'use client'

import { use, useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface CompetitorRow {
  id: string
  competitor_domain: string
  last_checked: string | null
  latestScore: {
    ai_score: number
    citation_rate: number
    aio_rate: number
  } | null
}

interface YourSiteData {
  score: number | null
  citation_rate: number
  aio_rate: number
}

function ScoreBadge({ value, suffix = '' }: { value: number | null; suffix?: string }) {
  if (value === null) return <span className="text-white/25">—</span>
  const color = value >= 70 ? '#00D4AA' : value >= 40 ? '#fbbf24' : '#f87171'
  return <span style={{ color, fontWeight: 700 }}>{Math.round(value)}{suffix}</span>
}

function cleanDomain(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .toLowerCase()
}

async function callCompetitorCheck(
  siteId: string,
  domain: string
): Promise<{ ok: boolean; error: string | null }> {
  const cleanedDomain = cleanDomain(domain)
  let res: Response
  try {
    res = await fetch('/api/competitor-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteId, competitorDomain: cleanedDomain }),
    })
  } catch (networkErr) {
    console.error(`[competitor-check] network error for "${domain}":`, networkErr)
    return { ok: false, error: 'Network error — check your connection and try again.' }
  }

  if (!res.ok) {
    let errorMsg: string
    try {
      const data = await res.json()
      errorMsg = data.error ?? `HTTP ${res.status}: ${res.statusText}`
    } catch {
      errorMsg = `HTTP ${res.status}: ${res.statusText}`
    }
    console.error(`[competitor-check] "${domain}" failed — ${res.status}:`, errorMsg)
    return { ok: false, error: errorMsg }
  }

  const data = await res.json()
  console.log(`[competitor-check] "${domain}" ok:`, data)
  return { ok: true, error: null }
}

