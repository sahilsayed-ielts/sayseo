import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CitationRunButton from '@/components/dashboard/CitationRunButton'
import CitationChecksTable from '@/components/dashboard/CitationChecksTable'

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_PLATFORMS = ['claude', 'chatgpt', 'gemini'] as const
type Platform = (typeof ALL_PLATFORMS)[number]

const PLATFORM_LABELS: Record<Platform, string> = {
  claude: 'Claude',
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
}

const PLATFORM_COLORS: Record<Platform, string> = {
  claude: '#E07B54',
  chatgpt: '#10A37F',
  gemini: '#4285F4',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days !== 1 ? 's' : ''} ago`
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      style={{
        backgroundColor: '#111',
        border: `1px solid ${accent ? 'rgba(0,212,170,0.2)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '0.75rem',
        padding: '1.25rem',
      }}
    >
      <p
        style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.4)',
          margin: '0 0 0.5rem',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: '2rem',
          fontWeight: 800,
          color: accent ? '#00D4AA' : '#fff',
          margin: 0,
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
      >
        {value}
      </p>
    </div>
  )
}

// ─── Platform breakdown ───────────────────────────────────────────────────────

function PlatformBreakdown({
  summaries,
  unavailablePlatforms,
}: {
  summaries: Array<{
    platform: string
    mention_count: number
    total_checks: number
    last_checked: string
  }>
  unavailablePlatforms: Set<string>
}) {
  const summaryMap = new Map(summaries.map((s) => [s.platform, s]))

  return (
    <div
      style={{
        backgroundColor: '#111',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '0.75rem',
        padding: '1.25rem',
        marginBottom: '1.5rem',
      }}
    >
      <h2
        style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.45)',
          margin: '0 0 1rem',
        }}
      >
        Platform Breakdown
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {ALL_PLATFORMS.map((platform) => {
          const s = summaryMap.get(platform)
          const rate = s && s.total_checks > 0
            ? ((s.mention_count / s.total_checks) * 100).toFixed(1)
            : '0.0'
          const isUnavailable = unavailablePlatforms.has(platform)
          const hasData = !!s

          return (
            <div
              key={platform}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: isUnavailable
                      ? 'rgba(255,255,255,0.2)'
                      : PLATFORM_COLORS[platform],
                    flexShrink: 0,
                    display: 'inline-block',
                  }}
                />
                <span
                  style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}
                >
                  {PLATFORM_LABELS[platform]}
                </span>
                {isUnavailable && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '0.25rem',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: 'rgba(255,255,255,0.3)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Unavailable
                  </span>
                )}
              </div>

              {hasData ? (
                <div
                  style={{
                    display: 'flex',
                    gap: '1.5rem',
                    fontSize: '0.8125rem',
                    color: 'rgba(255,255,255,0.5)',
                    flexWrap: 'wrap',
                  }}
                >
                  <span>
                    <strong style={{ color: '#00D4AA' }}>{s!.mention_count}</strong>{' '}
                    / {s!.total_checks} checks
                  </span>
                  <span>
                    <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{rate}%</strong> mention rate
                  </span>
                  <span>Last checked {timeAgo(s!.last_checked)}</span>
                </div>
              ) : (
                <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.25)' }}>
                  {isUnavailable ? 'Check failed' : 'Not yet checked'}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CitationsPage({
  params,
}: {
  params: Promise<{ siteId: string }>
}) {
  const { siteId } = await params
  const supabase = await createClient()

  const { data: site } = await supabase
    .from('connected_sites')
    .select('id, domain')
    .eq('id', siteId)
    .single()

  if (!site) notFound()

  const [checksResult, summaryResult] = await Promise.all([
    supabase
      .from('citation_checks')
      .select('id, query, platform, domain_mentioned, response_snippet, checked_at')
      .eq('site_id', siteId)
      .order('checked_at', { ascending: false })
      .limit(50),
    supabase
      .from('citation_summary')
      .select('platform, mention_count, total_checks, last_checked')
      .eq('site_id', siteId),
  ])

  const checks = checksResult.data ?? []
  const summaries = summaryResult.data ?? []

  // Platforms that have checks but no summary row had consistent failures
  const platformsWithChecks = new Set(checks.map((c) => c.platform))
  const platformsWithSummary = new Set(summaries.map((s) => s.platform))
  const unavailablePlatforms = new Set(
    ALL_PLATFORMS.filter((p) => platformsWithChecks.has(p) && !platformsWithSummary.has(p))
  )

  const totalMentioned = summaries.reduce((acc, s) => acc + s.mention_count, 0)
  const totalChecked = summaries.reduce((acc, s) => acc + s.total_checks, 0)
  const overallRate = totalChecked > 0
    ? ((totalMentioned / totalChecked) * 100).toFixed(1)
    : '0.0'
  const platformsChecked = summaries.length

  const lastChecked =
    summaries.length > 0
      ? new Date(Math.max(...summaries.map((s) => new Date(s.last_checked).getTime())))
      : null
  const canRun =
    !lastChecked || Date.now() - lastChecked.getTime() > 1 * 60 * 60 * 1000

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Page header */}
      <div style={{ marginBottom: '2rem' }}>
        <p
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: '#00D4AA',
            margin: '0 0 0.2rem',
          }}
        >
          Citation Monitor
        </p>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#fff',
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          {site.domain}
        </h1>
      </div>

      {/* Summary cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <StatCard label="Total Mentions" value={String(totalMentioned)} accent />
        <StatCard label="Overall Mention Rate" value={`${overallRate}%`} />
        <StatCard label="Platforms Checked" value={`${platformsChecked} / 3`} />
      </div>

      {/* Run button */}
      <CitationRunButton
        siteId={siteId}
        domain={site.domain}
        disabled={!canRun}
        lastChecked={lastChecked?.toISOString() ?? null}
      />

      {/* Platform breakdown */}
      <PlatformBreakdown summaries={summaries} unavailablePlatforms={unavailablePlatforms} />

      {/* Query results table */}
      <CitationChecksTable checks={checks.slice(0, 30)} />
    </div>
  )
}
