'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuickWin {
  query: string
  page: string
  position: number
  impressions: number
  ctr: number
  reason: string
  priority: 'high' | 'medium'
}

interface ContentGap {
  query: string
  impressions: number
  suggested_page: string
  suggested_slug: string
  reason: string
}

interface AICitation {
  query: string
  page: string
  reason: string
  recommended_action: string
}

interface AIOOpp {
  query: string
  page: string
  reason: string
  schema_type: string
  recommended_action: string
}

interface CTROpt {
  query: string
  page: string
  position: number
  current_ctr: number
  reason: string
  recommended_action: string
}

interface AnalysisSummary {
  total_queries: number
  total_pages: number
  avg_position: number
  top_opportunity: string
}

export interface AnalysisJSON {
  quick_wins: QuickWin[]
  content_gaps: ContentGap[]
  ai_citation_opportunities: AICitation[]
  aio_opportunities: AIOOpp[]
  ctr_optimisation: CTROpt[]
  summary: AnalysisSummary
}

export interface QIRun {
  id: string
  fetched_at: string
  row_count: number | null
  status: string
}

interface Props {
  siteId: string
  domain: string
  hasGscToken: boolean
  initialRuns: QIRun[]
  initialAnalysis: AnalysisJSON | null
  initialRunId: string | null
}

type Step = 'idle' | 'fetching' | 'analysing' | 'loading' | 'error'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function truncateUrl(url: string, max = 48): string {
  const clean = url.replace(/^https?:\/\//, '')
  return clean.length > max ? clean.slice(0, max) + '…' : clean
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function fmtPct(n: number): string {
  return (n * 100).toFixed(1) + '%'
}

// ─── Spinner ─────────────────────────────────────────────────────────────────

function Spinner({ size = 14 }: { size?: number }) {
  return (
    <svg
      style={{ width: size, height: size, animation: 'qi-spin 0.8s linear infinite', flexShrink: 0 }}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity={0.2} />
      <path opacity={0.8} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ label }: { label: string }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{
        height: 3,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.06)',
        overflow: 'hidden',
        marginBottom: '0.625rem',
      }}>
        <div style={{
          height: '100%',
          width: '40%',
          backgroundColor: '#00D4AA',
          borderRadius: 2,
          animation: 'qi-progress 1.4s ease-in-out infinite',
        }} />
      </div>
      <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
        {label}
      </p>
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div style={{
      backgroundColor: '#111',
      border: `1px solid ${accent ? 'rgba(0,212,170,0.2)' : 'rgba(255,255,255,0.07)'}`,
      borderRadius: '0.75rem',
      padding: '1.25rem',
    }}>
      <p style={{
        fontSize: '0.7rem',
        fontWeight: 700,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.1em',
        color: 'rgba(255,255,255,0.4)',
        margin: '0 0 0.5rem',
      }}>
        {label}
      </p>
      <p style={{
        fontSize: '1.75rem',
        fontWeight: 800,
        color: accent ? '#00D4AA' : '#fff',
        margin: 0,
        letterSpacing: '-0.03em',
        lineHeight: 1,
      }}>
        {value}
      </p>
    </div>
  )
}

// ─── Priority badge ───────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: 'high' | 'medium' }) {
  const high = priority === 'high'
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.3rem',
      padding: '0.2rem 0.55rem',
      borderRadius: '0.375rem',
      fontSize: '0.72rem',
      fontWeight: 700,
      backgroundColor: high ? 'rgba(0,212,170,0.12)' : 'rgba(255,255,255,0.06)',
      color: high ? '#00D4AA' : 'rgba(255,255,255,0.4)',
      border: `1px solid ${high ? 'rgba(0,212,170,0.25)' : 'rgba(255,255,255,0.08)'}`,
      whiteSpace: 'nowrap' as const,
    }}>
      <span style={{
        width: 5,
        height: 5,
        borderRadius: '50%',
        backgroundColor: high ? '#00D4AA' : 'rgba(255,255,255,0.3)',
        flexShrink: 0,
      }} />
      {high ? 'High' : 'Medium'}
    </span>
  )
}

