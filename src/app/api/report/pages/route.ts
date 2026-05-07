import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@/lib/supabase/server'
import { getOAuthClient, isInvalidGrant } from '@/lib/google-clients'
import { getCachedReport, setCachedReport } from '@/lib/report-cache'
import { AI_REFERRAL_DOMAINS } from '@/lib/ai-sources'

// ─── Types ───────────────────────────────────────────────────────────────────

interface PageSource {
  domain: string
  name: string
  sessions: number
}

interface PageEntry {
  url: string
  totalAiSessions: number
  sources: PageSource[]
}

interface PagesReport {
  pages: PageEntry[]
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

function parseDateRange(range: string) {
  const days = parseInt(range, 10)
  if (isNaN(days) || days <= 0) throw new Error('Invalid dateRange. Use format: 30d, 7d, 90d')
  return { startDate: `${days}daysAgo`, endDate: 'today' }
}

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
    .select('id, ga4_property_id')
    .eq('id', siteId)
    .single()

  if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 })

  // Cache check
  const cached = await getCachedReport(supabase, siteId, 'pages', dateRange)
  if (cached) {
    return NextResponse.json({ ...cached, fromCache: true })
  }

  const report: Omit<PagesReport, 'fromCache'> = { pages: [], dateRange }

  if (!site.ga4_property_id) {
    await setCachedReport(supabase, siteId, 'pages', dateRange, report)
    return NextResponse.json({ ...report, fromCache: false })
  }

  let dates: ReturnType<typeof parseDateRange>
  try {
    dates = parseDateRange(dateRange)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }

  try {
    const auth = await getOAuthClient(siteId, ['ga4', 'gsc'])
    const analyticsdata = google.analyticsdata({ version: 'v1beta', auth })
    const property = `properties/${site.ga4_property_id}`
    const aiDomains = [...AI_REFERRAL_DOMAINS]

    // Fetch page × source breakdown for AI sources
    const res = await analyticsdata.properties.runReport({
      property,
      requestBody: {
        dateRanges: [dates],
        dimensions: [
          { name: 'pagePath' },
          { name: 'pageTitle' },
          { name: 'sessionSource' },
        ],
        metrics: [{ name: 'sessions' }],
        dimensionFilter: {
          filter: {
            fieldName: 'sessionSource',
            inListFilter: { values: aiDomains, caseSensitive: false },
          },
        },
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: '200',
      },
    })

    // Group rows by pagePath
    const pageMap = new Map<
      string,
      { totalAiSessions: number; sources: Map<string, { domain: string; name: string; sessions: number }> }
    >()

    for (const row of res.data.rows ?? []) {
      const url = row.dimensionValues?.[0]?.value ?? ''
      const sourceDomain = (row.dimensionValues?.[2]?.value ?? '').toLowerCase()
      const sessions = metricInt(row.metricValues?.[0]?.value)
      const displayName = AI_SOURCE_DISPLAY[sourceDomain] ?? sourceDomain

      let page = pageMap.get(url)
      if (!page) {
        page = { totalAiSessions: 0, sources: new Map() }
        pageMap.set(url, page)
      }

      page.totalAiSessions += sessions

      // Consolidate sources with same display name (chatgpt.com + chat.openai.com → ChatGPT)
      const existing = page.sources.get(displayName)
      if (existing) {
        existing.sessions += sessions
      } else {
        page.sources.set(displayName, { domain: sourceDomain, name: displayName, sessions })
      }
    }

    // Convert to array, sort sources within each page by sessions desc
    for (const [url, { totalAiSessions, sources }] of pageMap) {
      report.pages.push({
        url,
        totalAiSessions,
        sources: [...sources.values()].sort((a, b) => b.sessions - a.sessions),
      })
    }

    // Pages already ordered by total sessions (GA4 ordered by sessions per row, so top pages come first)
    report.pages.sort((a, b) => b.totalAiSessions - a.totalAiSessions)
  } catch (err) {
    if (isInvalidGrant(err)) {
      return NextResponse.json({ error: 'reconnect_required' }, { status: 401 })
    }
    console.error('[pages] GA4 error:', err)
    return NextResponse.json({ error: 'Failed to fetch page data from GA4' }, { status: 500 })
  }

  await setCachedReport(supabase, siteId, 'pages', dateRange, report)
  return NextResponse.json({ ...report, fromCache: false })
}
