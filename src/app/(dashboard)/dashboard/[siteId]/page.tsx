import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function SiteDashboardPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params
  const supabase = await createClient()

  const { data: site } = await supabase
    .from('connected_sites')
    .select('id, domain, ga4_property_id, gsc_site_url, created_at')
    .eq('id', siteId)
    .single()

  if (!site) notFound()

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#00D4AA', flexShrink: 0 }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#00D4AA' }}>
            Connected
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
          {site.domain}
        </h1>
        <p style={{ marginTop: '0.5rem', color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem' }}>
          Site ID: {site.id}
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        {[
          { label: 'GA4 Property', value: site.ga4_property_id ?? '—' },
          { label: 'GSC Site', value: site.gsc_site_url ?? '—' },
          { label: 'Connected', value: new Date(site.created_at).toLocaleDateString('en-GB') },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              backgroundColor: '#111',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '0.75rem',
              padding: '1.25rem',
            }}
          >
            <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', margin: '0 0 0.5rem' }}>
              {label}
            </p>
            <p style={{ fontSize: '0.9rem', color: '#fff', margin: 0, wordBreak: 'break-all' }}>{value}</p>
          </div>
        ))}
      </div>

      <div
        style={{
          backgroundColor: '#111',
          border: '1px solid rgba(0,212,170,0.2)',
          borderRadius: '0.75rem',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚧</div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: '0 0 0.5rem' }}>
          Dashboard coming soon
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', margin: '0 0 1.5rem' }}>
          AI visibility reports, GA4 attribution, and GSC insights are being built.
        </p>
        <Link
          href="/dashboard/connect"
          style={{
            display: 'inline-block',
            padding: '0.625rem 1.25rem',
            borderRadius: '0.5rem',
            backgroundColor: '#00D4AA',
            color: '#0A0A0A',
            fontWeight: 700,
            fontSize: '0.875rem',
            textDecoration: 'none',
          }}
        >
          Connect another site
        </Link>
      </div>
    </div>
  )
}
