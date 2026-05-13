import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardIndexPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: oauthSites } = await supabase
    .from('connected_sites')
    .select('id')
    .eq('user_id', user.id)
    .not('access_token', 'is', null)
    .order('token_expiry', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(1)

  if (oauthSites && oauthSites.length > 0) {
    redirect(`/dashboard/${oauthSites[0].id}`)
  }

  const { data: sites } = await supabase
    .from('connected_sites')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  if (sites && sites.length > 0) {
    redirect(`/dashboard/${sites[0].id}`)
  }

  redirect('/dashboard/connect')
}
