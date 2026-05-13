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
    .from('ga4_intel_pages')
    .select('page_path, channel, sessions, engaged_sessions, bounce_rate, avg_engagement_time, conversions')
    .eq('run_id', runId)
    .order('sessions', { ascending: false })

  if (error || !rows) {
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }

  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  const header = ['page_path', 'channel', 'sessions', 'engaged_sessions', 'bounce_rate', 'avg_engagement_time_s', 'conversions'].map(escape).join(',')
  const lines = rows.map((r) =>
    [
      r.page_path,
      r.channel ?? '',
      r.sessions ?? 0,
      r.engaged_sessions ?? 0,
      Number(r.bounce_rate ?? 0).toFixed(3),
      Number(r.avg_engagement_time ?? 0).toFixed(1),
      r.conversions ?? 0,
    ].map(escape).join(',')
  )

  return new NextResponse([header, ...lines].join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="ga4-intel-${runId.slice(0, 8)}.csv"`,
    },
  })
}
