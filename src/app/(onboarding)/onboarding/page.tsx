'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// ─── Progress dots ─────────────────────────────────────────────────────────────

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current
        return (
          <span
            key={n}
            style={{
              width: active ? 24 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: done || active ? '#00D4AA' : 'rgba(255,255,255,0.15)',
              transition: 'width 0.3s ease, background-color 0.3s ease',
              display: 'inline-block',
            }}
          />
        )
      })}
    </div>
  )
}

// ─── Spinner ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg style={{ width: 16, height: 16, animation: 'spin 1s linear infinite', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity={0.25} />
      <path opacity={0.75} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

// ─── Module feature cards (step 3) ────────────────────────────────────────────

function ModuleCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div style={{
      backgroundColor: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderTop: '2px solid #00D4AA',
      borderRadius: '0.75rem',
      padding: '1.25rem',
    }}>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: '0.5rem',
        backgroundColor: 'rgba(0,212,170,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '0.875rem',
      }}>
        {icon}
      </div>
      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', margin: '0 0 0.375rem' }}>
        {title}
      </p>
      <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0 }}>
        {body}
      </p>
    </div>
  )
}

// ─── SVG icons ─────────────────────────────────────────────────────────────────

function IconBarChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="1.75" aria-hidden="true">
      <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" />
    </svg>
  )
}

function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="1.75" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
    </svg>
  )
}

