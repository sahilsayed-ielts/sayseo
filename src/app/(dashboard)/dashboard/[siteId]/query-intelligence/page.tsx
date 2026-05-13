import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import QueryIntelligenceClient, { type AnalysisJSON, type QIRun } from '@/components/dashboard/QueryIntelligenceClient'

export default async function QueryIntelligencePage({
  params,
}: {
  params: Promise<{ siteId: string }>
}) {
  const { siteId } = await params
  const supabase = await createClient()

  const { data: site } = await supabase
    .from('connected_sites')
    .select('id, domain, gsc_site_url, access_token')
    .eq('id', siteId)
    .single()

  if (!site) notFound()

  const admin = createAdminClient()

  const [runsResult, oauthResult] = await Promise.all([
    admin
      .from('query_intelligence_runs')
      .select('id, fetched_at, row_count, status')
      .eq('site_id', siteId)
      .order('fetched_at', { ascending: false })
      .limit(20),
    admin
      .from('oauth_tokens')
      .select('id')
      .eq('site_id', siteId)
      .in('provider', ['gsc', 'ga4'])
      .limit(1)
      .maybeSingle(),
  ])

  const runs: QIRun[] = (runsResult.data ?? []) as QIRun[]
  const hasGscToken = !!(oauthResult.data) || !!(site.access_token)

  // Load analysis for the most recent complete run, if one exists
  const latestCompleteRun = runs.find((r) => r.status === 'complete')
  let initialAnalysis: AnalysisJSON | null = null
  let initialRunId: string | null = null

  if (latestCompleteRun) {
    const { data: analysisRow } = await admin
      .from('query_intelligence_analyses')
      .select('analysis_json, run_id')
      .eq('run_id', latestCompleteRun.id)
      .maybeSingle()

    if (analysisRow) {
      initialAnalysis = analysisRow.analysis_json as AnalysisJSON
      initialRunId = analysisRow.run_id as string
    }
  }

  return (
    <QueryIntelligenceClient
      siteId={siteId}
      domain={site.domain}
      hasGscToken={hasGscToken}
      initialRuns={runs}
      initialAnalysis={initialAnalysis}
      initialRunId={initialRunId}
    />
  )
}
