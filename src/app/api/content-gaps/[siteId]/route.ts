import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface Gap {
  topic: string
  ai_platforms: string[]
  opportunity_score: number
  suggested_title: string
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

  // ── Get top 20 GSC queries from report cache ───────────────────────────────
  const { data: cacheRow } = await admin
    .from('report_cache')
    .select('data')
    .eq('site_id', siteId)
    .eq('report_type', 'ai-traffic')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  type CacheData = { topQueries?: Array<{ query: string; clicks: number }> }
  const cacheData = (cacheRow?.data ?? {}) as CacheData
  const queries = (cacheData.topQueries ?? []).slice(0, 20).map((q) => q.query)

  if (queries.length === 0) {
    return NextResponse.json({ error: 'No query data available. Load the dashboard first to cache GSC queries.' }, { status: 422 })
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
        'You are an AI SEO strategist. Given these search queries a site currently ranks for, identify related topics that AI platforms (ChatGPT, Perplexity, Google AI Overview) actively discuss but the site likely has no content for. Return ONLY a JSON array, no markdown. Each item: { "topic": string, "ai_platforms": string[], "opportunity_score": number (1-10), "suggested_title": string }',
      messages: [
        {
          role: 'user',
          content: `Site: ${site.domain}\n\nCurrently ranking queries:\n${queries.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\nIdentify 8–12 content gap opportunities.`,
        },
      ],
    }),
  })

  if (!anthropicRes.ok) {
    const text = await anthropicRes.text()
    console.error('[content-gaps] Claude error:', text.slice(0, 300))
    return NextResponse.json({ error: 'AI analysis failed' }, { status: 502 })
  }

  const anthropicData = await anthropicRes.json()
  const rawText = (anthropicData.content as Array<{ type: string; text?: string }>)
    .find((b) => b.type === 'text')?.text ?? '[]'

  let gaps: Gap[] = []
  try {
    const parsed = extractJSON(rawText)
    if (!Array.isArray(parsed)) throw new Error('Not an array')
    gaps = parsed as Gap[]
  } catch (err) {
    console.error('[content-gaps] JSON parse error:', err, rawText.slice(0, 200))
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 502 })
  }

  // ── Replace existing gaps for this site ───────────────────────────────────
  await admin.from('content_gaps').delete().eq('site_id', siteId)

  const rows = gaps.map((g) => ({
    site_id: siteId,
    topic: g.topic ?? '',
    ai_platforms: Array.isArray(g.ai_platforms) ? g.ai_platforms : [],
    opportunity_score: typeof g.opportunity_score === 'number' ? Math.min(10, Math.max(1, g.opportunity_score)) : 5,
    suggested_title: g.suggested_title ?? '',
  }))

  const { error: insErr } = await admin.from('content_gaps').insert(rows)
  if (insErr) {
    console.error('[content-gaps] insert error:', insErr)
    return NextResponse.json({ error: 'Failed to save gaps' }, { status: 500 })
  }

  return NextResponse.json({ gaps: rows })
}
