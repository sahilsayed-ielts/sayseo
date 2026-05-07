import type { Site } from './types'

function Bone({ w = '100%', h = 16, radius = 6 }: { w?: string | number; h?: number; radius?: number }) {
  return (
    <div
      className="animate-pulse"
      style={{
        width: w,
        height: h,
        borderRadius: radius,
        backgroundColor: 'rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}
    />
  )
}

function CardSkeleton({ h = 100 }: { h?: number }) {
  return (
    <div
      style={{
        backgroundColor: '#111',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '0.75rem',
        padding: '1.25rem',
        height: h,
      }}
    >
      <div className="animate-pulse" style={{ height: '100%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 6 }} />
    </div>
  )
}

export default function DashboardSkeleton({
  site,
  dateRange,
  setDateRange,
}: {
  site: Site
  dateRange: string
  setDateRange: (r: string) => void
}) {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#00D4AA', margin: '0 0 0.25rem' }}>
            Dashboard
          </p>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
            {site.domain}
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {(['7d', '30d', '90d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              style={{
                padding: '0.375rem 0.875rem',
                borderRadius: '0.375rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: dateRange === r ? '#00D4AA' : 'rgba(255,255,255,0.07)',
                color: dateRange === r ? '#0A0A0A' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.15s',
              }}
            >
              {r}
            </button>
          ))}
          <div style={{ width: 90, height: 34, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 6 }} className="animate-pulse" />
          <div style={{ width: 100, height: 34, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 6 }} className="animate-pulse" />
        </div>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[...Array(4)].map((_, i) => <CardSkeleton key={i} h={110} />)}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <CardSkeleton h={280} />
        <CardSkeleton h={280} />
      </div>

      {/* Table */}
      <CardSkeleton h={300} />

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
        <CardSkeleton h={240} />
        <CardSkeleton h={240} />
      </div>
    </div>
  )
}
