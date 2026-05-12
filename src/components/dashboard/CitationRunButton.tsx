'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Platform = 'claude' | 'chatgpt' | 'gemini' | 'all'

interface Props {
  siteId: string
  domain: string
  platformLastChecked: Record<string, string | null>
}

interface RunResult {
  checked: number
  mentioned: number
  platforms: Array<{ platform: string; checked: number; mentioned: number; available: boolean }>
}

const PLATFORM_LABELS: Record<string, string> = {
  claude: 'Claude',
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
}

const INDIVIDUAL_PLATFORMS = ['claude', 'chatgpt', 'gemini'] as const

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days !== 1 ? 's' : ''} ago`
}

function Spinner() {
  return (
    <svg
      style={{ width: 13, height: 13, animation: 'spin 1s linear infinite', flexShrink: 0 }}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity={0.25} />
      <path opacity={0.75} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

export default function CitationRunButton({ siteId, domain, platformLastChecked }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<Platform | null>(null)
  const [results, setResults] = useState<Partial<Record<Platform, RunResult>>>({})
  const [errors, setErrors] = useState<Partial<Record<Platform, string>>>({})

  const runCheck = async (platform: Platform) => {
    if (platform === 'all') {
      setLoading('all')
      setErrors({})
      setResults({})

      for (const p of INDIVIDUAL_PLATFORMS) {
        try {
          const res = await fetch('/api/citations/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ siteId, domain, platform: p }),
          })
          const data = await res.json()
          if (!res.ok) {
            setErrors((prev) => ({ ...prev, [p]: data.error ?? 'Check failed. Please try again.' }))
          } else {
            setResults((prev) => ({ ...prev, [p]: data as RunResult }))
          }
        } catch {
          setErrors((prev) => ({ ...prev, [p]: 'Network error. Please try again.' }))
        }
      }

      router.refresh()
      setLoading(null)
      return
    }

    setLoading(platform)
    setErrors((prev) => ({ ...prev, [platform]: undefined }))
    setResults((prev) => ({ ...prev, [platform]: undefined }))

    try {
      const res = await fetch('/api/citations/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, domain, platform }),
      })
      const data = await res.json()

      if (!res.ok) {
        setErrors((prev) => ({ ...prev, [platform]: data.error ?? 'Check failed. Please try again.' }))
      } else {
        setResults((prev) => ({ ...prev, [platform]: data as RunResult }))
        router.refresh()
      }
    } catch {
      setErrors((prev) => ({ ...prev, [platform]: 'Network error. Please try again.' }))
    } finally {
      setLoading(null)
    }
  }

  const anyLoading = loading !== null

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {/* Button row */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Individual platform buttons */}
        {INDIVIDUAL_PLATFORMS.map((platform) => {
          const isLoading = loading === platform
          const isDisabled = anyLoading
          const lastChecked = platformLastChecked[platform]

          return (
            <div key={platform} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <button
                onClick={() => runCheck(platform)}
                disabled={isDisabled}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: '#0A0A0A',
                  backgroundColor: isDisabled ? 'rgba(0,212,170,0.4)' : '#00D4AA',
                  border: 'none',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {isLoading ? (
                  <>
                    <Spinner />
                    Checking…
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                    Check {PLATFORM_LABELS[platform]}
                  </>
                )}
              </button>
              {lastChecked && (
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', paddingLeft: '0.125rem' }}>
                  {timeAgo(lastChecked)}
                </span>
              )}
            </div>
          )
        })}

        {/* Divider */}
        <div style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.08)', alignSelf: 'stretch', margin: '0 0.125rem' }} />

        {/* Run All button */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <button
            onClick={() => runCheck('all')}
            disabled={anyLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: anyLoading ? 'rgba(0,212,170,0.5)' : '#00D4AA',
              backgroundColor: 'transparent',
              border: `1px solid ${anyLoading ? 'rgba(0,212,170,0.2)' : 'rgba(0,212,170,0.4)'}`,
              cursor: anyLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {loading === 'all' ? (
              <>
                <Spinner />
                Running all…
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M5 3l14 9-14 9V3z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Run All
              </>
            )}
          </button>
        </div>
      </div>

      {/* Per-platform results and errors */}
      <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {([...INDIVIDUAL_PLATFORMS, 'all'] as Platform[]).map((platform) => {
          const err = errors[platform]
          const result = results[platform]
          if (!err && !result) return null

          return (
            <div key={platform}>
              {err && (
                <div
                  style={{
                    padding: '0.5rem 0.875rem',
                    borderRadius: '0.5rem',
                    backgroundColor: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    fontSize: '0.8125rem',
                    color: '#fca5a5',
                  }}
                >
                  {platform !== 'all' && <strong style={{ color: '#f87171' }}>{PLATFORM_LABELS[platform]}: </strong>}
                  {err}
                </div>
              )}
              {result && (
                <div
                  style={{
                    padding: '0.625rem 0.875rem',
                    borderRadius: '0.5rem',
                    backgroundColor: 'rgba(0,212,170,0.08)',
                    border: '1px solid rgba(0,212,170,0.2)',
                    fontSize: '0.8125rem',
                  }}
                >
                  <span style={{ color: '#00D4AA', fontWeight: 600 }}>
                    {platform !== 'all' && `${PLATFORM_LABELS[platform]}: `}
                    {result.mentioned} mention{result.mentioned !== 1 ? 's' : ''} across{' '}
                    {result.checked} {result.checked !== 1 ? 'queries' : 'query'}
                  </span>
                  {platform === 'all' && result.platforms.length > 0 && (
                    <span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: '0.5rem' }}>
                      ({result.platforms.map((p) =>
                        p.available ? `${PLATFORM_LABELS[p.platform]}: ${p.mentioned}/${p.checked}` : `${PLATFORM_LABELS[p.platform]}: unavailable`
                      ).join(' · ')})
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
