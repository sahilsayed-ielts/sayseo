import type { TopQuery } from './types'

export default function QueriesPanel({ queries }: { queries: TopQuery[] }) {
  const maxClicks = Math.max(...queries.map((q) => q.clicks), 1)

  return (
    <div
      style={{
        backgroundColor: '#111',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '0.75rem',
        padding: '1.5rem',
      }}
    >
      <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', margin: '0 0 1.25rem', letterSpacing: '-0.01em' }}>
        Top Search Queries
      </h2>

      {queries.length === 0 ? (
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
          No GSC query data. Connect Search Console to see top queries.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {queries.slice(0, 10).map((q) => {
            const barWidth = `${Math.round((q.clicks / maxClicks) * 100)}%`
            const ctr = q.impressions > 0 ? ((q.clicks / q.impressions) * 100).toFixed(1) : '0.0'
            return (
              <div key={q.query}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      color: '#fff',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '55%',
                    }}
                    title={q.query}
                  >
                    {q.query}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>
                    {q.clicks.toLocaleString()} clicks · {ctr}% CTR
                  </span>
                </div>
                <div style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: barWidth, backgroundColor: '#00D4AA', borderRadius: 2, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
