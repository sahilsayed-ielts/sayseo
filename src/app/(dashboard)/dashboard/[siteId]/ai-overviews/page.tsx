import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getOAuthClient } from '@/lib/google-clients'
import { google } from 'googleapis'
import AIORunButton from '@/components/dashboard/AIORunButton'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AIOCheck {
  id: string
  query: string
  aio_triggered: boolean
  domain_cited: boolean
  citation_position: number | null
  citation_url: string | null
  checked_at: string
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub?: string
  accent?: boolean
}) {
  return (
    <div
      style={{
        backgroundColor: '#111',
        border: `1px solid ${accent ? 'rgba(0,212,170,0.2)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '0.75rem',
        padding: '1.25rem',
      }}
    >
      <p style={{
        fontSize: '0.7rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'rgba(255,255,255,0.4)',
        margin: '0 0 0.5rem',
      }}>
        {label}
      </p>
      <p style={{
        fontSize: '2rem',
        fontWeight: 800,
        color: accent ? '#00D4AA' : '#fff',
        margin: 0,
        letterSpacing: '-0.03em',
        lineHeight: 1,
      }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', margin: '0.4rem 0 0' }}>
          {sub}
        </p>
      )}
    </div>
  )
}

// ─── Badges ───────────────────────────────────────────────────────────────────

function Badge({ active, yes, no }: { active: boolean; yes: string; no: string }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.2rem 0.6rem',
      borderRadius: '0.375rem',
      fontSize: '0.75rem',
      fontWeight: 700,
      backgroundColor: active ? 'rgba(0,212,170,0.12)' : 'rgba(255,255,255,0.06)',
      color: active ? '#00D4AA' : 'rgba(255,255,255,0.35)',
      border: `1px solid ${active ? 'rgba(0,212,170,0.25)' : 'rgba(255,255,255,0.08)'}`,
    }}>
      {active ? yes : no}
    </span>
  )
}

// ─── Results table ────────────────────────────────────────────────────────────

function ResultsTable({ checks }: { checks: AIOCheck[] }) {
  if (checks.length === 0) {
    return (
      <div style={{
        backgroundColor: '#111',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '0.75rem',
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" style={{ marginBottom: '1rem' }} aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', margin: '0 0 0.5rem' }}>
          No checks run yet
        </p>
        <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
          Click &ldquo;Run Check&rdquo; to scan your top keywords for AI Overview appearances.
        </p>
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: '#111',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '0.75rem',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <h2 style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.45)',
          margin: 0,
        }}>
          Query Results
        </h2>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Query', 'AIO Triggered', 'Domain Cited', 'Position', 'Cited URL', 'Checked At'].map((h) => (
                <th key={h} style={{
                  padding: '0.625rem 1.25rem',
                  textAlign: 'left',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'rgba(255,255,255,0.35)',
                  whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {checks.map((check, i) => {
              const relativeTime = formatRelative(check.checked_at)
              const truncatedUrl = check.citation_url
                ? check.citation_url.replace(/^https?:\/\//, '').slice(0, 40) +
                  (check.citation_url.replace(/^https?:\/\//, '').length > 40 ? '…' : '')
                : null

              return (
                <tr
                  key={check.id}
                  style={{ borderBottom: i < checks.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                >
                  <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.8125rem', color: '#fff', fontWeight: 500, maxWidth: 220 }}>
                    {check.query}
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem' }}>
                    <Badge active={check.aio_triggered} yes="Yes" no="No" />
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem' }}>
                    {check.aio_triggered
                      ? <Badge active={check.domain_cited} yes="Cited" no="—" />
                      : <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.2)' }}>—</span>
                    }
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.8125rem', color: check.citation_position ? '#fff' : 'rgba(255,255,255,0.2)' }}>
                    {check.citation_position ?? '—'}
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem', maxWidth: 200 }}>
                    {truncatedUrl ? (
                      <a
                        href={check.citation_url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={check.citation_url!}
                        style={{ fontSize: '0.8125rem', color: '#00D4AA', textDecoration: 'none' }}
                      >
                        {truncatedUrl}
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.2)' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>
                    {relativeTime}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Relative time helper ────────────────────────────────────────────────────

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AIOPage({
  params,
}: {
  params: Promise<{ siteId: string }>
}) {
  const { siteId } = await params
  const supabase = await createClient()

  const { data: site } = await supabase
    .from('connected_sites')
    .select('id, domain, gsc_site_url')
    .eq('id', siteId)
    .single()

  if (!site) notFound()

  const admin = createAdminClient()

  const [checksResult, summaryResult] = await Promise.all([
    admin
      .from('aio_checks')
      .select('id, query, aio_triggered, domain_cited, citation_position, citation_url, checked_at')
      .eq('site_id', siteId)
      .order('checked_at', { ascending: false })
      .limit(50),
    admin
      .from('aio_summary')
      .select('queries_checked, aio_triggers, domain_citations, last_checked')
      .eq('site_id', siteId)
      .maybeSingle(),
  ])

  const checks: AIOCheck[] = checksResult.data ?? []
  const summary = summaryResult.data

  // Metric derived values
  const queriesChecked = summary?.queries_checked ?? 0
  const aioTriggers = summary?.aio_triggers ?? 0
  const domainCitations = summary?.domain_citations ?? 0

  const aioRate = queriesChecked > 0
    ? `${((aioTriggers / queriesChecked) * 100).toFixed(0)}% of checked`
    : undefined
  const citedRate = aioTriggers > 0
    ? `${((domainCitations / aioTriggers) * 100).toFixed(0)}% of triggered`
    : undefined

  // Average citation position
  const positionedChecks = checks.filter((c) => c.citation_position !== null)
  const avgPosition = positionedChecks.length > 0
    ? (positionedChecks.reduce((acc, c) => acc + c.citation_position!, 0) / positionedChecks.length).toFixed(1)
    : null

  // Fetch top GSC queries to pass to the run button
  let gscQueries: string[] = []
  if (site.gsc_site_url) {
    try {
      const auth = await getOAuthClient(siteId, ['gsc', 'ga4'])
      const searchconsole = google.searchconsole({ version: 'v1', auth })
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
      const fmt = (d: Date) => d.toISOString().split('T')[0]

      const gscRes = await searchconsole.searchanalytics.query({
        siteUrl: site.gsc_site_url,
        requestBody: {
          startDate: fmt(startDate),
          endDate: fmt(endDate),
          dimensions: ['query'],
          rowLimit: 20,
          type: 'web',
        },
      })
      gscQueries = (gscRes.data.rows ?? [])
        .map((row) => row.keys?.[0] ?? '')
        .filter(Boolean)
    } catch (err) {
      console.error('[aio-page] GSC fetch error:', err)
    }
  }

  // 24h cooldown check
  const lastChecked = summary?.last_checked ?? null
  const canRun = !lastChecked || Date.now() - new Date(lastChecked).getTime() > 23 * 60 * 60 * 1000

  // Only show trend placeholder after first check
  const hasChecked = queriesChecked > 0

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Page header */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: '#00D4AA',
          margin: '0 0 0.2rem',
        }}>
          AI Overview Tracker
        </p>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 800,
          color: '#fff',
          margin: 0,
          letterSpacing: '-0.02em',
        }}>
          {site.domain}
        </h1>
      </div>

      {/* Metric cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        <StatCard label="Queries Checked" value={String(queriesChecked)} />
        <StatCard label="AI Overviews Triggered" value={String(aioTriggers)} sub={aioRate} accent />
        <StatCard label="Domain Cited" value={String(domainCitations)} sub={citedRate} accent />
        <StatCard label="Avg Citation Position" value={avgPosition ? `Position ${avgPosition}` : '—'} />
      </div>

      {/* Run button */}
      <AIORunButton
        siteId={siteId}
        domain={site.domain}
        queries={gscQueries}
        disabled={!canRun || gscQueries.length === 0}
        lastChecked={lastChecked}
      />

      {gscQueries.length === 0 && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '0.75rem 1rem',
          borderRadius: '0.5rem',
          backgroundColor: 'rgba(251,191,36,0.07)',
          border: '1px solid rgba(251,191,36,0.2)',
          fontSize: '0.8125rem',
          color: 'rgba(251,191,36,0.8)',
        }}>
          No GSC queries available — connect Google Search Console to enable AI Overview checks.
        </div>
      )}

      {/* Trend placeholder (shown after first check) */}
      {hasChecked && (
        <div style={{
          backgroundColor: '#111',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <div style={{
            flexShrink: 0,
            width: 36,
            height: 36,
            borderRadius: '0.5rem',
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.75" aria-hidden="true">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', margin: '0 0 0.2rem' }}>
              Trend tracking
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
              Trend tracking will appear after your second check.
            </p>
          </div>
        </div>
      )}

      {/* Results table */}
      <ResultsTable checks={checks} />
    </div>
  )
}
