import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import DashboardClient from '@/components/dashboard/DashboardClient'

function scoreColour(score: number) {
  if (score <= 40) return { text: '#f87171', bg: 'rgba(248,113,113,0.1)', ring: 'rgba(248,113,113,0.3)' }
  if (score <= 70) return { text: '#fbbf24', bg: 'rgba(251,191,36,0.1)', ring: 'rgba(251,191,36,0.3)' }
  return { text: '#00D4AA', bg: 'rgba(0,212,170,0.1)', ring: 'rgba(0,212,170,0.3)' }
}

export default async function SiteDashboardPage({
  params,
}: {
  params: Promise<{ siteId: string }>
}) {
  const { siteId } = await params
  const supabase = await createClient()

  const { data: site } = await supabase
    .from('connected_sites')
    .select('id, user_id, domain, last_synced, ga4_property_id, gsc_site_url, access_token')
    .eq('id', siteId)
    .single()

  if (!site) notFound()

  // Check whether this site has OAuth tokens (i.e. was connected via Google)
  const admin = createAdminClient()
  const { count } = await admin
    .from('oauth_tokens')
    .select('id', { count: 'exact', head: true })
    .eq('site_id', siteId)

  const hasCredentials = Boolean(site.access_token) || (count ?? 0) > 0

  // Fetch latest visibility score for the score card
  const { data: latestScore } = await admin
    .from('visibility_scores')
    .select('score, score_change, calculated_at')
    .eq('site_id', siteId)
    .order('calculated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const score = latestScore?.score ?? null
  const colours = score !== null ? scoreColour(score) : null

  const scoreCard = (
    <div
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '1rem 1.5rem' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: colours ? colours.bg : 'rgba(255,255,255,0.03)',
          border: `1px solid ${colours ? colours.ring : 'rgba(255,255,255,0.08)'}`,
          borderRadius: '0.75rem',
          padding: '0.875rem 1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: 52,
              height: 52,
              borderRadius: '50%',
              border: `2px solid ${colours ? colours.ring : 'rgba(255,255,255,0.15)'}`,
              background: 'rgba(0,0,0,0.3)',
              flexShrink: 0,
            }}
          >
            {score !== null ? (
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: colours!.text, lineHeight: 1 }}>{score}</span>
            ) : (
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'rgba(255,255,255,0.2)', lineHeight: 1 }}>—</span>
            )}
          </div>
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>
              AI Visibility Score
            </p>
            <p style={{ fontSize: '0.875rem', color: score !== null ? colours!.text : 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
              {score !== null
                ? score <= 40 ? 'Needs Work' : score <= 70 ? 'Developing' : 'Strong'
                : 'Not calculated yet'}
            </p>
            {latestScore?.score_change !== undefined && latestScore.score_change !== 0 && (
              <p style={{ fontSize: '0.7rem', color: (latestScore.score_change ?? 0) > 0 ? '#34d399' : '#f87171', marginTop: 2 }}>
                {(latestScore.score_change ?? 0) > 0 ? '↑' : '↓'} {Math.abs(latestScore.score_change ?? 0)} pts since last check
              </p>
            )}
          </div>
        </div>
        <Link
          href={`/dashboard/${siteId}/score`}
          style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: colours ? colours.text : 'rgba(255,255,255,0.4)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            opacity: 0.85,
          }}
        >
          View Breakdown
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </div>
  )

  const intelligenceSection = (
    <div style={{ padding: '1.5rem' }}>
      <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '0.875rem' }}>
        Intelligence
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        {[
          {
            href: `/dashboard/${siteId}/recommendations`,
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="1.8" aria-hidden="true">
                <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ),
            label: 'Recommendations',
            sublabel: 'Fix list, content gaps & schema',
          },
          {
            href: `/dashboard/${siteId}/competitors`,
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="1.8" aria-hidden="true">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ),
            label: 'Competitor Compare',
            sublabel: 'Benchmark against rivals',
          },
          {
            href: `/dashboard/${siteId}/score`,
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ),
            label: 'Score Breakdown',
            sublabel: 'Module scores & history',
          },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            style={{
              display: 'block',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '0.75rem',
              padding: '1rem',
              textDecoration: 'none',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            className="hover:bg-white/[0.07] hover:border-[#00D4AA]/25"
          >
            <div style={{ marginBottom: '0.5rem' }}>{card.icon}</div>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: 2 }}>{card.label}</p>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>{card.sublabel}</p>
          </Link>
        ))}
      </div>
    </div>
  )

  const connectBanner = !hasCredentials ? (
    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        background: 'rgba(0,212,170,0.07)',
        border: '1px solid rgba(0,212,170,0.25)',
        borderRadius: '0.75rem',
        padding: '1rem 1.25rem',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="1.8" aria-hidden="true">
            <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', marginBottom: 2 }}>
              Connect your Google account
            </p>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>
              Link GA4 and Search Console to see AI traffic data for {site.domain}.
            </p>
          </div>
        </div>
        <a
          href={`/api/auth/google?siteId=${siteId}`}
          style={{
            flexShrink: 0,
            padding: '0.5rem 1.125rem',
            borderRadius: '0.5rem',
            background: '#00D4AA',
            color: '#0A0A0A',
            fontSize: '0.8125rem',
            fontWeight: 700,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          Connect Google
        </a>
      </div>
    </div>
  ) : null

  return (
    <>
      {connectBanner}
      {scoreCard}
      <DashboardClient siteId={siteId} site={site} />
      {intelligenceSection}
    </>
  )
}
