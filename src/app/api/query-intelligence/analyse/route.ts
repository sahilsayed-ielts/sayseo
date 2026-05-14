import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const SYSTEM_PROMPT = `You are an expert SEO strategist. Analyse this Google Search Console query-to-page mapping data and return a JSON object with exactly this structure:
{
  "quick_wins": [{ "query": string, "page": string, "position": number, "impressions": number, "ctr": number, "reason": string, "priority": "high"|"medium" }],
  "content_gaps": [{ "query": string, "impressions": number, "suggested_page": string, "suggested_slug": string, "reason": string }],
  "ai_citation_opportunities": [{ "query": string, "page": string, "reason": string, "recommended_action": string }],
  "aio_opportunities": [{ "query": string, "page": string, "reason": string, "schema_type": string, "recommended_action": string }],
  "ctr_optimisation": [{ "query": string, "page": string, "position": number, "current_ctr": number, "reason": string, "recommended_action": string }],
  "summary": { "total_queries": number, "total_pages": number, "avg_position": number, "top_opportunity": string }
}
Rules:
- Return at most 15 items per array (pick the highest-impact ones).
- Return only valid JSON. No markdown, no preamble, no trailing text.
- Ensure the JSON is complete and properly closed before finishing.`

export async function POST(req: NextRequest) {
  const { runId, siteId } = await req.json()
  console.log('[qi/analyse] received runId=%s siteId=%s', runId, siteId)

  if (!runId || !siteId) {
    return NextResponse.json({ error: 'runId and siteId are required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const admin = createAdminClient()

  // Return cached analysis if it already exists for this run
  const { data: existing } = await admin
    .from('query_intelligence_analyses')
    .select('analysis_json')
    .eq('run_id', runId)
    .maybeSingle()

  if (existing) {
    console.log('[qi/analyse] returning cached analysis for runId=%s', runId)
    return NextResponse.json({ analysis: existing.analysis_json })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[qi/analyse] ANTHROPIC_API_KEY not set')
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 503 })
  }

  const { data: results, error: fetchErr } = await admin
    .from('query_intelligence_results')
    .select('query, page, clicks, impressions, ctr, position')
    .eq('run_id', runId)
    .order('impressions', { ascending: false })
    .limit(200)

  console.log('[qi/analyse] fetched %d result rows for runId=%s (fetchErr=%s)', results?.length ?? 0, runId, fetchErr?.message ?? 'none')

  if (fetchErr || !results) {
    console.error('[qi/analyse] Supabase fetch error:', fetchErr)
    return NextResponse.json({ error: 'Failed to fetch run results' }, { status: 500 })
  }

  const client = new Anthropic()

  let analysis: unknown
  let raw = ''
  try {
    console.log('[qi/analyse] calling Claude with %d rows', results.length)
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Analyse this query-to-page mapping data (${results.length} rows, sorted by impressions descending):\n\n${JSON.stringify(results)}`,
        },
      ],
    })

    console.log('[qi/analyse] Claude stop_reason=%s content_blocks=%d', message.stop_reason, message.content.length)
    raw = message.content[0].type === 'text' ? message.content[0].text : ''
    console.log('[qi/analyse] raw response (first 500 chars):', raw.slice(0, 500))

    const jsonStr = raw.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '').trim()
    analysis = JSON.parse(jsonStr)
    console.log('[qi/analyse] JSON parsed successfully, top-level keys:', Object.keys(analysis as object))
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    const status = (err as { status?: number }).status
    console.error('[qi/analyse] error — message: %s | status: %s | raw response: %s', errMsg, status ?? 'n/a', raw.slice(0, 1000))
    return NextResponse.json({ error: 'Intelligent analysis failed' }, { status: 500 })
  }

  const { error: upsertErr } = await admin
    .from('query_intelligence_analyses')
    .insert({ run_id: runId, site_id: siteId, analysis_json: analysis })

  if (upsertErr) {
    console.error('[query-intelligence/analyse] insert error:', upsertErr)
  }

  return NextResponse.json({ analysis })
}
