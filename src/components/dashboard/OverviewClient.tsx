'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import type { QIAnalysis } from '@/lib/query-intelligence/analyser'
import type { GA4Analysis } from '@/lib/ga4-intel/analyser'

const ChannelBarChart = dynamic(() => import('./charts/ChannelBarChart'), { ssr: false })
const PositionChart = dynamic(() => import('./charts/PositionChart'), { ssr: false })

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RunMeta {
  id: string
  fetched_at: string
  date_from: string | null
  date_to: string | null
  row_count: number | null
  source?: string | null
}

interface CachedAiTraffic {
  aiSources: Array<{ name: string; domain: string; sessions: number; trend: number | null }>
  totalAiSessions: number
  totalSessions: number
  aiPercentage: number
}

interface Props {
  siteId: string
  domain: string
  qiRuns: RunMeta[]
  ga4Runs: RunMeta[]
  initialQIAnalysis: QIAnalysis | null
  initialQIRunId: string | null
  initialGA4Analysis: GA4Analysis | null
  initialGA4RunId: string | null
  latestScore: { score: number; module1_score: number; module2_score: number; module3_score: number } | null
  cachedAiTraffic: CachedAiTraffic | null
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  bg: '#0A0A0A', card: '#111', border: 'rgba(255,255,255,0.07)',
  borderAccent: 'rgba(0,212,170,0.25)', accent: '#00D4AA',
  accentFaint: 'rgba(0,212,170,0.08)', text: '#fff',
  muted: 'rgba(255,255,255,0.38)', faint: 'rgba(255,255,255,0.15)',
  amber: '#F59E0B', purple: '#818CF8', red: '#EF4444', green: '#00D4AA',
  orange: '#FB923C',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtShort(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
function fmtNum(n: number) { return n.toLocaleString() }
function fmtPct(n: number) { return (n * 100).toFixed(1) + '%' }
function fmtPos(n: number) { return n.toFixed(1) }
function fmtSecs(s: number) {
  if (s < 60) return `${Math.round(s)}s`
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`
}

function runLabel(r: RunMeta): string {
  if (r.date_from && r.date_to) return `${fmtShort(r.date_from)} – ${fmtShort(r.date_to)}`
  return fmtDate(r.fetched_at)
}

function runLabelLong(r: RunMeta): string {
  if (r.date_from && r.date_to) return `${fmtDate(r.date_from)} – ${fmtDate(r.date_to)}`
  return `Run · ${fmtDate(r.fetched_at)}`
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '0.875rem', overflow: 'hidden', ...style }}>
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: '0.8125rem', fontWeight: 700, color: C.text, margin: 0 }}>{children}</h2>
}

function DeltaPill({ value, unit = '' }: { value: number; unit?: string }) {
  if (value === 0) return <span style={{ fontSize: '0.72rem', color: C.muted }}>—</span>
  const up = value > 0
  const color = up ? C.green : C.red
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: '0.72rem', fontWeight: 700, color, backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`, padding: '2px 6px', borderRadius: 4 }}>
      {up ? '▲' : '▼'} {up ? '+' : ''}{value}{unit}
    </span>
  )
}

// ─── Date Range Picker ────────────────────────────────────────────────────────

