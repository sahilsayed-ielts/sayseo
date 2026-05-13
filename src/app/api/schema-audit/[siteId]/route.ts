import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface SchemaAudit {
  page_url: string
  schemas_present: string[]
  schemas_missing: string[]
  suggested_schema: Record<string, unknown>
  impact: 'High' | 'Medium' | 'Low'
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

  // ── Get top AI-referenced pages ────────────────────────────────────────────
  // Combine: top pages from report cache + AIO-cited URLs
  const [cacheRow, aioRows] = await Promise.all([
    admin.from('report_cache').select('data').eq('site_id', siteId).eq('report_type', 'ai-traffic').order('created_at', { ascending: false }).limit(1).maybeSingle(),
    admin.from('aio_checks').select('citation_url').eq('site_id', siteId).eq('domain_cited', true).order('checked_at', { ascending: false }).limit(20),
  ])

  type CacheData = { topPages?: Array<{ url: string; sessions: number }> }
  const cacheData = (cacheRow?.data ?? {}) as CacheData
  const topPageUrls = (cacheData.topPages ?? []).slice(0, 8).map((p) => `https://${site.domain}${p.url}`)

  const aioCitedUrls = (aioRows.data ?? [])
    .map((r) => r.citation_url)
    .filter((u): u is string => Boolean(u))

  const allUrls = [...new Set([...topPageUrls, ...aioCitedUrls])].slice(0, 10)

  if (allUrls.length === 0) {
    return NextResponse.json({ error: 'No page data available. Load the dashboard first to cache page data.' }, { status: 422 })
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
        'You are a structured data expert. Given page URLs, identify which schemas are likely missing and generate the exact JSON-LD to add. Return ONLY a JSON array, no markdown. Each item: { "page_url": string, "schemas_present": string[], "schemas_missing": string[], "suggested_schema": object (valid JSON-LD for the most impactful missing schema), "impact": "High"|"Medium"|"Low" }. Consider schemas: FAQPage, HowTo, Article, BreadcrumbList, Organization, Product, LocalBusiness.',
      messages: [
        {
          role: 'user',
          content: `Site domain: ${site.domain}\n\nAudit these pages for missing structured data:\n${allUrls.map((u, i) => `${i + 1}. ${u}`).join('\n')}`,
        },
      ],
    }),
  })

  if (!anthropicRes.ok) {
    const text = await anthropicRes.text()
    console.error('[schema-audit] Claude error:', text.slice(0, 300))
    return NextResponse.json({ error: 'AI analysis failed' }, { status: 502 })
  }

  const anthropicData = await anthropicRes.json()
  const rawText = (anthropicData.content as Array<{ type: string; text?: string }>)
    .find((b) => b.type === 'text')?.text ?? '[]'

  let audits: SchemaAudit[] = []
  try {
    const parsed = extractJSON(rawText)
    if (!Array.isArray(parsed)) throw new Error('Not an array')
    audits = parsed as SchemaAudit[]
  } catch (err) {
    console.error('[schema-audit] JSON parse error:', err, rawText.slice(0, 200))
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 502 })
  }

  // ── Replace existing audits ────────────────────────────────────────────────
  await admin.from('schema_audits').delete().eq('site_id', siteId)

  const rows = audits.map((a) => ({
    site_id: siteId,
    page_url: a.page_url ?? '',
    schemas_present: Array.isArray(a.schemas_present) ? a.schemas_present : [],
    schemas_missing: Array.isArray(a.schemas_missing) ? a.schemas_missing : [],
    suggested_schema: a.suggested_schema ?? null,
  }))

  const { error: insErr } = await admin.from('schema_audits').insert(rows)
  if (insErr) {
    console.error('[schema-audit] insert error:', insErr)
    return NextResponse.json({ error: 'Failed to save audits' }, { status: 500 })
  }

  return NextResponse.json({ audits: rows })
}
