'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { AiTrafficReport, PagesReport, TrendResponse, Site } from './types'
import DashboardSkeleton from './DashboardSkeleton'
import MetricCards from './MetricCards'
import TopPagesTable from './TopPagesTable'
import QueriesPanel from './QueriesPanel'
import RecommendationsPanel from './RecommendationsPanel'

// Charts are client-only (Recharts uses browser APIs)
const AiSourceChart = dynamic(() => import('./AiSourceChart'), { ssr: false })
const TrendChart = dynamic(() => import('./TrendChart'), { ssr: false })

// ─── Computed overall trend from per-source data ──────────────────────────────
function computeOverallTrend(aiData: AiTrafficReport): number | null {
  const sources = aiData.aiSources.filter((s) => s.trend !== null)
  if (!sources.length) return null
  let totalCurrent = 0
  let totalPrevious = 0
  for (const s of aiData.aiSources) {
    totalCurrent += s.sessions
    totalPrevious += s.trend !== null ? s.sessions / (1 + s.trend / 100) : s.sessions
  }
  return totalPrevious > 0
    ? Math.round(((totalCurrent - totalPrevious) / totalPrevious) * 100)
    : null
}

// ─── Header bar ───────────────────────────────────────────────────────────────
function HeaderBar({
  site,
  dateRange,
  setDateRange,
  onRefresh,
  refreshing,
  fromCache,
}: {
  site: Site
  dateRange: string
  setDateRange: (r: string) => void
  onRefresh: () => void
  refreshing: boolean
  fromCache: boolean
}) {
  const lastSynced = site.last_synced
    ? new Date(site.last_synced).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem',
      }}
    >
      {/* Left: domain + cache status */}
      <div>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#00D4AA', margin: '0 0 0.2rem' }}>
          AI Visibility Dashboard
        </p>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
          {site.domain}
        </h1>
        {(lastSynced || fromCache) && (
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', margin: '0.25rem 0 0' }}>
            {fromCache ? '● Cached data' : `Last synced ${lastSynced}`}
          </p>
        )}
      </div>

      {/* Right: controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        {/* Date range */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '0.5rem',
            padding: 2,
          }}
        >
          {(['7d', '30d', '90d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: '0.375rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: dateRange === r ? '#00D4AA' : 'transparent',
                color: dateRange === r ? '#0A0A0A' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.15s',
              }}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={refreshing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.375rem 0.875rem',
            borderRadius: '0.5rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            border: '1px solid rgba(255,255,255,0.12)',
            backgroundColor: 'transparent',
            color: refreshing ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)',
            cursor: refreshing ? 'not-allowed' : 'pointer',
          }}
        >
          <svg
            style={{ width: 13, height: 13, flexShrink: 0, animation: refreshing ? 'spin 1s linear infinite' : 'none' }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>

        {/* Export PDF (placeholder) */}
        <button
          disabled
          title="PDF export coming soon"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.375rem 0.875rem',
            borderRadius: '0.5rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            border: '1px solid rgba(255,255,255,0.07)',
            backgroundColor: 'transparent',
            color: 'rgba(255,255,255,0.25)',
            cursor: 'not-allowed',
          }}
        >
          <svg style={{ width: 13, height: 13, flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export PDF
        </button>
      </div>
    </div>
  )
}

