import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserSites } from '@/lib/sites'
import DashboardHeader from '@/components/DashboardHeader'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_complete')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile?.onboarding_complete) redirect('/onboarding')

  const sites = await getUserSites(user.id)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', color: '#fff' }}>
      <DashboardHeader sites={sites} userEmail={user.email ?? ''} />
      <main>{children}</main>
    </div>
  )
}
