import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@/lib/supabase/server'
import { getOAuthClient, isInvalidGrant } from '@/lib/google-clients'
import { getCachedReport, setCachedReport } from '@/lib/report-cache'
import { AI_REFERRAL_DOMAINS } from '@/lib/ai-sources'

const AI_SOURCE_DISPLAY: Record<string, string> = {
  'chatgpt.com': 'ChatGPT',
  'chat.openai.com': 'ChatGPT',
  'perplexity.ai': 'Perplexity',
  'gemini.google.com': 'Gemini',
  'copilot.microsoft.com': 'Microsoft Copilot',
  'claude.ai': 'Claude',
  'you.com': 'You.com',
  'phind.com': 'Phind',
  'bard.google.com': 'Bard',
}

function ga4DateToISO(yyyymmdd: string): string {
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`
}

function metricInt(v: string | null | undefined): number {
  return parseInt(v ?? '0', 10) || 0
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const siteId = searchParams.get('siteId')
  const dateRange = searchParams.get('dateRange') ?? '30d'

  if (!siteId) return NextResponse.json({ error: 'siteId is required' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: site } = await supabase
    .from('connected_sites')
    .select('id, ga4_property_id')
    .eq('id', siteId)
    .single()

  if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 })

  const cached = await getCachedReport(supabase, siteId, 'trend', dateRange)
  if (cached) return NextResponse.json({ ...cached, fromCache: true })

  const days = parseInt(dateRange, 10)
  if (isNaN(days) || days <= 0) {
    return NextResponse.json({ error: 'Invalid dateRange' }, { status: 400 })
  }

  const payload: Record<string, unknown> & {
    series: Record<string, Array<{ date: string; sessions: number }>>
    sources: string[]
    dateRange: string
  } = { series: {}, sources: [], dateRange }

  if (!site.ga4_property_id) {
    await setCachedReport(supabase, siteId, 'trend', dateRange, payload)
    return NextResponse.json({ ...payload, fromCache: false })
  }

  try {
    const auth = await getOAuthClient(siteId, ['ga4', 'gsc'])
    const analyticsdata = google.analyticsdata({ version: 'v1beta', auth })
    const property = `properties/${site.ga4_property_id}`

    const res = await analyticsdata.properties.runReport({
      property,
      requestBody: {
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
        dimensions: [{ name: 'date' }, { name: 'sessionSource' }],
        metrics: [{ name: 'sessions' }],
        dimensionFilter: {
          filter: {
            fieldName: 'sessionSource',
            inListFilter: {
              values: [...AI_REFERRAL_DOMAINS],
              caseSensitive: false,
            },
          },
        },
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      },
    })

    const seriesMap: Record<string, Record<string, number>> = {}

    for (const row of res.data.rows ?? []) {
      const rawDate = row.dimensionValues?.[0]?.value ?? ''
      const sourceDomain = (row.dimensionValues?.[1]?.value ?? '').toLowerCase()
      const sessions = metricInt(row.metricValues?.[0]?.value)
      const displayName = AI_SOURCE_DISPLAY[sourceDomain] ?? sourceDomain
      const date = ga4DateToISO(rawDate)

      if (!seriesMap[displayName]) seriesMap[displayName] = {}
      seriesMap[displayName][date] = (seriesMap[displayName][date] ?? 0) + sessions
    }

    // Convert to sorted arrays per source
    for (const [sourceName, dateMap] of Object.entries(seriesMap)) {
      payload.series[sourceName] = Object.entries(dateMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, sessions]) => ({ date, sessions }))
    }

    payload.sources = Object.keys(payload.series).sort(
      (a, b) =>
        (payload.series[b].reduce((s, p) => s + p.sessions, 0)) -
        (payload.series[a].reduce((s, p) => s + p.sessions, 0))
    )
  } catch (err) {
    if (isInvalidGrant(err)) {
      return NextResponse.json({ error: 'reconnect_required' }, { status: 401 })
    }
    console.error('[trend] GA4 error:', err)
    return NextResponse.json({ error: 'Failed to fetch trend data' }, { status: 500 })
  }

  await setCachedReport(supabase, siteId, 'trend', dateRange, payload)
  return NextResponse.json({ ...payload, fromCache: false })
}
