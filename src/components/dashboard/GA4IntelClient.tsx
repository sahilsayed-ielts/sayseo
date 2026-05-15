'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type {
  GA4Analysis,
  GA4QuickWin,
  GA4EngagementIssue,
  GA4TrafficLeader,
  GA4HiddenGem,
  GA4ChannelStat,
  GA4ComparisonAnalysis,
  GA4PageRow,
  GA4ChannelRow,
} from '@/lib/ga4-intel/analyser'

// ─── Re-export for server component ──────────────────────────────────────────
export type { GA4Analysis as GA4AnalysisJSON }

export interface GA4Run {
  id: string
  fetched_at: string
  row_count: number | null
  status: string
  date_from?: string | null
  date_to?: string | null
  source?: string | null
}

interface Props {
  siteId: string
  domain: string
  initialRuns: GA4Run[]
  initialAnalysis: GA4Analysis | null
  initialRunId: string | null
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  bg: '#0A0A0A',
  card: '#111',
  border: 'rgba(255,255,255,0.07)',
  borderAccent: 'rgba(0,212,170,0.25)',
  accent: '#00D4AA',
  accentFaint: 'rgba(0,212,170,0.12)',
  text: '#fff',
  muted: 'rgba(255,255,255,0.35)',
  faint: 'rgba(255,255,255,0.15)',
  amber: '#F59E0B',
  purple: '#818CF8',
  orange: '#FB923C',
  red: '#EF4444',
  green: '#00D4AA',
}

const TH: React.CSSProperties = {
  padding: '0.55rem 1rem', fontSize: '0.67rem', fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted,
  whiteSpace: 'nowrap', backgroundColor: 'rgba(255,255,255,0.02)',
  borderBottom: `1px solid ${C.border}`, textAlign: 'left',
}
const TD: React.CSSProperties = { padding: '0.7rem 1rem', fontSize: '0.8125rem', color: C.text, verticalAlign: 'top' }

// ─── Date helpers ─────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtRunDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const MONTH_MAP: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
}

function detectDatesFromFilename(filename: string): { from: string; to: string } | null {
  const PAT = /(\d{1,2})\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{4})/gi
  const matches = [...filename.matchAll(PAT)]
  if (matches.length < 2) return null
  const toISO = (m: RegExpMatchArray) => {
    const mo = MONTH_MAP[m[2].toLowerCase().slice(0, 3)]
    return mo ? `${m[3]}-${mo}-${m[1].padStart(2, '0')}` : ''
  }
  const from = toISO(matches[0])
  const to = toISO(matches[1])
  return from && to ? { from, to } : null
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

