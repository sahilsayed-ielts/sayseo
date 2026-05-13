'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TrafficLeader {
  page: string; sessions: number; channel: string; insight: string
}
interface DecliningPage {
  page: string; sessions: number; bounce_rate: number; issue: string; recommended_action: string
}
interface EngagementIssue {
  page: string; bounce_rate: number; avg_engagement_time: number; reason: string; recommended_action: string
}
interface ContentOpportunity {
  page: string; sessions: number; insight: string; recommended_action: string
}
interface QuickWin {
  page: string; sessions: number; issue: string; recommended_action: string; priority: 'high' | 'medium'
}
interface ChannelRow {
  channel: string; sessions: number; percentage: number
}
interface GA4Summary {
  total_sessions: number; total_pages: number; top_channel: string; top_page: string; key_insight: string
}
export interface GA4AnalysisJSON {
  traffic_leaders: TrafficLeader[]
  declining_pages: DecliningPage[]
  engagement_issues: EngagementIssue[]
  content_opportunities: ContentOpportunity[]
  quick_wins: QuickWin[]
  channel_breakdown: ChannelRow[]
  summary: GA4Summary
}
export interface GA4Run {
  id: string; fetched_at: string; row_count: number | null; status: string
}
interface Props {
  siteId: string
  domain: string
  hasGa4Token: boolean
  ga4PropertyId: string | null
  initialRuns: GA4Run[]
  initialAnalysis: GA4AnalysisJSON | null
  initialRunId: string | null
}

type Step = 'idle' | 'fetching' | 'analysing' | 'loading' | 'error'
type TabId = 'quick_wins' | 'traffic_leaders' | 'engagement_issues' | 'content_opportunities' | 'declining_pages' | 'channel_breakdown'

// ─── CSV / download helpers ───────────────────────────────────────────────────

function escapeCell(v: string | number): string {
  return `"${String(v).replace(/"/g, '""')}"`
}
function buildCSV(headers: string[], rows: (string | number)[][]): string {
  return [headers, ...rows].map((r) => r.map(escapeCell).join(',')).join('\n')
}
function triggerDownload(filename: string, content: string, mime = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename
  document.body.appendChild(a); a.click()
  document.body.removeChild(a); URL.revokeObjectURL(url)
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

function truncPath(p: string, max = 50): string {
  return p.length > max ? p.slice(0, max) + '…' : p
}
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}
function fmtNum(n: number): string { return n.toLocaleString('en-GB') }
function fmtPct(n: number): string { return (n * 100).toFixed(1) + '%' }
function fmtSecs(s: number): string {
  if (s < 60) return `${Math.round(s)}s`
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner({ size = 14 }: { size?: number }) {
  return (
    <svg style={{ width: size, height: size, animation: 'ga4-spin 0.8s linear infinite', flexShrink: 0 }}
      viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity={0.2} />
      <path opacity={0.8} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ label }: { label: string }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: '0.625rem' }}>
        <div style={{ height: '100%', width: '45%', backgroundColor: '#00D4AA', borderRadius: 2, animation: 'ga4-progress 1.4s ease-in-out infinite' }} />
      </div>
      <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>{label}</p>
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent, icon }: {
  label: string; value: string; sub?: string; accent?: boolean; icon: React.ReactNode
}) {
  return (
    <div style={{
      backgroundColor: '#111',
      border: `1px solid ${accent ? 'rgba(0,212,170,0.25)' : 'rgba(255,255,255,0.07)'}`,
      borderRadius: '0.875rem', padding: '1.25rem',
      display: 'flex', flexDirection: 'column' as const, gap: '0.75rem',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '0.5rem',
        backgroundColor: accent ? 'rgba(0,212,170,0.12)' : 'rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', margin: '0 0 0.3rem' }}>
          {label}
        </p>
        <p style={{ fontSize: '1.625rem', fontWeight: 800, color: accent ? '#00D4AA' : '#fff', margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>
          {value}
        </p>
        {sub && (
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', margin: '0.3rem 0 0' }}>{sub}</p>
        )}
      </div>
    </div>
  )
}

// ─── Priority badge ───────────────────────────────────────────────────────────

function PriBadge({ p }: { p: 'high' | 'medium' }) {
  const hi = p === 'high'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.2rem 0.55rem', borderRadius: '0.35rem', fontSize: '0.7rem', fontWeight: 700,
      backgroundColor: hi ? 'rgba(0,212,170,0.12)' : 'rgba(255,255,255,0.05)',
      color: hi ? '#00D4AA' : 'rgba(255,255,255,0.35)',
      border: `1px solid ${hi ? 'rgba(0,212,170,0.2)' : 'rgba(255,255,255,0.07)'}`,
      whiteSpace: 'nowrap' as const,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: hi ? '#00D4AA' : 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
      {hi ? 'High' : 'Medium'}
    </span>
  )
}

// ─── Channel badge ────────────────────────────────────────────────────────────

const CHANNEL_COLORS: Record<string, string> = {
  'Organic Search': '#00D4AA',
  'Direct': '#38BDF8',
  'Referral': '#818CF8',
  'Organic Social': '#F59E0B',
  'Email': '#FB923C',
  'Paid Search': '#C084FC',
  'Display': '#F87171',
  'Unassigned': 'rgba(255,255,255,0.25)',
}

function ChannelDot({ channel }: { channel: string }) {
  const color = CHANNEL_COLORS[channel] ?? 'rgba(255,255,255,0.3)'
  return <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: color, flexShrink: 0, display: 'inline-block' }} />
}

