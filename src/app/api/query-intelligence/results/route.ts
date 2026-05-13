import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const runId = searchParams.get('runId')
  const siteId = searchParams.get('siteId')

  if (!runId || !siteId) {
    return NextResponse.json({ error: 'runId and siteId are required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const admin = createAdminClient()

  const { data: rows, error } = await admin
    .from('query_intelligence_results')
    .select('query, page, clicks, impressions, ctr, position')
    .eq('run_id', runId)
    .order('impressions', { ascending: false })

  if (error || !rows) {
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }

  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  const header = ['query', 'page', 'clicks', 'impressions', 'ctr', 'position'].map(escape).join(',')
  const lines = rows.map((r) =>
    [r.query, r.page, r.clicks ?? 0, r.impressions ?? 0,
      ((r.ctr ?? 0) * 100).toFixed(2) + '%', Number(r.position ?? 0).toFixed(1)]
      .map(escape).join(',')
  )

  const csv = [header, ...lines].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="query-intelligence-${runId.slice(0, 8)}.csv"`,
    },
  })
}
