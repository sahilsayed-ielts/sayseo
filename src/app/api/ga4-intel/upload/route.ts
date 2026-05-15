import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { analyse, type GA4PageRow, type GA4ChannelRow } from '@/lib/ga4-intel/analyser'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await req.json() as {
    siteId: string
    dateFrom?: string | null
    dateTo?: string | null
    pages: GA4PageRow[]
    channels?: GA4ChannelRow[]
    hasComparison: boolean
  }

  const { siteId, dateFrom, dateTo, pages, channels = [], hasComparison } = body

  if (!siteId) return NextResponse.json({ error: 'siteId is required' }, { status: 400 })
  if (!pages?.length) return NextResponse.json({ error: 'No page data provided' }, { status: 400 })

  const admin = createAdminClient()

  // Create run record
  const { data: run, error: runErr } = await admin
    .from('ga4_intel_runs')
    .insert({
      site_id: siteId,
      date_from: dateFrom ?? null,
      date_to: dateTo ?? null,
      source: 'upload',
      status: 'pending',
      row_count: pages.length,
    })
    .select('id')
    .single()

  if (runErr || !run) {
    console.error('[ga4-intel/upload] run insert error:', runErr)
    return NextResponse.json({ error: 'Failed to create run' }, { status: 500 })
  }

  const runId = run.id as string

  try {
    const analysis = analyse({ pages, channels, hasComparison })

    const { error: analysisErr } = await admin
      .from('ga4_intel_analyses')
      .insert({ run_id: runId, site_id: siteId, analysis_json: analysis })

    if (analysisErr) throw analysisErr

    await admin
      .from('ga4_intel_runs')
      .update({ status: 'complete' })
      .eq('id', runId)

    return NextResponse.json({ runId, analysis, rowCount: pages.length })
  } catch (err) {
    console.error('[ga4-intel/upload] error:', err)
    await admin.from('ga4_intel_runs').update({ status: 'error' }).eq('id', runId)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Upload failed' }, { status: 500 })
  }
}
