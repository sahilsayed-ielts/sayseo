import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import OverviewClient, { type RunMeta } from '@/components/dashboard/OverviewClient'
import type { QIAnalysis } from '@/lib/query-intelligence/analyser'
import type { GA4Analysis } from '@/lib/ga4-intel/analyser'

export default async function SiteDashboardPage({
  params,
}: {
  params: Promise<{ siteId: string }>
}) {
  const { siteId } = await params
  const supabase = await createClient()

  const { data: site } = await supabase
    .from('connected_sites')
    .select('id, domain')
    .eq('id', siteId)
    .single()

  if (!site) notFound()

  const admin = createAdminClient()

  const [
    { data: qiRunsData },
    { data: ga4RunsData },
    { data: latestScoreData },
    { data: aiCacheRow },
  ] = await Promise.all([
    admin
      .from('query_intelligence_runs')
      .select('id, fetched_at, date_from, date_to, row_count, source, status')
      .eq('site_id', siteId)
      .eq('status', 'complete')
      .order('fetched_at', { ascending: false })
      .limit(20),
    admin
      .from('ga4_intel_runs')
      .select('id, fetched_at, date_from, date_to, row_count, source, status')
      .eq('site_id', siteId)
      .eq('status', 'complete')
      .order('fetched_at', { ascending: false })
      .limit(20),
    admin
      .from('visibility_scores')
      .select('score, module1_score, module2_score, module3_score')
      .eq('site_id', siteId)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from('report_cache')
      .select('data')
      .eq('site_id', siteId)
      .eq('report_type', 'ai-traffic')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const qiRuns: RunMeta[] = (qiRunsData ?? []) as RunMeta[]
  const ga4Runs: RunMeta[] = (ga4RunsData ?? []) as RunMeta[]

  // Load latest QI analysis
  const latestQIRun = qiRuns[0] ?? null
  let initialQIAnalysis: QIAnalysis | null = null
  if (latestQIRun) {
    const { data } = await admin
      .from('query_intelligence_analyses')
      .select('analysis_json')
      .eq('run_id', latestQIRun.id)
      .maybeSingle()
    if (data) initialQIAnalysis = data.analysis_json as QIAnalysis
  }

  // Load latest GA4 analysis
  const latestGA4Run = ga4Runs[0] ?? null
  let initialGA4Analysis: GA4Analysis | null = null
  if (latestGA4Run) {
    const { data } = await admin
      .from('ga4_intel_analyses')
      .select('analysis_json')
      .eq('run_id', latestGA4Run.id)
      .maybeSingle()
    if (data) initialGA4Analysis = data.analysis_json as GA4Analysis
  }

  const latestScore = latestScoreData ?? null
  const cachedAiTraffic = aiCacheRow?.data ?? null

  return (
    <OverviewClient
      siteId={siteId}
      domain={site.domain}
      qiRuns={qiRuns}
      ga4Runs={ga4Runs}
      initialQIAnalysis={initialQIAnalysis}
      initialQIRunId={latestQIRun?.id ?? null}
      initialGA4Analysis={initialGA4Analysis}
      initialGA4RunId={latestGA4Run?.id ?? null}
      latestScore={latestScore}
      cachedAiTraffic={cachedAiTraffic}
    />
  )
}