function fmtNum(n: number): string { return n.toLocaleString() }
function fmtEngRate(r: number): string { return (r * 100).toFixed(1) + '%' }
function fmtSecs(s: number): string {
  if (s < 60) return `${Math.round(s)}s`
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`
}
function truncUrl(url: string, max = 50): string {
  const clean = url.replace(/^https?:\/\//, '')
  return clean.length > max ? clean.slice(0, max) + '…' : clean
}

// ─── CSV parsing ──────────────────────────────────────────────────────────────

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (c === ',' && !inQuotes) {
      result.push(current); current = ''
    } else {
      current += c
    }
  }
  result.push(current)
  return result
}

function parseCsvToRows(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n').filter(l => l.trim())
  if (lines.length < 2) return []
  const headers = parseCsvLine(lines[0].replace(/^﻿/, '')).map(h => h.trim().toLowerCase())
  return lines.slice(1).map(line => {
    const vals = parseCsvLine(line)
    return Object.fromEntries(headers.map((h, i) => [h, (vals[i] ?? '').trim()]))
  })
}

function parseDuration(val: string): number {
  if (!val) return 0
  const clean = val.trim()
  const minsMatch = clean.match(/(\d+)m\s*(\d+)s/)
  if (minsMatch) return parseInt(minsMatch[1]) * 60 + parseInt(minsMatch[2])
  const mOnly = clean.match(/^(\d+)m$/)
  if (mOnly) return parseInt(mOnly[1]) * 60
  const hmsMatch = clean.match(/^(\d+):(\d+):(\d+)$/)
  if (hmsMatch) return parseInt(hmsMatch[1]) * 3600 + parseInt(hmsMatch[2]) * 60 + parseInt(hmsMatch[3])
  const colonMatch = clean.match(/^(\d+):(\d+)$/)
  if (colonMatch) return parseInt(colonMatch[1]) * 60 + parseInt(colonMatch[2])
  const n = parseFloat(clean.replace(/[^0-9.]/g, ''))
  return isNaN(n) ? 0 : n
}

function parseRate(val: string): number {
  if (!val) return 0
  const clean = val.replace('%', '').trim()
  const n = parseFloat(clean)
  if (isNaN(n)) return 0
  return n > 1 ? n / 100 : n
}

function parseGA4PageCsv(text: string): { rows: GA4PageRow[]; hasComparison: boolean } {
  const raw = parseCsvToRows(text)
  if (!raw.length) return { rows: [], hasComparison: false }

  const keys = Object.keys(raw[0])

  const findCol = (include: string[], exclude: string[] = []): string =>
    keys.find(k => include.some(t => k.includes(t)) && !exclude.some(t => k.includes(t))) ?? ''

  const pageCol = findCol(['page path and screen class', 'page path', 'landing page', 'page title'])
  // "active users" is a fallback when the export uses the business-objectives view (no sessions column)
  const sessionsCol =
    keys.find(k => k === 'sessions') ||
    findCol(['sessions'], ['comparison', 'prev', 'period']) ||
    keys.find(k => k === 'active users') ||
    keys.find(k => k.includes('active user') && !k.includes(' per '))
  const engagedCol = findCol(['engaged session'], ['comparison', 'prev', 'period'])
  const engTimeCol = findCol(['engagement time'], ['comparison', 'prev', 'period'])
  const bounceCol = findCol(['bounce rate'], ['comparison', 'prev', 'period'])
  // Prefer exact match to avoid catching "views per active user"
  const viewsCol =
    keys.find(k => k === 'views' || k === 'page views' || k === 'screen views') ||
    findCol(['view'], ['comparison', 'prev', 'period', ' per '])
  const usersCol =
    keys.find(k => k === 'active users' || k === 'users') ||
    keys.find(k => k.includes('user') && !k.includes('new user') && !k.includes('comparison') && !k.includes('prev') && !k.includes(' per '))
  const conversionsCol = findCol(['conversion', 'key event', 'event count'], ['comparison', 'prev', 'period'])

  const hasComparison = keys.some(k =>
    k.includes('(comparison)') || k.includes('comparison period') ||
    (k.includes('comparison') && (k.includes('sessions') || k.includes('engaged') || k.includes('bounce')))
  )

  const prevSessionsCol = keys.find(k => k.includes('sessions') && k.includes('comparison')) ?? ''
  const prevEngagedCol = keys.find(k => k.includes('engaged session') && k.includes('comparison')) ?? ''
  const prevEngTimeCol = keys.find(k => k.includes('engagement time') && k.includes('comparison')) ?? ''
  const prevBounceCol = keys.find(k => k.includes('bounce') && k.includes('comparison')) ?? ''

  const isSummaryRow = (r: Record<string, string>): boolean => {
    const page = r[pageCol] ?? ''
    return !page || page.toLowerCase() === 'total' || page.startsWith('#')
  }

  const rows: GA4PageRow[] = raw
    .filter(r => !isSummaryRow(r))
    .map(r => {
      const sessions = parseInt(r[sessionsCol ?? ''] ?? '0') || 0
      const engaged = engagedCol ? (parseInt(r[engagedCol] ?? '0') || 0) : 0
      const bounceRaw = bounceCol ? parseRate(r[bounceCol] ?? '0') : 0
      const engagedSessions = engagedCol ? engaged : Math.round(sessions * (1 - bounceRaw))
      const avgTime = engTimeCol ? parseDuration(r[engTimeCol] ?? '0') : 0
      const bounceRate = bounceCol ? bounceRaw : (engagedCol && sessions > 0 ? 1 - engaged / sessions : 0)

      const row: GA4PageRow = {
        page: r[pageCol] ?? '',
        sessions,
        engaged_sessions: engagedSessions,
        avg_engagement_time: avgTime,
        bounce_rate: bounceRate,
        views: viewsCol ? (parseInt(r[viewsCol] ?? '0') || undefined) : undefined,
        users: usersCol ? (parseInt(r[usersCol] ?? '0') || undefined) : undefined,
        conversions: conversionsCol ? (parseInt(r[conversionsCol] ?? '0') || undefined) : undefined,
      }

      if (hasComparison) {
        if (prevSessionsCol) row.prev_sessions = parseInt(r[prevSessionsCol] ?? '0') || 0
        if (prevEngagedCol) row.prev_engaged_sessions = parseInt(r[prevEngagedCol] ?? '0') || 0
        if (prevEngTimeCol) row.prev_avg_engagement_time = parseDuration(r[prevEngTimeCol] ?? '0')
        if (prevBounceCol) row.prev_bounce_rate = parseRate(r[prevBounceCol] ?? '0')
      }

      return row
    })
    .filter(r => r.page && r.sessions > 0)

  return { rows, hasComparison }
}

function parseGA4ChannelCsv(text: string): { rows: GA4ChannelRow[]; hasComparison: boolean } {
  const raw = parseCsvToRows(text)
  if (!raw.length) return { rows: [], hasComparison: false }

  const keys = Object.keys(raw[0])
  const findCol = (include: string[], exclude: string[] = []): string =>
    keys.find(k => include.some(t => k.includes(t)) && !exclude.some(t => k.includes(t))) ?? ''

  const channelCol = findCol(['channel', 'medium', 'source'])
  const sessionsCol = keys.find(k => k === 'sessions') ?? findCol(['sessions'], ['comparison', 'prev'])
  const engagedCol = findCol(['engaged session'], ['comparison', 'prev'])
  const prevSessionsCol = keys.find(k => k.includes('sessions') && k.includes('comparison')) ?? ''
  const hasComparison = !!prevSessionsCol

  const rows: GA4ChannelRow[] = raw
    .filter(r => r[channelCol])
    .map(r => ({
      channel: r[channelCol] ?? '',
      sessions: parseInt(r[sessionsCol ?? ''] ?? '0') || 0,
      engaged_sessions: engagedCol ? (parseInt(r[engagedCol] ?? '0') || undefined) : undefined,
      prev_sessions: prevSessionsCol ? (parseInt(r[prevSessionsCol] ?? '0') || 0) : undefined,
    }))
    .filter(r => r.channel && r.sessions > 0)

  return { rows, hasComparison }
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Spinner({ size = 14 }: { size?: number }) {
  return (
    <svg style={{ width: size, height: size, animation: 'ga4-spin 0.8s linear infinite', flexShrink: 0 }}
      viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity={0.2} />
      <path opacity={0.8} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '0.875rem', overflow: 'hidden', ...style }}>
      {children}
    </div>
  )
}

function SectionHeader({ title, count, color = C.accent }: { title: string; count?: number; color?: string }) {
  return (
    <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: C.text }}>{title}</span>
      {count !== undefined && (
        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: '0.3rem', backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`, color }}>{count}</span>
      )}
    </div>
  )
}

function EmptyState({ msg }: { msg: string }) {
  return <div style={{ padding: '2.5rem 1.25rem', textAlign: 'center' }}><p style={{ color: C.muted, fontSize: '0.875rem', margin: 0 }}>{msg}</p></div>
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.15rem 0.5rem', borderRadius: '0.3rem', fontSize: '0.68rem', fontWeight: 700, backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`, color, border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`, whiteSpace: 'nowrap' as const }}>
      {label}
    </span>
  )
}

