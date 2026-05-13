import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface Opportunity {
  query_pattern: string
  page_type: string
  aio_likelihood: string
  suggested_slug: string
  suggested_title: string
}

interface ClaudeResponse {
  opportunities?: Opportunity[]
  insight_summary?: string
}

function extractJSON(text: string): unknown {
  const stripped = text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim()
  return JSON.parse(stripped)
}

const SYSTEM_PROMPT = `You are an AI search visibility expert specialising in Google AI Overviews and LLM citation patterns. You know which query types and page types are most likely to trigger AI Overview results and get cited by ChatGPT, Perplexity, and Google AI Overviews.

Query types with HIGH AIO trigger likelihood:
- Question queries (what is, how to, why does, when should, which is better)
- Comparison queries (X vs Y, X or Y, difference between X and Y)
- Best-for queries (best X for Y, top X for Y)
- Definition/explanation queries (what is X, X meaning, X explained)
- Step-by-step queries (how to X, steps to X, guide to X)
- Calculator/tool queries (X calculator, X checker, X score)

Page types that win AIO citations:
- FAQ pages with structured Q&A (FAQPage schema)
- Comparison pages with clear verdict sections
- How-to guides with numbered steps (HowTo schema)
- Definition/glossary pages
- Tool/calculator pages
- Pillar guides with clear headings

Analyse the provided GSC queries. For each opportunity identified, return a specific actionable page recommendation. Focus on gaps — queries the site is getting impressions for but likely has no dedicated AIO-optimised page targeting.

Return ONLY a JSON object with this exact structure, no markdown:
{
  "opportunities": [
    {
      "query_pattern": "string (the query pattern or example query)",
      "page_type": "string (FAQ Page / Comparison Page / How-To Guide / Definition Page / Tool Page / Pillar Guide)",
      "aio_likelihood": "string (High / Medium)",
      "suggested_slug": "string (e.g. /ielts-writing-task-2-tips)",
      "suggested_title": "string (e.g. IELTS Writing Task 2 Tips: Complete Guide for Band 7+)"
    }
  ],
  "insight_summary": "string (2-3 sentence summary of the biggest AIO opportunities found, referencing actual numbers from the query data)"
}`

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

  // ── Fetch up to 50 GSC queries from report cache ───────────────────────────
  const { data: cacheRow } = await admin
    .from('report_cache')
    .select('data')
    .eq('site_id', siteId)
    .eq('report_type', 'ai-traffic')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  type QueryEntry = { query: string; clicks: number; impressions: number }
  type CacheData = { topQueries?: QueryEntry[] }
  const queryRows = ((cacheRow?.data ?? {}) as CacheData).topQueries?.slice(0, 50) ?? []

  if (queryRows.length === 0) {
    return NextResponse.json(
      { error: 'No GSC query data available. Load the Overview tab first to cache your search queries, then try again.' },
      { status: 422 }
    )
  }

  const queryList = queryRows
    .map((q) => `${q.query} | ${q.impressions ?? 0} | ${q.clicks ?? 0}`)
    .join('\n')

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
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Site domain: ${site.domain}\nGSC queries (query | impressions | clicks):\n${queryList}\n\nIdentify the top AIO opportunities for this site. Return 8-15 opportunities maximum, prioritised by AIO likelihood and potential impact.`,
        },
      ],
    }),
  })

  if (!anthropicRes.ok) {
    const text = await anthropicRes.text()
    console.error('[aio-opportunities] Claude error:', text.slice(0, 300))
    return NextResponse.json({ error: 'AI analysis failed' }, { status: 502 })
  }

  const anthropicData = await anthropicRes.json()
  const rawText = (anthropicData.content as Array<{ type: string; text?: string }>)
    .find((b) => b.type === 'text')?.text ?? '{}'

  let opportunities: Opportunity[] = []
  let insight_summary = ''
  try {
    const parsed = extractJSON(rawText) as ClaudeResponse
    if (!Array.isArray(parsed.opportunities)) throw new Error('opportunities not an array')
    opportunities = parsed.opportunities
    insight_summary = typeof parsed.insight_summary === 'string' ? parsed.insight_summary : ''
  } catch (err) {
    console.error('[aio-opportunities] JSON parse error:', err, rawText.slice(0, 200))
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 502 })
  }

  // ── Replace existing opportunities for this site ───────────────────────────
  await admin.from('aio_opportunities').delete().eq('site_id', siteId)

  const rows = opportunities.map((o) => ({
    site_id: siteId,
    query_pattern: o.query_pattern ?? '',
    page_type: o.page_type ?? '',
    aio_likelihood: ['High', 'Medium'].includes(o.aio_likelihood) ? o.aio_likelihood : 'Medium',
    suggested_slug: o.suggested_slug ?? '',
    suggested_title: o.suggested_title ?? '',
  }))

  const { error: insErr } = await admin.from('aio_opportunities').insert(rows)
  if (insErr) {
    console.error('[aio-opportunities] insert error:', insErr)
    return NextResponse.json({ error: 'Failed to save opportunities' }, { status: 500 })
  }

  return NextResponse.json({ opportunities: rows, insight_summary })
}
