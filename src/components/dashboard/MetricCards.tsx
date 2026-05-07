import type { AiTrafficReport, PagesReport } from './types'

interface MetricCardProps {
  label: string
  value: string
  sub?: string
  trend?: number | null
  accent?: boolean
}

function TrendBadge({ trend }: { trend: number }) {
  const up = trend >= 0
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        fontSize: '0.75rem',
        fontWeight: 700,
        color: up ? '#00D4AA' : '#F87171',
        backgroundColor: up ? 'rgba(0,212,170,0.12)' : 'rgba(248,113,113,0.12)',
        borderRadius: 4,
        padding: '2px 6px',
      }}
    >
      {up ? '↑' : '↓'} {Math.abs(trend)}%
    </span>
  )
}

function MetricCard({ label, value, sub, trend, accent }: MetricCardProps) {
  return (
    <div
      style={{
        backgroundColor: '#111',
        border: `1px solid ${accent ? 'rgba(0,212,170,0.25)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '0.75rem',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
        {label}
      </p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.625rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '1.75rem', fontWeight: 800, color: accent ? '#00D4AA' : '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
          {value}
        </span>
        {trend !== null && trend !== undefined && <TrendBadge trend={trend} />}
      </div>
      {sub && (
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{sub}</p>
      )}
    </div>
  )
}

export default function MetricCards({
  aiData,
  pagesData,
  overallTrend,
}: {
  aiData: AiTrafficReport
  pagesData: PagesReport
  overallTrend: number | null
}) {
  const topSource = aiData.aiSources[0]
  const uniquePages = pagesData.pages.length

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
      <MetricCard
        label="Total AI Sessions"
        value={aiData.totalAiSessions.toLocaleString()}
        sub={`from ${aiData.totalSessions.toLocaleString()} total sessions`}
        trend={overallTrend}
        accent
      />
      <MetricCard
        label="AI Traffic Share"
        value={`${aiData.aiPercentage}%`}
        sub="of all site sessions"
      />
      <MetricCard
        label="Top AI Source"
        value={topSource?.name ?? '—'}
        sub={topSource ? `${topSource.sessions.toLocaleString()} sessions` : 'No data yet'}
        trend={topSource?.trend ?? null}
      />
      <MetricCard
        label="AI-Referenced Pages"
        value={uniquePages.toLocaleString()}
        sub="unique pages with AI traffic"
      />
    </div>
  )
}
