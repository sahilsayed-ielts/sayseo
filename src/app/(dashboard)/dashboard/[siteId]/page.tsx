import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from '@/components/dashboard/DashboardClient'

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

  return <DashboardClient siteId={siteId} site={site} />
}