function DateRangePicker({
  qiRuns, ga4Runs, selectedQIId, selectedGA4Id,
  onSelect, comparing, onToggleCompare,
}: {
  qiRuns: RunMeta[]; ga4Runs: RunMeta[]
  selectedQIId: string | null; selectedGA4Id: string | null
  onSelect: (qiId: string | null, ga4Id: string | null) => void
  comparing: boolean; onToggleCompare: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectedQI = qiRuns.find(r => r.id === selectedQIId)
  const selectedGA4 = ga4Runs.find(r => r.id === selectedGA4Id)

  // Build a unified period list — prefer pairs that share the same date range
  const periods: Array<{ label: string; qiId: string | null; ga4Id: string | null }> = []
  const usedQI = new Set<string>(); const usedGA4 = new Set<string>()

  for (const q of qiRuns) {
    const match = ga4Runs.find(g =>
      g.date_from && q.date_from && g.date_from === q.date_from && g.date_to === q.date_to
    )
    if (match) {
      periods.push({ label: runLabelLong(q), qiId: q.id, ga4Id: match.id })
      usedQI.add(q.id); usedGA4.add(match.id)
    }
  }
  for (const q of qiRuns) { if (!usedQI.has(q.id)) periods.push({ label: `QI · ${runLabelLong(q)}`, qiId: q.id, ga4Id: null }) }
  for (const g of ga4Runs) { if (!usedGA4.has(g.id)) periods.push({ label: `GA4 · ${runLabelLong(g)}`, qiId: null, ga4Id: g.id }) }

  const currentLabel = (() => {
    if (selectedQI && selectedGA4 && selectedQI.date_from) return runLabel(selectedQI)
    if (selectedQI) return runLabel(selectedQI)
    if (selectedGA4) return runLabel(selectedGA4)
    return 'No data'
  })()

  const hasComparison = (
    (selectedQI ? qiRuns.find(r => r.id === selectedQIId) : null) != null ||
    (selectedGA4 ? ga4Runs.find(r => r.id === selectedGA4Id) : null) != null
  )

  return (
    <div ref={ref} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {/* Date range button */}
      <button onClick={() => setOpen(o => !o)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.875rem', borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, color: C.text, backgroundColor: 'rgba(255,255,255,0.05)', border: `1px solid ${open ? C.accent : C.border}`, cursor: 'pointer', transition: 'border-color 0.15s' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" aria-hidden><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        {currentLabel}
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} aria-hidden><polyline points="6 9 12 15 18 9"/></svg>
      </button>

      {/* Compare toggle */}
      <button onClick={onToggleCompare} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.78rem', fontWeight: 600, color: comparing ? C.accent : C.muted, backgroundColor: comparing ? C.accentFaint : 'rgba(255,255,255,0.03)', border: `1px solid ${comparing ? C.borderAccent : C.border}`, cursor: 'pointer', transition: 'all 0.15s' }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
        Compare{comparing ? ': on' : ''}
      </button>

      {/* Dropdown */}
      {open && periods.length > 0 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 50, backgroundColor: '#1a1a1a', border: `1px solid ${C.border}`, borderRadius: '0.75rem', minWidth: 280, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
          <div style={{ padding: '0.625rem 0.875rem', borderBottom: `1px solid ${C.border}` }}>
            <p style={{ fontSize: '0.67rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted, margin: 0 }}>Available periods</p>
          </div>
          {periods.map((p, i) => {
            const active = p.qiId === selectedQIId && p.ga4Id === selectedGA4Id
            return (
              <button key={i} onClick={() => { onSelect(p.qiId, p.ga4Id); setOpen(false) }} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0.875rem', background: 'none', border: 'none', cursor: 'pointer', borderBottom: i < periods.length - 1 ? `1px solid rgba(255,255,255,0.04)` : 'none', backgroundColor: active ? C.accentFaint : 'transparent' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: active ? 700 : 500, color: active ? C.accent : C.text }}>{p.label}</span>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  {p.qiId && <span style={{ fontSize: '0.62rem', fontWeight: 700, color: C.purple, backgroundColor: 'rgba(129,140,248,0.12)', padding: '1px 5px', borderRadius: 3 }}>QI</span>}
                  {p.ga4Id && <span style={{ fontSize: '0.62rem', fontWeight: 700, color: C.green, backgroundColor: 'rgba(0,212,170,0.12)', padding: '1px 5px', borderRadius: 3 }}>GA4</span>}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, delta, deltaUnit = '', accent = false, noData = false }: {
  label: string; value: string; sub?: string; delta?: number; deltaUnit?: string; accent?: boolean; noData?: boolean
}) {
  return (
    <div style={{ backgroundColor: C.card, border: `1px solid ${accent ? C.borderAccent : C.border}`, borderRadius: '0.75rem', padding: '1rem 1.125rem' }}>
      <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted, margin: '0 0 0.3rem' }}>{label}</p>
      <p style={{ fontSize: '1.5rem', fontWeight: 800, color: noData ? C.muted : accent ? C.accent : C.text, margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
        {sub && <span style={{ fontSize: '0.72rem', color: C.faint }}>{sub}</span>}
        {delta !== undefined && <DeltaPill value={delta} unit={deltaUnit} />}
      </div>
    </div>
  )
}

// ─── AI Traffic section ───────────────────────────────────────────────────────

function AITrafficSection({ cached, ga4Analysis }: { cached: CachedAiTraffic | null; ga4Analysis: GA4Analysis | null }) {
  // Try to find AI-like channels from GA4 data (referral/ai channels)
  const aiChannels = ga4Analysis?.channel_breakdown.filter(c => {
    const name = c.channel.toLowerCase()
    return name.includes('referral') || name.includes('ai') || name.includes('organic social')
  }) ?? []

  if (!cached && !ga4Analysis) {
    return (
      <Card>
        <div style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: C.accent }} />
            <SectionTitle>AI Traffic</SectionTitle>
          </div>
          <p style={{ fontSize: '0.8125rem', color: C.muted, margin: 0 }}>Upload a GA4 export or connect Google Analytics to see AI traffic data.</p>
        </div>
      </Card>
    )
  }

  const sources = cached?.aiSources ?? []
  const totalAI = cached?.totalAiSessions ?? 0
  const totalAll = cached?.totalSessions ?? ga4Analysis?.meta.total_sessions ?? 0
  const aiPct = cached?.aiPercentage ?? (totalAll > 0 ? Math.round((totalAI / totalAll) * 100) : 0)

  return (
    <Card>
      <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: C.accent }} />
          <SectionTitle>AI Traffic</SectionTitle>
        </div>
        {totalAI > 0 && (
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: C.accent, backgroundColor: C.accentFaint, border: `1px solid ${C.borderAccent}`, padding: '0.15rem 0.5rem', borderRadius: '0.3rem' }}>
            {aiPct}% of all sessions
          </span>
        )}
      </div>
      <div style={{ padding: '1rem 1.25rem' }}>
        {sources.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {sources.map((s, i) => {
              const COLORS = [C.accent, C.purple, '#3B82F6', C.amber, C.orange, '#10B981']
              const color = COLORS[i % COLORS.length]
              const pct = totalAI > 0 ? (s.sessions / totalAI) * 100 : 0
              return (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: C.text, minWidth: 100 }}>{s.name}</span>
                  <div style={{ flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color, minWidth: 52, textAlign: 'right' }}>{fmtNum(s.sessions)}</span>
                  {s.trend !== null && (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: (s.trend ?? 0) >= 0 ? C.green : C.red, minWidth: 40, textAlign: 'right' }}>
                      {(s.trend ?? 0) >= 0 ? '▲' : '▼'} {Math.abs(s.trend ?? 0)}%
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <p style={{ fontSize: '0.8125rem', color: C.muted, margin: 0 }}>No AI referral sessions detected in this period. AI traffic from ChatGPT, Perplexity, and others will appear here.</p>
        )}

        {/* GA4 channel referrals */}
        {aiChannels.length > 0 && sources.length === 0 && (
          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: `1px solid ${C.border}` }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, marginBottom: '0.5rem' }}>From GA4 channels</p>
            {aiChannels.slice(0, 4).map(c => (
              <div key={c.channel} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                <span style={{ fontSize: '0.8rem', color: C.text }}>{c.channel}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: C.accent }}>{fmtNum(c.sessions)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

// ─── Comparison banner ────────────────────────────────────────────────────────

function CompareBanner({ qi, ga4 }: { qi: QIAnalysis | null; ga4: GA4Analysis | null }) {
  const hasQICmp = !!qi?.comparison
  const hasGA4Cmp = !!ga4?.comparison

  if (!hasQICmp && !hasGA4Cmp) {
    return (
      <div style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', backgroundColor: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', fontSize: '0.78rem', color: C.amber }}>
        No comparison data in this upload. Re-upload with a comparison period enabled in GA4/GSC to see period-over-period changes.
      </div>
    )
  }

  const parts: string[] = []
  if (hasQICmp) parts.push('Query Intel')
  if (hasGA4Cmp) parts.push('GA4 Intel')
  return (
    <div style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', backgroundColor: C.accentFaint, border: `1px solid ${C.borderAccent}`, fontSize: '0.78rem', color: C.accent }}>
      Comparing current vs previous period · {parts.join(' + ')} data
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OverviewClient({
  siteId, domain, qiRuns, ga4Runs,
  initialQIAnalysis, initialQIRunId, initialGA4Analysis, initialGA4RunId,
  latestScore, cachedAiTraffic,
}: Props) {
  const [selectedQIRunId, setSelectedQIRunId] = useState<string | null>(initialQIRunId)
  const [selectedGA4RunId, setSelectedGA4RunId] = useState<string | null>(initialGA4RunId)
  const [qiAnalysis, setQiAnalysis] = useState<QIAnalysis | null>(initialQIAnalysis)
  const [ga4Analysis, setGA4Analysis] = useState<GA4Analysis | null>(initialGA4Analysis)
  const [comparing, setComparing] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSelectPeriod = useCallback(async (qiId: string | null, ga4Id: string | null) => {
    if (qiId === selectedQIRunId && ga4Id === selectedGA4RunId) return
    setLoading(true)
    setSelectedQIRunId(qiId)
    setSelectedGA4RunId(ga4Id)

    const fetches: Promise<void>[] = []
    if (qiId && qiId !== selectedQIRunId) {
      fetches.push(
        fetch('/api/query-intelligence/analyse', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ runId: qiId, siteId }),
        })
          .then(r => r.json())
          .then((d: { analysis?: QIAnalysis }) => { if (d.analysis) setQiAnalysis(d.analysis) })
          .catch(() => {})
      )
    }
    if (ga4Id && ga4Id !== selectedGA4RunId) {
      fetches.push(
        fetch('/api/ga4-intel/analyse', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ runId: ga4Id, siteId }),
        })
          .then(r => r.json())
          .then((d: { analysis?: GA4Analysis }) => { if (d.analysis) setGA4Analysis(d.analysis) })
          .catch(() => {})
      )
    }
    await Promise.all(fetches)
    setLoading(false)
  }, [siteId, selectedQIRunId, selectedGA4RunId])

  const qi = qiAnalysis
  const ga4 = ga4Analysis
  const qiCmp = comparing ? qi?.comparison : undefined
  const ga4Cmp = comparing ? ga4?.comparison : undefined

  // ── Metric values ──────────────────────────────────────────────────────────
  const metrics = {
    clicks:     { v: qi?.meta.total_clicks ?? 0,      delta: qiCmp ? qiCmp.summary.click_change : undefined },
    impressions:{ v: qi?.meta.total_impressions ?? 0, delta: qiCmp ? qiCmp.summary.impression_change : undefined },
    ctr:        { v: qi?.meta.avg_ctr ?? 0,           delta: qiCmp?.summary.avg_ctr_change !== undefined ? Math.round(qiCmp.summary.avg_ctr_change * 10000) / 100 : undefined },
    position:   { v: qi?.meta.avg_position ?? 0,      delta: qiCmp ? Math.round(qiCmp.summary.avg_position_change * 10) / 10 : undefined },
    sessions:   { v: ga4?.meta.total_sessions ?? 0,   delta: ga4Cmp ? ga4Cmp.summary.session_change : undefined },
    engRate:    { v: ga4?.meta.avg_engagement_rate ?? 0, delta: ga4Cmp ? Math.round(ga4Cmp.summary.engagement_rate_change * 1000) / 10 : undefined },
  }

  const hasQI = !!qi
  const hasGA4 = !!ga4

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <style>{`@keyframes ov-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.875rem' }}>
        <div>
          <p style={{ fontSize: '0.67rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.accent, margin: '0 0 0.2rem' }}>Overview</p>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: C.text, margin: 0, letterSpacing: '-0.02em' }}>{domain}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {loading && (
            <svg style={{ width: 14, height: 14, animation: 'ov-spin 0.8s linear infinite', color: C.muted }} viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity={0.2}/>
              <path opacity={0.8} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          )}
          <DateRangePicker
            qiRuns={qiRuns} ga4Runs={ga4Runs}
            selectedQIId={selectedQIRunId} selectedGA4Id={selectedGA4RunId}
            onSelect={handleSelectPeriod}
            comparing={comparing} onToggleCompare={() => setComparing(c => !c)}
          />
        </div>
      </div>

      {/* ── Comparison banner ───────────────────────────────────────────── */}
      {comparing && <CompareBanner qi={qi} ga4={ga4} />}

      {/* ── No data state ───────────────────────────────────────────────── */}
      {!hasQI && !hasGA4 && (
        <Card>
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: C.text, margin: '0 0 0.5rem' }}>No data uploaded yet</p>
            <p style={{ fontSize: '0.8125rem', color: C.muted, margin: 0 }}>Go to <strong style={{ color: C.text }}>Query Intel</strong> and <strong style={{ color: C.text }}>GA4 Intel</strong> to upload your GSC and GA4 exports.</p>
          </div>
        </Card>
      )}

      {/* ── Metric cards ────────────────────────────────────────────────── */}
      {(hasQI || hasGA4) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 170px), 1fr))', gap: '0.75rem' }}>
          <MetricCard label="Organic Clicks" value={hasQI ? fmtNum(metrics.clicks.v) : '—'} sub={hasQI ? `${fmtNum(metrics.impressions.v)} impressions` : 'No QI data'} delta={comparing ? metrics.clicks.delta : undefined} accent noData={!hasQI} />
          <MetricCard label="Avg CTR" value={hasQI ? fmtPct(metrics.ctr.v) : '—'} sub="from search results" delta={comparing && metrics.ctr.delta !== undefined ? metrics.ctr.delta : undefined} deltaUnit="pp" noData={!hasQI} />
          <MetricCard label="Avg Position" value={hasQI ? fmtPos(metrics.position.v) : '—'} sub="search result ranking" delta={comparing && metrics.position.delta !== undefined ? -metrics.position.delta : undefined} noData={!hasQI} />
          <MetricCard label="GA4 Sessions" value={hasGA4 ? fmtNum(metrics.sessions.v) : '—'} sub={hasGA4 ? `${fmtNum(ga4?.meta.total_pages ?? 0)} pages tracked` : 'No GA4 data'} delta={comparing ? metrics.sessions.delta : undefined} accent noData={!hasGA4} />
          <MetricCard label="Engagement Rate" value={hasGA4 ? fmtPct(metrics.engRate.v) : '—'} sub="sessions with engagement" delta={comparing && metrics.engRate.delta !== undefined ? metrics.engRate.delta : undefined} deltaUnit="pp" noData={!hasGA4} />
          <MetricCard label="Avg Eng. Time" value={hasGA4 ? fmtSecs(ga4?.meta.avg_engagement_time ?? 0) : '—'} sub="per session" delta={comparing && ga4Cmp ? Math.round(ga4Cmp.summary.avg_time_change) : undefined} deltaUnit="s" noData={!hasGA4} />
        </div>
      )}

      {/* ── AI Traffic + Score ───────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1rem' }}>
        <AITrafficSection cached={cachedAiTraffic} ga4Analysis={ga4} />

        {/* Score card */}
        <Card>
          <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: C.amber }} />
            <SectionTitle>SEO Score</SectionTitle>
          </div>
          <div style={{ padding: '1.25rem' }}>
            {latestScore ? (
              <>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '3rem', fontWeight: 800, color: latestScore.score >= 70 ? C.green : latestScore.score >= 40 ? C.amber : C.red, letterSpacing: '-0.04em', lineHeight: 1 }}>{latestScore.score}</span>
                  <span style={{ fontSize: '0.875rem', color: C.muted }}>/100</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { label: 'Search Performance', val: latestScore.module1_score, max: 40, color: C.purple },
                    { label: 'Engagement Quality', val: latestScore.module2_score, max: 40, color: C.accent },
                    { label: 'AI Overviews', val: latestScore.module3_score, max: 20, color: C.amber },
                  ].map(m => (
                    <div key={m.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '0.72rem', color: C.muted }}>{m.label}</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: m.color }}>{m.val}/{m.max}</span>
                      </div>
                      <div style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${(m.val / m.max) * 100}%`, height: '100%', backgroundColor: m.color, borderRadius: 2 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p style={{ fontSize: '0.8125rem', color: C.muted, margin: 0 }}>Upload QI + GA4 data, then calculate your score on the Score page.</p>
            )}
          </div>
        </Card>
      </div>

      {/* ── Charts row ──────────────────────────────────────────────────── */}
      {(hasQI || hasGA4) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: '1rem' }}>
          {hasGA4 && ga4!.channel_breakdown.length > 0 && (
            <Card>
              <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${C.border}` }}>
                <SectionTitle>Channel Breakdown</SectionTitle>
              </div>
              <div style={{ padding: '1rem 1.25rem' }}>
                <ChannelBarChart data={ga4!.channel_breakdown.slice(0, 8)} comparing={comparing && !!ga4Cmp} />
              </div>
            </Card>
          )}

          {hasQI && qi!.position_buckets && qi!.position_buckets.length > 0 && (
            <Card>
              <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${C.border}` }}>
                <SectionTitle>Position Distribution</SectionTitle>
              </div>
              <div style={{ padding: '1rem 1.25rem' }}>
                <PositionChart data={qi!.position_buckets} />
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── Comparison detail ───────────────────────────────────────────── */}
      {comparing && (qiCmp || ga4Cmp) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: '1rem' }}>
          {qiCmp && (
            <Card>
              <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <SectionTitle>Search · Period Changes</SectionTitle>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { label: '↑ Improved positions', val: qiCmp.summary.total_improved, color: C.green },
                  { label: '↓ Dropped positions', val: qiCmp.summary.total_dropped, color: C.red },
                  { label: '✦ New queries', val: qiCmp.summary.total_new ?? 0, color: C.purple },
                  { label: '✕ Lost queries', val: qiCmp.summary.total_lost ?? 0, color: C.muted },
                ].map((r, i, arr) => (
                  <div key={r.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderBottom: i < arr.length - 1 ? `1px solid rgba(255,255,255,0.04)` : 'none' }}>
                    <span style={{ fontSize: '0.8125rem', color: r.color, fontWeight: 600 }}>{r.label}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 800, color: r.color }}>{fmtNum(r.val)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {ga4Cmp && (
            <Card>
              <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${C.border}` }}>
                <SectionTitle>Engagement · Period Changes</SectionTitle>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { label: '↑ Rising pages', val: ga4Cmp.summary.total_rising, color: C.green },
                  { label: '↓ Declining pages', val: ga4Cmp.summary.total_declining, color: C.red },
                  { label: '✦ New pages', val: ga4Cmp.summary.total_new, color: C.purple },
                  { label: '✕ Lost pages', val: ga4Cmp.summary.total_lost, color: C.muted },
                ].map((r, i, arr) => (
                  <div key={r.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderBottom: i < arr.length - 1 ? `1px solid rgba(255,255,255,0.04)` : 'none' }}>
                    <span style={{ fontSize: '0.8125rem', color: r.color, fontWeight: 600 }}>{r.label}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 800, color: r.color }}>{fmtNum(r.val)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── Top pages ───────────────────────────────────────────────────── */}
      {hasGA4 && ga4!.traffic_leaders.length > 0 && (
        <Card>
          <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <SectionTitle>Top Pages</SectionTitle>
            <span style={{ fontSize: '0.7rem', color: C.muted }}>by sessions</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Page', 'Sessions', 'Eng Rate', 'Avg Time', ...(comparing && ga4Cmp ? ['Session Δ'] : [])].map(h => (
                    <th key={h} style={{ padding: '0.5rem 1rem', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, textAlign: 'left', backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ga4!.traffic_leaders.slice(0, 10).map((p, i) => {
                  const er = p.engagement_rate
                  const erColor = er > 0.65 ? C.green : er > 0.4 ? C.amber : C.red
                  const risingPage = ga4Cmp?.rising.find(r => r.page === p.page)
                  const decliningPage = ga4Cmp?.declining.find(r => r.page === p.page)
                  const sessionDelta = risingPage?.session_change ?? decliningPage?.session_change
                  const clean = p.page.replace(/^https?:\/\/[^/]+/, '') || '/'
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid rgba(255,255,255,0.04)`, borderLeft: i < 3 ? `3px solid ${C.accent}` : '3px solid transparent' }}>
                      <td style={{ padding: '0.65rem 1rem', fontSize: '0.78rem', color: C.muted, maxWidth: 260 }}>
                        <span title={p.page}>{clean.length > 55 ? clean.slice(0, 55) + '…' : clean}</span>
                      </td>
                      <td style={{ padding: '0.65rem 1rem', fontSize: '0.8125rem', fontWeight: 700, color: i < 3 ? C.accent : C.text }}>{fmtNum(p.sessions)}</td>
                      <td style={{ padding: '0.65rem 1rem', fontSize: '0.8125rem', fontWeight: 600, color: erColor }}>{fmtPct(er)}</td>
                      <td style={{ padding: '0.65rem 1rem', fontSize: '0.8125rem', color: C.muted }}>{fmtSecs(p.avg_engagement_time)}</td>
                      {comparing && ga4Cmp && (
                        <td style={{ padding: '0.65rem 1rem' }}>
                          {sessionDelta !== undefined ? <DeltaPill value={sessionDelta} /> : <span style={{ color: C.muted, fontSize: '0.78rem' }}>—</span>}
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── Quick Wins ──────────────────────────────────────────────────── */}
      {(hasQI && qi!.quick_wins.length > 0) || (hasGA4 && ga4!.quick_wins.length > 0) ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: '1rem' }}>
          {hasQI && qi!.quick_wins.length > 0 && (
            <Card>
              <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: C.purple, backgroundColor: 'rgba(129,140,248,0.12)', padding: '0.1rem 0.4rem', borderRadius: '0.25rem' }}>{qi!.quick_wins.length}</span>
                <SectionTitle>Search Quick Wins</SectionTitle>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {qi!.quick_wins.slice(0, 5).map((w, i) => (
                  <div key={i} style={{ padding: '0.75rem 1.25rem', borderBottom: i < 4 ? `1px solid rgba(255,255,255,0.04)` : 'none', borderLeft: w.opportunity === 'top3_push' ? `3px solid ${C.accent}` : '3px solid transparent' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.78rem', color: C.muted, flex: 1 }}>{w.query}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: C.purple, whiteSpace: 'nowrap' }}>pos {w.position.toFixed(1)}</span>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: C.accent, margin: '0.2rem 0 0', fontWeight: 600 }}>{w.opportunity === 'top3_push' ? '→ Top 3 candidate' : '→ Page 1 candidate'} · est. +{fmtNum(w.potential_clicks)} clicks</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {hasGA4 && ga4!.quick_wins.length > 0 && (
            <Card>
              <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: C.amber, backgroundColor: 'rgba(245,158,11,0.12)', padding: '0.1rem 0.4rem', borderRadius: '0.25rem' }}>{ga4!.quick_wins.length}</span>
                <SectionTitle>Engagement Quick Wins</SectionTitle>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {ga4!.quick_wins.slice(0, 5).map((w, i) => (
                  <div key={i} style={{ padding: '0.75rem 1.25rem', borderBottom: i < 4 ? `1px solid rgba(255,255,255,0.04)` : 'none', borderLeft: w.priority === 'high' ? `3px solid ${C.amber}` : '3px solid transparent' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.78rem', color: C.muted, flex: 1 }}>{w.page.replace(/^https?:\/\/[^/]+/, '') || '/'}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: w.engagement_rate < 0.4 ? C.red : C.amber, whiteSpace: 'nowrap' }}>{fmtPct(w.engagement_rate)} eng.</span>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: C.amber, margin: '0.2rem 0 0', fontWeight: 600 }}>{w.action.slice(0, 70)}{w.action.length > 70 ? '…' : ''}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      ) : null}
    </div>
  )
}