// ─── Reconnect banner ─────────────────────────────────────────────────────────
function ReconnectBanner({ siteId }: { siteId: string }) {
  return (
    <div style={{ maxWidth: 640, margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔑</div>
      <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.75rem' }}>
        Google access needs to be reconnected
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', margin: '0 0 1.5rem' }}>
        Your access token has expired or been revoked. Reconnect your Google account to restore data access.
      </p>
      <a
        href={`/dashboard/connect?reconnect=${siteId}`}
        style={{
          display: 'inline-block',
          padding: '0.625rem 1.5rem',
          borderRadius: '0.5rem',
          backgroundColor: '#00D4AA',
          color: '#0A0A0A',
          fontWeight: 700,
          fontSize: '0.875rem',
          textDecoration: 'none',
        }}
      >
        Reconnect Google Account
      </a>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DashboardClient({ siteId, site }: { siteId: string; site: Site }) {
  const router = useRouter()
  const [dateRange, setDateRange] = useState('30d')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [reconnect, setReconnect] = useState(false)
  const [aiData, setAiData] = useState<AiTrafficReport | null>(null)
  const [pagesData, setPagesData] = useState<PagesReport | null>(null)
  const [trendData, setTrendData] = useState<TrendResponse | null>(null)
  const [fromCache, setFromCache] = useState(false)

  const fetchAll = useCallback(
    async (range: string, isRefresh = false) => {
      isRefresh ? setRefreshing(true) : setLoading(true)

      try {
        const [ai, pages, trend] = await Promise.all([
          fetch(`/api/report/ai-traffic?siteId=${siteId}&dateRange=${range}`).then((r) => r.json()),
          fetch(`/api/report/pages?siteId=${siteId}&dateRange=${range}`).then((r) => r.json()),
          fetch(`/api/report/trend?siteId=${siteId}&dateRange=${range}`).then((r) => r.json()),
        ])

        if (
          ai.error === 'reconnect_required' ||
          pages.error === 'reconnect_required' ||
          trend.error === 'reconnect_required'
        ) {
          setReconnect(true)
          return
        }

        // Normalize any error responses into safe empty shapes so renders never crash
        const safeAi: AiTrafficReport = ai.error
          ? { aiSources: [], topPages: [], topQueries: [], totalAiSessions: 0, totalSessions: 0, aiPercentage: 0, dateRange: range, fromCache: false }
          : ai
        const safePages: PagesReport = pages.error
          ? { pages: [], dateRange: range, fromCache: false }
          : pages
        const safeTrend: TrendResponse = trend.error
          ? { series: {}, sources: [], dateRange: range }
          : trend

        setAiData(safeAi)
        setPagesData(safePages)
        setTrendData(safeTrend)
        setFromCache(!!ai.fromCache)
      } catch (err) {
        console.error('[dashboard] fetch error:', err)
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [siteId]
  )

  useEffect(() => {
    fetchAll(dateRange)
  }, [fetchAll, dateRange])

  if (reconnect) return <ReconnectBanner siteId={siteId} />

  if (loading) {
    return (
      <DashboardSkeleton
        site={site}
        dateRange={dateRange}
        setDateRange={(r) => {
          setDateRange(r)
        }}
      />
    )
  }

  if (!aiData || !pagesData || !trendData) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'rgba(255,255,255,0.4)' }}>
        <p>Unable to load dashboard data. Try refreshing.</p>
        <button
          onClick={() => fetchAll(dateRange)}
          style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', backgroundColor: '#00D4AA', color: '#0A0A0A', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
        >
          Retry
        </button>
      </div>
    )
  }

  const overallTrend = computeOverallTrend(aiData)

  return (
    <>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <HeaderBar
          site={site}
          dateRange={dateRange}
          setDateRange={(r) => setDateRange(r)}
          onRefresh={() => fetchAll(dateRange, true)}
          refreshing={refreshing}
          fromCache={fromCache}
        />

        <MetricCards aiData={aiData} pagesData={pagesData} overallTrend={overallTrend} />

        {/* Charts row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <AiSourceChart sources={aiData.aiSources} />
          <TrendChart trend={trendData} />
        </div>

        <TopPagesTable pages={pagesData.pages} totalAiSessions={aiData.totalAiSessions} />

        {/* Bottom row: Queries + Recommendations */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
            gap: '1rem',
          }}
        >
          <QueriesPanel queries={aiData.topQueries} />
          <RecommendationsPanel siteId={siteId} />
        </div>

        {/* Cache notice */}
        {fromCache && (
          <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)', marginTop: '2rem' }}>
            Data cached · refreshes every 6 hours · click Refresh to clear
          </p>
        )}
      </div>
    </>
  )
}
