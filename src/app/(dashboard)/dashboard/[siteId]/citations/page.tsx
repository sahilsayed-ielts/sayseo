import { redirect } from 'next/navigation'
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

type CheckFallback = {
  total: number
  mentioned: number
  lastChecked: string | null
}

function PlatformBreakdown({
  summaries,
  unavailablePlatforms,
  checksFallback,
}: {
  summaries: Array<{
    platform: string
    mention_count: number
    total_checks: number
    last_checked: string
  }>
  unavailablePlatforms: Set<string>
  checksFallback: Record<string, CheckFallback>
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
          const fallback = checksFallback[platform]
          const isUnavailable = unavailablePlatforms.has(platform)

          // Prefer citation_summary; fall back to citation_checks derived stats
          const mentionCount = s?.mention_count ?? fallback?.mentioned ?? 0
          const totalChecks = s?.total_checks ?? fallback?.total ?? 0
          const lastCheckedIso = s?.last_checked ?? fallback?.lastChecked ?? null
          const rate = totalChecks > 0
            ? ((mentionCount / totalChecks) * 100).toFixed(1)
            : '0.0'

          // hasData = true if we have any row-level evidence of a run
          const hasData = !!s || (fallback?.lastChecked != null)

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
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>
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
                    <strong style={{ color: '#00D4AA' }}>{mentionCount}</strong>{' '}
                    / {totalChecks} checks
                  </span>
                  <span>
                    <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{rate}%</strong> mention rate
                  </span>
                  {lastCheckedIso && (
                    <span>Last checked {timeAgo(lastCheckedIso)}</span>
                  )}
                </div>
              ) : (
                <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.25)' }}>
                  Not yet checked
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
  const _hidden = true as boolean
  if (_hidden) redirect(`/dashboard/${siteId}`)
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
      .limit(150),
    supabase
      .from('citation_summary')
      .select('platform, mention_count, total_checks, last_checked')
      .eq('site_id', siteId),
  ])

  const checks = (checksResult.data ?? []) as Array<{ id: string; query: string; platform: string; domain_mentioned: boolean; response_snippet: string | null; checked_at: string }>
  const summaries = (summaryResult.data ?? []) as Array<{ platform: string; mention_count: number; total_checks: number; last_checked: string }>

  // Per-platform fallback stats derived from citation_checks rows
  // Used when citation_summary has no row for a platform (e.g. all checks errored)
  const checksFallback: Record<string, { total: number; mentioned: number; lastChecked: string | null }> = {}
  for (const check of checks) {
    if (!checksFallback[check.platform]) {
      checksFallback[check.platform] = { total: 0, mentioned: 0, lastChecked: null }
    }
    const isError = check.response_snippet === 'Check unavailable'
    if (!isError) {
      checksFallback[check.platform].total++
      if (check.domain_mentioned) checksFallback[check.platform].mentioned++
    }
    // checks are sorted desc — first occurrence per platform = most recent checked_at
    if (!checksFallback[check.platform].lastChecked) {
      checksFallback[check.platform].lastChecked = check.checked_at
    }
  }

  // Platforms that have citation_checks rows but no citation_summary row
  const platformsWithSummary = new Set(summaries.map((s) => s.platform))
  const unavailablePlatforms = new Set(
    Object.keys(checksFallback).filter((p) => !platformsWithSummary.has(p))
  )

  // Issue 1 fix: count platforms with ANY citation_checks row, not just summary rows
  const platformsChecked = new Set(checks.map((c) => c.platform)).size

  const totalMentioned = summaries.reduce((acc, s) => acc + s.mention_count, 0)
  const totalChecked = summaries.reduce((acc, s) => acc + s.total_checks, 0)
  const overallRate = totalChecked > 0
    ? ((totalMentioned / totalChecked) * 100).toFixed(1)
    : '0.0'

  // Per-platform last-checked for run buttons — prefer summary, fall back to checks
  const platformLastChecked: Record<string, string | null> = {
    claude: summaries.find((s) => s.platform === 'claude')?.last_checked ?? checksFallback['claude']?.lastChecked ?? null,
    chatgpt: summaries.find((s) => s.platform === 'chatgpt')?.last_checked ?? checksFallback['chatgpt']?.lastChecked ?? null,
    gemini: summaries.find((s) => s.platform === 'gemini')?.last_checked ?? checksFallback['gemini']?.lastChecked ?? null,
  }

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

      {/* Run buttons */}
      <CitationRunButton
        siteId={siteId}
        domain={site.domain}
        platformLastChecked={platformLastChecked}
      />

      {/* Platform breakdown */}
      <PlatformBreakdown
        summaries={summaries}
        unavailablePlatforms={unavailablePlatforms}
        checksFallback={checksFallback}
      />

      {/* Query results table */}
      <CitationChecksTable checks={checks.slice(0, 30)} />
    </div>
  )
}
