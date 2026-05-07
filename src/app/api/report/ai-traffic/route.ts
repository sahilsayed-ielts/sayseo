import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@/lib/supabase/server'
import { getOAuthClient, isInvalidGrant } from '@/lib/google-clients'
import { getCachedReport, setCachedReport } from '@/lib/report-cache'
import { AI_REFERRAL_DOMAINS } from '@/lib/ai-sources'

// ─── Types ───────────────────────────────────────────────────────────────────

interface AiSource {
  name: string
  domain: string
  sessions: number
  trend: number | null
}

interface TopPage {
  url: string
  source: string
  sessions: number
}

interface TopQuery {
  query: string
  clicks: number
  impressions: number
}

interface AiTrafficReport {
  aiSources: AiSource[]
  topPages: TopPage[]
  topQueries: TopQuery[]
  totalAiSessions: number
  totalSessions: number
  aiPercentage: number
  dateRange: string
  fromCache: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

/** Convert '30d' → GA4 date strings for current and previous periods. */
function parseDateRange(range: string) {
  const days = parseInt(range, 10)
  if (isNaN(days) || days <= 0) throw new Error('Invalid dateRange. Use format: 30d, 7d, 90d')
  return {
    current: { startDate: `${days}daysAgo`, endDate: 'today' },
    previous: { startDate: `${days * 2}daysAgo`, endDate: `${days + 1}daysAgo` },
  }
}

/** Get sessions value from a GA4 metric value (stringified int). */
function metricInt(value: string | null | undefined): number {
  return parseInt(value ?? '0', 10) || 0
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const siteId = searchParams.get('siteId')
  const dateRange = searchParams.get('dateRange') ?? '30d'

  if (!siteId) {
    return NextResponse.json({ error: 'siteId is required' }, { status: 400 })
  }

  // Auth + site ownership check (RLS enforced)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: site } = await supabase
    .from('connected_sites')
    .select('id, ga4_property_id, gsc_site_url')
    .eq('id', siteId)
    .single()

  if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 })

  // Cache check
  const cached = await getCachedReport(supabase, siteId, 'ai-traffic', dateRange)
  if (cached) {
    return NextResponse.json({ ...cached, fromCache: true })
  }

  // Parse date range
  let dates: ReturnType<typeof parseDateRange>
  try {
    dates = parseDateRange(dateRange)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }

  const aiDomains = [...AI_REFERRAL_DOMAINS]
  const report: Omit<AiTrafficReport, 'fromCache'> = {
    aiSources: [],
    topPages: [],
    topQueries: [],
    totalAiSessions: 0,
    totalSessions: 0,
    aiPercentage: 0,
    dateRange,
  }

  // ── GA4 calls ───────────────────────────────────────────────────────────────
  if (site.ga4_property_id) {
    try {
      const auth = await getOAuthClient(siteId, ['ga4', 'gsc'])
      const analyticsdata = google.analyticsdata({ version: 'v1beta', auth })
      const property = `properties/${site.ga4_property_id}`

      const [totalRes, aiBySourceRes, aiByPageRes] = await Promise.all([
        // Total sessions (no filter)
        analyticsdata.properties.runReport({
          property,
          requestBody: {
            dateRanges: [dates.current],
            metrics: [{ name: 'sessions' }],
          },
        }),
        // AI sessions by source — two date ranges for trend
        analyticsdata.properties.runReport({
          property,
          requestBody: {
            dateRanges: [
              { ...dates.current, name: 'current' },
              { ...dates.previous, name: 'previous' },
            ],
            dimensions: [{ name: 'sessionSource' }],
            metrics: [{ name: 'sessions' }],
            dimensionFilter: {
              filter: {
                fieldName: 'sessionSource',
                inListFilter: { values: aiDomains, caseSensitive: false },
              },
            },
            orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
            limit: '50',
          },
        }),
        // AI sessions by page + source
        analyticsdata.properties.runReport({
          property,
          requestBody: {
            dateRanges: [dates.current],
            dimensions: [{ name: 'pagePath' }, { name: 'sessionSource' }],
            metrics: [{ name: 'sessions' }],
            dimensionFilter: {
              filter: {
                fieldName: 'sessionSource',
                inListFilter: { values: aiDomains, caseSensitive: false },
              },
            },
            orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
            limit: '30',
          },
        }),
      ])

      // Total sessions
      report.totalSessions = metricInt(
        totalRes.data.rows?.[0]?.metricValues?.[0]?.value
      )

      // AI sessions by source — merge current/previous and consolidate display names
      const sourceMap = new Map<string, { current: number; previous: number }>()
      for (const row of aiBySourceRes.data.rows ?? []) {
        const domain = (row.dimensionValues?.[0]?.value ?? '').toLowerCase()
        const displayName = AI_SOURCE_DISPLAY[domain] ?? domain
        const current = metricInt(row.metricValues?.[0]?.value)
        const previous = metricInt(row.metricValues?.[1]?.value)
        const existing = sourceMap.get(displayName)
        if (existing) {
          existing.current += current
          existing.previous += previous
        } else {
          sourceMap.set(displayName, { current, previous })
        }
      }

      for (const [displayName, { current, previous }] of sourceMap) {
        // Find the canonical domain for this display name
        const domain =
          Object.entries(AI_SOURCE_DISPLAY).find(([, v]) => v === displayName)?.[0] ?? ''
        const trend =
          previous > 0 ? Math.round(((current - previous) / previous) * 100) : null
        report.aiSources.push({ name: displayName, domain, sessions: current, trend })
        report.totalAiSessions += current
      }

      // Sort by sessions desc
      report.aiSources.sort((a, b) => b.sessions - a.sessions)

      // Top pages
      for (const row of aiByPageRes.data.rows ?? []) {
        const url = row.dimensionValues?.[0]?.value ?? ''
        const sourceDomain = (row.dimensionValues?.[1]?.value ?? '').toLowerCase()
        const sessions = metricInt(row.metricValues?.[0]?.value)
        report.topPages.push({
          url,
          source: AI_SOURCE_DISPLAY[sourceDomain] ?? sourceDomain,
          sessions,
        })
      }

      report.aiPercentage =
        report.totalSessions > 0
          ? Math.round((report.totalAiSessions / report.totalSessions) * 1000) / 10
          : 0
    } catch (err) {
      if (isInvalidGrant(err)) {
        return NextResponse.json({ error: 'reconnect_required' }, { status: 401 })
      }
      console.error('[ai-traffic] GA4 error:', err)
      // Return partial report with GSC data if available
    }
  }

  // ── GSC calls ───────────────────────────────────────────────────────────────
  if (site.gsc_site_url) {
    try {
      const auth = await getOAuthClient(siteId, ['gsc', 'ga4'])
      const searchconsole = google.searchconsole({ version: 'v1', auth })

      // Convert GA4 date strings → ISO dates for GSC
      const days = parseInt(dateRange, 10)
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)
      const fmt = (d: Date) => d.toISOString().split('T')[0]

      const gscRes = await searchconsole.searchanalytics.query({
        siteUrl: site.gsc_site_url,
        requestBody: {
          startDate: fmt(startDate),
          endDate: fmt(endDate),
          dimensions: ['query'],
          rowLimit: 20,
          type: 'web',
        },
      })

      for (const row of gscRes.data.rows ?? []) {
        report.topQueries.push({
          query: row.keys?.[0] ?? '',
          clicks: Math.round(row.clicks ?? 0),
          impressions: Math.round(row.impressions ?? 0),
        })
      }
    } catch (err) {
      if (isInvalidGrant(err)) {
        return NextResponse.json({ error: 'reconnect_required' }, { status: 401 })
      }
      console.error('[ai-traffic] GSC error:', err)
      // Proceed with empty topQueries
    }
  }

  // Cache + return
  await setCachedReport(supabase, siteId, 'ai-traffic', dateRange, report)
  return NextResponse.json({ ...report, fromCache: false })
}