function IconBolt() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="1.75" aria-hidden="true">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconGA4() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect width="24" height="24" rx="4" fill="#F9AB00" />
      <path d="M12 4v16M8 12v8M16 8v12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconGSC() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect width="24" height="24" rx="4" fill="#4285F4" />
      <circle cx="12" cy="12" r="5" stroke="#fff" strokeWidth="2" />
      <path d="M17 17l3 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace('/auth/login')
      else setUserId(data.user.id)
    })
  }, [router])

  // ── Step 1: save domain ────────────────────────────────────────────────────

  const handleSaveDomain = async (e: FormEvent) => {
    e.preventDefault()
    if (!userId) return
    setError(null)

    const cleaned = domain.trim()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .toLowerCase()

    if (!cleaned || !cleaned.includes('.')) {
      setError('Please enter a valid domain, e.g. yourdomain.com')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error: profileErr } = await supabase
      .from('profiles')
      .upsert({ user_id: userId, domain: cleaned }, { onConflict: 'user_id' })

    if (profileErr) {
      setError('Could not save your domain. Please try again.')
      setLoading(false)
      return
    }

    // Create connected_sites entry so the dashboard has a site to show
    const { data: existing } = await supabase
      .from('connected_sites')
      .select('id')
      .eq('user_id', userId)
      .eq('domain', cleaned)
      .maybeSingle()

    if (!existing) {
      await supabase.from('connected_sites').insert({ user_id: userId, domain: cleaned })
    }

    setLoading(false)
    setStep(2)
  }

  // ── Step 3: complete onboarding ────────────────────────────────────────────

  const handleComplete = async () => {
    if (!userId) return
    setLoading(true)

    const supabase = createClient()
    await supabase
      .from('profiles')
      .upsert({ user_id: userId, onboarding_complete: true }, { onConflict: 'user_id' })

    router.push('/dashboard')
  }

  // ── Shared card wrapper ────────────────────────────────────────────────────

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#111',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1rem',
    padding: '2.5rem 2rem',
    width: '100%',
    maxWidth: 480,
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
    }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Top bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>Say</span>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#00D4AA', letterSpacing: '-0.03em' }}>SEO</span>
        </Link>
        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
          Step {step} of 3
        </span>
      </div>

      {/* Card */}
      <div style={cardStyle}>
        {/* Progress dots */}
        <div style={{ marginBottom: '2rem' }}>
          <ProgressDots current={step} total={3} />
        </div>

        {/* ── Step 1 ── */}
        {step === 1 && (
          <form onSubmit={handleSaveDomain}>
            <p style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#00D4AA',
              margin: '0 0 0.5rem',
            }}>
              Step 1 — Add Your Domain
            </p>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#fff',
              margin: '0 0 0.5rem',
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
            }}>
              Which website are you tracking?
            </h1>
            <p style={{
              fontSize: '0.875rem',
              color: 'rgba(255,255,255,0.45)',
              lineHeight: 1.65,
              margin: '0 0 2rem',
            }}>
              Enter your domain and we will start monitoring your AI visibility across ChatGPT, Gemini, Perplexity, and Google AI Overviews.
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="domain" style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'rgba(255,255,255,0.45)',
                marginBottom: '0.5rem',
              }}>
                Your website domain
              </label>
              <input
                id="domain"
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="yourdomain.com"
                autoFocus
                autoComplete="off"
                spellCheck={false}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: error ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.15s',
                }}
              />
              {error && (
                <p style={{ fontSize: '0.8125rem', color: '#fca5a5', margin: '0.5rem 0 0' }}>
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !domain.trim()}
              style={{
                width: '100%',
                padding: '0.8125rem',
                borderRadius: '0.5rem',
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: '#0A0A0A',
                backgroundColor: loading || !domain.trim() ? 'rgba(0,212,170,0.4)' : '#00D4AA',
                border: 'none',
                cursor: loading || !domain.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'background-color 0.15s',
              }}
            >
              {loading ? <><Spinner /> Saving…</> : 'Continue →'}
            </button>
          </form>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <div>
            <p style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#00D4AA',
              margin: '0 0 0.5rem',
            }}>
              Step 2 — Connect Your Data Sources
            </p>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#fff',
              margin: '0 0 0.5rem',
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
            }}>
              Link your Google properties
            </h1>
            <p style={{
              fontSize: '0.875rem',
              color: 'rgba(255,255,255,0.45)',
              lineHeight: 1.65,
              margin: '0 0 1.75rem',
            }}>
              Connect GA4 and Search Console to unlock your full AI traffic and citation data. Both are optional — you can add them any time from your dashboard.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.75rem' }}>
              {[
                {
                  icon: <IconGA4 />,
                  title: 'Google Analytics 4',
                  description: 'Track AI-generated sessions, page views, and referral traffic from ChatGPT, Gemini, and Perplexity.',
                },
                {
                  icon: <IconGSC />,
                  title: 'Google Search Console',
                  description: 'Surface the queries that drive AI Overview appearances and citation checks from your real search data.',
                },
              ].map((card) => (
                <div
                  key={card.title}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1.125rem',
                    borderRadius: '0.75rem',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div style={{ flexShrink: 0, marginTop: 2 }}>{card.icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', margin: '0 0 0.25rem' }}>
                      {card.title}
                    </p>
                    <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.55, margin: '0 0 0.875rem' }}>
                      {card.description}
                    </p>
                    <button
                      disabled
                      style={{
                        padding: '0.4375rem 0.875rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: 'rgba(255,255,255,0.3)',
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        cursor: 'not-allowed',
                      }}
                    >
                      Coming Soon
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(3)}
              style={{
                width: '100%',
                padding: '0.8125rem',
                borderRadius: '0.5rem',
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: '#0A0A0A',
                backgroundColor: '#00D4AA',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Continue →
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                onClick={() => setStep(3)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.8125rem',
                  color: 'rgba(255,255,255,0.35)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: 2,
                  padding: 0,
                }}
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3 ── */}
        {step === 3 && (
          <div>
            <p style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#00D4AA',
              margin: '0 0 0.5rem',
            }}>
              Step 3 — You&rsquo;re All Set
            </p>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#fff',
              margin: '0 0 0.5rem',
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
            }}>
              Your dashboard is ready.
            </h1>
            <p style={{
              fontSize: '0.875rem',
              color: 'rgba(255,255,255,0.45)',
              lineHeight: 1.65,
              margin: '0 0 1.75rem',
            }}>
              Here&rsquo;s what SaySEO will monitor for{domain ? ` ${domain}` : ' your site'}.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              <ModuleCard
                icon={<IconBarChart />}
                title="AI Traffic Analytics"
                body="See which AI platforms send traffic to your site and which pages they drive users to."
              />
              <ModuleCard
                icon={<IconSearch />}
                title="Citation Monitor"
                body="Discover when ChatGPT, Gemini, and Perplexity mention your domain in AI-generated responses."
              />
              <ModuleCard
                icon={<IconBolt />}
                title="AI Overview Tracker"
                body="Track which of your target queries trigger a Google AI Overview and whether you are cited."
              />
            </div>

            <button
              onClick={handleComplete}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.8125rem',
                borderRadius: '0.5rem',
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: '#0A0A0A',
                backgroundColor: loading ? 'rgba(0,212,170,0.4)' : '#00D4AA',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              {loading ? <><Spinner /> Taking you there…</> : 'Go to Dashboard →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
