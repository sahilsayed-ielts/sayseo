import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import GA4IntelClient, { type GA4AnalysisJSON, type GA4Run } from '@/components/dashboard/GA4IntelClient'

export default async function GA4IntelPage({
  params,
}: {
  params: Promise<{ siteId: string }>
}) {
  const { siteId } = await params
  const supabase = await createClient()

  const { data: site } = await supabase
    .from('connected_sites')
    .select('id, domain, ga4_property_id, access_token')
    .eq('id', siteId)
    .single()

  if (!site) notFound()

  const admin = createAdminClient()

  const [runsResult, oauthResult] = await Promise.all([
    admin
      .from('ga4_intel_runs')
      .select('id, fetched_at, row_count, status')
      .eq('site_id', siteId)
      .order('fetched_at', { ascending: false })
      .limit(20),
    admin
      .from('oauth_tokens')
      .select('id')
      .eq('site_id', siteId)
      .in('provider', ['ga4', 'gsc'])
      .limit(1)
      .maybeSingle(),
  ])

  const runs: GA4Run[] = (runsResult.data ?? []) as GA4Run[]
  const hasGa4Token = !!(oauthResult.data) || !!(site.access_token)

  const latestCompleteRun = runs.find((r) => r.status === 'complete')
  let initialAnalysis: GA4AnalysisJSON | null = null
  let initialRunId: string | null = null

  if (latestCompleteRun) {
    const { data: analysisRow } = await admin
      .from('ga4_intel_analyses')
      .select('analysis_json, run_id')
      .eq('run_id', latestCompleteRun.id)
      .maybeSingle()

    if (analysisRow) {
      initialAnalysis = analysisRow.analysis_json as GA4AnalysisJSON
      initialRunId = analysisRow.run_id as string
    }
  }

  return (
    <GA4IntelClient
      siteId={siteId}
      domain={site.domain}
      hasGa4Token={hasGa4Token}
      ga4PropertyId={(site as { ga4_property_id?: string | null }).ga4_property_id ?? null}
      initialRuns={runs}
      initialAnalysis={initialAnalysis}
      initialRunId={initialRunId}
    />
  )
}
