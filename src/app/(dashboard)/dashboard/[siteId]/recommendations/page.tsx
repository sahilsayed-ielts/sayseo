'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Fix {
  id: string
  fix_text: string
  impact: 'High' | 'Medium' | 'Low'
  category: 'Technical' | 'Content' | 'Schema'
  detail: string
}

interface Gap {
  id: string
  topic: string
  ai_platforms: string[]
  opportunity_score: number
  suggested_title: string
}

interface Audit {
  id: string
  page_url: string
  schemas_present: string[]
  schemas_missing: string[]
  suggested_schema: Record<string, unknown> | null
}

interface Opportunity {
  id: string
  query_pattern: string
  page_type: string
  aio_likelihood: 'High' | 'Medium'
  suggested_slug: string
  suggested_title: string
}

// ─── Impact badge ─────────────────────────────────────────────────────────────

function ImpactBadge({ impact }: { impact: Fix['impact'] }) {
  const colours: Record<Fix['impact'], string> = {
    High:   'bg-red-500/15 text-red-400 border-red-500/20',
    Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    Low:    'bg-white/8 text-white/40 border-white/10',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${colours[impact]}`}>
      {impact}
    </span>
  )
}

// ─── Category badge ────────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: Fix['category'] }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border border-[#00D4AA]/30 text-[#00D4AA]/80">
      {category}
    </span>
  )
}

// ─── Opportunity score pill ───────────────────────────────────────────────────

function ScorePill({ score }: { score: number }) {
  const colour =
    score >= 8 ? 'bg-emerald-500/15 text-emerald-400' :
    score >= 5 ? 'bg-amber-500/15 text-amber-400' :
                 'bg-red-500/15 text-red-400'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${colour}`}>
      {score}/10
    </span>
  )
}

// ─── AIO likelihood pill ──────────────────────────────────────────────────────

function AIOPill({ likelihood }: { likelihood: string }) {
  if (likelihood === 'High') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-900/40 text-[#00D4AA] border border-[#00D4AA]/30">
        High
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-900/40 text-amber-400 border border-amber-400/30">
      Medium
    </span>
  )
}

// ─── Schema JSON modal ────────────────────────────────────────────────────────

