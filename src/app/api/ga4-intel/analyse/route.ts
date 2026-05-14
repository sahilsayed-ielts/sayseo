import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const SYSTEM_PROMPT = `You are an expert SEO and digital analytics strategist. Analyse this GA4 page performance data and return a JSON object with exactly this structure:
{
  "traffic_leaders": [{ "page": string, "sessions": number, "channel": string, "insight": string }],
  "declining_pages": [{ "page": string, "sessions": number, "bounce_rate": number, "issue": string, "recommended_action": string }],
  "engagement_issues": [{ "page": string, "bounce_rate": number, "avg_engagement_time": number, "reason": string, "recommended_action": string }],
  "content_opportunities": [{ "page": string, "sessions": number, "insight": string, "recommended_action": string }],
  "quick_wins": [{ "page": string, "sessions": number, "issue": string, "recommended_action": string, "priority": "high"|"medium" }],
  "channel_breakdown": [{ "channel": string, "sessions": number, "percentage": number }],
  "summary": { "total_sessions": number, "total_pages": number, "top_channel": string, "top_page": string, "key_insight": string }
}
Rules:
- Return at most 15 items per array (pick the highest-impact ones).
- channel_breakdown should cover all channels present in the data, aggregated.
- declining_pages: pages with high bounce rate (>0.6) and low sessions relative to others.
- engagement_issues: pages where avg_engagement_time is very low (<30s) or bounce_rate is very high.
- content_opportunities: pages with decent sessions but poor engagement — could rank higher with improvements.
- quick_wins: pages where a specific, actionable change would meaningfully improve organic performance.
- Return only valid JSON. No markdown, no preamble, no trailing text.
- Ensure the JSON is complete and properly closed before finishing.`

export async function POST(req: NextRequest) {
  const { runId, siteId } = await req.json()
  console.log('[ga4-intel/analyse] received runId=%s siteId=%s', runId, siteId)

  if (!runId || !siteId) {
    return NextResponse.json({ error: 'runId and siteId are required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const admin = createAdminClient()

  const { data: existing } = await admin
    .from('ga4_intel_analyses')
    .select('analysis_json')
    .eq('run_id', runId)
    .maybeSingle()

  if (existing) {
    console.log('[ga4-intel/analyse] returning cached analysis for runId=%s', runId)
    return NextResponse.json({ analysis: existing.analysis_json })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 503 })
  }

  const { data: results, error: fetchErr } = await admin
    .from('ga4_intel_pages')
    .select('page_path, sessions, engaged_sessions, bounce_rate, avg_engagement_time, conversions, channel')
    .eq('run_id', runId)
    .order('sessions', { ascending: false })
    .limit(200)

  console.log('[ga4-intel/analyse] fetched %d page rows (err=%s)', results?.length ?? 0, fetchErr?.message ?? 'none')

  if (fetchErr || !results) {
    return NextResponse.json({ error: 'Failed to fetch run results' }, { status: 500 })
  }

  const client = new Anthropic()
  let analysis: unknown
  let raw = ''

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Analyse this GA4 page performance data (${results.length} rows, sorted by sessions descending):\n\n${JSON.stringify(results)}`,
      }],
    })

    console.log('[ga4-intel/analyse] stop_reason=%s', message.stop_reason)
    raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonStr = raw.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '').trim()
    analysis = JSON.parse(jsonStr)
    console.log('[ga4-intel/analyse] parsed keys:', Object.keys(analysis as object))
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error('[ga4-intel/analyse] error: %s | raw: %s', errMsg, raw.slice(0, 500))
    return NextResponse.json({ error: 'Intelligent analysis failed' }, { status: 500 })
  }

  const { error: upsertErr } = await admin
    .from('ga4_intel_analyses')
    .insert({ run_id: runId, site_id: siteId, analysis_json: analysis })

  if (upsertErr) {
    console.error('[ga4-intel/analyse] insert error:', upsertErr)
  }

  return NextResponse.json({ analysis })
}