// ─── Table shell ──────────────────────────────────────────────────────────────

const TH_STYLE: React.CSSProperties = {
  padding: '0.625rem 1rem',
  textAlign: 'left',
  fontSize: '0.7rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'rgba(255,255,255,0.3)',
  whiteSpace: 'nowrap',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
}

const TD_STYLE: React.CSSProperties = {
  padding: '0.8rem 1rem',
  fontSize: '0.8125rem',
  color: '#fff',
  verticalAlign: 'top',
}

function SectionShell({
  title,
  count,
  filter,
  onFilter,
  children,
  empty,
}: {
  title: string
  count: number
  filter: string
  onFilter: (v: string) => void
  children: React.ReactNode
  empty?: string
}) {
  return (
    <div style={{
      backgroundColor: '#111',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '0.75rem',
      overflow: 'hidden',
      marginBottom: '1.5rem',
    }}>
      <div style={{
        padding: '0.875rem 1.25rem',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap' as const,
        gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <h2 style={{
            fontSize: '0.8125rem',
            fontWeight: 700,
            color: '#fff',
            margin: 0,
          }}>
            {title}
          </h2>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.35)',
            backgroundColor: 'rgba(255,255,255,0.06)',
            padding: '0.1rem 0.45rem',
            borderRadius: '0.3rem',
          }}>
            {count}
          </span>
        </div>
        <input
          type="search"
          value={filter}
          onChange={(e) => onFilter(e.target.value)}
          placeholder="Filter…"
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '0.4rem',
            padding: '0.35rem 0.75rem',
            fontSize: '0.8125rem',
            color: '#fff',
            outline: 'none',
            width: 180,
          }}
        />
      </div>
      {count === 0 ? (
        <div style={{ padding: '2.5rem 1.25rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
            {empty ?? 'No items found.'}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            {children}
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Quick wins ───────────────────────────────────────────────────────────────

function QuickWinsSection({ items }: { items: QuickWin[] }) {
  const [filter, setFilter] = useState('')
  const filtered = useMemo(() => {
    if (!filter) return items
    const q = filter.toLowerCase()
    return items.filter((r) =>
      r.query.toLowerCase().includes(q) ||
      r.page.toLowerCase().includes(q) ||
      r.reason.toLowerCase().includes(q)
    )
  }, [items, filter])

  return (
    <SectionShell
      title="Quick Wins"
      count={filtered.length}
      filter={filter}
      onFilter={setFilter}
      empty="No quick wins identified."
    >
      <thead>
        <tr>
          {['Query', 'Page', 'Position', 'Impressions', 'CTR', 'Reason', 'Priority'].map((h) => (
            <th key={h} style={TH_STYLE}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filtered.map((row, i) => (
          <tr key={i} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <td style={{ ...TD_STYLE, maxWidth: 200 }}>{row.query}</td>
            <td style={{ ...TD_STYLE, maxWidth: 200 }}>
              <span title={row.page} style={{ color: 'rgba(255,255,255,0.6)' }}>
                {truncateUrl(row.page)}
              </span>
            </td>
            <td style={{ ...TD_STYLE, color: '#00D4AA', fontWeight: 600 }}>{row.position.toFixed(1)}</td>
            <td style={TD_STYLE}>{row.impressions.toLocaleString()}</td>
            <td style={TD_STYLE}>{fmtPct(row.ctr)}</td>
            <td style={{ ...TD_STYLE, maxWidth: 280, color: 'rgba(255,255,255,0.6)' }}>{row.reason}</td>
            <td style={TD_STYLE}><PriorityBadge priority={row.priority} /></td>
          </tr>
        ))}
      </tbody>
    </SectionShell>
  )
}

// ─── Content gaps ─────────────────────────────────────────────────────────────

function ContentGapsSection({ items }: { items: ContentGap[] }) {
  const [filter, setFilter] = useState('')
  const filtered = useMemo(() => {
    if (!filter) return items
    const q = filter.toLowerCase()
    return items.filter((r) =>
      r.query.toLowerCase().includes(q) ||
      r.suggested_slug.toLowerCase().includes(q) ||
      r.reason.toLowerCase().includes(q)
    )
  }, [items, filter])

  return (
    <SectionShell
      title="Content Gaps"
      count={filtered.length}
      filter={filter}
      onFilter={setFilter}
      empty="No content gaps identified."
    >
      <thead>
        <tr>
          {['Query', 'Impressions', 'Suggested Page', 'Suggested Slug', 'Reason'].map((h) => (
            <th key={h} style={TH_STYLE}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filtered.map((row, i) => (
          <tr key={i} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <td style={{ ...TD_STYLE, maxWidth: 200 }}>{row.query}</td>
            <td style={TD_STYLE}>{row.impressions.toLocaleString()}</td>
            <td style={{ ...TD_STYLE, maxWidth: 200, color: 'rgba(255,255,255,0.6)' }}>{row.suggested_page}</td>
            <td style={{ ...TD_STYLE }}>
              <code style={{
                fontSize: '0.75rem',
                backgroundColor: 'rgba(255,255,255,0.06)',
                padding: '0.1rem 0.4rem',
                borderRadius: '0.25rem',
                color: '#00D4AA',
              }}>
                {row.suggested_slug}
              </code>
            </td>
            <td style={{ ...TD_STYLE, maxWidth: 280, color: 'rgba(255,255,255,0.6)' }}>{row.reason}</td>
          </tr>
        ))}
      </tbody>
    </SectionShell>
  )
}

// ─── AI citation opportunities ────────────────────────────────────────────────

function AICitationSection({ items }: { items: AICitation[] }) {
  const [filter, setFilter] = useState('')
  const filtered = useMemo(() => {
    if (!filter) return items
    const q = filter.toLowerCase()
    return items.filter((r) =>
      r.query.toLowerCase().includes(q) ||
      r.page.toLowerCase().includes(q) ||
      r.reason.toLowerCase().includes(q) ||
      r.recommended_action.toLowerCase().includes(q)
    )
  }, [items, filter])

  return (
    <SectionShell
      title="AI Citation Opportunities"
      count={filtered.length}
      filter={filter}
      onFilter={setFilter}
      empty="No AI citation opportunities identified."
    >
      <thead>
        <tr>
          {['Query', 'Page', 'Reason', 'Recommended Action'].map((h) => (
            <th key={h} style={TH_STYLE}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filtered.map((row, i) => (
          <tr key={i} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <td style={{ ...TD_STYLE, maxWidth: 200 }}>{row.query}</td>
            <td style={{ ...TD_STYLE, maxWidth: 180, color: 'rgba(255,255,255,0.6)' }}>
              <span title={row.page}>{truncateUrl(row.page)}</span>
            </td>
            <td style={{ ...TD_STYLE, maxWidth: 260, color: 'rgba(255,255,255,0.6)' }}>{row.reason}</td>
            <td style={{ ...TD_STYLE, maxWidth: 280 }}>{row.recommended_action}</td>
          </tr>
        ))}
      </tbody>
    </SectionShell>
  )
}

// ─── AIO opportunities ────────────────────────────────────────────────────────

function AIOSection({ items }: { items: AIOOpp[] }) {
  const [filter, setFilter] = useState('')
  const filtered = useMemo(() => {
    if (!filter) return items
    const q = filter.toLowerCase()
    return items.filter((r) =>
      r.query.toLowerCase().includes(q) ||
      r.page.toLowerCase().includes(q) ||
      r.schema_type.toLowerCase().includes(q) ||
      r.recommended_action.toLowerCase().includes(q)
    )
  }, [items, filter])

  return (
    <SectionShell
      title="AIO Opportunities"
      count={filtered.length}
      filter={filter}
      onFilter={setFilter}
      empty="No AIO opportunities identified."
    >
      <thead>
        <tr>
          {['Query', 'Page', 'Schema Type', 'Recommended Action'].map((h) => (
            <th key={h} style={TH_STYLE}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filtered.map((row, i) => (
          <tr key={i} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <td style={{ ...TD_STYLE, maxWidth: 200 }}>{row.query}</td>
            <td style={{ ...TD_STYLE, maxWidth: 180, color: 'rgba(255,255,255,0.6)' }}>
              <span title={row.page}>{truncateUrl(row.page)}</span>
            </td>
            <td style={TD_STYLE}>
              <code style={{
                fontSize: '0.75rem',
                backgroundColor: 'rgba(0,212,170,0.08)',
                padding: '0.1rem 0.4rem',
                borderRadius: '0.25rem',
                color: '#00D4AA',
              }}>
                {row.schema_type}
              </code>
            </td>
            <td style={{ ...TD_STYLE, maxWidth: 280 }}>{row.recommended_action}</td>
          </tr>
        ))}
      </tbody>
    </SectionShell>
  )
}

// ─── CTR optimisation ─────────────────────────────────────────────────────────

function CTRSection({ items }: { items: CTROpt[] }) {
  const [filter, setFilter] = useState('')
  const filtered = useMemo(() => {
    if (!filter) return items
    const q = filter.toLowerCase()
    return items.filter((r) =>
      r.query.toLowerCase().includes(q) ||
      r.page.toLowerCase().includes(q) ||
      r.reason.toLowerCase().includes(q) ||
      r.recommended_action.toLowerCase().includes(q)
    )
  }, [items, filter])

  return (
    <SectionShell
      title="CTR Optimisation"
      count={filtered.length}
      filter={filter}
      onFilter={setFilter}
      empty="No CTR optimisation opportunities identified."
    >
      <thead>
        <tr>
          {['Query', 'Page', 'Position', 'Current CTR', 'Reason', 'Recommended Action'].map((h) => (
            <th key={h} style={TH_STYLE}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filtered.map((row, i) => (
          <tr key={i} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <td style={{ ...TD_STYLE, maxWidth: 200 }}>{row.query}</td>
            <td style={{ ...TD_STYLE, maxWidth: 180, color: 'rgba(255,255,255,0.6)' }}>
              <span title={row.page}>{truncateUrl(row.page)}</span>
            </td>
            <td style={{ ...TD_STYLE, color: '#00D4AA', fontWeight: 600 }}>{row.position.toFixed(1)}</td>
            <td style={TD_STYLE}>{fmtPct(row.current_ctr)}</td>
            <td style={{ ...TD_STYLE, maxWidth: 240, color: 'rgba(255,255,255,0.6)' }}>{row.reason}</td>
            <td style={{ ...TD_STYLE, maxWidth: 280 }}>{row.recommended_action}</td>
          </tr>
        ))}
      </tbody>
    </SectionShell>
  )
}

// ─── Previous runs ────────────────────────────────────────────────────────────

function PreviousRuns({
  runs,
  currentRunId,
  onLoad,
}: {
  runs: QIRun[]
  currentRunId: string | null
  onLoad: (runId: string) => Promise<void>
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  if (runs.length === 0) return null

  const handleLoad = async (runId: string) => {
    setLoadingId(runId)
    await onLoad(runId)
    setLoadingId(null)
  }

  return (
    <div style={{
      backgroundColor: '#111',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '0.75rem',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <h2 style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#fff', margin: 0 }}>
          Previous Runs
        </h2>
      </div>
      <div>
        {runs.map((run, i) => {
          const isActive = run.id === currentRunId
          const isLoading = loadingId === run.id
          return (
            <div
              key={run.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.875rem 1.25rem',
                borderBottom: i < runs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                backgroundColor: isActive ? 'rgba(0,212,170,0.04)' : 'transparent',
              }}
            >
              <div>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: isActive ? '#00D4AA' : '#fff', margin: '0 0 0.2rem' }}>
                  {fmtDate(run.fetched_at)}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                  {run.row_count != null ? `${run.row_count.toLocaleString()} rows` : 'Unknown row count'}
                  {' · '}
                  <span style={{ color: run.status === 'complete' ? 'rgba(0,212,170,0.6)' : 'rgba(255,255,255,0.3)' }}>
                    {run.status}
                  </span>
                </p>
              </div>
              {!isActive && run.status === 'complete' && (
                <button
                  onClick={() => handleLoad(run.id)}
                  disabled={!!loadingId}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.875rem',
                    borderRadius: '0.4rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: isLoading ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.7)',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    cursor: loadingId ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isLoading ? <Spinner size={12} /> : null}
                  {isLoading ? 'Loading…' : 'Load'}
                </button>
              )}
              {isActive && (
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#00D4AA',
                  backgroundColor: 'rgba(0,212,170,0.1)',
                  border: '1px solid rgba(0,212,170,0.2)',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '0.3rem',
                }}>
                  Active
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function QueryIntelligenceClient({
  siteId,
  domain,
  hasGscToken,
  initialRuns,
  initialAnalysis,
  initialRunId,
}: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('idle')
  const [analysis, setAnalysis] = useState<AnalysisJSON | null>(initialAnalysis)
  const [runs, setRuns] = useState<QIRun[]>(initialRuns)
  const [currentRunId, setCurrentRunId] = useState<string | null>(initialRunId)
  const [error, setError] = useState<string | null>(null)

  const latestRun = runs[0] ?? null

  const handleFetchAndAnalyse = async () => {
    setStep('fetching')
    setError(null)

    let runId: string
    try {
      const fetchRes = await fetch('/api/query-intelligence/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId }),
      })
      const fetchData = await fetchRes.json()
      if (!fetchRes.ok) {
        setStep('error')
        setError(fetchData.error ?? 'Failed to fetch Search Console data.')
        return
      }
      runId = fetchData.runId
      setCurrentRunId(runId)
      setRuns((prev) => [
        { id: runId, fetched_at: new Date().toISOString(), row_count: fetchData.rowCount, status: 'complete' },
        ...prev,
      ])
    } catch {
      setStep('error')
      setError('Network error whilst fetching Search Console data.')
      return
    }

    setStep('analysing')
    try {
      const analyseRes = await fetch('/api/query-intelligence/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId, siteId }),
      })
      const analyseData = await analyseRes.json()
      if (!analyseRes.ok) {
        setStep('error')
        setError(analyseData.error ?? 'Intelligent analysis failed.')
        return
      }
      setAnalysis(analyseData.analysis)
      setStep('idle')
      router.refresh()
    } catch {
      setStep('error')
      setError('Network error during intelligent analysis.')
    }
  }

  const handleLoadRun = async (runId: string) => {
    setStep('loading')
    try {
      const res = await fetch('/api/query-intelligence/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId, siteId }),
      })
      const data = await res.json()
      if (res.ok) {
        setAnalysis(data.analysis)
        setCurrentRunId(runId)
      } else {
        setError(data.error ?? 'Failed to load run analysis.')
      }
    } catch {
      setError('Network error loading run.')
    } finally {
      setStep('idle')
    }
  }

  const isRunning = step === 'fetching' || step === 'analysing'
  const summary = analysis?.summary

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* Page header */}
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: '1rem' }}>
        <div>
          <p style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.12em',
            color: '#00D4AA',
            margin: '0 0 0.2rem',
          }}>
            Query Intelligence
          </p>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>
            {domain}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            Query-to-page mapping powered by your live Search Console data
          </p>
          {latestRun && !isRunning && (
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', margin: '0.35rem 0 0' }}>
              Last run: {fmtDate(latestRun.fetched_at)}
            </p>
          )}
        </div>

        {hasGscToken ? (
          <button
            onClick={handleFetchAndAnalyse}
            disabled={isRunning}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1.375rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 700,
              color: '#0A0A0A',
              backgroundColor: isRunning ? 'rgba(0,212,170,0.4)' : '#00D4AA',
              border: 'none',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              flexShrink: 0,
              transition: 'opacity 0.15s',
            }}
          >
            {isRunning ? <Spinner /> : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            )}
            {step === 'fetching' ? 'Fetching Search Console data…' : step === 'analysing' ? 'Running intelligent analysis…' : 'Fetch & Analyse'}
          </button>
        ) : (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            backgroundColor: 'rgba(251,191,36,0.07)',
            border: '1px solid rgba(251,191,36,0.2)',
            fontSize: '0.8125rem',
            color: 'rgba(251,191,36,0.85)',
            maxWidth: 340,
          }}>
            <strong style={{ display: 'block', marginBottom: '0.2rem' }}>Google account not connected</strong>
            Connect your Google account via Settings to enable Query Intelligence.
          </div>
        )}
      </div>

      {/* Progress bar */}
      {step === 'fetching' && <ProgressBar label="Fetching Search Console data…" />}
      {step === 'analysing' && <ProgressBar label="Running intelligent analysis…" />}

      {/* Error state */}
      {step === 'error' && error && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '0.75rem 1rem',
          borderRadius: '0.5rem',
          backgroundColor: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          fontSize: '0.8125rem',
          color: '#fca5a5',
        }}>
          {error}
          <button
            onClick={() => setStep('idle')}
            style={{
              marginLeft: '0.75rem',
              fontSize: '0.8125rem',
              color: 'rgba(255,255,255,0.4)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* No analysis yet */}
      {!analysis && step === 'idle' && (
        <div style={{
          backgroundColor: '#111',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '0.75rem',
          padding: '3.5rem 1.5rem',
          textAlign: 'center' as const,
          marginBottom: '1.5rem',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" style={{ marginBottom: '1rem' }} aria-hidden="true">
            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
            <path d="M13 13l6 6" />
          </svg>
          <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'rgba(255,255,255,0.35)', margin: '0 0 0.4rem' }}>
            No analysis yet
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.2)', margin: 0 }}>
            Click &ldquo;Fetch &amp; Analyse&rdquo; to pull your Search Console data and generate insights.
          </p>
        </div>
      )}

      {/* Summary cards */}
      {summary && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}>
          <StatCard label="Total Queries Tracked" value={summary.total_queries.toLocaleString()} />
          <StatCard label="Total Pages Mapped" value={summary.total_pages.toLocaleString()} />
          <StatCard label="Average Position" value={Number(summary.avg_position).toFixed(1)} accent />
          <StatCard label="Top Opportunity" value={summary.top_opportunity} />
        </div>
      )}

      {/* Analysis sections */}
      {analysis && (
        <>
          <QuickWinsSection items={analysis.quick_wins ?? []} />
          <ContentGapsSection items={analysis.content_gaps ?? []} />
          <AICitationSection items={analysis.ai_citation_opportunities ?? []} />
          <AIOSection items={analysis.aio_opportunities ?? []} />
          <CTRSection items={analysis.ctr_optimisation ?? []} />
        </>
      )}

      {/* Previous runs */}
      <PreviousRuns
        runs={runs}
        currentRunId={currentRunId}
        onLoad={handleLoadRun}
      />

      <style>{`
        @keyframes qi-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes qi-progress {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(150%); }
          100% { transform: translateX(150%); }
        }
      `}</style>
    </div>
  )
}
