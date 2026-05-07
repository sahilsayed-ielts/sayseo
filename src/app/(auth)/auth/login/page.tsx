'use client'

import { useState, FormEvent, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function SpinnerIcon() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
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

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }}>
      <path d="M20 6L9 17L4 12" stroke="#00D4AA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const features = [
  {
    title: 'AI Visibility Tracking',
    body: 'See exactly where your site appears in ChatGPT, Perplexity, Gemini, and other AI engines.',
  },
  {
    title: 'GA4 + GSC Integration',
    body: 'Connect your analytics in seconds. No manual exports — data flows in automatically.',
  },
  {
    title: 'AI Traffic Attribution',
    body: 'Separate AI referral sessions from organic search to understand your true visibility split.',
  },
  {
    title: 'Competitor Benchmarking',
    body: 'Track how your AI presence compares to rivals across all major AI platforms.',
  },
]

function LeftPanel() {
  return (
    <div
      className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 xl:p-16"
      style={{ backgroundColor: '#0A0A0A', minHeight: '100%', borderRight: '1px solid #1a1a1a' }}
    >
      <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 0 }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>Say</span>
        <span style={{ fontSize: 20, fontWeight: 800, color: '#00D4AA', letterSpacing: '-0.03em' }}>SEO</span>
      </Link>

      <div className="my-10">
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', lineHeight: 1.25, marginBottom: '1rem' }}>
          Your AI visibility,<br />finally measurable.
        </h2>
        <p style={{ fontSize: '0.875rem', lineHeight: 1.75, marginBottom: '2rem', color: '#666' }}>
          SaySEO connects your GA4 and Search Console data to show you exactly how AI platforms
          are discovering and citing your content.
        </p>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {features.map((f) => (
            <li key={f.title} style={{ display: 'flex', gap: '0.75rem' }}>
              <CheckIcon />
              <div>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>{f.title}</span>
                <span style={{ fontSize: '0.875rem', color: '#666' }}> — {f.body}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p style={{ fontSize: '0.875rem', fontStyle: 'italic', color: '#444' }}>
        &ldquo;Built for SEO professionals who want to own their AI presence.&rdquo;
      </p>
    </div>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <div style={{ width: '100%', maxWidth: '22rem', margin: '0 auto' }}>
      <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.03em' }}>Say</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#00D4AA', letterSpacing: '-0.03em' }}>SEO</span>
        </Link>
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>AI visibility platform for SEO pros</p>
      </div>

      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', color: '#0A0A0A' }}>Welcome back</h1>
      <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1.75rem' }}>Sign in to your SaySEO account</p>

      {error && (
        <div style={{ marginBottom: '1.25rem', borderRadius: '0.5rem', padding: '0.75rem 1rem', backgroundColor: '#fff1f0', border: '1px solid #fca5a5' }}>
          <p style={{ fontSize: '0.875rem', color: '#dc2626' }}>{error}</p>
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogleSignIn}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '0.75rem', borderRadius: '0.5rem', padding: '0.75rem 1rem',
          fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
          border: '1.5px solid #0A0A0A', color: '#0A0A0A', backgroundColor: '#fff',
          marginBottom: '1.25rem', transition: 'background-color 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>or continue with email</span>
        <div style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label htmlFor="email" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.375rem', color: '#0A0A0A' }}>
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{ width: '100%', borderRadius: '0.5rem', border: '1px solid #cbd5e1', padding: '0.625rem 1rem', fontSize: '0.875rem', color: '#0f172a', backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
            <label htmlFor="password" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0A0A0A' }}>
              Password
            </label>
            <Link href="/auth/reset-password" style={{ fontSize: '0.75rem', color: '#00D4AA', textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{ width: '100%', borderRadius: '0.5rem', border: '1px solid #cbd5e1', padding: '0.625rem 1rem', fontSize: '0.875rem', color: '#0f172a', backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', borderRadius: '0.5rem', padding: '0.75rem', fontSize: '0.875rem',
            fontWeight: 700, color: '#0A0A0A', backgroundColor: '#00D4AA',
            border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1, marginTop: '0.25rem', transition: 'opacity 0.15s',
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <SpinnerIcon />
              Signing in&hellip;
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#666' }}>
        Don&rsquo;t have an account?{' '}
        <Link href="/auth/signup" style={{ fontWeight: 600, color: '#00D4AA', textDecoration: 'none' }}>
          Create one free &rarr;
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <LeftPanel />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem', backgroundColor: '#fafbfc' }}>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