// ─── Table primitives ─────────────────────────────────────────────────────────

const TH: React.CSSProperties = {
  padding: '0.6rem 1rem', textAlign: 'left', fontSize: '0.68rem', fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.28)',
  whiteSpace: 'nowrap', backgroundColor: 'rgba(255,255,255,0.02)',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
}
const TD: React.CSSProperties = {
  padding: '0.75rem 1rem', fontSize: '0.8125rem', color: '#fff', verticalAlign: 'top',
}

function Row({ children, highPri, last }: { children: React.ReactNode; highPri?: boolean; last?: boolean }) {
  return (
    <tr style={{
      borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.04)',
      borderLeft: highPri ? '3px solid #00D4AA' : '3px solid transparent',
    }}>
      {children}
    </tr>
  )
}

// ─── Tab bar ─────────────────────────────────────────────────────────────────

const TAB_DEFS: { id: TabId; label: string; color: string }[] = [
  { id: 'quick_wins',            label: 'Quick Wins',          color: '#00D4AA' },
  { id: 'traffic_leaders',       label: 'Traffic Leaders',     color: '#38BDF8' },
  { id: 'engagement_issues',     label: 'Engagement Issues',   color: '#FB923C' },
  { id: 'content_opportunities', label: 'Content Gaps',        color: '#F59E0B' },
  { id: 'declining_pages',       label: 'Declining Pages',     color: '#F87171' },
  { id: 'channel_breakdown',     label: 'Channels',            color: '#818CF8' },
]

