import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { getCachedReport, setCachedReport } from '@/lib/report-cache'

const SYSTEM_PROMPT = `You are SaySEO Intelligence Engine, an advanced analytics system specialising in AI search visibility for websites. Given site traffic data, generate specific, actionable recommendations to improve the site's visibility in AI-powered search engines such as ChatGPT, Perplexity, and Gemini.

Focus recommendations on: content structure for AI consumption, citation opportunity gaps, schema markup, topical authority, and content gaps based on the actual traffic patterns shown.

Respond ONLY with a valid JSON array of 3–5 objects. No preamble. No text outside the JSON array. Each object must have exactly these keys:
- "title": short recommendation title (max 8 words)
- "description": specific, actionable advice referencing the actual data where relevant (2–3 sentences)
- "impact": exactly one of "High", "Medium", or "Low"`

interface Recommendation {
  title: string
  description: string
  impact: 'High' | 'Medium' | 'Low'
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const siteId = searchParams.get('siteId')

  if (!siteId) return NextResponse.json({ error: 'siteId is required' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: site } = await supabase
    .from('connected_sites')
    .select('id, domain')
    .eq('id', siteId)
    .single()

  if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 })

  // Cache recommendations for 6 hours
  const cached = await getCachedReport(supabase, siteId, 'recommendations', '30d')
  if (cached) return NextResponse.json({ ...cached, fromCache: true })

  // Load the ai-traffic report from cache (we don't refetch GA4 just for this)
  const trafficCache = await getCachedReport(supabase, siteId, 'ai-traffic', '30d')
  const pagesCache = await getCachedReport(supabase, siteId, 'pages', '30d')

  // Build context for Claude
  const context = {
    domain: site.domain,
    dateRange: '30d',
    totalSessions: trafficCache?.totalSessions ?? 'unknown',
    totalAiSessions: trafficCache?.totalAiSessions ?? 'unknown',
    aiPercentage: trafficCache?.aiPercentage ?? 'unknown',
    topAiSources: trafficCache?.aiSources ?? [],
    topAiPages: (trafficCache?.topPages as Array<{ url: string; source: string; sessions: number }> | undefined)?.slice(0, 10) ?? [],
    topQueries: (trafficCache?.topQueries as Array<{ query: string; clicks: number; impressions: number }> | undefined)?.slice(0, 10) ?? [],
    uniquePagesWithAiTraffic:
      (pagesCache?.pages as Array<unknown> | undefined)?.length ?? 'unknown',
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'Recommendations unavailable — ANTHROPIC_API_KEY not configured.' },
      { status: 503 }
    )
  }

  let recommendations: Recommendation[] = []

  try {
    const client = new Anthropic()

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: `Analyse this AI visibility data and generate recommendations:\n\n${JSON.stringify(context, null, 2)}`,
        },
      ],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''

    // Strip any markdown fences before parsing
    const jsonStr = raw.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '').trim()
    const parsed = JSON.parse(jsonStr) as Recommendation[]
    recommendations = parsed.filter(
      (r) =>
        typeof r.title === 'string' &&
        typeof r.description === 'string' &&
        ['High', 'Medium', 'Low'].includes(r.impact)
    )
  } catch (err) {
    console.error('[recommendations] Claude error:', err)
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }

  const payload = { recommendations }
  await setCachedReport(supabase, siteId, 'recommendations', '30d', payload)
  return NextResponse.json({ ...payload, fromCache: false })
}
