'use client'

import { useEffect, useState } from 'react'
import type { Recommendation } from './types'

const IMPACT_STYLES: Record<string, { bg: string; color: string }> = {
  High: { bg: 'rgba(0,212,170,0.12)', color: '#00D4AA' },
  Medium: { bg: 'rgba(251,191,36,0.12)', color: '#FBBF24' },
  Low: { bg: 'rgba(156,163,175,0.12)', color: '#9CA3AF' },
}

export default function RecommendationsPanel({ siteId }: { siteId: string }) {
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/recommendations?siteId=${siteId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setRecommendations(data.recommendations)
        }
      })
      .catch(() => setError('Failed to load recommendations.'))
      .finally(() => setLoading(false))
  }, [siteId])

  return (
    <div
      style={{
        backgroundColor: '#111',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '0.75rem',
        padding: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>
          SaySEO Intelligence Engine
        </h2>
        <span
          style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#00D4AA',
            backgroundColor: 'rgba(0,212,170,0.1)',
            borderRadius: 4,
            padding: '2px 6px',
          }}
        >
          Recommendations
        </span>
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{ height: 64, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8 }}
            />
          ))}
        </div>
      )}

      {error && !loading && (
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{error}</p>
      )}

      {recommendations && !loading && (
        <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {recommendations.map((rec, i) => {
            const impactStyle = IMPACT_STYLES[rec.impact] ?? IMPACT_STYLES.Low
            return (
              <li
                key={i}
                style={{
                  display: 'flex',
                  gap: '0.875rem',
                  padding: '0.875rem',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '0.5rem',
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0,212,170,0.15)',
                    color: '#00D4AA',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{rec.title}</span>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: impactStyle.color,
                        backgroundColor: impactStyle.bg,
                        borderRadius: 4,
                        padding: '1px 5px',
                        flexShrink: 0,
                      }}
                    >
                      {rec.impact}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6 }}>
                    {rec.description}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
