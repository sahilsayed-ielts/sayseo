import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { analyse, type QueryRow, type PageRow } from '@/lib/query-intelligence/analyser'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await req.json() as {
    siteId: string
    dateFrom: string
    dateTo: string
    compareFrom?: string
    compareTo?: string
    domain?: string
    queries: QueryRow[]
    pages?: PageRow[]
  }

  const { siteId, dateFrom, dateTo, compareFrom, compareTo, domain, queries, pages = [] } = body

  if (!siteId) return NextResponse.json({ error: 'siteId is required' }, { status: 400 })
  if (!queries?.length) return NextResponse.json({ error: 'No query data provided' }, { status: 400 })

  const admin = createAdminClient()

  // Create run record
  const { data: run, error: runErr } = await admin
    .from('query_intelligence_runs')
    .insert({
      site_id: siteId,
      date_from: dateFrom,
      date_to: dateTo,
      compare_from: compareFrom ?? null,
      compare_to: compareTo ?? null,
      source: 'upload',
      status: 'pending',
      row_count: queries.length + pages.length,
    })
    .select('id')
    .single()

  if (runErr || !run) {
    console.error('[qi/upload] run insert error:', runErr)
    return NextResponse.json({ error: 'Failed to create run' }, { status: 500 })
  }

  const runId = run.id

  try {
    // Store query rows
    if (queries.length > 0) {
      const queryRows = queries.map(q => ({
        run_id: runId,
        site_id: siteId,
        row_type: 'query',
        query: q.query,
        page: null,
        clicks: q.clicks,
        impressions: q.impressions,
        ctr: q.ctr,
        position: q.position,
        prev_clicks: q.prevClicks ?? null,
        prev_impressions: q.prevImpressions ?? null,
        prev_ctr: q.prevCtr ?? null,
        prev_position: q.prevPosition ?? null,
      }))
      // Insert in batches to avoid payload limits
      for (let i = 0; i < queryRows.length; i += 500) {
        const { error } = await admin.from('query_intelligence_results').insert(queryRows.slice(i, i + 500))
        if (error) throw error
      }
    }

    // Store page rows
    if (pages.length > 0) {
      const pageRows = pages.map(p => ({
        run_id: runId,
        site_id: siteId,
        row_type: 'page',
        query: null,
        page: p.page,
        clicks: p.clicks,
        impressions: p.impressions,
        ctr: p.ctr,
        position: p.position,
        prev_clicks: p.prevClicks ?? null,
        prev_impressions: p.prevImpressions ?? null,
        prev_ctr: p.prevCtr ?? null,
        prev_position: p.prevPosition ?? null,
      }))
      for (let i = 0; i < pageRows.length; i += 500) {
        const { error } = await admin.from('query_intelligence_results').insert(pageRows.slice(i, i + 500))
        if (error) throw error
      }
    }

    // Run analysis
    const hasComparison = queries.some(q => q.prevImpressions !== undefined)
    const analysis = analyse({ queries, pages, domain, hasComparison })

    // Store analysis
    const { error: analysisErr } = await admin
      .from('query_intelligence_analyses')
      .insert({ run_id: runId, site_id: siteId, analysis_json: analysis })

    if (analysisErr) throw analysisErr

    await admin
      .from('query_intelligence_runs')
      .update({ status: 'complete' })
      .eq('id', runId)

    return NextResponse.json({ runId, analysis, rowCount: queries.length })
  } catch (err) {
    console.error('[qi/upload] error:', err)
    await admin.from('query_intelligence_runs').update({ status: 'error' }).eq('id', runId)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Upload failed' }, { status: 500 })
  }
}
