import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAIOForQuery } from '@/lib/serpapi'

function extractJSON(text: string): unknown {
  const stripped = text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim()
  return JSON.parse(stripped)
}

export async function POST(req: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    // ── Parse body ────────────────────────────────────────────────────────────
    let body: { siteId?: string; competitorDomain?: string }
    try {
      body = await req.json()
    } catch (parseErr) {
      console.error('[competitor-check] malformed request body:', parseErr)
      return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 })
    }

    const { siteId, competitorDomain } = body

    if (!siteId || !competitorDomain) {
      return NextResponse.json(
        { error: `Missing required fields: ${[!siteId && 'siteId', !competitorDomain && 'competitorDomain'].filter(Boolean).join(', ')}` },
        { status: 400 }
      )
    }

    // ── Verify site ownership ─────────────────────────────────────────────────
    const { data: site } = await supabase
      .from('connected_sites')
      .select('id, domain')
      .eq('id', siteId)
      .single()
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 })

    const cleanedDomain = competitorDomain
      .trim()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .toLowerCase()

    const admin = createAdminClient()

    // ── Upsert competitor into competitor_sites ────────────────────────────────
    const { data: compSite, error: upsertErr } = await admin
      .from('competitor_sites')
      .upsert({ site_id: siteId, competitor_domain: cleanedDomain }, { onConflict: 'site_id,competitor_domain' })
      .select('id')
      .single()

    if (upsertErr || !compSite) {
      console.error('[competitor-check] competitor_sites upsert error:', upsertErr)
      return NextResponse.json(
        { error: `Failed to save competitor: ${upsertErr?.message ?? 'unknown error'}` },
        { status: 500 }
      )
    }

    // ── Resolve queries — 3-tier fallback ────────────────────────────────────
    let queries: string[] = []
    let querySource = 'report_cache'

    // Tier 1: report_cache ai-traffic topQueries
    const { data: cacheRow } = await admin
      .from('report_cache')
      .select('data')
      .eq('site_id', siteId)
      .eq('report_type', 'ai-traffic')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    type CacheData = { topQueries?: Array<{ query: string; clicks: number }> }
    queries = ((cacheRow?.data ?? {}) as CacheData).topQueries?.slice(0, 5).map((q) => q.query) ?? []

    // Tier 2: distinct queries from citation_checks
    if (queries.length === 0) {
      querySource = 'citation_checks'
      const { data: citationRows } = await admin
        .from('citation_checks')
        .select('query')
        .eq('site_id', siteId)
        .order('checked_at', { ascending: false })
        .limit(20)

      if (citationRows && citationRows.length > 0) {
        const seen = new Set<string>()
        for (const row of citationRows) {
          if (row.query && !seen.has(row.query)) {
            seen.add(row.query)
            queries.push(row.query)
            if (queries.length >= 5) break
          }
        }
      }
    }

    // Tier 3: domain-derived fallback queries
    if (queries.length === 0) {
      querySource = 'fallback'
      const domainWord = site.domain
        .replace(/\.(com|co\.uk|org|net|io|uk|co).*$/, '')
        .replace(/^www\./, '')
        .toLowerCase()
      queries = [
        `${domainWord} guide`,
        `${domainWord} tips`,
        `best ${domainWord}`,
      ]
    }

    console.log(`[competitor-check] siteId=${siteId} competitor=${cleanedDomain} queries=${queries.length} source=${querySource}`, queries)

    // ── AIO checks for competitor domain ─────────────────────────────────────
    let aio_triggered = 0
    for (const query of queries) {
      try {
        const result = await checkAIOForQuery(query, cleanedDomain)
        if (result.domain_cited) aio_triggered++
      } catch (err) {
        console.error(`[competitor-check] SerpAPI AIO check failed for "${query}":`, err instanceof Error ? err.stack : err)
        // Non-fatal: continue with remaining queries
      }
      if (queries.indexOf(query) < queries.length - 1) {
        await new Promise((r) => setTimeout(r, 500))
      }
    }
    const aio_rate = queries.length > 0 ? (aio_triggered / queries.length) * 100 : 0

    // ── Claude citation estimate ───────────────────────────────────────────────
    let citation_rate = 0
    try {
      const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 200,
          system:
            'You are an SEO data analyst. Return ONLY a JSON object: { "citation_rate": number (0-100) }. No other text.',
          messages: [
            {
              role: 'user',
              content: `Estimate the citation rate (0-100) for domain "${cleanedDomain}" in AI assistant responses for these queries: ${queries.join(', ')}. Base your estimate on the domain's likely authority and relevance.`,
            },
          ],
        }),
      })

      if (anthropicRes.ok) {
        const anthropicData = await anthropicRes.json()
        const rawText = (anthropicData.content as Array<{ type: string; text?: string }>)
          .find((b) => b.type === 'text')?.text ?? '{}'
        const parsed = extractJSON(rawText) as { citation_rate?: number }
        citation_rate = typeof parsed.citation_rate === 'number' ? Math.min(100, Math.max(0, parsed.citation_rate)) : 0
      } else {
        const errText = await anthropicRes.text()
        console.error(`[competitor-check] Claude API error ${anthropicRes.status}:`, errText.slice(0, 300))
        // Non-fatal: citation_rate stays 0
      }
    } catch (err) {
      console.error('[competitor-check] Claude citation estimate error:', err instanceof Error ? err.stack : err)
      // Non-fatal: citation_rate stays 0
    }

    // ── Compute simplified AI score (M2 + M3 scaled to 100) ──────────────────
    const m2 = Math.round((citation_rate / 100) * 50)
    const m3 = Math.round((aio_rate / 100) * 50)
    const ai_score = Math.min(100, m2 + m3)

    // ── Save competitor score ─────────────────────────────────────────────────
    const { error: scoreInsertErr } = await admin.from('competitor_scores').insert({
      competitor_site_id: compSite.id,
      ai_score,
      citation_rate,
      aio_rate,
    })

    if (scoreInsertErr) {
      console.error('[competitor-check] competitor_scores insert error:', scoreInsertErr)
      return NextResponse.json(
        { error: `Failed to save competitor score: ${scoreInsertErr.message}` },
        { status: 500 }
      )
    }

    await admin.from('competitor_sites').update({ last_checked: new Date().toISOString() }).eq('id', compSite.id)

    return NextResponse.json({ competitorDomain: cleanedDomain, ai_score, citation_rate, aio_rate })
  } catch (err) {
    console.error('[competitor-check] unhandled error:', err instanceof Error ? err.stack : err)
    return NextResponse.json(
      { error: `Internal server error: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    )
  }
}