function SchemaModal({ schema, onClose }: { schema: Record<string, unknown>; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#111] border border-white/10 rounded-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/8">
          <p className="text-sm font-bold text-white">Suggested Schema JSON-LD</p>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <pre className="p-5 text-xs text-[#00D4AA] font-mono overflow-auto max-h-96 leading-relaxed">
          {JSON.stringify(schema, null, 2)}
        </pre>
        <div className="px-5 py-3.5 border-t border-white/8 flex justify-end">
          <button
            onClick={() => navigator.clipboard.writeText(JSON.stringify(schema, null, 2))}
            className="px-4 py-2 text-xs font-semibold border border-white/20 text-white/70 rounded-lg hover:border-[#00D4AA] hover:text-[#00D4AA] transition-colors"
          >
            Copy JSON
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity={0.25} />
      <path opacity={0.75} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-16 text-center">
      <p className="text-sm text-white/30">{message}</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RecommendationsPage({
  params,
}: {
  params: Promise<{ siteId: string }>
}) {
  const { siteId } = use(params)
  const [activeTab, setActiveTab] = useState<'fixes' | 'gaps' | 'schema' | 'aio'>('fixes')

  // Fix List state
  const [fixes, setFixes] = useState<Fix[]>([])
  const [fixesLoading, setFixesLoading] = useState(false)
  const [fixesGenerating, setFixesGenerating] = useState(false)
  const [fixesError, setFixesError] = useState<string | null>(null)
  const [expandedFix, setExpandedFix] = useState<string | null>(null)

  // Content Gaps state
  const [gaps, setGaps] = useState<Gap[]>([])
  const [gapsLoading, setGapsLoading] = useState(false)
  const [gapsGenerating, setGapsGenerating] = useState(false)
  const [gapsError, setGapsError] = useState<string | null>(null)

  // Schema Audit state
  const [audits, setAudits] = useState<Audit[]>([])
  const [auditsLoading, setAuditsLoading] = useState(false)
  const [auditsGenerating, setAuditsGenerating] = useState(false)
  const [auditsError, setAuditsError] = useState<string | null>(null)
  const [modalSchema, setModalSchema] = useState<Record<string, unknown> | null>(null)

  // AIO Opportunities state
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(false)
  const [opportunitiesGenerating, setOpportunitiesGenerating] = useState(false)
  const [opportunitiesError, setOpportunitiesError] = useState<string | null>(null)
  const [insightSummary, setInsightSummary] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // ── Data loading ─────────────────────────────────────────────────────────

  useEffect(() => {
    const supabase = createClient()
    setFixesLoading(true)
    supabase
      .from('fix_list')
      .select('id, fix_text, impact, category, detail')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setFixes((data ?? []) as Fix[])
        setFixesLoading(false)
      })
  }, [siteId])

  useEffect(() => {
    if (activeTab !== 'gaps') return
    const supabase = createClient()
    setGapsLoading(true)
    supabase
      .from('content_gaps')
      .select('id, topic, ai_platforms, opportunity_score, suggested_title')
      .eq('site_id', siteId)
      .order('opportunity_score', { ascending: false })
      .then(({ data }) => {
        setGaps((data ?? []) as Gap[])
        setGapsLoading(false)
      })
  }, [siteId, activeTab])

  useEffect(() => {
    if (activeTab !== 'schema') return
    const supabase = createClient()
    setAuditsLoading(true)
    supabase
      .from('schema_audits')
      .select('id, page_url, schemas_present, schemas_missing, suggested_schema')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setAudits((data ?? []) as Audit[])
        setAuditsLoading(false)
      })
  }, [siteId, activeTab])

  useEffect(() => {
    if (activeTab !== 'aio') return
    const supabase = createClient()
    setOpportunitiesLoading(true)
    supabase
      .from('aio_opportunities')
      .select('id, query_pattern, page_type, aio_likelihood, suggested_slug, suggested_title')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOpportunities((data ?? []) as Opportunity[])
        setOpportunitiesLoading(false)
      })
  }, [siteId, activeTab])

  // ── Generate handlers ─────────────────────────────────────────────────────

  const generateFixes = async () => {
    setFixesGenerating(true)
    setFixesError(null)
    try {
      const res = await fetch(`/api/generate-fixes/${siteId}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setFixesError(data.error ?? 'Generation failed'); return }
      setFixes(data.fixes as Fix[])
    } catch {
      setFixesError('Network error. Please try again.')
    } finally {
      setFixesGenerating(false)
    }
  }

  const generateGaps = async () => {
    setGapsGenerating(true)
    setGapsError(null)
    try {
      const res = await fetch(`/api/content-gaps/${siteId}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setGapsError(data.error ?? 'Generation failed'); return }
      setGaps(data.gaps as Gap[])
    } catch {
      setGapsError('Network error. Please try again.')
    } finally {
      setGapsGenerating(false)
    }
  }

  const generateAudits = async () => {
    setAuditsGenerating(true)
    setAuditsError(null)
    try {
      const res = await fetch(`/api/schema-audit/${siteId}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setAuditsError(data.error ?? 'Generation failed'); return }
      setAudits(data.audits as Audit[])
    } catch {
      setAuditsError('Network error. Please try again.')
    } finally {
      setAuditsGenerating(false)
    }
  }

  const generateOpportunities = async () => {
    setOpportunitiesGenerating(true)
    setOpportunitiesError(null)
    setInsightSummary(null)
    try {
      const res = await fetch(`/api/aio-opportunities/${siteId}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setOpportunitiesError(data.error ?? 'Analysis failed'); return }
      setOpportunities(data.opportunities as Opportunity[])
      setInsightSummary(data.insight_summary ?? null)
    } catch {
      setOpportunitiesError('Network error. Please try again.')
    } finally {
      setOpportunitiesGenerating(false)
    }
  }

  const copyTitle = (opp: Opportunity) => {
    navigator.clipboard.writeText(opp.suggested_title).then(() => {
      setCopiedId(opp.id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  const impactOrder: Record<Fix['impact'], number> = { High: 0, Medium: 1, Low: 2 }
  const sortedFixes = [...fixes].sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact])

  const tabs = [
    { key: 'fixes',  label: 'Fix List' },
    { key: 'gaps',   label: 'Content Gaps' },
    { key: 'schema', label: 'Schema Audit' },
    { key: 'aio',    label: 'AIO Opportunities' },
  ] as const

  return (
    <>
      {modalSchema && (
        <SchemaModal schema={modalSchema} onClose={() => setModalSchema(null)} />
      )}

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

        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#00D4AA] mb-1">Intelligence Layer</p>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Recommendations</h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/8 mb-6 gap-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap ${
                activeTab === tab.key
                  ? 'text-[#00D4AA] border-[#00D4AA]'
                  : 'text-white/40 border-transparent hover:text-white/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB 1: Fix List ── */}
        {activeTab === 'fixes' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-white/40">
                {fixes.length > 0 ? `${fixes.length} fixes generated` : 'No fixes yet'}
              </p>
              <button
                onClick={generateFixes}
                disabled={fixesGenerating}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#00D4AA] text-black hover:bg-[#00D4AA]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {fixesGenerating ? <><Spinner /> Generating…</> : 'Generate Fixes'}
              </button>
            </div>
            {fixesError && <p className="text-sm text-red-400 mb-4">{fixesError}</p>}

            {fixesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-white/5 rounded-xl h-20" />
                ))}
              </div>
            ) : sortedFixes.length === 0 ? (
              <EmptyState message="Click Generate Fixes to analyse your site data with AI and get actionable SEO recommendations." />
            ) : (
              <div className="space-y-3">
                {sortedFixes.map((fix) => (
                  <div key={fix.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                        <ImpactBadge impact={fix.impact} />
                        <CategoryBadge category={fix.category} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white leading-snug">{fix.fix_text}</p>
                        {fix.detail && (
                          <button
                            onClick={() => setExpandedFix(expandedFix === fix.id ? null : fix.id)}
                            className="mt-1.5 text-xs text-[#00D4AA]/70 hover:text-[#00D4AA] transition-colors"
                          >
                            {expandedFix === fix.id ? 'Hide detail ↑' : 'Learn more ↓'}
                          </button>
                        )}
                        {expandedFix === fix.id && fix.detail && (
                          <p className="mt-2 text-xs text-white/40 leading-relaxed border-t border-white/8 pt-2">
                            {fix.detail}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: Content Gaps ── */}
        {activeTab === 'gaps' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-white/40">
                {gaps.length > 0 ? `${gaps.length} opportunities found` : 'No analysis yet'}
              </p>
              <button
                onClick={generateGaps}
                disabled={gapsGenerating}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#00D4AA] text-black hover:bg-[#00D4AA]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {gapsGenerating ? <><Spinner /> Analysing…</> : 'Analyse Gaps'}
              </button>
            </div>
            {gapsError && <p className="text-sm text-red-400 mb-4">{gapsError}</p>}

            {gapsLoading ? (
              <div className="animate-pulse space-y-2">
                {[1, 2, 3, 4].map((i) => <div key={i} className="bg-white/5 rounded-lg h-12" />)}
              </div>
            ) : gaps.length === 0 ? (
              <EmptyState message="Click Analyse Gaps to discover content topics that AI platforms discuss but your site doesn't cover." />
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/8">
                      {['Topic', 'AI Platforms', 'Opportunity', 'Suggested Title'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-white/30">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {gaps.map((gap, i) => (
                      <tr
                        key={gap.id}
                        className={`${i < gaps.length - 1 ? 'border-b border-white/5' : ''} hover:bg-white/5 transition-colors`}
                      >
                        <td className="px-4 py-3 font-medium text-white">{gap.topic}</td>
                        <td className="px-4 py-3 text-white/50">
                          {(gap.ai_platforms ?? []).join(', ')}
                        </td>
                        <td className="px-4 py-3">
                          <ScorePill score={gap.opportunity_score} />
                        </td>
                        <td className="px-4 py-3 text-white/60 max-w-xs">{gap.suggested_title}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: Schema Audit ── */}
        {activeTab === 'schema' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-white/40">
                {audits.length > 0 ? `${audits.length} pages audited` : 'No audit yet'}
              </p>
              <button
                onClick={generateAudits}
                disabled={auditsGenerating}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#00D4AA] text-black hover:bg-[#00D4AA]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {auditsGenerating ? <><Spinner /> Auditing…</> : 'Run Audit'}
              </button>
            </div>
            {auditsError && <p className="text-sm text-red-400 mb-4">{auditsError}</p>}

            {auditsLoading ? (
              <div className="animate-pulse space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="bg-white/5 rounded-lg h-14" />)}
              </div>
            ) : audits.length === 0 ? (
              <EmptyState message="Click Run Audit to analyse your top pages for missing structured data schemas." />
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/8">
                      {['Page URL', 'Schemas Present', 'Schemas Missing', ''].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-white/30 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {audits.map((audit, i) => (
                      <tr
                        key={audit.id}
                        className={`${i < audits.length - 1 ? 'border-b border-white/5' : ''} hover:bg-white/5 transition-colors`}
                      >
                        <td className="px-4 py-3 max-w-xs">
                          <a
                            href={audit.page_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#00D4AA] hover:underline truncate block text-xs"
                          >
                            {audit.page_url.replace(/^https?:\/\//, '')}
                          </a>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {(audit.schemas_present ?? []).map((s) => (
                              <span key={s} className="px-1.5 py-0.5 text-xs rounded bg-emerald-500/15 text-emerald-400">{s}</span>
                            ))}
                            {(audit.schemas_present ?? []).length === 0 && <span className="text-white/20 text-xs">None detected</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {(audit.schemas_missing ?? []).map((s) => (
                              <span key={s} className="px-1.5 py-0.5 text-xs rounded bg-red-500/15 text-red-400">{s}</span>
                            ))}
                            {(audit.schemas_missing ?? []).length === 0 && <span className="text-white/20 text-xs">None missing</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {audit.suggested_schema && (
                            <button
                              onClick={() => setModalSchema(audit.suggested_schema)}
                              className="px-3 py-1.5 text-xs font-semibold border border-white/15 text-white/60 rounded-lg hover:border-[#00D4AA] hover:text-[#00D4AA] transition-colors whitespace-nowrap"
                            >
                              Get Schema JSON
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: AIO Opportunities ── */}
        {activeTab === 'aio' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-white/40">
                {opportunities.length > 0 ? `${opportunities.length} opportunities found` : 'No analysis yet'}
              </p>
              <button
                onClick={generateOpportunities}
                disabled={opportunitiesGenerating}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#00D4AA] text-black hover:bg-[#00D4AA]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {opportunitiesGenerating ? <><Spinner /> Analysing…</> : 'Find Opportunities'}
              </button>
            </div>
            {opportunitiesError && <p className="text-sm text-red-400 mb-4">{opportunitiesError}</p>}

            {/* Insight summary — only shown after a fresh API call */}
            {insightSummary && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-5">
                <div className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-[#00D4AA] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
                  </svg>
                  <p className="text-sm text-gray-300 leading-relaxed">{insightSummary}</p>
                </div>
              </div>
            )}

            {opportunitiesLoading ? (
              <div className="animate-pulse space-y-2">
                {[1, 2, 3, 4, 5].map((i) => <div key={i} className="bg-white/5 rounded-lg h-12" />)}
              </div>
            ) : opportunities.length === 0 ? (
              <EmptyState message="Click Find Opportunities to analyse your GSC queries for AIO potential." />
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/8">
                      {['Query Pattern', 'Page Type', 'AIO Likelihood', 'Suggested Slug', 'Suggested Title', ''].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-white/30 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {opportunities.map((opp, i) => (
                      <tr
                        key={opp.id}
                        className={`${i < opportunities.length - 1 ? 'border-b border-white/5' : ''} hover:bg-white/[0.04] transition-colors group`}
                      >
                        <td className="px-4 py-3 font-medium text-white max-w-[180px]">
                          <span className="line-clamp-2">{opp.query_pattern}</span>
                        </td>
                        <td className="px-4 py-3 text-white/50 whitespace-nowrap">{opp.page_type}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <AIOPill likelihood={opp.aio_likelihood} />
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-[#00D4AA]/70 max-w-[160px]">
                          <span className="line-clamp-1">{opp.suggested_slug}</span>
                        </td>
                        <td className="px-4 py-3 text-white/70 max-w-xs">
                          <span className="line-clamp-2">{opp.suggested_title}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => copyTitle(opp)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border border-white/10 text-white/40 hover:border-[#00D4AA]/40 hover:text-[#00D4AA] transition-colors opacity-0 group-hover:opacity-100"
                            title="Copy suggested title"
                          >
                            {copiedId === opp.id ? (
                              <>
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Copied!
                              </>
                            ) : (
                              <>
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                  <rect x="9" y="9" width="13" height="13" rx="2" />
                                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeLinecap="round" />
                                </svg>
                                Copy Title
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
