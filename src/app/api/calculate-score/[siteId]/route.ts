import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface CachedAiReport {
  aiPercentage: number
  aiSources: Array<{ trend: number | null; sessions: number }>
  topPages: Array<{ url: string; sessions: number }>
  topQueries: Array<{ query: string; clicks: number }>
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: site } = await supabase
    .from('connected_sites')
    .select('id')
    .eq('id', siteId)
    .single()
  if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 })

  const admin = createAdminClient()

  // ── Module 1: AI traffic data from report cache ────────────────────────────
  const { data: cacheRow } = await admin
    .from('report_cache')
    .select('data')
    .eq('site_id', siteId)
    .eq('report_type', 'ai-traffic')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const m1Data = (cacheRow?.data ?? {}) as Partial<CachedAiReport>
  const aiPercentage = m1Data.aiPercentage ?? 0
  const trendUp = (m1Data.aiSources ?? []).some(
    (s) => s.trend !== null && s.trend > 0
  )
  const module1_score = Math.min(33, Math.round((aiPercentage / 100) * 20 + (trendUp ? 13 : 0)))

  // ── Module 2: citation rate ────────────────────────────────────────────────
  const { data: citRows } = await admin
    .from('citation_summary')
    .select('mention_count, total_checks')
    .eq('site_id', siteId)

  const totalChecks = (citRows ?? []).reduce((s, r) => s + r.total_checks, 0)
  const totalMentions = (citRows ?? []).reduce((s, r) => s + r.mention_count, 0)
  const citationRate = totalChecks > 0 ? (totalMentions / totalChecks) * 100 : 0
  const module2_score = Math.min(33, Math.round((citationRate / 100) * 33))

  // ── Module 3: AIO appearance rate ─────────────────────────────────────────
  const { data: aioRow } = await admin
    .from('aio_summary')
    .select('queries_checked, aio_triggers')
    .eq('site_id', siteId)
    .maybeSingle()

  const aioRate =
    (aioRow?.queries_checked ?? 0) > 0
      ? ((aioRow!.aio_triggers ?? 0) / aioRow!.queries_checked) * 100
      : 0
  const module3_score = Math.min(34, Math.round((aioRate / 100) * 34))

  const score = module1_score + module2_score + module3_score

  // ── Compute score change against previous row ──────────────────────────────
  const { data: prevRow } = await admin
    .from('visibility_scores')
    .select('score')
    .eq('site_id', siteId)
    .order('calculated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const score_change = prevRow ? score - prevRow.score : 0

  // ── Insert new score row ───────────────────────────────────────────────────
  const { error: insertErr } = await admin.from('visibility_scores').insert({
    site_id: siteId,
    score,
    module1_score,
    module2_score,
    module3_score,
    score_change,
  })

  if (insertErr) {
    console.error('[calculate-score] insert error:', insertErr)
    return NextResponse.json({ error: 'Failed to save score' }, { status: 500 })
  }

  return NextResponse.json({ score, module1_score, module2_score, module3_score, score_change })
}
