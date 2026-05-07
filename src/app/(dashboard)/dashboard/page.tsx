import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardIndexPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: sites } = await supabase
    .from('connected_sites')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)

  if (sites && sites.length > 0) {
    redirect(`/dashboard/${sites[0].id}`)
  }

  redirect('/dashboard/connect')
}
