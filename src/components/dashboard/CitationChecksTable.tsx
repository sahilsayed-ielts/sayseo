'use client'

import { useState } from 'react'

interface CitationCheck {
  id: string
  query: string
  platform: string
  domain_mentioned: boolean
  response_snippet: string | null
  checked_at: string
}

const PLATFORM_LABELS: Record<string, string> = {
  claude: 'Claude',
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
}

const PLATFORM_COLORS: Record<string, string> = {
  claude: '#E07B54',
  chatgpt: '#10A37F',
  gemini: '#4285F4',
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-label="Mentioned" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" fill="rgba(0,212,170,0.15)" />
      <path d="M8 12l3 3 5-5" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CrossIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-label="Not mentioned" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" fill="rgba(239,68,68,0.1)" />
      <path d="M15 9l-6 6M9 9l6 6" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function SnippetCell({ text }: { text: string | null }) {
  const [expanded, setExpanded] = useState(false)

  if (!text) return <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>

  if (text === 'Check unavailable') {
    return (
      <span
        style={{
          fontSize: '0.72rem',
          fontWeight: 600,
          padding: '0.2rem 0.5rem',
          borderRadius: '0.25rem',
          backgroundColor: 'rgba(255,255,255,0.05)',
          color: 'rgba(255,255,255,0.3)',
          border: '1px solid rgba(255,255,255,0.08)',
          letterSpacing: '0.03em',
        }}
      >
        Unavailable
      </span>
    )
  }

  const truncated = text.length > 100 ? text.slice(0, 100) + '…' : text

  return (
    <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
      {expanded ? text : truncated}
      {text.length > 100 && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            marginLeft: '0.375rem',
            fontSize: '0.75rem',
            color: '#00D4AA',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'underline',
            textUnderlineOffset: 2,
          }}
        >
          {expanded ? 'Collapse' : 'View full'}
        </button>
      )}
    </span>
  )
}

function PlatformBadge({ platform }: { platform: string }) {
  const label = PLATFORM_LABELS[platform] ?? platform
  const color = PLATFORM_COLORS[platform] ?? 'rgba(255,255,255,0.4)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: color,
          flexShrink: 0,
          display: 'inline-block',
        }}
      />
      <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
        {label}
      </span>
    </div>
  )
}

export default function CitationChecksTable({ checks }: { checks: CitationCheck[] }) {
  if (checks.length === 0) {
    return (
      <div
        style={{
          backgroundColor: '#111',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '0.75rem',
          padding: '3rem 1.5rem',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.3)',
          fontSize: '0.875rem',
        }}
      >
        No citation checks yet. Run a check to see results.
      </div>
    )
  }

  return (
    <div
      style={{
        backgroundColor: '#111',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '0.75rem',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <h2
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.45)',
            margin: 0,
          }}
        >
          Query Results
        </h2>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Query', 'Platform', 'Domain Mentioned', 'Response Snippet', 'Checked At'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '0.625rem 1.25rem',
                    textAlign: 'left',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'rgba(255,255,255,0.35)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {checks.map((check, i) => (
              <tr
                key={check.id}
                style={{
                  borderBottom:
                    i < checks.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}
              >
                <td
                  style={{
                    padding: '0.875rem 1.25rem',
                    fontSize: '0.8125rem',
                    color: '#fff',
                    fontWeight: 500,
                    maxWidth: 220,
                  }}
                >
                  {check.query}
                </td>
                <td style={{ padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }}>
                  <PlatformBadge platform={check.platform} />
                </td>
                <td style={{ padding: '0.875rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    {check.domain_mentioned ? <CheckIcon /> : <CrossIcon />}
                    <span
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: check.domain_mentioned ? '#00D4AA' : '#f87171',
                      }}
                    >
                      {check.domain_mentioned ? 'Yes' : 'No'}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '0.875rem 1.25rem', maxWidth: 340 }}>
                  <SnippetCell text={check.response_snippet} />
                </td>
                <td
                  style={{
                    padding: '0.875rem 1.25rem',
                    fontSize: '0.8125rem',
                    color: 'rgba(255,255,255,0.4)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {new Date(check.checked_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
