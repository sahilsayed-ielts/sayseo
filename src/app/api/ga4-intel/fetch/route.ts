import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getOAuthClient, isInvalidGrant } from '@/lib/google-clients'
import { google } from 'googleapis'

export async function POST(req: NextRequest) {
  const { siteId } = await req.json()
  if (!siteId) return NextResponse.json({ error: 'siteId is required' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: site } = await supabase
    .from('connected_sites')
    .select('id, domain, ga4_property_id, access_token')
    .eq('id', siteId)
    .single()

  if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 })
  if (!site.ga4_property_id) {
    return NextResponse.json({ error: 'No GA4 property ID configured for this site' }, { status: 422 })
  }

  const admin = createAdminClient()

  const { data: run, error: runErr } = await admin
    .from('ga4_intel_runs')
    .insert({ site_id: siteId, status: 'pending', date_range: 'last90days' })
    .select('id')
    .single()

  if (runErr || !run) {
    return NextResponse.json({ error: 'Failed to create run record' }, { status: 500 })
  }

  const runId = run.id

  try {
    const auth = await getOAuthClient(siteId, ['ga4', 'gsc'])
    const analyticsdata = google.analyticsdata({ version: 'v1beta', auth })

    const gaRes = await analyticsdata.properties.runReport({
      property: `properties/${site.ga4_property_id}`,
      requestBody: {
        dateRanges: [{ startDate: '90daysAgo', endDate: 'yesterday' }],
        dimensions: [
          { name: 'pagePath' },
          { name: 'sessionDefaultChannelGroup' },
        ],
        metrics: [
          { name: 'sessions' },
          { name: 'engagedSessions' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
          { name: 'conversions' },
        ],
        limit: '1000',
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      },
    })

    type DimVal = { value?: string | null }
    type MetVal = { value?: string | null }
    type GA4Row = { dimensionValues?: DimVal[] | null; metricValues?: MetVal[] | null }

    const gaRows: GA4Row[] = gaRes.data.rows ?? []

    const rows = gaRows.map((row) => {
      const dims = row.dimensionValues ?? []
      const mets = row.metricValues ?? []
      return {
        run_id: runId,
        site_id: siteId,
        page_path: dims[0]?.value ?? '',
        channel: dims[1]?.value ?? '',
        sessions: parseInt(mets[0]?.value ?? '0', 10),
        engaged_sessions: parseInt(mets[1]?.value ?? '0', 10),
        bounce_rate: parseFloat(mets[2]?.value ?? '0'),
        avg_engagement_time: parseFloat(mets[3]?.value ?? '0'),
        conversions: parseInt(mets[4]?.value ?? '0', 10),
      }
    }).filter((r) => r.page_path)

    if (rows.length > 0) {
      const BATCH = 500
      for (let i = 0; i < rows.length; i += BATCH) {
        const { error: insErr } = await admin
          .from('ga4_intel_pages')
          .insert(rows.slice(i, i + BATCH))
        if (insErr) throw insErr
      }
    }

    await admin
      .from('ga4_intel_runs')
      .update({ status: 'complete', row_count: rows.length })
      .eq('id', runId)

    return NextResponse.json({ runId, rowCount: rows.length })
  } catch (err) {
    console.error('[ga4-intel/fetch]', err)

    await admin
      .from('ga4_intel_runs')
      .update({ status: 'error' })
      .eq('id', runId)

    if (isInvalidGrant(err)) {
      return NextResponse.json({ error: 'reconnect_required' }, { status: 422 })
    }

    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'GA4 fetch failed' },
      { status: 500 }
    )
  }
}
