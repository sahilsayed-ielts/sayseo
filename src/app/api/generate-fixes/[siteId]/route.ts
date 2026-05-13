import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface Fix {
  fix_text: string
  impact: 'High' | 'Medium' | 'Low'
  category: 'Technical' | 'Content' | 'Schema'
  detail: string
}

function extractJSON(text: string): unknown {
  const stripped = text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim()
  return JSON.parse(stripped)
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: site } = await supabase
    .from('connected_sites')
    .select('id, domain')
    .eq('id', siteId)
    .single()
  if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 })

  const admin = createAdminClient()

  // ── Gather data from all 3 modules ────────────────────────────────────────
  const [cacheRow, citRows, aioRows, aioSummary, citSummary] = await Promise.all([
    admin.from('report_cache').select('data').eq('site_id', siteId).eq('report_type', 'ai-traffic').order('created_at', { ascending: false }).limit(1).maybeSingle(),
    admin.from('citation_checks').select('query, domain_mentioned, response_snippet').eq('site_id', siteId).order('checked_at', { ascending: false }).limit(20),
    admin.from('aio_checks').select('query, aio_triggered, domain_cited, citation_url').eq('site_id', siteId).order('checked_at', { ascending: false }).limit(20),
    admin.from('aio_summary').select('queries_checked, aio_triggers, domain_citations').eq('site_id', siteId).maybeSingle(),
    admin.from('citation_summary').select('mention_count, total_checks').eq('site_id', siteId),
  ])

  const m1 = (cacheRow.data?.data ?? {}) as Record<string, unknown>
  const totalCitChecks = (citSummary.data ?? []).reduce((s, r) => s + r.total_checks, 0)
  const totalCitMentions = (citSummary.data ?? []).reduce((s, r) => s + r.mention_count, 0)
  const citationRate = totalCitChecks > 0 ? ((totalCitMentions / totalCitChecks) * 100).toFixed(1) : '0'
  const aioRate =
    (aioSummary.data?.queries_checked ?? 0) > 0
      ? (((aioSummary.data!.aio_triggers ?? 0) / aioSummary.data!.queries_checked) * 100).toFixed(1)
      : '0'

  const payload = {
    domain: site.domain,
    module1_ai_traffic: {
      ai_percentage: (m1 as { aiPercentage?: number }).aiPercentage ?? 0,
      top_pages: (m1 as { topPages?: unknown[] }).topPages?.slice(0, 10) ?? [],
      top_queries: (m1 as { topQueries?: unknown[] }).topQueries?.slice(0, 10) ?? [],
    },
    module2_citations: {
      citation_rate_percent: citationRate,
      recent_checks: (citRows.data ?? []).slice(0, 10),
    },
    module3_aio: {
      aio_rate_percent: aioRate,
      domain_citations: aioSummary.data?.domain_citations ?? 0,
      recent_checks: (aioRows.data ?? []).slice(0, 10),
    },
  }

  // ── Claude API call ────────────────────────────────────────────────────────
  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system:
        'You are an AI SEO expert. Analyse the provided site data and return a JSON array of actionable fixes. Each fix must be specific to the data — reference actual page URLs, query strings, and metrics where possible. Return ONLY a JSON array, no markdown. Each item: { "fix_text": string, "impact": "High"|"Medium"|"Low", "category": "Technical"|"Content"|"Schema", "detail": string }',
      messages: [
        {
          role: 'user',
          content: `Analyse this site data and generate 6–10 specific, actionable SEO fixes:\n\n${JSON.stringify(payload, null, 2)}`,
        },
      ],
    }),
  })

  if (!anthropicRes.ok) {
    const text = await anthropicRes.text()
    console.error('[generate-fixes] Claude error:', text.slice(0, 300))
    return NextResponse.json({ error: 'AI analysis failed' }, { status: 502 })
  }

  const anthropicData = await anthropicRes.json()
  const rawText = (anthropicData.content as Array<{ type: string; text?: string }>)
    .find((b) => b.type === 'text')?.text ?? '[]'

  let fixes: Fix[] = []
  try {
    const parsed = extractJSON(rawText)
    if (!Array.isArray(parsed)) throw new Error('Not an array')
    fixes = parsed as Fix[]
  } catch (err) {
    console.error('[generate-fixes] JSON parse error:', err, rawText.slice(0, 200))
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 502 })
  }

  // ── Replace existing fixes for this site ──────────────────────────────────
  await admin.from('fix_list').delete().eq('site_id', siteId)

  const rows = fixes.map((f) => ({
    site_id: siteId,
    fix_text: f.fix_text ?? '',
    impact: (['High', 'Medium', 'Low'] as const).includes(f.impact) ? f.impact : 'Medium',
    category: (['Technical', 'Content', 'Schema'] as const).includes(f.category) ? f.category : 'Content',
    detail: f.detail ?? '',
  }))

  const { error: insErr } = await admin.from('fix_list').insert(rows)
  if (insErr) {
    console.error('[generate-fixes] insert error:', insErr)
    return NextResponse.json({ error: 'Failed to save fixes' }, { status: 500 })
  }

  return NextResponse.json({ fixes: rows })
}
