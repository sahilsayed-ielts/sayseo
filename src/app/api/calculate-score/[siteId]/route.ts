import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface QIMeta {
  avg_position: number
  avg_ctr: number
  total_clicks: number
  total_impressions: number
}

interface GA4Meta {
  avg_engagement_rate: number
  avg_engagement_time: number
  total_sessions: number
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

  const [
    { data: qiRow },
    { data: ga4Row },
    { data: aioRow },
  ] = await Promise.all([
    admin
      .from('query_intelligence_analyses')
      .select('analysis_json')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from('ga4_intel_analyses')
      .select('analysis_json')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from('aio_summary')
      .select('queries_checked, aio_triggers')
      .eq('site_id', siteId)
      .maybeSingle(),
  ])

  // ── Module 1: Search Performance (max 40) ─────────────────────────────────
  // Source: latest Query Intelligence analysis
  const qiMeta = (qiRow?.analysis_json as { meta?: QIMeta } | null)?.meta
  let module1_score = 0
  if (qiMeta && qiMeta.total_impressions > 0) {
    // Position score (max 20): position 1 = 20, position 50+ = 0
    const posScore = Math.max(0, Math.min(20, Math.round(20 - (qiMeta.avg_position - 1) * 0.42)))
    // CTR score (max 20): 10%+ = full marks
    const ctrScore = Math.min(20, Math.round((qiMeta.avg_ctr / 0.10) * 20))
    module1_score = posScore + ctrScore
  }

  // ── Module 2: Engagement Quality (max 40) ─────────────────────────────────
  // Source: latest GA4 Intel analysis
  const ga4Meta = (ga4Row?.analysis_json as { meta?: GA4Meta } | null)?.meta
  let module2_score = 0
  if (ga4Meta && ga4Meta.total_sessions > 0) {
    // Engagement rate score (max 25): 65%+ = full marks
    const erScore = Math.min(25, Math.round((ga4Meta.avg_engagement_rate / 0.65) * 25))
    // Engagement time score (max 15): 120s+ = full marks
    const etScore = Math.min(15, Math.round((ga4Meta.avg_engagement_time / 120) * 15))
    module2_score = erScore + etScore
  }

  // ── Module 3: AI Overview Rate (max 20) ───────────────────────────────────
  const aioRate =
    (aioRow?.queries_checked ?? 0) > 0
      ? ((aioRow!.aio_triggers ?? 0) / aioRow!.queries_checked)
      : 0
  const module3_score = Math.min(20, Math.round(aioRate * 20))

  const score = module1_score + module2_score + module3_score

  // ── Score change vs previous ──────────────────────────────────────────────
  const { data: prevRow } = await admin
    .from('visibility_scores')
    .select('score')
    .eq('site_id', siteId)
    .order('calculated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const score_change = prevRow ? score - prevRow.score : 0

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
