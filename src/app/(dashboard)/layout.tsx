import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', color: '#fff' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          height: 56,
          backgroundColor: '#0A0A0A',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
        }}
      >
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>Say</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#00D4AA', letterSpacing: '-0.03em' }}>SEO</span>
        </Link>

        <nav style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem' }}>
          <Link href="/dashboard/connect" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>
            Connect
          </Link>
        </nav>

        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.email}
        </span>
      </header>

      <main>{children}</main>
    </div>
  )
}
