'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

function Spinner() {
  return (
    <svg
      style={{ width: 14, height: 14, animation: 'spin 1s linear infinite', flexShrink: 0 }}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity={0.25} />
      <path opacity={0.75} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

interface Props {
  siteId: string
  domain: string
  queries: string[]
  disabled: boolean
  lastChecked: string | null
}

export default function AIORunButton({ siteId, domain, queries, disabled, lastChecked }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ checked: number; aio_triggers: number; domain_citations: number } | null>(null)

  const handleRun = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/ai-overviews/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, domain, queries }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Check failed. Please try again.')
      } else {
        setResult(data)
        router.refresh()
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const lastCheckedLabel = lastChecked
    ? new Date(lastChecked).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={handleRun}
          disabled={disabled || loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.25rem',
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
          {loading ? (
            <>
              <Spinner />
              Scanning {queries.length} quer{queries.length !== 1 ? 'ies' : 'y'} via SerpAPI…
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M21 21l-4.35-4.35" />
                <circle cx="11" cy="11" r="8" />
                <path d="M11 8v3m0 0v3m0-3h3m-3 0H8" />
              </svg>
              Run Check
            </>
          )}
        </button>

        {disabled && lastCheckedLabel && !loading && (
          <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.35)' }}>
            Last checked {lastCheckedLabel} · available again in 24 hours
          </span>
        )}

        {!disabled && lastCheckedLabel && !loading && (
          <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.35)' }}>
            Last checked {lastCheckedLabel}
          </span>
        )}
      </div>

      {error && (
        <div style={{
          marginTop: '0.75rem',
          padding: '0.625rem 0.875rem',
          borderRadius: '0.5rem',
          backgroundColor: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          fontSize: '0.8125rem',
          color: '#fca5a5',
        }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{
          marginTop: '0.75rem',
          padding: '0.625rem 0.875rem',
          borderRadius: '0.5rem',
          backgroundColor: 'rgba(0,212,170,0.08)',
          border: '1px solid rgba(0,212,170,0.2)',
          fontSize: '0.8125rem',
          color: '#00D4AA',
        }}>
          Check complete — {result.aio_triggers} AI Overview{result.aio_triggers !== 1 ? 's' : ''} triggered across {result.checked} quer{result.checked !== 1 ? 'ies' : 'y'}, {result.domain_citations} domain citation{result.domain_citations !== 1 ? 's' : ''} found.
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
