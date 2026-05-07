import Link from 'next/link'
import type { Site } from './types'

const steps = [
  {
    n: 1,
    title: 'Click "Connect via Google" below',
    body: 'This starts the Google OAuth flow so SaySEO can read your GA4 and Search Console data.',
  },
  {
    n: 2,
    title: 'Sign in with the Google account that owns your property',
    body: 'Use the account that has at least Viewer access to your GA4 property and Search Console site.',
  },
  {
    n: 3,
    title: 'Select your GA4 property and GSC site',
    body: 'SaySEO will auto-detect the properties on your account — just pick the right ones from the dropdowns.',
  },
  {
    n: 4,
    title: 'Your AI traffic data will appear automatically',
    body: 'Once connected, SaySEO fetches up to 90 days of historical data. No manual exports needed.',
  },
]

export default function ManualConnectionState({ site }: { site: Site }) {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '3rem 1.5rem' }}>
      {/* Domain header */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#00D4AA', margin: '0 0 0.25rem' }}>
          AI Visibility Dashboard
        </p>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
          {site.domain}
        </h1>
      </div>

      {/* Banner */}
      <div
        style={{
          backgroundColor: '#111',
          border: '1px solid rgba(255,200,0,0.2)',
          borderLeft: '3px solid #f59e0b',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '1.25rem', flexShrink: 0, marginTop: 2 }}>⚠</span>
          <div>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#fff', margin: '0 0 0.5rem', letterSpacing: '-0.01em' }}>
              Manual connection detected — no data access yet
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.6 }}>
              This site was added manually without granting SaySEO access to your Google Analytics
              or Search Console. To see your AI traffic data, you need to connect via Google OAuth.
            </p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div
        style={{
          backgroundColor: '#111',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 1.25rem' }}>
          How to connect
        </h3>
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {steps.map((step) => (
            <li key={step.n} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <span
                style={{
                  flexShrink: 0,
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0,212,170,0.12)',
                  border: '1px solid rgba(0,212,170,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#00D4AA',
                }}
              >
                {step.n}
              </span>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', margin: '0 0 0.2rem' }}>
                  {step.title}
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.55 }}>
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link
          href="/dashboard/connect"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.5rem',
            borderRadius: '0.5rem',
            backgroundColor: '#00D4AA',
            color: '#0A0A0A',
            fontWeight: 700,
            fontSize: '0.875rem',
            textDecoration: 'none',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
          </svg>
          Connect via Google
        </Link>
        <Link
          href="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.625rem 1.25rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.6)',
            fontWeight: 600,
            fontSize: '0.875rem',
            textDecoration: 'none',
          }}
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
