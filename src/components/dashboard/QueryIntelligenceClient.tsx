'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { QIAnalysis, QuickWin, CTROpportunity, ContentGap, FeaturedSnippetOpp, LongTailOpp, TopPerformer, TopicCluster, PageAnalysis, KeywordGroup, ContentMapAnalysis, AiOpportunity } from '@/lib/query-intelligence/analyser'
import type { QueryRow, PageRow } from '@/lib/query-intelligence/analyser'

// ─── Re-export for server component ──────────────────────────────────────────
export type { QIAnalysis as AnalysisJSON }

export interface QIRun {
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
  initialRuns: QIRun[]
  initialAnalysis: QIAnalysis | null
  initialRunId: string | null
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function today(): string {
  return new Date().toISOString().split('T')[0]
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

function monthsAgo(n: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() - n)
  return d.toISOString().split('T')[0]
}

const DATE_PRESETS = [
  { label: 'Last 7 days',    dateFrom: () => daysAgo(7),    dateTo: () => today() },
  { label: 'Last 28 days',   dateFrom: () => daysAgo(28),   dateTo: () => today() },
  { label: 'Last 3 months',  dateFrom: () => monthsAgo(3),  dateTo: () => today() },
  { label: 'Last 6 months',  dateFrom: () => monthsAgo(6),  dateTo: () => today() },
  { label: 'Last 12 months', dateFrom: () => monthsAgo(12), dateTo: () => today() },
  { label: 'Last 16 months', dateFrom: () => monthsAgo(16), dateTo: () => today() },
]

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtRunDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ─── Filename date detection ──────────────────────────────────────────────────

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
  const to   = toISO(matches[1])
  return from && to ? { from, to } : null
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

function parseCtr(val: string): number {
  const clean = val.replace('%', '').trim()
  const n = parseFloat(clean)
  if (isNaN(n)) return 0
  // GSC always exports CTR as a percentage string ("0.23%", "17.86%")
  // so always divide by 100 — the > 1 check was wrong for sub-1% values
  return n / 100
}

function parseQueryCsv(text: string): { rows: QueryRow[]; hasComparison: boolean } {
  const raw = parseCsvToRows(text)
  if (!raw.length) return { rows: [], hasComparison: false }

  const keys = Object.keys(raw[0])
  const findCol = (...terms: string[]) =>
    keys.find(k => terms.some(t => k.includes(t))) ?? ''

  const qCol  = findCol('top queries', 'query')
  const cCol  = findCol('clicks')
  const iCol  = findCol('impressions')
  const rCol  = findCol('ctr')
  const pCol  = findCol('position')

  // Detect comparison: look for a second "clicks" / "impressions" column
  const compClicksCol  = keys.find(k => k.includes('click') && (k.includes('prev') || k.includes('period 2') || k.includes('previous')))
  const compImpCol     = keys.find(k => k.includes('impress') && (k.includes('prev') || k.includes('period 2') || k.includes('previous')))
  const compCtrCol     = keys.find(k => k.includes('ctr') && (k.includes('prev') || k.includes('period 2') || k.includes('previous')))
  const compPosCol     = keys.find(k => k.includes('position') && (k.includes('prev') || k.includes('period 2') || k.includes('previous')))
  const hasComparison  = !!(compClicksCol || compImpCol)

  const rows: QueryRow[] = raw
    .filter(r => r[qCol])
    .map(r => ({
      query:            r[qCol] ?? '',
      clicks:           parseInt(r[cCol] ?? '0') || 0,
      impressions:      parseInt(r[iCol] ?? '0') || 0,
      ctr:              parseCtr(r[rCol] ?? '0'),
      position:         parseFloat(r[pCol] ?? '0') || 0,
      prevClicks:       compClicksCol ? (parseInt(r[compClicksCol] ?? '0') || 0) : undefined,
      prevImpressions:  compImpCol    ? (parseInt(r[compImpCol]    ?? '0') || 0) : undefined,
      prevCtr:          compCtrCol    ? parseCtr(r[compCtrCol] ?? '0') : undefined,
      prevPosition:     compPosCol    ? (parseFloat(r[compPosCol] ?? '0') || 0) : undefined,
    }))

  return { rows, hasComparison }
}

function parsePageCsv(text: string): PageRow[] {
  const raw = parseCsvToRows(text)
  if (!raw.length) return []

  const keys = Object.keys(raw[0])
  const findCol = (...terms: string[]) => keys.find(k => terms.some(t => k.includes(t))) ?? ''

  const pgCol = findCol('top pages', 'page')
  const cCol  = findCol('clicks')
  const iCol  = findCol('impressions')
  const rCol  = findCol('ctr')
  const pCol  = findCol('position')

  return raw
    .filter(r => r[pgCol])
    .map(r => ({
      page:        r[pgCol] ?? '',
      clicks:      parseInt(r[cCol] ?? '0') || 0,
      impressions: parseInt(r[iCol] ?? '0') || 0,
      ctr:         parseCtr(r[rCol] ?? '0'),
      position:    parseFloat(r[pCol] ?? '0') || 0,
    }))
}

// ─── Formatting ───────────────────────────────────────────────────────────────

function fmtPct(n: number, decimals = 1): string { return (n * 100).toFixed(decimals) + '%' }
function fmtNum(n: number): string { return n.toLocaleString() }
function truncUrl(url: string, max = 45): string {
  const clean = url.replace(/^https?:\/\//, '')
  return clean.length > max ? clean.slice(0, max) + '…' : clean
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

// ─── Shared primitives ────────────────────────────────────────────────────────

function Spinner({ size = 14 }: { size?: number }) {
  return (
    <svg style={{ width: size, height: size, animation: 'qi-spin 0.8s linear infinite', flexShrink: 0 }}
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

function DataTable({ headers, children, empty }: { headers: string[]; children: React.ReactNode; empty?: string }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>{headers.map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
      {!children && empty && <EmptyState msg={empty} />}
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

// ─── Tab system ───────────────────────────────────────────────────────────────

type TabId = 'overview' | 'quick_wins' | 'ctr' | 'gaps' | 'snippets' | 'longtail' | 'performers' | 'clusters' | 'comparison' | 'pages' | 'keyword_groups' | 'content_map' | 'ai_opps'

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

function OverviewPanel({ analysis }: { analysis: QIAnalysis }) {
  const { meta, position_buckets, branded_split } = analysis
  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <StatGrid items={[
        { label: 'Total Queries',   value: fmtNum(meta.total_queries),              accent: true },
        { label: 'Total Clicks',    value: fmtNum(meta.total_clicks)                },
        { label: 'Total Impressions', value: fmtNum(meta.total_impressions)         },
        { label: 'Avg CTR',         value: fmtPct(meta.avg_ctr),                   accent: true },
        { label: 'Avg Position',    value: Number(meta.avg_position).toFixed(1)     },
        ...(meta.total_pages > 0 ? [{ label: 'Pages Analysed', value: fmtNum(meta.total_pages) }] : []),
      ]} />

      {/* Position buckets */}
      <Card>
        <SectionHeader title="Position Distribution" />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              {['Bucket', 'Queries', 'Impressions', 'Clicks', 'Avg CTR', 'Avg Pos'].map(h => <th key={h} style={TH}>{h}</th>)}
            </tr></thead>
            <tbody>
              {position_buckets.map((b, i) => (
                <TR key={b.label} last={i === position_buckets.length - 1}>
                  <td style={{ ...TD, fontWeight: 700 }}><span style={{ color: i === 0 ? C.accent : C.text }}>{b.label}</span></td>
                  <td style={TD}>{fmtNum(b.count)}</td>
                  <td style={TD}>{fmtNum(b.impressions)}</td>
                  <td style={{ ...TD, color: C.accent }}>{fmtNum(b.clicks)}</td>
                  <td style={TD}>{fmtPct(b.avg_ctr)}</td>
                  <td style={{ ...TD, color: C.muted }}>{Number(b.avg_position).toFixed(1)}</td>
                </TR>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Branded split */}
      {branded_split.brand && (
        <Card>
          <SectionHeader title="Branded vs Non-branded" />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                {['Type', 'Queries', 'Clicks', 'Impressions', 'Avg CTR', 'Avg Pos'].map(h => <th key={h} style={TH}>{h}</th>)}
              </tr></thead>
              <tbody>
                {[
                  { label: `Branded (${branded_split.brand})`, d: branded_split.branded },
                  { label: 'Non-branded', d: branded_split.non_branded },
                ].map(({ label, d }, i) => (
                  <TR key={label} last={i === 1}>
                    <td style={{ ...TD, fontWeight: 600 }}>{label}</td>
                    <td style={TD}>{fmtNum(d.queries)}</td>
                    <td style={{ ...TD, color: C.accent }}>{fmtNum(d.clicks)}</td>
                    <td style={TD}>{fmtNum(d.impressions)}</td>
                    <td style={TD}>{fmtPct(d.avg_ctr)}</td>
                    <td style={{ ...TD, color: C.muted }}>{Number(d.avg_position).toFixed(1)}</td>
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

function QuickWinsPanel({ items }: { items: QuickWin[] }) {
  if (!items.length) return <EmptyState msg="No quick win opportunities found in this data." />
  return (
    <DataTable headers={['Query', 'Position', 'Impressions', 'Clicks', 'CTR', 'Opportunity', 'Potential Lift']}>
      {items.map((r, i) => (
        <TR key={i} highlight={r.opportunity === 'top3_push'} last={i === items.length - 1}>
          <td style={{ ...TD, maxWidth: 240, fontWeight: 500 }}>{r.query}</td>
          <td style={{ ...TD, color: C.accent, fontWeight: 700 }}>{Number(r.position).toFixed(1)}</td>
          <td style={TD}>{fmtNum(r.impressions)}</td>
          <td style={TD}>{fmtNum(r.clicks)}</td>
          <td style={{ ...TD, color: C.muted }}>{fmtPct(r.ctr)}</td>
          <td style={TD}><Badge label={r.opportunity === 'top3_push' ? 'Top 3 push' : 'Page 1 push'} color={r.opportunity === 'top3_push' ? C.accent : C.amber} /></td>
          <td style={{ ...TD, color: C.accent, fontWeight: 600 }}>{r.lift_estimate}</td>
        </TR>
      ))}
    </DataTable>
  )
}

function CTRPanel({ items }: { items: CTROpportunity[] }) {
  if (!items.length) return <EmptyState msg="No CTR gaps found. Your titles and descriptions are performing well." />
  return (
    <DataTable headers={['Query', 'Position', 'Impressions', 'Actual CTR', 'Expected CTR', 'Gap', 'Missed Clicks', 'Priority']}>
      {items.map((r, i) => (
        <TR key={i} highlight={r.priority === 'high'} last={i === items.length - 1}>
          <td style={{ ...TD, maxWidth: 240, fontWeight: 500 }}>{r.query}</td>
          <td style={{ ...TD, fontWeight: 600 }}>{Number(r.position).toFixed(1)}</td>
          <td style={TD}>{fmtNum(r.impressions)}</td>
          <td style={{ ...TD, color: r.priority === 'high' ? C.red : C.amber }}>{fmtPct(r.actual_ctr)}</td>
          <td style={{ ...TD, color: C.muted }}>{fmtPct(r.expected_ctr)}</td>
          <td style={{ ...TD, color: C.red, fontWeight: 700 }}>−{r.gap_pct}%</td>
          <td style={{ ...TD, color: C.amber }}>{fmtNum(r.missed_clicks)}/mo</td>
          <td style={TD}><Badge label={r.priority === 'high' ? 'High' : 'Medium'} color={r.priority === 'high' ? C.red : C.amber} /></td>
        </TR>
      ))}
    </DataTable>
  )
}

function ContentGapsPanel({ items }: { items: ContentGap[] }) {
  if (!items.length) return <EmptyState msg="No major content gaps identified." />
  const intentColors: Record<string, string> = { informational: C.purple, commercial: C.amber, transactional: C.green, navigational: C.orange }
  return (
    <DataTable headers={['Query', 'Impressions', 'Clicks', 'Position', 'CTR', 'Intent']}>
      {items.map((r, i) => (
        <TR key={i} last={i === items.length - 1}>
          <td style={{ ...TD, maxWidth: 260, fontWeight: 500 }}>{r.query}</td>
          <td style={{ ...TD, fontWeight: 700 }}>{fmtNum(r.impressions)}</td>
          <td style={{ ...TD, color: C.muted }}>{fmtNum(r.clicks)}</td>
          <td style={TD}>{Number(r.position).toFixed(1)}</td>
          <td style={{ ...TD, color: C.red }}>{fmtPct(r.ctr, 2)}</td>
          <td style={TD}><Badge label={r.intent} color={intentColors[r.intent] ?? C.muted} /></td>
        </TR>
      ))}
    </DataTable>
  )
}

function SnippetsPanel({ items }: { items: FeaturedSnippetOpp[] }) {
  if (!items.length) return <EmptyState msg="No featured snippet opportunities detected." />
  const typeColors: Record<string, string> = { question: C.purple, comparison: C.amber, list: C.orange, definition: C.green }
  return (
    <DataTable headers={['Query', 'Position', 'Impressions', 'Type', 'Recommended Action']}>
      {items.map((r, i) => (
        <TR key={i} last={i === items.length - 1}>
          <td style={{ ...TD, maxWidth: 240, fontWeight: 500 }}>{r.query}</td>
          <td style={{ ...TD, color: C.accent, fontWeight: 700 }}>{Number(r.position).toFixed(1)}</td>
          <td style={TD}>{fmtNum(r.impressions)}</td>
          <td style={TD}><Badge label={r.query_type} color={typeColors[r.query_type] ?? C.muted} /></td>
          <td style={{ ...TD, maxWidth: 300, fontSize: '0.78rem', color: C.muted }}>{r.action}</td>
        </TR>
      ))}
    </DataTable>
  )
}

function LongTailPanel({ items }: { items: LongTailOpp[] }) {
  if (!items.length) return <EmptyState msg="No long-tail opportunities found with sufficient impressions." />
  return (
    <DataTable headers={['Query', 'Words', 'Position', 'Impressions', 'Clicks', 'CTR', 'Difficulty']}>
      {items.map((r, i) => (
        <TR key={i} last={i === items.length - 1}>
          <td style={{ ...TD, maxWidth: 280, fontWeight: 500 }}>{r.query}</td>
          <td style={{ ...TD, color: C.purple, fontWeight: 700 }}>{r.word_count}</td>
          <td style={TD}>{Number(r.position).toFixed(1)}</td>
          <td style={TD}>{fmtNum(r.impressions)}</td>
          <td style={TD}>{fmtNum(r.clicks)}</td>
          <td style={{ ...TD, color: C.muted }}>{fmtPct(r.ctr)}</td>
          <td style={TD}><Badge label={r.difficulty} color={r.difficulty === 'easy' ? C.green : C.amber} /></td>
        </TR>
      ))}
    </DataTable>
  )
}

function PerformersPanel({ items }: { items: TopPerformer[] }) {
  if (!items.length) return <EmptyState msg="No queries significantly outperforming expected CTR." />
  return (
    <DataTable headers={['Query', 'Position', 'Impressions', 'Actual CTR', 'Expected CTR', 'Performance Ratio']}>
      {items.map((r, i) => (
        <TR key={i} highlight last={i === items.length - 1}>
          <td style={{ ...TD, maxWidth: 260, fontWeight: 500 }}>{r.query}</td>
          <td style={TD}>{Number(r.position).toFixed(1)}</td>
          <td style={TD}>{fmtNum(r.impressions)}</td>
          <td style={{ ...TD, color: C.accent, fontWeight: 700 }}>{fmtPct(r.actual_ctr)}</td>
          <td style={{ ...TD, color: C.muted }}>{fmtPct(r.expected_ctr)}</td>
          <td style={TD}><Badge label={`${r.performance_ratio}×`} color={C.accent} /></td>
        </TR>
      ))}
    </DataTable>
  )
}

function ClustersPanel({ items }: { items: TopicCluster[] }) {
  if (!items.length) return <EmptyState msg="Not enough recurring terms to identify topic clusters." />
  return (
    <div style={{ padding: '0.75rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '0.75rem' }}>
        {items.map(c => (
          <div key={c.topic} style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: '0.625rem', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: C.accent }}>#{c.topic}</span>
              <span style={{ fontSize: '0.72rem', color: C.muted }}>{c.query_count} queries</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {[
                { l: 'Impressions', v: fmtNum(c.total_impressions) },
                { l: 'Clicks',      v: fmtNum(c.total_clicks) },
                { l: 'Avg CTR',     v: fmtPct(c.avg_ctr) },
                { l: 'Avg Pos',     v: Number(c.avg_position).toFixed(1) },
              ].map(it => (
                <div key={it.l}>
                  <p style={{ fontSize: '0.67rem', color: C.muted, margin: '0 0 0.1rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{it.l}</p>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: C.text, margin: 0 }}>{it.v}</p>
                </div>
              ))}
            </div>
            <div>
              <p style={{ fontSize: '0.67rem', color: C.muted, margin: '0 0 0.35rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Top queries</p>
              {c.top_queries.map((q, i) => (
                <p key={i} style={{ fontSize: '0.78rem', color: C.faint, margin: '0 0 0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>· {q}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ComparisonPanel({ data }: { data: NonNullable<QIAnalysis['comparison']> }) {
  const { summary } = data
  const signedNum = (n: number) => (n >= 0 ? '+' : '') + fmtNum(n)
  const signedPct = (n: number) => (n >= 0 ? '+' : '') + n + '%'
  const posColor = (n: number) => n > 0 ? C.green : n < 0 ? C.red : C.muted

  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <StatGrid items={[
        { label: 'Click Change',      value: signedNum(summary.click_change),      sub: signedPct(summary.click_change_pct),      accent: summary.click_change >= 0 },
        { label: 'Impression Change', value: signedNum(summary.impression_change), sub: signedPct(summary.impression_change_pct) },
        { label: 'Avg Pos Change',    value: signedNum(summary.avg_position_change), sub: summary.avg_position_change > 0 ? 'improved' : 'declined' },
        { label: 'Improved Queries',  value: fmtNum(summary.total_improved),       accent: true },
        { label: 'Dropped Queries',   value: fmtNum(summary.total_dropped) },
      ]} />

      {data.improved_positions.length > 0 && (
        <Card>
          <SectionHeader title="Position Improvements" count={data.improved_positions.length} color={C.green} />
          <DataTable headers={['Query', 'Previous', 'Current', 'Improvement', 'Impressions']}>
            {data.improved_positions.map((r, i) => (
              <TR key={i} highlight last={i === data.improved_positions.length - 1}>
                <td style={{ ...TD, maxWidth: 260, fontWeight: 500 }}>{r.query}</td>
                <td style={{ ...TD, color: C.muted }}>{Number(r.from_pos).toFixed(1)}</td>
                <td style={{ ...TD, color: C.accent, fontWeight: 700 }}>{Number(r.to_pos).toFixed(1)}</td>
                <td style={{ ...TD, color: C.green, fontWeight: 700 }}>+{r.change}</td>
                <td style={TD}>{fmtNum(r.impressions)}</td>
              </TR>
            ))}
          </DataTable>
        </Card>
      )}

      {data.dropped_positions.length > 0 && (
        <Card>
          <SectionHeader title="Position Drops" count={data.dropped_positions.length} color={C.red} />
          <DataTable headers={['Query', 'Previous', 'Current', 'Drop', 'Impressions']}>
            {data.dropped_positions.map((r, i) => (
              <TR key={i} last={i === data.dropped_positions.length - 1}>
                <td style={{ ...TD, maxWidth: 260, fontWeight: 500 }}>{r.query}</td>
                <td style={{ ...TD, color: C.muted }}>{Number(r.from_pos).toFixed(1)}</td>
                <td style={{ ...TD, color: C.red, fontWeight: 700 }}>{Number(r.to_pos).toFixed(1)}</td>
                <td style={{ ...TD, color: C.red, fontWeight: 700 }}>−{r.change}</td>
                <td style={TD}>{fmtNum(r.impressions)}</td>
              </TR>
            ))}
          </DataTable>
        </Card>
      )}

      {data.new_queries.length > 0 && (
        <Card>
          <SectionHeader title="New Queries (appeared this period)" count={data.new_queries.length} color={C.purple} />
          <DataTable headers={['Query', 'Impressions', 'Position']}>
            {data.new_queries.map((r, i) => (
              <TR key={i} last={i === data.new_queries.length - 1}>
                <td style={{ ...TD, maxWidth: 300, fontWeight: 500 }}>{r.query}</td>
                <td style={TD}>{fmtNum(r.impressions)}</td>
                <td style={{ ...TD, color: C.muted }}>{Number(r.position).toFixed(1)}</td>
              </TR>
            ))}
          </DataTable>
        </Card>
      )}

      {data.lost_queries.length > 0 && (
        <Card>
          <SectionHeader title="Lost Queries (disappeared this period)" count={data.lost_queries.length} color={C.red} />
          <DataTable headers={['Query', 'Prev Impressions', 'Prev Position']}>
            {data.lost_queries.map((r, i) => (
              <TR key={i} last={i === data.lost_queries.length - 1}>
                <td style={{ ...TD, maxWidth: 300, fontWeight: 500 }}>{r.query}</td>
                <td style={TD}>{fmtNum(r.prev_impressions)}</td>
                <td style={{ ...TD, color: C.muted }}>{Number(r.prev_position).toFixed(1)}</td>
              </TR>
            ))}
          </DataTable>
        </Card>
      )}
    </div>
  )
}

function PagesPanel({ items }: { items: PageAnalysis[] }) {
  if (!items.length) return <EmptyState msg="No page data available." />
  const colorForCtr = (v: PageAnalysis['ctr_vs_avg']) => v === 'above' ? C.green : v === 'below' ? C.red : C.muted
  return (
    <DataTable headers={['Page', 'Clicks', 'Impressions', 'CTR', 'Avg Pos', 'CTR vs Avg', 'Mapped Queries']}>
      {items.map((r, i) => (
        <TR key={i} last={i === items.length - 1}>
          <td style={{ ...TD, maxWidth: 240 }}>
            <span title={r.page} style={{ color: C.muted, fontSize: '0.78rem' }}>{truncUrl(r.page)}</span>
          </td>
          <td style={{ ...TD, color: C.accent, fontWeight: 700 }}>{fmtNum(r.clicks)}</td>
          <td style={TD}>{fmtNum(r.impressions)}</td>
          <td style={TD}>{fmtPct(r.ctr)}</td>
          <td style={{ ...TD, color: C.muted }}>{Number(r.position).toFixed(1)}</td>
          <td style={TD}><Badge label={r.ctr_vs_avg} color={colorForCtr(r.ctr_vs_avg)} /></td>
          <td style={{ ...TD, maxWidth: 240, fontSize: '0.78rem', color: C.muted }}>{r.mapped_queries.slice(0, 3).join(', ')}{r.mapped_queries.length > 3 ? ` +${r.mapped_queries.length - 3} more` : ''}</td>
        </TR>
      ))}
    </DataTable>
  )
}

// ─── New analysis panels ──────────────────────────────────────────────────────

const INTENT_COLORS: Record<string, string> = {
  informational: C.purple,
  commercial:    C.amber,
  transactional: C.green,
  navigational:  C.orange,
  mixed:         'rgba(255,255,255,0.35)',
}

function KeywordGroupsPanel({ items }: { items: KeywordGroup[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  if (!items.length) return <EmptyState msg="No keyword groups found in this data." />
  return (
    <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {items.map(g => {
        const isOpen = expanded === g.parent_topic
        return (
          <div key={g.parent_topic} style={{ border: `1px solid ${C.border}`, borderRadius: '0.625rem', overflow: 'hidden' }}>
            <button onClick={() => setExpanded(isOpen ? null : g.parent_topic)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: C.text }}>{g.parent_topic}</span>
                  <Badge label={g.intent} color={INTENT_COLORS[g.intent] ?? C.muted} />
                  <span style={{ fontSize: '0.7rem', color: C.muted }}>{g.query_count} quer{g.query_count === 1 ? 'y' : 'ies'}</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.72rem', color: C.muted }}>{fmtNum(g.total_impressions)} impr</span>
                  <span style={{ fontSize: '0.72rem', color: C.accent }}>{fmtNum(g.total_clicks)} clicks</span>
                  <span style={{ fontSize: '0.72rem', color: C.muted }}>avg pos {Number(g.avg_position).toFixed(1)}</span>
                  <span style={{ fontSize: '0.72rem', color: C.muted }}>{fmtPct(g.avg_ctr)} CTR</span>
                </div>
              </div>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} aria-hidden><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {isOpen && (
              <div style={{ borderTop: `1px solid ${C.border}`, padding: '0.75rem 1rem' }}>
                <p style={{ fontSize: '0.78rem', color: C.amber, margin: '0 0 0.75rem', fontStyle: 'italic' }}>{g.recommended_action}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {g.queries.map((q, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.3rem 0.5rem', borderRadius: '0.3rem', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      <span style={{ flex: 1, fontSize: '0.8rem', color: C.text }}>{q.query}</span>
                      <Badge label={q.intent} color={INTENT_COLORS[q.intent] ?? C.muted} />
                      <span style={{ fontSize: '0.7rem', color: C.muted, minWidth: 48, textAlign: 'right' }}>pos {Number(q.position).toFixed(1)}</span>
                      <span style={{ fontSize: '0.7rem', color: C.muted, minWidth: 62, textAlign: 'right' }}>{fmtNum(q.impressions)} impr</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ContentMapPanel({ data }: { data: ContentMapAnalysis }) {
  const [expandedPage, setExpandedPage] = useState<string | null>(null)
  const [section, setSection] = useState<'pages' | 'orphans' | 'suggested'>('pages')

  const subs: { id: typeof section; label: string }[] = [
    { id: 'pages',     label: `Mapped Pages (${data.mapped_pages.length})` },
    { id: 'orphans',   label: `Orphan Queries (${data.orphan_queries.length})` },
    { id: 'suggested', label: `New Page Ideas (${data.suggested_pages.length})` },
  ]

  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '0.75rem' }}>
        {[
          { label: 'Coverage',        value: `${data.coverage_pct.toFixed(1)}%`,      sub: 'impressions mapped',           accent: true },
          { label: 'Mapped Pages',    value: fmtNum(data.mapped_pages.length),          sub: 'pages with queries'                        },
          { label: 'Orphan Queries',  value: fmtNum(data.orphan_queries.length),        sub: 'no dedicated page'                         },
          { label: 'New Page Ideas',  value: fmtNum(data.suggested_pages.length),       sub: 'recommended pages',            accent: true },
        ].map(it => (
          <div key={it.label} style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: `1px solid ${it.accent ? C.borderAccent : C.border}`, borderRadius: '0.625rem', padding: '0.875rem 1rem' }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted, margin: '0 0 0.25rem' }}>{it.label}</p>
            <p style={{ fontSize: '1.375rem', fontWeight: 800, color: it.accent ? C.accent : C.text, margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>{it.value}</p>
            {it.sub && <p style={{ fontSize: '0.68rem', color: C.faint, margin: '0.2rem 0 0' }}>{it.sub}</p>}
          </div>
        ))}
      </div>

      {/* Sub-navigation */}
      <div style={{ display: 'flex', gap: '0.35rem', borderBottom: `1px solid ${C.border}` }}>
        {subs.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)} style={{ padding: '0.5rem 0.875rem', fontSize: '0.8rem', fontWeight: section === s.id ? 700 : 500, color: section === s.id ? C.accent : C.muted, background: 'none', border: 'none', borderBottom: `2px solid ${section === s.id ? C.accent : 'transparent'}`, marginBottom: '-1px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Mapped pages */}
      {section === 'pages' && (
        data.mapped_pages.length === 0
          ? <EmptyState msg="No pages were matched to queries. Upload a Pages CSV for full mapping." />
          : <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {data.mapped_pages.map(p => {
                const isOpen = expandedPage === p.page
                return (
                  <div key={p.page} style={{ border: `1px solid ${C.border}`, borderRadius: '0.625rem', overflow: 'hidden' }}>
                    <button onClick={() => setExpandedPage(isOpen ? null : p.page)} style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.875rem 1rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: C.accent, margin: '0 0 0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{truncUrl(p.page, 60)}</p>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.7rem', color: C.muted }}>{p.mapped_queries.length} queries matched</span>
                          <span style={{ fontSize: '0.7rem', color: C.muted }}>{fmtNum(p.page_impressions)} impr</span>
                          <span style={{ fontSize: '0.7rem', color: C.accent }}>{fmtNum(p.page_clicks)} clicks</span>
                          <span style={{ fontSize: '0.7rem', color: C.muted }}>pos {Number(p.page_position).toFixed(1)}</span>
                        </div>
                      </div>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, marginTop: 3 }} aria-hidden><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    {isOpen && (
                      <div style={{ borderTop: `1px solid ${C.border}`, padding: '0.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        {p.mapped_queries.map((q, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.3rem 0.4rem', borderRadius: '0.3rem', backgroundColor: 'rgba(255,255,255,0.015)' }}>
                            <span style={{ flex: 1, fontSize: '0.78rem', color: C.text }}>{q.query}</span>
                            <Badge label={q.intent} color={INTENT_COLORS[q.intent] ?? C.muted} />
                            <span style={{ fontSize: '0.68rem', color: C.muted, minWidth: 48, textAlign: 'right' }}>pos {Number(q.position).toFixed(1)}</span>
                            <span style={{ fontSize: '0.68rem', color: C.muted, minWidth: 58, textAlign: 'right' }}>{fmtNum(q.impressions)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
      )}

      {/* Orphan queries */}
      {section === 'orphans' && (
        data.orphan_queries.length === 0
          ? <EmptyState msg="All queries are mapped to a page." />
          : <DataTable headers={['Query', 'Intent', 'Impressions', 'Clicks', 'Position', 'CTR']}>
              {data.orphan_queries.map((q, i) => (
                <TR key={i} last={i === data.orphan_queries.length - 1}>
                  <td style={{ ...TD, maxWidth: 260, fontWeight: 500 }}>{q.query}</td>
                  <td style={TD}><Badge label={q.intent} color={INTENT_COLORS[q.intent] ?? C.muted} /></td>
                  <td style={{ ...TD, fontWeight: 700 }}>{fmtNum(q.impressions)}</td>
                  <td style={{ ...TD, color: C.accent }}>{fmtNum(q.clicks)}</td>
                  <td style={TD}>{Number(q.position).toFixed(1)}</td>
                  <td style={{ ...TD, color: C.muted }}>{fmtPct(q.ctr)}</td>
                </TR>
              ))}
            </DataTable>
      )}

      {/* Suggested pages */}
      {section === 'suggested' && (
        data.suggested_pages.length === 0
          ? <EmptyState msg="No new page recommendations at this time." />
          : <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {data.suggested_pages.map((p, i) => (
                <div key={i} style={{ border: `1px solid ${p.priority === 'high' ? C.borderAccent : C.border}`, borderRadius: '0.625rem', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: C.text }}>{p.suggested_title}</span>
                        <Badge label={p.priority === 'high' ? 'High Priority' : 'Medium'} color={p.priority === 'high' ? C.accent : C.amber} />
                        <Badge label={p.intent} color={INTENT_COLORS[p.intent] ?? C.muted} />
                      </div>
                      <p style={{ fontSize: '0.72rem', color: C.faint, margin: '0.2rem 0 0', fontFamily: 'monospace' }}>{p.suggested_slug}</p>
                    </div>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: C.accent, whiteSpace: 'nowrap' }}>{fmtNum(p.total_impressions)}<span style={{ fontSize: '0.68rem', color: C.muted, fontWeight: 400, marginLeft: '0.2rem' }}>impr</span></span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: C.muted, margin: '0 0 0.5rem' }}>{p.reason}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {p.target_queries.slice(0, 6).map((q, j) => (
                      <span key={j} style={{ fontSize: '0.68rem', color: C.faint, backgroundColor: 'rgba(255,255,255,0.04)', padding: '0.15rem 0.5rem', borderRadius: '0.25rem', border: `1px solid rgba(255,255,255,0.06)` }}>{q}</span>
                    ))}
                    {p.target_queries.length > 6 && <span style={{ fontSize: '0.68rem', color: C.faint }}>+{p.target_queries.length - 6} more</span>}
                  </div>
                </div>
              ))}
            </div>
      )}
    </div>
  )
}

const AI_TYPE_LABELS: Record<string, string> = {
  ai_overview: 'AI Overview', how_to: 'How-To', comparison: 'Comparison',
  definition: 'Definition', list: 'List / Best', faq: 'FAQ',
}
const AI_TYPE_COLORS: Record<string, string> = {
  ai_overview: C.purple, how_to: C.accent, comparison: C.amber,
  definition: C.orange, list: '#EC4899', faq: C.purple,
}

function AiOppsPanel({ items }: { items: AiOpportunity[] }) {
  if (!items.length) return <EmptyState msg="No AI traffic opportunities detected in this data." />
  return (
    <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {items.map((opp, i) => (
        <div key={i} style={{ border: `1px solid ${opp.score === 'high' ? C.borderAccent : C.border}`, borderRadius: '0.625rem', padding: '0.875rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                <Badge label={AI_TYPE_LABELS[opp.ai_type] ?? opp.ai_type} color={AI_TYPE_COLORS[opp.ai_type] ?? C.muted} />
                <Badge label={opp.score === 'high' ? 'High' : 'Medium'} color={opp.score === 'high' ? C.accent : C.amber} />
              </div>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, color: C.text, margin: '0 0 0.15rem' }}>{opp.query}</p>
              {opp.mapped_page && <p style={{ fontSize: '0.7rem', color: C.muted, margin: 0 }}>{truncUrl(opp.mapped_page, 55)}</p>}
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 800, color: C.text, margin: 0 }}>{fmtNum(opp.impressions)}</p>
              <p style={{ fontSize: '0.67rem', color: C.muted, margin: '0.1rem 0 0' }}>impressions</p>
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '0.4rem', padding: '0.45rem 0.75rem', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.67rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted }}>Content format · </span>
            <span style={{ fontSize: '0.78rem', color: C.text }}>{opp.content_format}</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: C.muted, margin: '0 0 0.3rem' }}>{opp.action}</p>
          <p style={{ fontSize: '0.67rem', color: C.faint, margin: 0 }}>Schema: {opp.schema_recommendation}</p>
        </div>
      ))}
    </div>
  )
}

// ─── File drop zone ───────────────────────────────────────────────────────────

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

// ─── Previous runs panel ──────────────────────────────────────────────────────

function PreviousRuns({ runs, currentRunId, onLoad }: { runs: QIRun[]; currentRunId: string | null; onLoad: (id: string) => Promise<void> }) {
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

export default function QueryIntelligenceClient({ siteId, domain, initialRuns, initialAnalysis, initialRunId }: Props) {
  const router = useRouter()

  // Upload state
  const [queriesFile, setQueriesFile] = useState<File | null>(null)
  const [pagesFile, setPagesFile] = useState<File | null>(null)
  const [dateFrom, setDateFrom] = useState(daysAgo(28))
  const [dateTo, setDateTo] = useState(today())
  const [activePreset, setActivePreset] = useState('Last 28 days')
  const [datesAutoDetected, setDatesAutoDetected] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)

  // Run state
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<QIAnalysis | null>(initialAnalysis)
  const [runs, setRuns] = useState<QIRun[]>(initialRuns)
  const [currentRunId, setCurrentRunId] = useState<string | null>(initialRunId)
  const [currentDateRange, setCurrentDateRange] = useState<{ from: string; to: string } | null>(
    initialAnalysis ? null : null
  )

  // Active tab
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  const applyPreset = (preset: typeof DATE_PRESETS[0]) => {
    setActivePreset(preset.label)
    setDateFrom(preset.dateFrom())
    setDateTo(preset.dateTo())
    setDatesAutoDetected(false)
  }

  const handleQueriesFile = (f: File) => {
    setQueriesFile(f)
    const detected = detectDatesFromFilename(f.name)
    if (detected) {
      setDateFrom(detected.from)
      setDateTo(detected.to)
      setDatesAutoDetected(true)
      setActivePreset('')
      setShowDatePicker(false)
    }
  }

  const handlePagesFile = (f: File) => {
    setPagesFile(f)
    if (!datesAutoDetected) {
      const detected = detectDatesFromFilename(f.name)
      if (detected) {
        setDateFrom(detected.from)
        setDateTo(detected.to)
        setDatesAutoDetected(true)
        setActivePreset('')
        setShowDatePicker(false)
      }
    }
  }

  const handleAnalyse = async () => {
    if (!queriesFile) { setUploadError('Please upload a Queries CSV from Google Search Console.'); return }
    setUploading(true)
    setUploadError(null)

    try {
      const queriesText = await queriesFile.text()
      const { rows: queryRows, hasComparison } = parseQueryCsv(queriesText)

      if (!queryRows.length) {
        setUploadError('Could not parse the Queries CSV. Make sure it is exported directly from Google Search Console.')
        setUploading(false)
        return
      }

      let pageRows: PageRow[] = []
      if (pagesFile) {
        const pagesText = await pagesFile.text()
        pageRows = parsePageCsv(pagesText)
      }

      const res = await fetch('/api/query-intelligence/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, dateFrom, dateTo, domain, queries: queryRows, pages: pageRows }),
      })

      const data = await res.json()
      if (!res.ok) { setUploadError(data.error ?? 'Analysis failed.'); setUploading(false); return }

      setAnalysis(data.analysis)
      setCurrentRunId(data.runId)
      setCurrentDateRange({ from: dateFrom, to: dateTo })
      setRuns(prev => [{
        id: data.runId,
        fetched_at: new Date().toISOString(),
        row_count: data.rowCount,
        status: 'complete',
        date_from: dateFrom,
        date_to: dateTo,
        source: 'upload',
      }, ...prev])
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
      const res = await fetch('/api/query-intelligence/analyse', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId, siteId }),
      })
      const data = await res.json()
      if (res.ok) { setAnalysis(data.analysis); setCurrentRunId(runId) }
      else setUploadError(data.error ?? 'Failed to load analysis.')
    } catch { setUploadError('Network error loading run.') }
  }

  const tabs: TabDef[] = [
    { id: 'overview',        label: 'Overview',          color: C.accent,   count: undefined },
    { id: 'quick_wins',      label: 'Quick Wins',        color: C.accent,   count: analysis?.quick_wins.length },
    { id: 'keyword_groups',  label: 'Keyword Groups',    color: C.purple,   count: analysis?.keyword_groups?.length,              hidden: !analysis?.keyword_groups },
    { id: 'ai_opps',         label: 'AI Opportunities',  color: '#EC4899',  count: analysis?.ai_opportunities?.length,            hidden: !analysis?.ai_opportunities },
    { id: 'content_map',     label: 'Content Map',       color: C.accent,   count: analysis?.content_map?.mapped_pages.length,    hidden: !analysis?.content_map },
    { id: 'ctr',             label: 'CTR Optimizer',     color: C.amber,    count: analysis?.ctr_opportunities.length },
    { id: 'gaps',            label: 'Content Gaps',      color: C.purple,   count: analysis?.content_gaps.length },
    { id: 'snippets',        label: 'Featured Snippets', color: '#818CF8',  count: analysis?.featured_snippets.length },
    { id: 'longtail',        label: 'Long-tail',         color: C.orange,   count: analysis?.long_tail.length },
    { id: 'performers',      label: 'Top Performers',    color: C.green,    count: analysis?.top_performers.length },
    { id: 'clusters',        label: 'Topic Clusters',    color: C.purple,   count: analysis?.topic_clusters.length },
    { id: 'comparison',      label: 'Comparison',        color: C.amber,    count: analysis?.comparison?.summary.total_improved,  hidden: !analysis?.meta.has_comparison },
    { id: 'pages',           label: 'Pages',             color: C.muted,    count: analysis?.pages?.length,                       hidden: !analysis?.meta.has_pages },
  ]

  const currentRun = runs.find(r => r.id === currentRunId)

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <p style={{ fontSize: '0.67rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.accent, margin: '0 0 0.2rem' }}>Query Intelligence</p>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: C.text, margin: '0 0 0.2rem', letterSpacing: '-0.02em' }}>{domain}</h1>
          {analysis && currentRun?.date_from && currentRun.date_to ? (
            <p style={{ fontSize: '0.8125rem', color: C.muted, margin: 0 }}>
              {fmtDate(currentRun.date_from)} – {fmtDate(currentRun.date_to)}
              {analysis.meta.has_comparison && <span style={{ color: C.amber, marginLeft: '0.5rem' }}>· with comparison</span>}
            </p>
          ) : (
            <p style={{ fontSize: '0.8125rem', color: C.muted, margin: 0 }}>Upload GSC exports to analyse your search performance</p>
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
          <SectionHeader title="Upload GSC Exports" />
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Date range */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: C.muted, margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Date Range</p>
                {datesAutoDetected && (
                  <button onClick={() => setShowDatePicker(v => !v)} style={{ fontSize: '0.72rem', color: C.accent, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    {showDatePicker ? 'Hide picker' : 'Edit dates'}
                  </button>
                )}
              </div>
              {datesAutoDetected && !showDatePicker ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem 0.875rem', borderRadius: '0.5rem', backgroundColor: C.accentFaint, border: `1px solid ${C.borderAccent}` }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2.5" aria-hidden><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: C.accent }}>{fmtDate(dateFrom)} – {fmtDate(dateTo)}</span>
                  <span style={{ fontSize: '0.72rem', color: C.muted }}>auto-detected from filename</span>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                    {DATE_PRESETS.map(p => (
                      <button key={p.label} onClick={() => applyPreset(p)} style={{ padding: '0.35rem 0.75rem', borderRadius: '0.4rem', fontSize: '0.78rem', fontWeight: 600, color: activePreset === p.label ? C.bg : C.muted, backgroundColor: activePreset === p.label ? C.accent : 'rgba(255,255,255,0.05)', border: `1px solid ${activePreset === p.label ? C.accent : C.border}`, cursor: 'pointer' }}>
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
                </>
              )}
            </div>

            {/* File uploads */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '0.875rem' }}>
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, color: C.text, margin: '0 0 0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Queries CSV <span style={{ color: C.red }}>*</span></p>
                <p style={{ fontSize: '0.75rem', color: C.muted, margin: '0 0 0.625rem' }}>GSC → Performance → Queries tab → Export. Comparison exports (dual columns) are auto-detected.</p>
                <DropZone label="Drop Queries CSV here" sub="or click to browse" file={queriesFile} onFile={handleQueriesFile} />
              </div>
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, color: C.text, margin: '0 0 0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pages CSV <span style={{ color: C.muted }}>(optional)</span></p>
                <p style={{ fontSize: '0.75rem', color: C.muted, margin: '0 0 0.625rem' }}>GSC → Performance → Pages tab → Export. Used to map queries to landing pages.</p>
                <DropZone label="Drop Pages CSV here" sub="or click to browse" file={pagesFile} onFile={handlePagesFile} />
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '0.75rem' }}>
            {[
              { label: 'Queries',     value: fmtNum(analysis.meta.total_queries),    accent: true },
              { label: 'Impressions', value: fmtNum(analysis.meta.total_impressions) },
              { label: 'Clicks',      value: fmtNum(analysis.meta.total_clicks)      },
              { label: 'Avg CTR',     value: fmtPct(analysis.meta.avg_ctr),          accent: true },
              { label: 'Avg Position', value: Number(analysis.meta.avg_position).toFixed(1) },
              { label: 'Quick Wins',  value: String(analysis.quick_wins.length),     accent: true },
            ].map(it => (
              <div key={it.label} style={{ backgroundColor: C.card, border: `1px solid ${it.accent ? C.borderAccent : C.border}`, borderRadius: '0.75rem', padding: '0.875rem 1rem' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted, margin: '0 0 0.25rem' }}>{it.label}</p>
                <p style={{ fontSize: '1.375rem', fontWeight: 800, color: it.accent ? C.accent : C.text, margin: 0, letterSpacing: '-0.03em' }}>{it.value}</p>
              </div>
            ))}
          </div>

          {/* Tabbed panel */}
          <Card>
            <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />
            <div>
              {activeTab === 'overview'       && <OverviewPanel      analysis={analysis} />}
              {activeTab === 'quick_wins'     && <QuickWinsPanel     items={analysis.quick_wins} />}
              {activeTab === 'keyword_groups' && analysis.keyword_groups   && <KeywordGroupsPanel items={analysis.keyword_groups} />}
              {activeTab === 'ai_opps'        && analysis.ai_opportunities && <AiOppsPanel        items={analysis.ai_opportunities} />}
              {activeTab === 'content_map'    && analysis.content_map      && <ContentMapPanel    data={analysis.content_map} />}
              {activeTab === 'ctr'            && <CTRPanel           items={analysis.ctr_opportunities} />}
              {activeTab === 'gaps'           && <ContentGapsPanel   items={analysis.content_gaps} />}
              {activeTab === 'snippets'       && <SnippetsPanel      items={analysis.featured_snippets} />}
              {activeTab === 'longtail'       && <LongTailPanel      items={analysis.long_tail} />}
              {activeTab === 'performers'     && <PerformersPanel    items={analysis.top_performers} />}
              {activeTab === 'clusters'       && <ClustersPanel      items={analysis.topic_clusters} />}
              {activeTab === 'comparison'     && analysis.comparison        && <ComparisonPanel   data={analysis.comparison} />}
              {activeTab === 'pages'          && analysis.pages             && <PagesPanel        items={analysis.pages} />}
            </div>
          </Card>
        </>
      )}

      {/* Previous runs */}
      <PreviousRuns runs={runs} currentRunId={currentRunId} onLoad={handleLoadRun} />

      <style>{`
        @keyframes qi-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