function StatGrid({ items }: { items: { label: string; value: string; sub?: string; accent?: boolean }[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '0.875rem' }}>
      {items.map(it => (
        <div key={it.label} style={{ backgroundColor: C.card, border: `1px solid ${it.accent ? C.borderAccent : C.border}`, borderRadius: '0.75rem', padding: '1rem' }}>
          <p style={{ fontSize: '0.67rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted, margin: '0 0 0.35rem' }}>{it.label}</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, color: it.accent ? C.accent : C.text, margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>{it.value}</p>
          {it.sub && <p style={{ fontSize: '0.72rem', color: C.faint, margin: '0.25rem 0 0' }}>{it.sub}</p>}
        </div>
      ))}
    </div>
  )
}

function DataTable({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>{headers.map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

function TR({ children, highlight, last }: { children: React.ReactNode; highlight?: boolean; last?: boolean }) {
  return (
    <tr style={{ borderBottom: last ? 'none' : `1px solid rgba(255,255,255,0.04)`, borderLeft: highlight ? `3px solid ${C.accent}` : '3px solid transparent' }}>
      {children}
    </tr>
  )
}

function DeltaBadge({ v }: { v: number }) {
  if (v === 0) return <span style={{ color: C.muted, fontSize: '0.75rem' }}>—</span>
  const color = v > 0 ? C.green : C.red
  const arrow = v > 0 ? '▲' : '▼'
  return <span style={{ color, fontSize: '0.78rem', fontWeight: 700 }}>{arrow} {v > 0 ? '+' : ''}{v}</span>
}

// ─── Tab system ───────────────────────────────────────────────────────────────

type TabId = 'overview' | 'quick_wins' | 'traffic_leaders' | 'hidden_gems' | 'engagement_issues' | 'channels' | 'comparison'

interface TabDef { id: TabId; label: string; color: string; count?: number; hidden?: boolean }

function TabBar({ tabs, active, onChange }: { tabs: TabDef[]; active: TabId; onChange: (t: TabId) => void }) {
  return (
    <div style={{ display: 'flex', overflowX: 'auto', borderBottom: `1px solid ${C.border}` }}>
      {tabs.filter(t => !t.hidden).map(t => {
        const on = t.id === active
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.7rem 1.1rem', fontSize: '0.8125rem', fontWeight: on ? 700 : 500, color: on ? t.color : C.muted, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, borderBottom: on ? `2px solid ${t.color}` : '2px solid transparent', marginBottom: '-1px', whiteSpace: 'nowrap', transition: 'color 0.15s' }}>
            {t.label}
            {t.count !== undefined && (
              <span style={{ fontSize: '0.67rem', fontWeight: 700, padding: '0.1rem 0.35rem', borderRadius: '0.25rem', backgroundColor: on ? `color-mix(in srgb, ${t.color} 15%, transparent)` : 'rgba(255,255,255,0.05)', color: on ? t.color : C.faint }}>
                {t.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── Analysis panels ──────────────────────────────────────────────────────────

function OverviewPanel({ analysis }: { analysis: GA4Analysis }) {
  const { meta, channel_breakdown } = analysis

  const buckets = [
    { label: 'Excellent (>70%)',     color: C.green,  test: (er: number) => er > 0.70 },
    { label: 'Good (50–70%)',        color: C.accent, test: (er: number) => er > 0.50 && er <= 0.70 },
    { label: 'Needs Work (30–50%)',  color: C.amber,  test: (er: number) => er > 0.30 && er <= 0.50 },
    { label: 'Poor (<30%)',          color: C.red,    test: (er: number) => er <= 0.30 },
  ]

  const pagesWithEr = analysis.traffic_leaders.map(p => ({ er: p.engagement_rate, sessions: p.sessions }))
  const bucketData = buckets.map(b => {
    const matching = pagesWithEr.filter(p => b.test(p.er))
    return { label: b.label, color: b.color, count: matching.length, sessions: matching.reduce((s, p) => s + p.sessions, 0) }
  })

  const statsItems: { label: string; value: string; sub?: string; accent?: boolean }[] = [
    { label: 'Total Sessions',       value: fmtNum(meta.total_sessions),            accent: true },
    { label: 'Pages Tracked',        value: fmtNum(meta.total_pages) },
    { label: 'Avg Engagement Rate',  value: fmtEngRate(meta.avg_engagement_rate),   accent: true },
    { label: 'Avg Engagement Time',  value: fmtSecs(meta.avg_engagement_time) },
    { label: 'Quick Wins',           value: String(analysis.quick_wins.length),     accent: true },
    ...(meta.has_channels ? [{ label: 'Organic Traffic %', value: fmtEngRate(meta.organic_session_pct) }] : []),
  ]

  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <StatGrid items={statsItems} />

      <Card>
        <SectionHeader title="Engagement Distribution" />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Bucket', 'Pages', 'Sessions'].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
            <tbody>
              {bucketData.map((b, i) => (
                <TR key={b.label} last={i === bucketData.length - 1}>
                  <td style={TD}><span style={{ color: b.color, fontWeight: 700 }}>{b.label}</span></td>
                  <td style={{ ...TD, fontWeight: 700 }}>{fmtNum(b.count)}</td>
                  <td style={{ ...TD, color: C.muted }}>{fmtNum(b.sessions)}</td>
                </TR>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {meta.has_channels && channel_breakdown.length > 0 && (
        <Card>
          <SectionHeader title="Channel Breakdown" />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Channel', 'Sessions', 'Share', ...(channel_breakdown.some(c => c.engagement_rate !== undefined) ? ['Eng Rate'] : [])].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
              <tbody>
                {channel_breakdown.slice(0, 6).map((c, i) => (
                  <TR key={c.channel} last={i === Math.min(channel_breakdown.length, 6) - 1}>
                    <td style={{ ...TD, fontWeight: 600 }}>{c.channel}</td>
                    <td style={TD}>{fmtNum(c.sessions)}</td>
                    <td style={{ ...TD, color: C.accent }}>{c.share.toFixed(1)}%</td>
                    {c.engagement_rate !== undefined && <td style={TD}>{fmtEngRate(c.engagement_rate)}</td>}
                  </TR>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

function QuickWinsPanel({ items }: { items: GA4QuickWin[] }) {
  if (!items.length) return <EmptyState msg="No quick win opportunities found in this data." />
  const oppColors: Record<GA4QuickWin['opportunity'], string> = {
    improve_engagement: C.red,
    hidden_gem: C.accent,
    drive_traffic: C.purple,
  }
  const oppLabels: Record<GA4QuickWin['opportunity'], string> = {
    improve_engagement: 'Improve Engagement',
    hidden_gem: 'Hidden Gem',
    drive_traffic: 'Drive Traffic',
  }
  return (
    <DataTable headers={['Page', 'Sessions', 'Eng Rate', 'Avg Time', 'Opportunity', 'Priority', 'Action']}>
      {items.map((r, i) => (
        <TR key={i} highlight={r.priority === 'high'} last={i === items.length - 1}>
          <td style={{ ...TD, maxWidth: 220 }}><span title={r.page} style={{ color: C.muted, fontSize: '0.78rem' }}>{truncUrl(r.page)}</span></td>
          <td style={{ ...TD, fontWeight: 700 }}>{fmtNum(r.sessions)}</td>
          <td style={{ ...TD, color: r.engagement_rate < 0.35 ? C.red : r.engagement_rate > 0.65 ? C.green : C.amber }}>{fmtEngRate(r.engagement_rate)}</td>
          <td style={{ ...TD, color: C.muted }}>{fmtSecs(r.avg_engagement_time)}</td>
          <td style={TD}><Badge label={oppLabels[r.opportunity]} color={oppColors[r.opportunity]} /></td>
          <td style={TD}><Badge label={r.priority === 'high' ? 'High' : 'Medium'} color={r.priority === 'high' ? C.red : C.amber} /></td>
          <td style={{ ...TD, maxWidth: 260, fontSize: '0.75rem', color: C.muted }}>{r.action}</td>
        </TR>
      ))}
    </DataTable>
  )
}

function TrafficLeadersPanel({ items, hasConversions }: { items: GA4TrafficLeader[]; hasConversions: boolean }) {
  if (!items.length) return <EmptyState msg="No traffic data available." />
  const maxSessions = items[0]?.sessions ?? 1
  const headers = ['Page', 'Sessions', 'Share', 'Eng Rate', 'Avg Time', 'Views', ...(hasConversions ? ['Conversions'] : [])]
  return (
    <DataTable headers={headers}>
      {items.map((r, i) => (
        <TR key={i} highlight={i < 3} last={i === items.length - 1}>
          <td style={{ ...TD, maxWidth: 220 }}><span title={r.page} style={{ color: C.muted, fontSize: '0.78rem' }}>{truncUrl(r.page)}</span></td>
          <td style={{ ...TD, fontWeight: 700, color: i < 3 ? C.accent : C.text }}>{fmtNum(r.sessions)}</td>
          <td style={TD}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 80 }}>
              <div style={{ flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${(r.sessions / maxSessions) * 100}%`, height: '100%', backgroundColor: C.accent, borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: '0.72rem', color: C.muted, minWidth: 36 }}>{r.session_share.toFixed(1)}%</span>
            </div>
          </td>
          <td style={{ ...TD, color: r.engagement_rate > 0.65 ? C.green : r.engagement_rate < 0.35 ? C.red : C.amber }}>{fmtEngRate(r.engagement_rate)}</td>
          <td style={{ ...TD, color: C.muted }}>{fmtSecs(r.avg_engagement_time)}</td>
          <td style={TD}>{fmtNum(r.views)}</td>
          {hasConversions && <td style={{ ...TD, color: C.accent }}>{fmtNum(r.conversions ?? 0)}</td>}
        </TR>
      ))}
    </DataTable>
  )
}

function HiddenGemsPanel({ items }: { items: GA4HiddenGem[] }) {
  if (!items.length) return <EmptyState msg="No hidden gems found. Try uploading more data." />
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ padding: '0.875rem 1.25rem', backgroundColor: 'rgba(0,212,170,0.04)', borderBottom: `1px solid ${C.border}` }}>
        <p style={{ fontSize: '0.8125rem', color: C.muted, margin: 0 }}>These pages have excellent user engagement but low traffic — prioritise them for SEO promotion</p>
      </div>
      <DataTable headers={['Page', 'Sessions', 'Eng Rate', 'Avg Time', 'Gem Score', 'Action']}>
        {items.map((r, i) => (
          <TR key={i} highlight last={i === items.length - 1}>
            <td style={{ ...TD, maxWidth: 220 }}><span title={r.page} style={{ color: C.muted, fontSize: '0.78rem' }}>{truncUrl(r.page)}</span></td>
            <td style={TD}>{fmtNum(r.sessions)}</td>
            <td style={{ ...TD, color: C.green, fontWeight: 700 }}>{fmtEngRate(r.engagement_rate)}</td>
            <td style={{ ...TD, color: C.accent }}>{fmtSecs(r.avg_engagement_time)}</td>
            <td style={{ ...TD, color: C.amber, fontWeight: 700 }}>{r.gem_score.toFixed(1)}</td>
            <td style={{ ...TD, maxWidth: 260, fontSize: '0.75rem', color: C.muted }}>{r.action}</td>
          </TR>
        ))}
      </DataTable>
    </div>
  )
}

function EngagementIssuesPanel({ items }: { items: GA4EngagementIssue[] }) {
  if (!items.length) return <EmptyState msg="No significant engagement issues found. Your pages are performing well." />
  return (
    <DataTable headers={['Page', 'Sessions', 'Eng Rate', 'Avg Time', 'Severity', 'Issue', 'Action']}>
      {items.map((r, i) => (
        <TR key={i} last={i === items.length - 1}>
          <td style={{ ...TD, maxWidth: 200 }}><span title={r.page} style={{ color: C.muted, fontSize: '0.78rem' }}>{truncUrl(r.page)}</span></td>
          <td style={TD}>{fmtNum(r.sessions)}</td>
          <td style={{ ...TD, color: r.severity === 'critical' ? C.red : C.amber, fontWeight: 700 }}>{fmtEngRate(r.engagement_rate)}</td>
          <td style={{ ...TD, color: C.muted }}>{fmtSecs(r.avg_engagement_time)}</td>
          <td style={TD}><Badge label={r.severity === 'critical' ? 'Critical' : 'Warning'} color={r.severity === 'critical' ? C.red : C.amber} /></td>
          <td style={{ ...TD, maxWidth: 220, fontSize: '0.75rem', color: C.muted }}>{r.issue}</td>
          <td style={{ ...TD, maxWidth: 220, fontSize: '0.75rem', color: C.muted }}>{r.action}</td>
        </TR>
      ))}
    </DataTable>
  )
}

function ChannelsPanel({ items, hasCmp }: { items: GA4ChannelStat[]; hasCmp: boolean }) {
  if (!items.length) return <EmptyState msg="No channel data available. Upload a Traffic Acquisition CSV for this panel." />
  const maxSessions = items[0]?.sessions ?? 1
  const showEngRate = items.some(c => c.engagement_rate !== undefined)
  const headers = ['Channel', 'Sessions', 'Share', ...(showEngRate ? ['Eng Rate'] : []), ...(hasCmp ? ['Session Δ', 'Session Δ%'] : [])]
  return (
    <DataTable headers={headers}>
      {items.map((c, i) => (
        <TR key={c.channel} last={i === items.length - 1}>
          <td style={{ ...TD, fontWeight: 700 }}>{c.channel}</td>
          <td style={{ ...TD, fontWeight: 700 }}>{fmtNum(c.sessions)}</td>
          <td style={TD}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 80 }}>
              <div style={{ flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${(c.sessions / maxSessions) * 100}%`, height: '100%', backgroundColor: C.accent, borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: '0.72rem', color: C.muted, minWidth: 36 }}>{c.share.toFixed(1)}%</span>
            </div>
          </td>
          {showEngRate && <td style={TD}>{c.engagement_rate !== undefined ? fmtEngRate(c.engagement_rate) : '—'}</td>}
          {hasCmp && (
            <>
              <td style={TD}>{c.session_change !== undefined ? <DeltaBadge v={c.session_change} /> : '—'}</td>
              <td style={TD}>
                {c.session_change_pct !== undefined
                  ? <span style={{ color: c.session_change_pct > 0 ? C.green : c.session_change_pct < 0 ? C.red : C.muted, fontSize: '0.78rem', fontWeight: 700 }}>
                      {c.session_change_pct > 0 ? '+' : ''}{c.session_change_pct}%
                    </span>
                  : '—'}
              </td>
            </>
          )}
        </TR>
      ))}
    </DataTable>
  )
}

function ComparisonPanel({ data }: { data: GA4ComparisonAnalysis }) {
  const [subView, setSubView] = useState<'rising' | 'declining' | 'new' | 'lost'>('rising')
  const { summary } = data

  const nc = (n: number) => n > 0 ? C.green : n < 0 ? C.red : C.muted
  const borderFor = (color: string) =>
    color === C.green ? 'rgba(0,212,170,0.22)' : color === C.red ? 'rgba(239,68,68,0.18)' : C.border
  const sp = (n: number) => (n > 0 ? '+' : '') + fmtNum(n)

  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Hero stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '0.75rem' }}>
        {[
          { label: 'Sessions',     value: sp(summary.session_change),         sub: (summary.session_change_pct >= 0 ? '+' : '') + summary.session_change_pct + '%',                   color: nc(summary.session_change) },
          { label: 'Eng Rate',     value: (summary.engagement_rate_change >= 0 ? '+' : '') + fmtEngRate(Math.abs(summary.engagement_rate_change)), sub: summary.engagement_rate_change > 0 ? 'improved' : 'declined', color: nc(summary.engagement_rate_change) },
          { label: 'Avg Eng Time', value: (summary.avg_time_change >= 0 ? '+' : '') + fmtSecs(Math.abs(summary.avg_time_change)),                  sub: summary.avg_time_change > 0 ? 'improved' : 'declined',      color: nc(summary.avg_time_change) },
        ].map(it => (
          <div key={it.label} style={{ backgroundColor: C.card, border: `1px solid ${borderFor(it.color)}`, borderRadius: '0.75rem', padding: '1rem' }}>
            <p style={{ fontSize: '0.67rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted, margin: '0 0 0.3rem' }}>{it.label}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: it.color, margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>{it.value}</p>
            <p style={{ fontSize: '0.72rem', color: `color-mix(in srgb, ${it.color} 65%, transparent)`, margin: '0.25rem 0 0' }}>{it.sub}</p>
          </div>
        ))}
      </div>

      {/* Movement grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))', gap: '0.5rem' }}>
        {([
          { label: '↑ Rising',    value: summary.total_rising,    color: C.green,  sub: 'sessions up ≥15%',   view: 'rising'    as const },
          { label: '↓ Declining', value: summary.total_declining, color: C.red,    sub: 'sessions down ≥15%', view: 'declining' as const },
          { label: '✦ New',       value: summary.total_new,       color: C.purple, sub: 'new this period',    view: 'new'       as const },
          { label: '✕ Lost',      value: summary.total_lost,      color: C.faint,  sub: 'disappeared',        view: 'lost'      as const },
        ] as { label: string; value: number; color: string; sub: string; view: typeof subView }[]).map(it => (
          <button key={it.label} onClick={() => setSubView(it.view)} style={{ all: 'unset' as const, cursor: 'pointer', display: 'block', boxSizing: 'border-box' as const, backgroundColor: `color-mix(in srgb, ${it.color} 8%, transparent)`, border: `2px solid ${subView === it.view ? it.color : `color-mix(in srgb, ${it.color} 22%, transparent)`}`, borderRadius: '0.625rem', padding: '0.75rem 0.875rem', transition: 'border-color 0.15s' }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, color: it.color, margin: '0 0 0.2rem' }}>{it.label}</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: it.color, margin: 0, lineHeight: 1, letterSpacing: '-0.03em' }}>{fmtNum(it.value)}</p>
            <p style={{ fontSize: '0.67rem', color: `color-mix(in srgb, ${it.color} 55%, transparent)`, margin: '0.2rem 0 0' }}>{it.sub}</p>
          </button>
        ))}
      </div>

      {/* Detail table */}
      <Card style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, overflowX: 'auto' }}>
          {([
            { id: 'rising',    label: 'Rising Pages',    count: data.rising.length,    color: C.green  },
            { id: 'declining', label: 'Declining Pages', count: data.declining.length, color: C.red    },
            { id: 'new',       label: 'New Pages',       count: data.new_pages.length, color: C.purple },
            { id: 'lost',      label: 'Lost Pages',      count: data.lost_pages.length, color: C.faint },
          ] as { id: typeof subView; label: string; count: number; color: string }[]).map(s => (
            <button key={s.id} onClick={() => setSubView(s.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.7rem 1rem', fontSize: '0.8125rem', fontWeight: subView === s.id ? 700 : 500, color: subView === s.id ? s.color : C.muted, background: 'none', border: 'none', borderBottom: `2px solid ${subView === s.id ? s.color : 'transparent'}`, marginBottom: '-1px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {s.label}
              <span style={{ fontSize: '0.67rem', fontWeight: 700, padding: '0.1rem 0.35rem', borderRadius: '0.25rem', backgroundColor: subView === s.id ? `color-mix(in srgb, ${s.color} 15%, transparent)` : 'rgba(255,255,255,0.05)', color: subView === s.id ? s.color : C.faint }}>{s.count}</span>
            </button>
          ))}
        </div>

        {subView === 'rising' && (
          data.rising.length === 0
            ? <EmptyState msg="No pages with significant session growth this period." />
            : <DataTable headers={['Page', 'Now', 'Before', 'Session Δ', 'Session Δ%', 'Eng Rate', 'Eng Δ']}>
                {data.rising.map((r, i) => (
                  <TR key={i} highlight last={i === data.rising.length - 1}>
                    <td style={{ ...TD, maxWidth: 200 }}><span title={r.page} style={{ fontSize: '0.78rem', color: C.muted }}>{truncUrl(r.page)}</span></td>
                    <td style={{ ...TD, color: C.accent, fontWeight: 700 }}>{fmtNum(r.sessions)}</td>
                    <td style={{ ...TD, color: C.muted, fontSize: '0.78rem' }}>{fmtNum(r.prev_sessions)}</td>
                    <td style={{ ...TD, color: C.green, fontWeight: 700 }}>+{fmtNum(r.session_change)}</td>
                    <td style={{ ...TD, color: C.green, fontWeight: 700 }}>+{r.session_change_pct}%</td>
                    <td style={TD}>{fmtEngRate(r.engagement_rate)}</td>
                    <td style={{ ...TD, color: r.engagement_change > 0 ? C.green : r.engagement_change < 0 ? C.red : C.muted, fontWeight: 600 }}>
                      {r.engagement_change >= 0 ? '+' : ''}{(r.engagement_change * 100).toFixed(1)}pp
                    </td>
                  </TR>
                ))}
              </DataTable>
        )}

        {subView === 'declining' && (
          data.declining.length === 0
            ? <EmptyState msg="No pages with significant session decline this period." />
            : <DataTable headers={['Page', 'Now', 'Before', 'Session Δ', 'Session Δ%', 'Eng Rate', 'Eng Δ']}>
                {data.declining.map((r, i) => (
                  <TR key={i} last={i === data.declining.length - 1}>
                    <td style={{ ...TD, maxWidth: 200 }}><span title={r.page} style={{ fontSize: '0.78rem', color: C.muted }}>{truncUrl(r.page)}</span></td>
                    <td style={{ ...TD, color: C.red, fontWeight: 700 }}>{fmtNum(r.sessions)}</td>
                    <td style={{ ...TD, color: C.muted, fontSize: '0.78rem' }}>{fmtNum(r.prev_sessions)}</td>
                    <td style={{ ...TD, color: C.red, fontWeight: 700 }}>{fmtNum(r.session_change)}</td>
                    <td style={{ ...TD, color: C.red, fontWeight: 700 }}>{r.session_change_pct}%</td>
                    <td style={TD}>{fmtEngRate(r.engagement_rate)}</td>
                    <td style={{ ...TD, color: r.engagement_change > 0 ? C.green : r.engagement_change < 0 ? C.red : C.muted, fontWeight: 600 }}>
                      {r.engagement_change >= 0 ? '+' : ''}{(r.engagement_change * 100).toFixed(1)}pp
                    </td>
                  </TR>
                ))}
              </DataTable>
        )}

        {subView === 'new' && (
          data.new_pages.length === 0
            ? <EmptyState msg="No new pages appeared this period." />
            : <DataTable headers={['Page', 'Sessions', 'Eng Rate']}>
                {data.new_pages.map((r, i) => (
                  <TR key={i} highlight last={i === data.new_pages.length - 1}>
                    <td style={{ ...TD, maxWidth: 300 }}><span title={r.page} style={{ fontSize: '0.78rem', color: C.muted }}>{truncUrl(r.page, 60)}</span></td>
                    <td style={{ ...TD, fontWeight: 700 }}>{fmtNum(r.sessions)}</td>
                    <td style={TD}>{fmtEngRate(r.engagement_rate)}</td>
                  </TR>
                ))}
              </DataTable>
        )}

        {subView === 'lost' && (
          data.lost_pages.length === 0
            ? <EmptyState msg="No pages disappeared this period." />
            : <DataTable headers={['Page', 'Prev Sessions', 'Prev Eng Rate']}>
                {data.lost_pages.map((r, i) => (
                  <TR key={i} last={i === data.lost_pages.length - 1}>
                    <td style={{ ...TD, maxWidth: 300 }}><span title={r.page} style={{ fontSize: '0.78rem', color: C.muted }}>{truncUrl(r.page, 60)}</span></td>
                    <td style={{ ...TD, color: C.muted, fontWeight: 600 }}>{fmtNum(r.prev_sessions)}</td>
                    <td style={{ ...TD, color: C.muted }}>{fmtEngRate(r.prev_engagement_rate)}</td>
                  </TR>
                ))}
              </DataTable>
        )}
      </Card>
    </div>
  )
}

// ─── Drop zone ────────────────────────────────────────────────────────────────

function DropZone({ label, sub, file, onFile, accept = '.csv' }: { label: string; sub: string; file: File | null; onFile: (f: File) => void; accept?: string }) {
  const [dragging, setDragging] = useState(false)
  const ref = useRef<HTMLInputElement>(null)

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) onFile(f)
  }, [onFile])

  return (
    <div
      onClick={() => ref.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      style={{ border: `2px dashed ${dragging ? C.accent : file ? 'rgba(0,212,170,0.35)' : C.border}`, borderRadius: '0.75rem', padding: '1.5rem 1rem', cursor: 'pointer', textAlign: 'center', backgroundColor: dragging ? C.accentFaint : file ? 'rgba(0,212,170,0.04)' : 'transparent', transition: 'all 0.15s' }}
    >
      <input ref={ref} type="file" accept={accept} style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
      {file ? (
        <>
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: C.accent, margin: '0 0 0.2rem' }}>{file.name}</p>
          <p style={{ fontSize: '0.75rem', color: C.muted, margin: 0 }}>{(file.size / 1024).toFixed(1)} KB · Click to replace</p>
        </>
      ) : (
        <>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="1.5" style={{ marginBottom: '0.625rem' }} aria-hidden><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: C.text, margin: '0 0 0.2rem' }}>{label}</p>
          <p style={{ fontSize: '0.75rem', color: C.muted, margin: 0 }}>{sub}</p>
        </>
      )}
    </div>
  )
}

// ─── Previous runs ────────────────────────────────────────────────────────────

function PreviousRuns({ runs, currentRunId, onLoad }: { runs: GA4Run[]; currentRunId: string | null; onLoad: (id: string) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  if (runs.length === 0) return null

  return (
    <Card>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: C.text }}>Previous Analyses</span>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: C.muted, backgroundColor: 'rgba(255,255,255,0.06)', padding: '0.1rem 0.4rem', borderRadius: '0.3rem' }}>{runs.length}</span>
        </div>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} aria-hidden><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div style={{ borderTop: `1px solid ${C.border}` }}>
          {runs.map((run, i) => {
            const isActive = run.id === currentRunId
            const isLoading = loadingId === run.id
            const rangeLabel = run.date_from && run.date_to ? `${fmtDate(run.date_from)} – ${fmtDate(run.date_to)}` : null
            return (
              <div key={run.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderBottom: i < runs.length - 1 ? `1px solid rgba(255,255,255,0.04)` : 'none', backgroundColor: isActive ? 'rgba(0,212,170,0.04)' : 'transparent' }}>
                <div>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: isActive ? C.accent : C.text, margin: '0 0 0.15rem' }}>
                    {rangeLabel ?? fmtRunDate(run.fetched_at)}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: C.faint, margin: 0 }}>
                    {run.row_count != null ? `${fmtNum(run.row_count)} rows` : '—'}
                    {' · '}
                    <span style={{ color: run.status === 'complete' ? 'rgba(0,212,170,0.5)' : C.faint }}>{run.status}</span>
                    {run.source && run.source !== 'api' ? ` · ${run.source}` : ''}
                  </p>
                </div>
                {isActive ? (
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: C.accent, backgroundColor: C.accentFaint, border: `1px solid rgba(0,212,170,0.2)`, padding: '0.2rem 0.55rem', borderRadius: '0.3rem' }}>Active</span>
                ) : run.status === 'complete' ? (
                  <button onClick={async () => { setLoadingId(run.id); await onLoad(run.id); setLoadingId(null) }} disabled={!!loadingId} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.7rem', borderRadius: '0.4rem', fontSize: '0.75rem', fontWeight: 600, color: isLoading ? C.muted : 'rgba(255,255,255,0.65)', backgroundColor: 'rgba(255,255,255,0.06)', border: `1px solid rgba(255,255,255,0.09)`, cursor: loadingId ? 'not-allowed' : 'pointer' }}>
                    {isLoading && <Spinner size={11} />}
                    {isLoading ? 'Loading…' : 'Load'}
                  </button>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function GA4IntelClient({ siteId, domain, initialRuns, initialAnalysis, initialRunId }: Props) {
  const router = useRouter()

  const [queriesFile, setQueriesFile] = useState<File | null>(null)
  const [channelsFile, setChannelsFile] = useState<File | null>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [datesAutoDetected, setDatesAutoDetected] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [activePreset, setActivePreset] = useState('')

  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<GA4Analysis | null>(initialAnalysis)
  const [runs, setRuns] = useState<GA4Run[]>(initialRuns)
  const [currentRunId, setCurrentRunId] = useState<string | null>(initialRunId)
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  const DATE_PRESETS = [
    { label: 'Last 7 days',    fn: (): string => { const d = new Date(); d.setDate(d.getDate() - 7);  return d.toISOString().split('T')[0] } },
    { label: 'Last 28 days',   fn: (): string => { const d = new Date(); d.setDate(d.getDate() - 28); return d.toISOString().split('T')[0] } },
    { label: 'Last 3 months',  fn: (): string => { const d = new Date(); d.setMonth(d.getMonth() - 3);  return d.toISOString().split('T')[0] } },
    { label: 'Last 6 months',  fn: (): string => { const d = new Date(); d.setMonth(d.getMonth() - 6);  return d.toISOString().split('T')[0] } },
    { label: 'Last 12 months', fn: (): string => { const d = new Date(); d.setMonth(d.getMonth() - 12); return d.toISOString().split('T')[0] } },
  ]

  const applyPreset = (label: string, from: string) => {
    setActivePreset(label)
    setDateFrom(from)
    setDateTo(new Date().toISOString().split('T')[0])
    setDatesAutoDetected(false)
  }

  const tryDetectDates = (f: File) => {
    const detected = detectDatesFromFilename(f.name)
    if (detected && !datesAutoDetected) {
      setDateFrom(detected.from)
      setDateTo(detected.to)
      setDatesAutoDetected(true)
      setActivePreset('')
      setShowDatePicker(false)
    }
  }

  const handleAnalyse = async () => {
    if (!queriesFile) { setUploadError('Please upload a GA4 Pages CSV.'); return }
    setUploading(true)
    setUploadError(null)

    try {
      const pagesText = await queriesFile.text()
      const { rows: pageRows, hasComparison } = parseGA4PageCsv(pagesText)

      if (!pageRows.length) {
        setUploadError('Could not parse the Pages CSV. Make sure it is exported from GA4 → Reports → Engagement → Pages and screens.')
        setUploading(false)
        return
      }

      let channelRows: GA4ChannelRow[] = []
      if (channelsFile) {
        const channelsText = await channelsFile.text()
        channelRows = parseGA4ChannelCsv(channelsText).rows
      }

      const res = await fetch('/api/ga4-intel/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId,
          dateFrom: dateFrom || null,
          dateTo: dateTo || null,
          pages: pageRows,
          channels: channelRows,
          hasComparison,
        }),
      })

      const data = await res.json() as { runId?: string; analysis?: GA4Analysis; rowCount?: number; error?: string }
      if (!res.ok) { setUploadError(data.error ?? 'Analysis failed.'); setUploading(false); return }

      if (data.analysis) setAnalysis(data.analysis)
      if (data.runId) {
        setCurrentRunId(data.runId)
        setRuns(prev => [{
          id: data.runId!,
          fetched_at: new Date().toISOString(),
          row_count: data.rowCount ?? null,
          status: 'complete',
          date_from: dateFrom || null,
          date_to: dateTo || null,
          source: 'upload',
        }, ...prev])
      }
      setActiveTab('overview')
      router.refresh()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Unexpected error')
    } finally {
      setUploading(false)
    }
  }

  const handleLoadRun = async (runId: string) => {
    setUploadError(null)
    try {
      const res = await fetch('/api/ga4-intel/analyse', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId, siteId }),
      })
      const data = await res.json() as { analysis?: GA4Analysis; error?: string }
      if (res.ok && data.analysis) { setAnalysis(data.analysis); setCurrentRunId(runId) }
      else setUploadError(data.error ?? 'Failed to load analysis.')
    } catch { setUploadError('Network error loading run.') }
  }

  const currentRun = runs.find(r => r.id === currentRunId)

  const tabs: TabDef[] = [
    { id: 'overview',           label: 'Overview',           color: C.accent  },
    { id: 'quick_wins',         label: 'Quick Wins',         color: C.accent,  count: analysis?.quick_wins.length },
    { id: 'traffic_leaders',    label: 'Traffic Leaders',    color: C.green,   count: analysis?.traffic_leaders.length },
    { id: 'hidden_gems',        label: 'Hidden Gems',        color: C.amber,   count: analysis?.hidden_gems.length },
    { id: 'engagement_issues',  label: 'Engagement Issues',  color: C.red,     count: analysis?.engagement_issues.length },
    { id: 'channels',           label: 'Channels',           color: C.purple,  count: analysis?.channel_breakdown.length, hidden: !(analysis?.meta.has_channels) },
    { id: 'comparison',         label: 'Comparison',         color: C.amber,   count: analysis?.comparison?.summary.total_rising, hidden: !analysis?.comparison },
  ]

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <p style={{ fontSize: '0.67rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.accent, margin: '0 0 0.2rem' }}>GA4 Intelligence</p>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: C.text, margin: '0 0 0.2rem', letterSpacing: '-0.02em' }}>{domain}</h1>
          {analysis && currentRun?.date_from && currentRun.date_to ? (
            <p style={{ fontSize: '0.8125rem', color: C.muted, margin: 0 }}>
              {fmtDate(currentRun.date_from)} – {fmtDate(currentRun.date_to)}
              {analysis.meta.has_comparison && <span style={{ color: C.amber, marginLeft: '0.5rem' }}>· with comparison</span>}
            </p>
          ) : (
            <p style={{ fontSize: '0.8125rem', color: C.muted, margin: 0 }}>Upload GA4 exports to analyse your engagement performance</p>
          )}
        </div>
        {analysis && (
          <button onClick={() => setAnalysis(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.875rem', borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, color: C.muted, backgroundColor: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, cursor: 'pointer' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            New upload
          </button>
        )}
      </div>

      {/* Error banner */}
      {uploadError && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', fontSize: '0.8125rem', color: '#fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <span>{uploadError}</span>
          <button onClick={() => setUploadError(null)} style={{ fontSize: '0.75rem', color: C.muted, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>Dismiss</button>
        </div>
      )}

      {/* Upload panel */}
      {!analysis && (
        <Card>
          <SectionHeader title="Upload GA4 Exports" />
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Date range */}
            <div>
              {datesAutoDetected && !showDatePicker ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem 0.875rem', borderRadius: '0.5rem', backgroundColor: C.accentFaint, border: `1px solid ${C.borderAccent}` }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2.5" aria-hidden><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: C.accent }}>{fmtDate(dateFrom)} – {fmtDate(dateTo)}</span>
                  <span style={{ fontSize: '0.72rem', color: C.muted, flex: 1 }}>auto-detected from filename</span>
                  <button onClick={() => setShowDatePicker(true)} style={{ fontSize: '0.72rem', color: C.muted, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Edit</button>
                </div>
              ) : showDatePicker || datesAutoDetected ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: C.muted, margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Date Range</p>
                    {(dateFrom || dateTo) && (
                      <button onClick={() => { setShowDatePicker(false); setDatesAutoDetected(false); setDateFrom(''); setDateTo(''); setActivePreset('') }} style={{ fontSize: '0.72rem', color: C.muted, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Clear</button>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                    {DATE_PRESETS.map(p => (
                      <button key={p.label} onClick={() => applyPreset(p.label, p.fn())} style={{ padding: '0.35rem 0.75rem', borderRadius: '0.4rem', fontSize: '0.78rem', fontWeight: 600, color: activePreset === p.label ? C.bg : C.muted, backgroundColor: activePreset === p.label ? C.accent : 'rgba(255,255,255,0.05)', border: `1px solid ${activePreset === p.label ? C.accent : C.border}`, cursor: 'pointer' }}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {[{ label: 'From', val: dateFrom, set: setDateFrom }, { label: 'To', val: dateTo, set: setDateTo }].map(f => (
                      <div key={f.label}>
                        <label style={{ display: 'block', fontSize: '0.72rem', color: C.muted, marginBottom: '0.25rem' }}>{f.label}</label>
                        <input type="date" value={f.val} onChange={e => { f.set(e.target.value); setActivePreset(''); setDatesAutoDetected(false) }} style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: '0.4rem', padding: '0.4rem 0.625rem', fontSize: '0.8125rem', color: C.text, outline: 'none', colorScheme: 'dark' }} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowDatePicker(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.75rem', borderRadius: '0.4rem', fontSize: '0.78rem', fontWeight: 600, color: C.muted, backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, cursor: 'pointer' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Add date range (optional)
                </button>
              )}
            </div>

            {/* File uploads */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '0.875rem' }}>
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, color: C.text, margin: '0 0 0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pages CSV <span style={{ color: C.red }}>*</span></p>
                <p style={{ fontSize: '0.75rem', color: C.muted, margin: '0 0 0.625rem' }}>GA4 → Reports → Engagement → Pages and screens → Export. Supports single period and comparison period exports.</p>
                <DropZone label="Drop Pages CSV here" sub="or click to browse" file={queriesFile} onFile={f => { setQueriesFile(f); tryDetectDates(f) }} />
              </div>
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, color: C.text, margin: '0 0 0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Channels CSV <span style={{ color: C.muted }}>(optional)</span></p>
                <p style={{ fontSize: '0.75rem', color: C.muted, margin: '0 0 0.625rem' }}>GA4 → Reports → Acquisition → Traffic acquisition → Export. Unlocks the Channels panel and organic traffic %.</p>
                <DropZone label="Drop Channels CSV here" sub="or click to browse" file={channelsFile} onFile={f => { setChannelsFile(f); tryDetectDates(f) }} />
              </div>
            </div>

            <button onClick={handleAnalyse} disabled={uploading || !queriesFile} style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.5rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 700, color: C.bg, backgroundColor: uploading || !queriesFile ? 'rgba(0,212,170,0.35)' : C.accent, border: 'none', cursor: uploading || !queriesFile ? 'not-allowed' : 'pointer', transition: 'opacity 0.15s' }}>
              {uploading ? <Spinner /> : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/><path d="M11 8v6m-3-3h6"/></svg>
              )}
              {uploading ? 'Analysing…' : 'Analyse'}
            </button>
          </div>
        </Card>
      )}

      {/* Analysis results */}
      {analysis && (
        <>
          {/* Summary strip */}
          {(() => {
            const cmp = analysis.comparison?.summary
            const nc = (n: number) => n > 0 ? C.green : n < 0 ? C.red : C.muted
            const sp = (n: number) => (n > 0 ? '+' : '') + fmtNum(n)
            const stats = [
              { label: 'Sessions',     value: fmtNum(analysis.meta.total_sessions),           accent: true,  delta: cmp ? sp(cmp.session_change) : undefined,                                                                                                dc: cmp ? nc(cmp.session_change) : undefined },
              { label: 'Engagement',   value: fmtEngRate(analysis.meta.avg_engagement_rate),  accent: true,  delta: cmp ? (cmp.engagement_rate_change >= 0 ? '+' : '') + fmtEngRate(Math.abs(cmp.engagement_rate_change)) : undefined,                       dc: cmp ? nc(cmp.engagement_rate_change) : undefined },
              { label: 'Avg Eng Time', value: fmtSecs(analysis.meta.avg_engagement_time),    accent: false, delta: cmp ? (cmp.avg_time_change >= 0 ? '+' : '') + fmtSecs(Math.abs(cmp.avg_time_change)) : undefined,                                        dc: cmp ? nc(cmp.avg_time_change) : undefined },
              { label: 'Quick Wins',   value: String(analysis.quick_wins.length),             accent: true,  delta: undefined as string | undefined,                                                                                                          dc: undefined as string | undefined },
              { label: 'Issues',       value: String(analysis.engagement_issues.length),      accent: false, delta: undefined, dc: undefined },
            ]
            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '0.75rem' }}>
                {stats.map(it => (
                  <div key={it.label} style={{ backgroundColor: C.card, border: `1px solid ${it.accent ? C.borderAccent : C.border}`, borderRadius: '0.75rem', padding: '0.875rem 1rem' }}>
                    <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted, margin: '0 0 0.25rem' }}>{it.label}</p>
                    <p style={{ fontSize: '1.375rem', fontWeight: 800, color: it.accent ? C.accent : C.text, margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>{it.value}</p>
                    {it.delta !== undefined && <p style={{ fontSize: '0.72rem', fontWeight: 700, color: it.dc, margin: '0.25rem 0 0' }}>{it.delta} vs prev</p>}
                  </div>
                ))}
              </div>
            )
          })()}

          {/* Tabbed panel */}
          <Card>
            <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />
            <div>
              {activeTab === 'overview'          && <OverviewPanel          analysis={analysis} />}
              {activeTab === 'quick_wins'        && <QuickWinsPanel         items={analysis.quick_wins} />}
              {activeTab === 'traffic_leaders'   && <TrafficLeadersPanel    items={analysis.traffic_leaders} hasConversions={analysis.meta.has_conversions} />}
              {activeTab === 'hidden_gems'       && <HiddenGemsPanel        items={analysis.hidden_gems} />}
              {activeTab === 'engagement_issues' && <EngagementIssuesPanel  items={analysis.engagement_issues} />}
              {activeTab === 'channels'          && <ChannelsPanel          items={analysis.channel_breakdown} hasCmp={analysis.meta.has_comparison} />}
              {activeTab === 'comparison'        && analysis.comparison     && <ComparisonPanel data={analysis.comparison} />}
            </div>
          </Card>
        </>
      )}

      {/* Previous runs */}
      <PreviousRuns runs={runs} currentRunId={currentRunId} onLoad={handleLoadRun} />

      <style>{`
        @keyframes ga4-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