function TabBar({ active, counts, onChange }: {
  active: TabId; counts: Record<TabId, number>; onChange: (t: TabId) => void
}) {
  return (
    <div style={{ display: 'flex', gap: 0, overflowX: 'auto' as const, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      {TAB_DEFS.map((t) => {
        const isActive = t.id === active
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.125rem', fontSize: '0.8125rem', fontWeight: isActive ? 700 : 500,
              color: isActive ? t.color : 'rgba(255,255,255,0.4)',
              background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0,
              borderBottom: isActive ? `2px solid ${t.color}` : '2px solid transparent',
              marginBottom: '-1px', whiteSpace: 'nowrap' as const, transition: 'color 0.15s',
            }}
          >
            {t.label}
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '0.3rem',
              backgroundColor: isActive ? `color-mix(in srgb, ${t.color} 15%, transparent)` : 'rgba(255,255,255,0.06)',
              color: isActive ? t.color : 'rgba(255,255,255,0.3)',
            }}>
              {counts[t.id]}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Export dropdown ──────────────────────────────────────────────────────────

function ExportDropdown({ analysis, currentRunId, siteId, domain }: {
  analysis: GA4AnalysisJSON; currentRunId: string | null; siteId: string; domain: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const downloadRaw = () => {
    if (!currentRunId) return
    setOpen(false)
    const a = document.createElement('a')
    a.href = `/api/ga4-intel/results?runId=${currentRunId}&siteId=${siteId}`
    a.download = `${domain}-ga4-pages.csv`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }

  const downloadQuickWins = () => {
    setOpen(false)
    triggerDownload(`${domain}-ga4-quick-wins.csv`, buildCSV(
      ['Page', 'Sessions', 'Issue', 'Recommended Action', 'Priority'],
      (analysis.quick_wins ?? []).map((r) => [r.page, r.sessions, r.issue, r.recommended_action, r.priority])
    ))
  }

  const downloadJSON = () => {
    setOpen(false)
    triggerDownload(`${domain}-ga4-analysis.json`, JSON.stringify(analysis, null, 2), 'application/json')
  }

  const items = [
    { label: 'Raw Page Data (CSV)', sub: 'All tracked pages & metrics', action: downloadRaw },
    { label: 'Quick Wins (CSV)', sub: null, action: downloadQuickWins },
    { label: 'Full Analysis (JSON)', sub: null, action: downloadJSON },
  ]

  return (
    <div ref={ref} style={{ position: 'relative' as const }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.5rem 0.875rem', borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 600,
          color: 'rgba(255,255,255,0.75)', backgroundColor: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute' as const, right: 0, top: 'calc(100% + 0.375rem)',
          backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '0.625rem', minWidth: 220, zIndex: 50,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)', overflow: 'hidden',
        }}>
          {items.map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                width: '100%', padding: '0.75rem 1rem', background: 'none', border: 'none',
                cursor: 'pointer', borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                textAlign: 'left' as const,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#fff', margin: 0 }}>{item.label}</p>
                {item.sub && <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', margin: '0.1rem 0 0' }}>{item.sub}</p>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Tab panel ────────────────────────────────────────────────────────────────

function TabPanel({ tab, analysis }: { tab: TabId; analysis: GA4AnalysisJSON }) {
  const [filter, setFilter] = useState('')

  const { headers, rows, empty } = useMemo(() => {
    const q = filter.toLowerCase()
    const m = (...vals: string[]) => !q || vals.some((v) => v.toLowerCase().includes(q))

    switch (tab) {
      case 'quick_wins': {
        const items = (analysis.quick_wins ?? []).filter((r) => m(r.page, r.issue, r.recommended_action))
        return {
          headers: ['Page', 'Sessions', 'Issue', 'Recommended Action', 'Priority'],
          empty: 'No quick wins identified.',
          rows: items.map((r, i) => (
            <Row key={i} highPri={r.priority === 'high'} last={i === items.length - 1}>
              <td style={{ ...TD, maxWidth: 220 }}>
                <span title={r.page} style={{ fontWeight: 500 }}>{truncPath(r.page)}</span>
              </td>
              <td style={{ ...TD, color: '#00D4AA', fontWeight: 700 }}>{fmtNum(r.sessions)}</td>
              <td style={{ ...TD, maxWidth: 220, color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem' }}>{r.issue}</td>
              <td style={{ ...TD, maxWidth: 260, fontSize: '0.78rem' }}>{r.recommended_action}</td>
              <td style={TD}><PriBadge p={r.priority} /></td>
            </Row>
          )),
        }
      }
      case 'traffic_leaders': {
        const items = (analysis.traffic_leaders ?? []).filter((r) => m(r.page, r.channel, r.insight))
        return {
          headers: ['Page', 'Sessions', 'Channel', 'Insight'],
          empty: 'No traffic leader data available.',
          rows: items.map((r, i) => (
            <Row key={i} last={i === items.length - 1}>
              <td style={{ ...TD, maxWidth: 240, fontWeight: 500 }}>
                <span title={r.page}>{truncPath(r.page)}</span>
              </td>
              <td style={{ ...TD, color: '#38BDF8', fontWeight: 700 }}>{fmtNum(r.sessions)}</td>
              <td style={TD}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ChannelDot channel={r.channel} />
                  <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>{r.channel}</span>
                </span>
              </td>
              <td style={{ ...TD, maxWidth: 300, color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem' }}>{r.insight}</td>
            </Row>
          )),
        }
      }
      case 'engagement_issues': {
        const items = (analysis.engagement_issues ?? []).filter((r) => m(r.page, r.reason, r.recommended_action))
        return {
          headers: ['Page', 'Bounce Rate', 'Avg Engagement', 'Reason', 'Recommended Action'],
          empty: 'No engagement issues identified.',
          rows: items.map((r, i) => (
            <Row key={i} last={i === items.length - 1}>
              <td style={{ ...TD, maxWidth: 220, fontWeight: 500 }}>
                <span title={r.page}>{truncPath(r.page)}</span>
              </td>
              <td style={{ ...TD, color: r.bounce_rate > 0.7 ? '#F87171' : '#FB923C', fontWeight: 700 }}>
                {fmtPct(r.bounce_rate)}
              </td>
              <td style={{ ...TD, color: 'rgba(255,255,255,0.65)' }}>{fmtSecs(r.avg_engagement_time)}</td>
              <td style={{ ...TD, maxWidth: 220, color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem' }}>{r.reason}</td>
              <td style={{ ...TD, maxWidth: 260, fontSize: '0.78rem' }}>{r.recommended_action}</td>
            </Row>
          )),
        }
      }
      case 'content_opportunities': {
        const items = (analysis.content_opportunities ?? []).filter((r) => m(r.page, r.insight, r.recommended_action))
        return {
          headers: ['Page', 'Sessions', 'Insight', 'Recommended Action'],
          empty: 'No content opportunities identified.',
          rows: items.map((r, i) => (
            <Row key={i} last={i === items.length - 1}>
              <td style={{ ...TD, maxWidth: 220, fontWeight: 500 }}>
                <span title={r.page}>{truncPath(r.page)}</span>
              </td>
              <td style={{ ...TD, color: '#F59E0B', fontWeight: 700 }}>{fmtNum(r.sessions)}</td>
              <td style={{ ...TD, maxWidth: 240, color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem' }}>{r.insight}</td>
              <td style={{ ...TD, maxWidth: 280, fontSize: '0.78rem' }}>{r.recommended_action}</td>
            </Row>
          )),
        }
      }
      case 'declining_pages': {
        const items = (analysis.declining_pages ?? []).filter((r) => m(r.page, r.issue, r.recommended_action))
        return {
          headers: ['Page', 'Sessions', 'Bounce Rate', 'Issue', 'Recommended Action'],
          empty: 'No declining pages identified.',
          rows: items.map((r, i) => (
            <Row key={i} last={i === items.length - 1}>
              <td style={{ ...TD, maxWidth: 220, fontWeight: 500 }}>
                <span title={r.page}>{truncPath(r.page)}</span>
              </td>
              <td style={{ ...TD, color: '#F87171', fontWeight: 700 }}>{fmtNum(r.sessions)}</td>
              <td style={{ ...TD, color: 'rgba(255,255,255,0.65)' }}>{fmtPct(r.bounce_rate)}</td>
              <td style={{ ...TD, maxWidth: 220, color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem' }}>{r.issue}</td>
              <td style={{ ...TD, maxWidth: 260, fontSize: '0.78rem' }}>{r.recommended_action}</td>
            </Row>
          )),
        }
      }
      case 'channel_breakdown': {
        const items = (analysis.channel_breakdown ?? []).filter((r) => m(r.channel))
        const maxSessions = Math.max(...items.map((r) => r.sessions), 1)
        return {
          headers: ['Channel', 'Sessions', 'Share', ''],
          empty: 'No channel data available.',
          rows: items.map((r, i) => (
            <Row key={i} last={i === items.length - 1}>
              <td style={TD}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ChannelDot channel={r.channel} />
                  <span style={{ fontWeight: 600 }}>{r.channel}</span>
                </span>
              </td>
              <td style={{ ...TD, color: '#818CF8', fontWeight: 700 }}>{fmtNum(r.sessions)}</td>
              <td style={{ ...TD, color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>{Number(r.percentage).toFixed(1)}%</td>
              <td style={{ ...TD, width: 160, verticalAlign: 'middle' }}>
                <div style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    backgroundColor: CHANNEL_COLORS[r.channel] ?? 'rgba(255,255,255,0.2)',
                    width: `${(r.sessions / maxSessions) * 100}%`,
                    transition: 'width 0.4s ease',
                  }} />
                </div>
              </td>
            </Row>
          )),
        }
      }
    }
  }, [tab, analysis, filter])

  const tabDef = TAB_DEFS.find((t) => t.id === tab)

  return (
    <div>
      <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <input
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={`Filter ${tabDef?.label ?? ''}…`}
          style={{
            backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '0.4rem', padding: '0.375rem 0.75rem', fontSize: '0.8125rem', color: '#fff',
            outline: 'none', width: 220,
          }}
        />
        {filter && (
          <button onClick={() => setFilter('')} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer' }}>
            Clear
          </button>
        )}
        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', marginLeft: 'auto' }}>
          {rows.length} {rows.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {rows.length === 0 ? (
        <div style={{ padding: '2.5rem 1.25rem', textAlign: 'center' as const }}>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.2)', margin: 0 }}>{empty}</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' as const }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{headers.map((h) => <th key={h} style={TH}>{h}</th>)}</tr></thead>
            <tbody>{rows}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Previous runs ────────────────────────────────────────────────────────────

function PreviousRuns({ runs, currentRunId, onLoad }: {
  runs: GA4Run[]; currentRunId: string | null; onLoad: (id: string) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  if (runs.length === 0) return null

  const handleLoad = async (runId: string) => {
    setLoadingId(runId)
    await onLoad(runId)
    setLoadingId(null)
  }

  return (
    <div style={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.875rem', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#fff' }}>Previous Runs</span>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.06)', padding: '0.1rem 0.4rem', borderRadius: '0.3rem' }}>
            {runs.length}
          </span>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {runs.map((run, i) => {
            const isActive = run.id === currentRunId
            const isLoading = loadingId === run.id
            return (
              <div key={run.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.75rem 1.25rem',
                borderBottom: i < runs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                backgroundColor: isActive ? 'rgba(0,212,170,0.04)' : 'transparent',
              }}>
                <div>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: isActive ? '#00D4AA' : '#fff', margin: '0 0 0.15rem' }}>
                    {fmtDate(run.fetched_at)}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
                    {run.row_count != null ? `${fmtNum(run.row_count)} pages` : '—'}
                    {' · '}
                    <span style={{ color: run.status === 'complete' ? 'rgba(0,212,170,0.55)' : 'rgba(255,255,255,0.25)' }}>
                      {run.status}
                    </span>
                  </p>
                </div>
                {isActive ? (
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#00D4AA', backgroundColor: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', padding: '0.2rem 0.55rem', borderRadius: '0.3rem' }}>
                    Active
                  </span>
                ) : run.status === 'complete' ? (
                  <button
                    onClick={() => handleLoad(run.id)}
                    disabled={!!loadingId}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                      padding: '0.35rem 0.75rem', borderRadius: '0.4rem', fontSize: '0.78rem', fontWeight: 600,
                      color: isLoading ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.65)',
                      backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)',
                      cursor: loadingId ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isLoading && <Spinner size={11} />}
                    {isLoading ? 'Loading…' : 'Load'}
                  </button>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function GA4IntelClient({
  siteId, domain, hasGa4Token, ga4PropertyId, initialRuns, initialAnalysis, initialRunId,
}: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('idle')
  const [analysis, setAnalysis] = useState<GA4AnalysisJSON | null>(initialAnalysis)
  const [runs, setRuns] = useState<GA4Run[]>(initialRuns)
  const [currentRunId, setCurrentRunId] = useState<string | null>(initialRunId)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('quick_wins')

  const latestRun = runs[0] ?? null
  const isRunning = step === 'fetching' || step === 'analysing'

  const handleFetchAndAnalyse = async () => {
    setStep('fetching')
    setError(null)

    let runId: string
    try {
      const res = await fetch('/api/ga4-intel/fetch', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStep('error')
        setError(
          data.error === 'reconnect_required'
            ? 'Google account connection expired. Please reconnect.'
            : data.error ?? 'Failed to fetch Google Analytics data.'
        )
        return
      }
      runId = data.runId
      setCurrentRunId(runId)
      setRuns((prev) => [{ id: runId, fetched_at: new Date().toISOString(), row_count: data.rowCount, status: 'complete' }, ...prev])
    } catch {
      setStep('error'); setError('Network error whilst fetching GA4 data.'); return
    }

    setStep('analysing')
    try {
      const res = await fetch('/api/ga4-intel/analyse', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId, siteId }),
      })
      const data = await res.json()
      if (!res.ok) { setStep('error'); setError(data.error ?? 'Intelligent analysis failed.'); return }
      setAnalysis(data.analysis)
      setStep('idle')
      router.refresh()
    } catch {
      setStep('error'); setError('Network error during intelligent analysis.')
    }
  }

  const handleLoadRun = async (runId: string) => {
    setStep('loading')
    try {
      const res = await fetch('/api/ga4-intel/analyse', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId, siteId }),
      })
      const data = await res.json()
      if (res.ok) { setAnalysis(data.analysis); setCurrentRunId(runId) }
      else setError(data.error ?? 'Failed to load run analysis.')
    } catch {
      setError('Network error loading run.')
    } finally {
      setStep('idle')
    }
  }

  const summary = analysis?.summary
  const tabCounts: Record<TabId, number> = {
    quick_wins:            (analysis?.quick_wins ?? []).length,
    traffic_leaders:       (analysis?.traffic_leaders ?? []).length,
    engagement_issues:     (analysis?.engagement_issues ?? []).length,
    content_opportunities: (analysis?.content_opportunities ?? []).length,
    declining_pages:       (analysis?.declining_pages ?? []).length,
    channel_breakdown:     (analysis?.channel_breakdown ?? []).length,
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: '1rem' }}>
        <div>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#00D4AA', margin: '0 0 0.25rem' }}>
            GA4 Intel
          </p>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: '0 0 0.2rem', letterSpacing: '-0.02em' }}>
            {domain}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
            Page performance analysis powered by your live Google Analytics data
          </p>
          {latestRun && !isRunning && (
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', margin: '0.3rem 0 0' }}>
              Last run: {fmtDate(latestRun.fetched_at)}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
          {analysis && currentRunId && (
            <ExportDropdown analysis={analysis} currentRunId={currentRunId} siteId={siteId} domain={domain} />
          )}
          {hasGa4Token && ga4PropertyId ? (
            <button
              onClick={handleFetchAndAnalyse}
              disabled={isRunning}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5625rem 1.25rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 700,
                color: '#0A0A0A', backgroundColor: isRunning ? 'rgba(0,212,170,0.4)' : '#00D4AA',
                border: 'none', cursor: isRunning ? 'not-allowed' : 'pointer', transition: 'opacity 0.15s',
              }}
            >
              {isRunning ? <Spinner /> : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                </svg>
              )}
              {step === 'fetching' ? 'Fetching…' : step === 'analysing' ? 'Analysing…' : 'Fetch & Analyse'}
            </button>
          ) : !hasGa4Token ? (
            <div style={{ padding: '0.625rem 0.875rem', borderRadius: '0.5rem', backgroundColor: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', fontSize: '0.8125rem', color: 'rgba(251,191,36,0.8)' }}>
              Google account not connected
            </div>
          ) : (
            <div style={{ padding: '0.625rem 0.875rem', borderRadius: '0.5rem', backgroundColor: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', fontSize: '0.8125rem', color: 'rgba(251,191,36,0.8)' }}>
              GA4 property ID not configured
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      {step === 'fetching' && <ProgressBar label="Fetching Google Analytics data…" />}
      {step === 'analysing' && <ProgressBar label="Running intelligent analysis…" />}

      {/* Error banner */}
      {step === 'error' && error && (
        <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', fontSize: '0.8125rem', color: '#fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <span>{error}</span>
          <button onClick={() => setStep('idle')} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>Dismiss</button>
        </div>
      )}

      {/* Empty state */}
      {!analysis && step === 'idle' && (
        <div style={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.875rem', padding: '4rem 1.5rem', textAlign: 'center' as const, marginBottom: '1.5rem' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.25" style={{ marginBottom: '1rem' }} aria-hidden="true">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)', margin: '0 0 0.4rem' }}>No analysis yet</p>
          <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.18)', margin: 0 }}>
            Click &ldquo;Fetch &amp; Analyse&rdquo; to pull 90 days of GA4 data and generate SEO insights.
          </p>
        </div>
      )}

      {/* Summary cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <StatCard
            label="Total Sessions"
            value={fmtNum(summary.total_sessions)}
            sub="last 90 days"
            accent
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
          />
          <StatCard
            label="Pages Tracked"
            value={fmtNum(summary.total_pages)}
            sub="unique page paths"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
          />
          <StatCard
            label="Top Channel"
            value={summary.top_channel}
            sub="highest traffic source"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}
          />
          <StatCard
            label="Key Insight"
            value={(summary.key_insight ?? '').slice(0, 40) + ((summary.key_insight ?? '').length > 40 ? '…' : '')}
            sub={summary.top_page ? truncPath(summary.top_page, 30) : undefined}
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
          />
        </div>
      )}

      {/* Download hint */}
      {summary && currentRunId && (
        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.3)' }}>
            {fmtNum(summary.total_sessions)} sessions across {fmtNum(summary.total_pages)} pages
          </span>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.15)' }}>·</span>
          <button
            onClick={() => {
              const a = document.createElement('a')
              a.href = `/api/ga4-intel/results?runId=${currentRunId}&siteId=${siteId}`
              a.download = `${domain}-ga4-pages.csv`
              document.body.appendChild(a); a.click(); document.body.removeChild(a)
            }}
            style={{ fontSize: '0.8125rem', color: '#00D4AA', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline', textUnderlineOffset: '2px' }}
          >
            Download CSV
          </button>
        </div>
      )}

      {/* Tabbed panel */}
      {analysis && (
        <div style={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.875rem', overflow: 'hidden', marginBottom: '1.5rem' }}>
          <TabBar active={activeTab} counts={tabCounts} onChange={setActiveTab} />
          <TabPanel tab={activeTab} analysis={analysis} />
        </div>
      )}

      {/* Previous runs */}
      <PreviousRuns runs={runs} currentRunId={currentRunId} onLoad={handleLoadRun} />

      <style>{`
        @keyframes ga4-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes ga4-progress { 0% { transform: translateX(-120%); } 60% { transform: translateX(0%); } 100% { transform: translateX(120%); } }
      `}</style>
    </div>
  )
}
