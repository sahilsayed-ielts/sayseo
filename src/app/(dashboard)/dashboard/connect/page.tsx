'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// ─── Types ───────────────────────────────────────────────────────────────────

interface GA4Property {
  propertyId: string
  displayName: string
}

interface GSCSite {
  siteUrl: string
}

type OauthStep = 'idle' | 'loading' | 'selecting' | 'saving' | 'connected'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractDomain(url: string): string {
  if (url.startsWith('sc-domain:')) return url.replace('sc-domain:', '')
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

function oauthErrorMessage(code: string | null): string | null {
  if (!code) return null
  const messages: Record<string, string> = {
    oauth_denied: 'You cancelled the Google authorisation. Please try again.',
    invalid_callback: 'The OAuth callback was malformed. Please try again.',
    state_mismatch: 'Security check failed. Please try again.',
    token_exchange_failed: 'Could not exchange the authorisation code. Please try again.',
  }
  return messages[code] ?? `OAuth error: ${code.replace(/_/g, ' ')}`
}

// ─── Small UI atoms ───────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin" style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

function CheckCircle() {
  return (
    <svg style={{ width: 40, height: 40 }} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#00D4AA" fillOpacity={0.15} />
      <path d="M8 12l3 3 5-5" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

// ─── Styled select ────────────────────────────────────────────────────────────

function StyledSelect({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <div>
      <label
        htmlFor={id}
        style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)', marginBottom: '0.4rem' }}
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          backgroundColor: '#1a1a1a',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '0.5rem',
          color: '#fff',
          fontSize: '0.875rem',
          padding: '0.625rem 0.875rem',
          outline: 'none',
          cursor: 'pointer',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </select>
    </div>
  )
}

// ─── Help modal ───────────────────────────────────────────────────────────────

function HelpModal({ siteId, onDismiss }: { siteId: string | null; onDismiss: () => void }) {
  const router = useRouter()
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onDismiss() }}
    >
      <div
        style={{
          backgroundColor: '#111',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '1rem',
          maxWidth: 520,
          width: '100%',
          padding: '2rem',
        }}
      >
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: '0 0 0.5rem' }}>
          Manual API access setup
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 1.5rem', lineHeight: 1.7 }}>
          Your site has been saved. To pull live data, grant SaySEO read access to your Google properties:
        </p>

        <ol style={{ margin: '0 0 1.5rem', padding: '0 0 0 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            {
              title: 'Find your GA4 Property ID',
              body: 'In Google Analytics, go to Admin → Property Settings. The Property ID is the numeric value shown at the top (e.g. 123456789).',
            },
            {
              title: 'Find your GSC Site URL',
              body: 'In Google Search Console, select your property from the dropdown. The full URL shown in the address bar is your site URL.',
            },
            {
              title: 'Grant API access',
              body: 'Create a service account in Google Cloud Console, then add it as a Viewer in both GA4 (Admin → Property Access Management) and GSC (Settings → Users and permissions). Email the service account key to support@sayseo.co.uk and we\'ll complete setup within 24 hours.',
            },
          ].map(({ title, body }, i) => (
            <li key={i} style={{ fontSize: '0.875rem', lineHeight: 1.7 }}>
              <span style={{ fontWeight: 700, color: '#00D4AA' }}>{title}.</span>{' '}
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>{body}</span>
            </li>
          ))}
        </ol>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onDismiss}
            style={{
              padding: '0.625rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.55)',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
          {siteId && (
            <button
              onClick={() => router.push(`/dashboard/${siteId}`)}
              style={{
                padding: '0.625rem 1.25rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#0A0A0A',
                backgroundColor: '#00D4AA',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Go to Dashboard →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: '#111',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '1rem',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      {children}
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      style={{
        borderRadius: '0.5rem',
        padding: '0.75rem 1rem',
        backgroundColor: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.3)',
        fontSize: '0.875rem',
        color: '#fca5a5',
      }}
    >
      {message}
    </div>
  )
}

function PrimaryButton({
  onClick,
  disabled,
  loading,
  children,
  type = 'button',
}: {
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  type?: 'button' | 'submit'
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        width: '100%',
        padding: '0.75rem 1.25rem',
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: 700,
        color: '#0A0A0A',
        backgroundColor: disabled || loading ? 'rgba(0,212,170,0.4)' : '#00D4AA',
        border: 'none',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: 'opacity 0.15s',
      }}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}

function TextInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
  pattern,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  hint?: string
  pattern?: string
}) {
  return (
    <div>
      <label
        htmlFor={id}
        style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)', marginBottom: '0.4rem' }}
      >
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        pattern={pattern}
        style={{
          width: '100%',
          backgroundColor: '#1a1a1a',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '0.5rem',
          color: '#fff',
          fontSize: '0.875rem',
          padding: '0.625rem 0.875rem',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
      {hint && (
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.375rem' }}>{hint}</p>
      )}
    </div>
  )
}

// ─── Main page content ────────────────────────────────────────────────────────

function ConnectContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const stepParam = searchParams.get('step')
  const errorParam = searchParams.get('error')

  // OAuth section
  const [oauthStep, setOauthStep] = useState<OauthStep>(
    stepParam === 'select' ? 'loading' : 'idle'
  )
  const [ga4Properties, setGa4Properties] = useState<GA4Property[]>([])
  const [gscSites, setGscSites] = useState<GSCSite[]>([])
  const [selectedGa4, setSelectedGa4] = useState('')
  const [selectedGsc, setSelectedGsc] = useState('')
  const [oauthError, setOauthError] = useState<string | null>(oauthErrorMessage(errorParam))

  // Manual section
  const [manualGa4, setManualGa4] = useState('')
  const [manualGsc, setManualGsc] = useState('')
  const [manualSaving, setManualSaving] = useState(false)
  const [manualError, setManualError] = useState<string | null>(null)
  const [manualSiteId, setManualSiteId] = useState<string | null>(null)
  const [showHelp, setShowHelp] = useState(false)

  // Fetch properties when redirected back from Google OAuth
  useEffect(() => {
    if (stepParam !== 'select') return

    fetch('/api/google/properties')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setOauthError(data.error)
          setOauthStep('idle')
          return
        }
        setGa4Properties(data.ga4Properties ?? [])
        setGscSites(data.gscSites ?? [])
        setSelectedGa4(data.ga4Properties?.[0]?.propertyId ?? '')
        setSelectedGsc(data.gscSites?.[0]?.siteUrl ?? '')
        setOauthStep('selecting')
      })
      .catch(() => {
        setOauthError('Failed to load your Google properties. Please try reconnecting.')
        setOauthStep('idle')
      })
  }, [stepParam])

  // Save OAuth selection
  const handleOauthSave = async () => {
    if (!selectedGa4 && !selectedGsc) {
      setOauthError('Select at least one GA4 property or GSC site.')
      return
    }
    setOauthStep('saving')
    setOauthError(null)

    const res = await fetch('/api/dashboard/sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ga4PropertyId: selectedGa4 || null,
        gscSiteUrl: selectedGsc || null,
        source: 'oauth',
      }),
    })
    const data = await res.json()

    if (!res.ok) {
      setOauthError(data.error ?? 'Failed to save. Please try again.')
      setOauthStep('selecting')
      return
    }

    setOauthStep('connected')
    setTimeout(() => router.push(`/dashboard/${data.siteId}`), 1500)
  }

  // Save manual connection
  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setManualError(null)

    if (!manualGa4 && !manualGsc) {
      setManualError('Enter at least one GA4 Property ID or GSC Site URL.')
      return
    }
    if (manualGa4 && !/^\d+$/.test(manualGa4)) {
      setManualError('GA4 Property ID must be numeric (e.g. 123456789).')
      return
    }
    if (manualGsc && !manualGsc.startsWith('http')) {
      setManualError('GSC Site URL must start with https:// (e.g. https://example.com).')
      return
    }

    setManualSaving(true)

    const res = await fetch('/api/dashboard/sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ga4PropertyId: manualGa4 || null,
        gscSiteUrl: manualGsc || null,
        source: 'manual',
      }),
    })
    const data = await res.json()
    setManualSaving(false)

    if (!res.ok) {
      setManualError(data.error ?? 'Failed to save. Please try again.')
      return
    }

    setManualSiteId(data.siteId)
    setShowHelp(true)
  }

  return (
    <>
      {showHelp && (
        <HelpModal
          siteId={manualSiteId}
          onDismiss={() => {
            setShowHelp(false)
            if (manualSiteId) router.push(`/dashboard/${manualSiteId}`)
          }}
        />
      )}

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem' }}>
        {/* Page header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span
            style={{
              display: 'inline-block',
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#00D4AA',
              marginBottom: '0.75rem',
            }}
          >
            Step 1 of 2
          </span>
          <h1
            style={{
              fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '-0.025em',
              margin: '0 0 0.75rem',
            }}
          >
            Connect your data
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.45)', margin: 0, maxWidth: 480 }}>
            Link Google Analytics 4 and Search Console to start tracking your AI visibility.
          </p>
        </div>

        {/* Two-column grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
            gap: '1.25rem',
            alignItems: 'start',
          }}
        >
          {/* ─── Section 1: Google OAuth ─── */}
          <Card>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: '0.4rem',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    fontSize: '0.875rem',
                  }}
                >
                  🔗
                </span>
                <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Connect via Google
                </h2>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.6 }}>
                The fastest way to start. We request{' '}
                <strong style={{ color: 'rgba(255,255,255,0.7)' }}>read-only</strong> access
                to your GA4 and Search Console properties.
              </p>
            </div>

            {oauthStep === 'idle' && (
              <>
                {oauthError && <ErrorBanner message={oauthError} />}
                <a
                  href="/api/auth/google"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.625rem',
                    width: '100%',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#0A0A0A',
                    backgroundColor: '#00D4AA',
                    textDecoration: 'none',
                    boxSizing: 'border-box',
                    textAlign: 'center',
                  }}
                >
                  <GoogleIcon />
                  Connect Google Account
                </a>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', margin: 0, textAlign: 'center' }}>
                  We never write to your GA4 or GSC data.
                </p>
              </>
            )}

            {oauthStep === 'loading' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 0', color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
                <Spinner />
                Loading your Google properties…
              </div>
            )}

            {oauthStep === 'selecting' && (
              <>
                {oauthError && <ErrorBanner message={oauthError} />}

                <div style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', backgroundColor: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)', fontSize: '0.8rem', color: '#00D4AA' }}>
                  ✓ Connected to Google — select which property to use
                </div>

                <StyledSelect
                  id="ga4-property"
                  label="GA4 Property"
                  value={selectedGa4}
                  onChange={setSelectedGa4}
                >
                  <option value="">— Skip GA4 —</option>
                  {ga4Properties.length === 0 && (
                    <option disabled>No GA4 properties found</option>
                  )}
                  {ga4Properties.map((p) => (
                    <option key={p.propertyId} value={p.propertyId}>
                      {p.displayName} ({p.propertyId})
                    </option>
                  ))}
                </StyledSelect>

                <StyledSelect
                  id="gsc-site"
                  label="Search Console Site"
                  value={selectedGsc}
                  onChange={setSelectedGsc}
                >
                  <option value="">— Skip GSC —</option>
                  {gscSites.length === 0 && (
                    <option disabled>No GSC sites found</option>
                  )}
                  {gscSites.map((s) => (
                    <option key={s.siteUrl} value={s.siteUrl}>
                      {s.siteUrl}
                    </option>
                  ))}
                </StyledSelect>

                <PrimaryButton onClick={handleOauthSave} loading={false}>
                  Save selection →
                </PrimaryButton>
              </>
            )}

            {oauthStep === 'saving' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 0', color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
                <Spinner />
                Saving your connection…
              </div>
            )}

            {oauthStep === 'connected' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1.5rem 0' }}>
                <CheckCircle />
                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#00D4AA', margin: 0 }}>
                  Connected!
                </p>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                  Redirecting to your dashboard…
                </p>
              </div>
            )}
          </Card>

          {/* ─── Section 2: Manual input ─── */}
          <Card>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: '0.4rem',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    fontSize: '0.875rem',
                  }}
                >
                  ⚙️
                </span>
                <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Manual connection
                </h2>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.6 }}>
                Prefer not to OAuth? Enter your IDs directly and we&rsquo;ll walk you through
                granting access.
              </p>
            </div>

            <form onSubmit={handleManualSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {manualError && <ErrorBanner message={manualError} />}

              <TextInput
                id="manual-ga4"
                label="GA4 Property ID"
                value={manualGa4}
                onChange={setManualGa4}
                placeholder="123456789"
                hint="Admin → Property Settings in Google Analytics. Numbers only."
              />

              <TextInput
                id="manual-gsc"
                label="GSC Site URL"
                value={manualGsc}
                onChange={setManualGsc}
                placeholder="https://example.com"
                hint="The property URL as shown in Search Console (include https://)."
              />

              <div>
                <button
                  type="button"
                  onClick={() => setShowHelp(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    color: '#00D4AA',
                    padding: 0,
                    textDecoration: 'underline',
                    textUnderlineOffset: 3,
                  }}
                >
                  Where do I find these values?
                </button>
              </div>

              <div
                style={{
                  borderRadius: '0.5rem',
                  padding: '0.875rem 1rem',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  fontSize: '0.8rem',
                  color: 'rgba(255,255,255,0.4)',
                  lineHeight: 1.6,
                }}
              >
                After saving, we&rsquo;ll show you how to grant API read access to your GA4 and
                GSC properties. No code required.
              </div>

              <PrimaryButton type="submit" loading={manualSaving}>
                Save &amp; get setup instructions →
              </PrimaryButton>
            </form>
          </Card>
        </div>
      </div>
    </>
  )
}

export default function ConnectPage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'rgba(255,255,255,0.4)', gap: '0.75rem', fontSize: '0.875rem' }}>
          <svg className="animate-spin" style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading…
        </div>
      }
    >
      <ConnectContent />
    </Suspense>
  )
}
