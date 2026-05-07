import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import DashboardClient from '@/components/dashboard/DashboardClient'
import ManualConnectionState from '@/components/dashboard/ManualConnectionState'

export default async function SiteDashboardPage({
  params,
}: {
  params: Promise<{ siteId: string }>
}) {
  const { siteId } = await params
  const supabase = await createClient()

  const { data: site } = await supabase
    .from('connected_sites')
    .select('id, domain, last_synced, ga4_property_id, gsc_site_url')
    .eq('id', siteId)
    .single()

  if (!site) notFound()

  // Check whether this site has OAuth tokens (i.e. was connected via Google)
  const admin = createAdminClient()
  const { count } = await admin
    .from('oauth_tokens')
    .select('id', { count: 'exact', head: true })
    .eq('site_id', siteId)

  const hasCredentials = (count ?? 0) > 0

  if (!hasCredentials) {
    return <ManualConnectionState site={site} />
  }

  return <DashboardClient siteId={siteId} site={site} />
}