export default function CompetitorsPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params)
  // Memoize so the same instance is used across renders — prevents useCallback/useEffect churn
  const supabase = useMemo(() => createClient(), [])

  const [domains, setDomains] = useState<[string, string, string]>(['', '', ''])
  const [domainErrors, setDomainErrors] = useState<[string | null, string | null, string | null]>([null, null, null])
  const [competitors, setCompetitors] = useState<CompetitorRow[]>([])
  const [yourSite, setYourSite] = useState<YourSiteData | null>(null)
  const [siteDomain, setSiteDomain] = useState('')
  const [running, setRunning] = useState(false)
  const [checkingId, setCheckingId] = useState<string | null>(null)
  const [checkError, setCheckError] = useState<string | null>(null)
  const [allFailed, setAllFailed] = useState(false)

  const fetchCompetitors = useCallback(async () => {
    // competitor_sites has no created_at column — order by id instead
    const { data, error: sitesErr } = await supabase
      .from('competitor_sites')
      .select('id, competitor_domain, last_checked')
      .eq('site_id', siteId)
      .order('id', { ascending: true })

    if (sitesErr) {
      console.error('[fetchCompetitors] competitor_sites query error:', sitesErr)
      return
    }
    if (!data) return

    console.log('[fetchCompetitors] competitor_sites rows:', data.length, data)

    const rows: CompetitorRow[] = await Promise.all(
      data.map(async (cs) => {
        // competitor_scores uses checked_at, not created_at
        const { data: scoreRow, error: scoreErr } = await supabase
          .from('competitor_scores')
          .select('ai_score, citation_rate, aio_rate')
          .eq('competitor_site_id', cs.id)
          .order('checked_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (scoreErr) {
          console.error(`[fetchCompetitors] competitor_scores error for ${cs.competitor_domain}:`, scoreErr)
        }
        console.log(`[fetchCompetitors] score for ${cs.competitor_domain}:`, scoreRow)

        return {
          id: cs.id,
          competitor_domain: cs.competitor_domain,
          last_checked: cs.last_checked,
          latestScore: scoreRow ?? null,
        }
      })
    )

    console.log('[fetchCompetitors] final rows:', rows)
    setCompetitors(rows)

    // Pre-fill domain inputs with existing competitors (only on initial load, not mid-run)
    setDomains((prev) => {
      const filled: [string, string, string] = [...prev] as [string, string, string]
      rows.slice(0, 3).forEach((r, i) => {
        if (!filled[i]) filled[i] = r.competitor_domain
      })
      return filled
    })
  }, [siteId, supabase])

  useEffect(() => {
    const init = async () => {
      const { data: site } = await supabase
        .from('connected_sites')
        .select('domain')
        .eq('id', siteId)
        .single()
      if (site) setSiteDomain(site.domain)

      const { data: scoreRow } = await supabase
        .from('visibility_scores')
        .select('score, module2_score, module3_score')
        .eq('site_id', siteId)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (scoreRow) {
        setYourSite({
          score: scoreRow.score,
          citation_rate: scoreRow.module2_score != null ? (scoreRow.module2_score / 33) * 100 : 0,
          aio_rate: scoreRow.module3_score != null ? (scoreRow.module3_score / 34) * 100 : 0,
        })
      } else {
        setYourSite({ score: null, citation_rate: 0, aio_rate: 0 })
      }

      await fetchCompetitors()
    }
    init()
  }, [siteId, supabase, fetchCompetitors])

  const handleRunComparison = async () => {
    const toRun = domains.map((d, i) => ({ domain: cleanDomain(d), index: i })).filter((x) => x.domain)
    if (toRun.length === 0) {
      setDomainErrors(['Enter a domain.', null, null])
      return
    }

    setRunning(true)
    setDomainErrors([null, null, null])
    setAllFailed(false)

    const errors: [string | null, string | null, string | null] = [null, null, null]
    let failCount = 0

    for (const { domain, index } of toRun) {
      const { ok, error } = await callCompetitorCheck(siteId, domain)
      if (!ok) {
        errors[index] = error
        failCount++
      }
    }

    await fetchCompetitors()
    setRunning(false)
    setDomainErrors(errors)
    setAllFailed(failCount === toRun.length && toRun.length > 0)
  }

  const handleCheckOne = async (comp: CompetitorRow) => {
    setCheckingId(comp.id)
    setCheckError(null)
    const { ok, error } = await callCompetitorCheck(siteId, comp.competitor_domain)
    await fetchCompetitors()
    setCheckingId(null)
    if (!ok) setCheckError(`Check failed for ${comp.competitor_domain}: ${error}`)
  }

  // Show table whenever we have your-site data OR any competitor rows (scored or not)
  const showTable = yourSite !== null || competitors.length > 0

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Back link */}
      <Link
        href={`/dashboard/${siteId}`}
        className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors mb-8"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to dashboard
      </Link>

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#00D4AA] mb-1">Intelligence</p>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Competitor Compare</h1>
        <p className="mt-1 text-sm text-white/40">See how your AI visibility stacks up against competitors.</p>
      </div>

      {/* Domain inputs */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Competitor Domains</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {([0, 1, 2] as const).map((i) => (
            <div key={i}>
              <input
                type="text"
                value={domains[i]}
                onChange={(e) => {
                  const next: [string, string, string] = [...domains] as [string, string, string]
                  next[i] = e.target.value
                  setDomains(next)
                  // Clear error when user edits
                  const errs: [string | null, string | null, string | null] = [...domainErrors] as [string | null, string | null, string | null]
                  errs[i] = null
                  setDomainErrors(errs)
                }}
                placeholder={`competitor${i + 1}.com`}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#00D4AA]/50 transition-colors"
                style={domainErrors[i] ? { borderColor: 'rgba(248,113,113,0.5)' } : undefined}
              />
              {domainErrors[i] && (
                <p className="mt-1 text-xs text-red-400 leading-tight">{domainErrors[i]}</p>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={handleRunComparison}
          disabled={running}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#00D4AA] text-black hover:bg-[#00D4AA]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {running ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity={0.25} />
                <path opacity={0.75} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Running…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Run Comparison
            </>
          )}
        </button>
      </div>

      {/* All-failed banner */}
      {allFailed && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-400 font-semibold mb-1">All competitor checks failed</p>
          <p className="text-xs text-red-400/70">The most common cause is that the AI traffic report hasn&apos;t been loaded yet. Go to the Overview tab, wait for the report to finish loading, then come back and try again.</p>
        </div>
      )}

      {/* Comparison table */}
      {showTable && (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          {checkError && (
            <div className="px-5 py-3 border-b border-white/5 bg-red-500/10">
              <p className="text-xs text-red-400">{checkError}</p>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-white/30">Domain</th>
                  <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-widest text-white/30">AI Score</th>
                  <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-widest text-white/30">Citation Rate</th>
                  <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-widest text-white/30">AIO Rate</th>
                  <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-widest text-white/30">Last Checked</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {/* Your site row */}
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,212,170,0.04)' }}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#00D4AA]/15 text-[#00D4AA]">YOU</span>
                      <span className="text-white font-semibold">{siteDomain || '—'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <ScoreBadge value={yourSite?.score ?? null} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <ScoreBadge value={yourSite ? yourSite.citation_rate : null} suffix="%" />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <ScoreBadge value={yourSite ? yourSite.aio_rate : null} suffix="%" />
                  </td>
                  <td className="px-5 py-4 text-right text-white/30 text-xs">—</td>
                  <td className="px-5 py-4" />
                </tr>

                {/* Competitor rows */}
                {competitors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-white/30 text-sm">
                      Enter competitor domains above and click Run Comparison.
                    </td>
                  </tr>
                ) : (
                  competitors.map((comp) => (
                    <tr key={comp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td className="px-5 py-4 text-white/70 font-medium">{comp.competitor_domain}</td>
                      <td className="px-5 py-4 text-right">
                        <ScoreBadge value={comp.latestScore?.ai_score ?? null} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <ScoreBadge value={comp.latestScore?.citation_rate ?? null} suffix="%" />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <ScoreBadge value={comp.latestScore?.aio_rate ?? null} suffix="%" />
                      </td>
                      <td className="px-5 py-4 text-right text-white/30 text-xs">
                        {comp.last_checked
                          ? new Date(comp.last_checked).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                          : <span className="text-white/20">Not yet checked</span>}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {!comp.latestScore && (
                          <button
                            onClick={() => handleCheckOne(comp)}
                            disabled={checkingId === comp.id}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold border border-white/10 text-white/50 hover:border-[#00D4AA]/40 hover:text-[#00D4AA] disabled:opacity-40 transition-colors"
                          >
                            {checkingId === comp.id ? (
                              <>
                                <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity={0.25} />
                                  <path opacity={0.75} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                Checking…
                              </>
                            ) : 'Check now'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Note */}
      <p className="mt-4 text-xs text-white/20 leading-relaxed">
        Competitor scores are estimated using AI Overview appearance rate (SerpAPI) and citation likelihood (Claude). They do not use the competitor&apos;s Google Analytics data.
      </p>
    </div>
  )
}
