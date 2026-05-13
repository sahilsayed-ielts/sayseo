import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getOAuthClient, isInvalidGrant } from '@/lib/google-clients'
import { google } from 'googleapis'

function dateString(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split('T')[0]
}

export async function POST(req: NextRequest) {
  const { siteId } = await req.json()
  if (!siteId) return NextResponse.json({ error: 'siteId is required' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: site } = await supabase
    .from('connected_sites')
    .select('id, domain, gsc_site_url')
    .eq('id', siteId)
    .single()

  if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 })
  if (!site.gsc_site_url) {
    return NextResponse.json({ error: 'No GSC site URL configured for this site' }, { status: 422 })
  }

  const admin = createAdminClient()

  const { data: run, error: runErr } = await admin
    .from('query_intelligence_runs')
    .insert({ site_id: siteId, status: 'pending' })
    .select('id')
    .single()

  if (runErr || !run) {
    return NextResponse.json({ error: 'Failed to create run record' }, { status: 500 })
  }

  const runId = run.id

  try {
    const auth = await getOAuthClient(siteId, ['gsc', 'ga4'])
    const searchconsole = google.searchconsole({ version: 'v1', auth })

    const gscRes = await searchconsole.searchanalytics.query({
      siteUrl: site.gsc_site_url,
      requestBody: {
        startDate: dateString(28),
        endDate: dateString(1),
        dimensions: ['query', 'page'],
        rowLimit: 1000,
      },
    })

    const rows = (gscRes.data.rows ?? []).map((row) => ({
      run_id: runId,
      site_id: siteId,
      query: row.keys?.[0] ?? '',
      page: row.keys?.[1] ?? '',
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    }))

    if (rows.length > 0) {
      const { error: insErr } = await admin
        .from('query_intelligence_results')
        .insert(rows)
      if (insErr) throw insErr
    }

    await admin
      .from('query_intelligence_runs')
      .update({ status: 'complete', row_count: rows.length })
      .eq('id', runId)

    return NextResponse.json({ runId, rowCount: rows.length })
  } catch (err) {
    console.error('[query-intelligence/fetch]', err)

    await admin
      .from('query_intelligence_runs')
      .update({ status: 'error' })
      .eq('id', runId)

    if (isInvalidGrant(err)) {
      return NextResponse.json({ error: 'reconnect_required' }, { status: 422 })
    }

    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'GSC fetch failed' },
      { status: 500 }
    )
  }
}
