'use client'

import { useState } from 'react'
import {
  assembleResults,
  GeoResults,
  PromptResult,
  UserInputs,
} from '@/lib/geo/promptGenerator'
import {
  SourceType,
  IntentType,
  autocompleteToQueries,
  redditToQueries,
  wikipediaToQueries,
  sitemapToQueries,
  dedupeQueries,
  getFallbackQueries,
} from '@/lib/geo/freeSources'
import { promptsToCSV, downloadCSV } from '@/lib/geo/csvExport'

// ─── Badge styles ─────────────────────────────────────────────────────────────

const SOURCE_STYLES: Record<SourceType, string> = {
  'Verified free source':   'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Extracted from website': 'bg-blue-50 text-blue-700 border border-blue-200',
}

const SOURCE_DOTS: Record<SourceType, string> = {
  'Verified free source':   'bg-emerald-500',
  'Extracted from website': 'bg-blue-500',
}

const INTENT_STYLES: Record<IntentType, string> = {
  Informational:     'bg-sky-50 text-sky-700',
  Commercial:        'bg-emerald-50 text-emerald-700',
  Comparison:        'bg-purple-50 text-purple-700',
  Local:             'bg-orange-50 text-orange-700',
  'Problem-solving': 'bg-red-50 text-red-700',
  'Trust-building':  'bg-yellow-50 text-yellow-700',
  Transactional:     'bg-teal-50 text-teal-700',
}

const FUNNEL_STYLES = {
  Awareness:     'bg-gray-100 text-gray-600',
  Consideration: 'bg-blue-50 text-blue-600',
  Decision:      'bg-emerald-50 text-emerald-700',
}

const PRIORITY_COLORS = {
  High:   'text-emerald-700',
  Medium: 'text-amber-600',
  Low:    'text-gray-400',
}

// ─── Score dots ───────────────────────────────────────────────────────────────

function ScoreDot({ value }: { value: number }) {
  const colors = ['', 'bg-red-300', 'bg-orange-300', 'bg-yellow-300', 'bg-emerald-400', 'bg-emerald-600']
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`w-2 h-2 rounded-full ${i <= value ? colors[value] : 'bg-gray-100'}`} />
      ))}
    </span>
  )
}

// ─── Source status types ──────────────────────────────────────────────────────

type FetchStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty'

interface SourceState {
  status: FetchStatus
  count: number
  label: string
}

type SourceKey = 'autocomplete' | 'reddit' | 'wikipedia' | 'sitemap'

const SOURCE_META: Record<SourceKey, { label: string; detail: string; color: string }> = {
  autocomplete: { label: 'Autocomplete (DuckDuckGo / Google)', detail: 'Real search query patterns', color: 'text-sky-600' },
  reddit:       { label: 'Reddit Discussions',                  detail: 'Top community questions and threads', color: 'text-orange-600' },
  wikipedia:    { label: 'Wikipedia Entity Expansion',           detail: 'Related topics and concepts', color: 'text-gray-600' },
  sitemap:      { label: 'Website Analysis',                     detail: 'Headings extracted from your site', color: 'text-blue-600' },
}

// ─── Tab types ────────────────────────────────────────────────────────────────

type Tab = 'prompts' | 'intent' | 'plan' | 'schema' | 'brief'

const TABS: { id: Tab; label: string }[] = [
  { id: 'prompts', label: 'All Prompts' },
  { id: 'intent',  label: 'By Intent' },
  { id: 'plan',    label: 'Content Plan' },
  { id: 'schema',  label: 'Schema' },
  { id: 'brief',   label: 'Content Brief' },
]

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULTS: UserInputs = {
  websiteUrl:   '',
  topic:        '',
  country:      '',
  audience:     '',
  businessGoal: '',
}

const IDLE_SOURCES: Record<SourceKey, SourceState> = {
  autocomplete: { status: 'idle', count: 0, label: SOURCE_META.autocomplete.label },
  reddit:       { status: 'idle', count: 0, label: SOURCE_META.reddit.label },
  wikipedia:    { status: 'idle', count: 0, label: SOURCE_META.wikipedia.label },
  sitemap:      { status: 'idle', count: 0, label: SOURCE_META.sitemap.label },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GeoPromptClient() {
  const [inputs, setInputs]       = useState<UserInputs>(DEFAULTS)
  const [results, setResults]     = useState<GeoResults | null>(null)
  const [loading, setLoading]     = useState(false)
  const [sources, setSources]     = useState<Record<SourceKey, SourceState>>(IDLE_SOURCES)
  const [activeTab, setActiveTab] = useState<Tab>('prompts')
  const [filterSource, setFilterSource] = useState<SourceType | 'All'>('All')
  const [briefCopied, setBriefCopied]   = useState(false)
  const [usedFallback, setUsedFallback] = useState(false)

  function handleChange(key: keyof UserInputs, value: string) {
    setInputs((prev) => ({ ...prev, [key]: value }))
  }

  function updateSource(key: SourceKey, patch: Partial<SourceState>) {
    setSources((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }))
  }

  async function fetchSource<T>(
    url: string,
    key: SourceKey,
    transform: (data: T) => ReturnType<typeof autocompleteToQueries>,
    dataKey: keyof T,
  ) {
    updateSource(key, { status: 'loading' })
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error('non-200')
      const data: T = await res.json()
      const queries = transform(data)
      updateSource(key, {
        status: queries.length > 0 ? 'success' : 'empty',
        count: queries.length,
      })
      return queries
    } catch {
      updateSource(key, { status: 'error', count: 0 })
      return []
    }
  }

  async function handleGenerate() {
    setLoading(true)
    setResults(null)
    setUsedFallback(false)
    setSources(IDLE_SOURCES)
    setActiveTab('prompts')
    setFilterSource('All')

    const q  = encodeURIComponent(`${inputs.topic} ${inputs.country}`)
    const t  = encodeURIComponent(inputs.topic)
    const u  = encodeURIComponent(inputs.websiteUrl)

    const [autoQ, redditQ, wikiQ, siteQ] = await Promise.all([
      fetchSource<{ suggestions: string[]; source: string }>(
        `/api/geo/autocomplete?q=${q}`,
        'autocomplete',
        (d) => autocompleteToQueries(d.suggestions ?? []),
        'suggestions',
      ),
      fetchSource<{ posts: Array<{ title: string; score: number }>; source: string }>(
        `/api/geo/reddit?q=${t}`,
        'reddit',
        (d) => redditToQueries(d.posts ?? []),
        'posts',
      ),
      fetchSource<{ topics: string[]; descriptions: string[]; source: string }>(
        `/api/geo/wikipedia?q=${t}`,
        'wikipedia',
        (d) => wikipediaToQueries(d.topics ?? [], inputs.topic, inputs.audience, inputs.country),
        'topics',
      ),
      fetchSource<{ headings: string[]; urls: string[]; domain: string; source: string }>(
        `/api/geo/sitemap?url=${u}`,
        'sitemap',
        (d) => sitemapToQueries(d.headings ?? []),
        'headings',
      ),
    ])

    let queries = dedupeQueries([...autoQ, ...redditQ, ...wikiQ, ...siteQ])

    if (queries.length === 0) {
      queries = getFallbackQueries(inputs.topic, inputs.country, inputs.audience)
      setUsedFallback(true)
    }

    setResults(assembleResults(queries, inputs))
    setLoading(false)
  }

  function handleCSV() {
    if (!results) return
    const csv = promptsToCSV(results.prompts)
    const slug = inputs.topic.toLowerCase().replace(/\s+/g, '-').slice(0, 30)
    downloadCSV(csv, `geo-prompts-${slug}.csv`)
  }

  function handleCopyBrief() {
    if (!results) return
    const { contentBrief: b } = results
    const text = [
      `PAGE TITLE: ${b.pageTitle}`,
      `H1: ${b.h1}`,
      `META DESCRIPTION: ${b.metaDescription}`,
      `PRIMARY KEYWORD: ${b.primaryKeyword}`,
      `SECONDARY KEYWORDS: ${b.secondaryKeywords.join(', ')}`,
      `TARGET WORD COUNT: ${b.targetWordCount}`,
      `CONTENT GOAL: ${b.contentGoal}`,
      '',
      'SECTIONS:',
      ...b.sections.map((s) =>
        [
          `H2: ${s.h2}`,
          ...(s.h3s.length ? s.h3s.map((h) => `  H3: ${h}`) : []),
          `  Notes: ${s.notes}`,
          `  Target words: ${s.wordCount}`,
        ].join('\n'),
      ),
      '',
      `SCHEMA TYPES: ${b.schemaTypes.join(', ')}`,
      `CTA: ${b.cta}`,
    ].join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setBriefCopied(true)
      setTimeout(() => setBriefCopied(false), 2000)
    })
  }

  const filteredPrompts = results
    ? filterSource === 'All'
      ? results.prompts
      : results.prompts.filter((p) => p.sourceType === filterSource)
    : []

  const byIntent = results
    ? results.prompts.reduce<Record<string, PromptResult[]>>((acc, p) => {
        if (!acc[p.intent]) acc[p.intent] = []
        acc[p.intent].push(p)
        return acc
      }, {})
    : {}

  const allSourceTypes = [...new Set(results?.prompts.map((p) => p.sourceType) ?? [])] as SourceType[]

  // ── Status icon helper
  function StatusIcon({ status }: { status: FetchStatus }) {
    if (status === 'idle') return <span className="w-4 h-4 rounded-full bg-gray-200 inline-block" />
    if (status === 'loading') return (
      <svg className="w-4 h-4 animate-spin text-emerald-600" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    )
    if (status === 'success') return (
      <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    )
    if (status === 'empty') return (
      <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    )
    // error
    return (
      <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">

      {/* ── Input form ─────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
          <h2 className="text-[0.9375rem] font-extrabold text-gray-900">Enter your details</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Fetches live data from DuckDuckGo, Reddit, Wikipedia and your website — no API key required.
          </p>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Website URL</label>
            <input
              type="url"
              value={inputs.websiteUrl}
              onChange={(e) => handleChange('websiteUrl', e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Topic / Service</label>
            <input
              type="text"
              value={inputs.topic}
              onChange={(e) => handleChange('topic', e.target.value)}
              placeholder="e.g. IELTS online courses"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Target Country</label>
            <input
              type="text"
              value={inputs.country}
              onChange={(e) => handleChange('country', e.target.value)}
              placeholder="e.g. India"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Target Audience</label>
            <input
              type="text"
              value={inputs.audience}
              onChange={(e) => handleChange('audience', e.target.value)}
              placeholder="e.g. IELTS students"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Business Goal</label>
            <input
              type="text"
              value={inputs.businessGoal}
              onChange={(e) => handleChange('businessGoal', e.target.value)}
              placeholder="e.g. Promote online IELTS courses"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
            />
          </div>
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={handleGenerate}
            disabled={loading || !inputs.topic.trim()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Fetching live data…
              </>
            ) : (
              <>
                Generate GEO Prompts
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Live source status panel ────────────────────────────────────────── */}
      {(loading || results) && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              {loading ? 'Fetching live data from free sources…' : 'Data sources used'}
            </p>
          </div>
          <div className="divide-y divide-gray-100">
            {(Object.keys(SOURCE_META) as SourceKey[]).map((key) => {
              const meta = SOURCE_META[key]
              const state = sources[key]
              return (
                <div key={key} className="flex items-center gap-3 px-5 py-3">
                  <StatusIcon status={state.status} />
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
                    <span className="text-xs text-gray-400 ml-2">— {meta.detail}</span>
                  </div>
                  {state.status === 'success' && (
                    <span className="text-xs font-bold text-emerald-700">{state.count} found</span>
                  )}
                  {state.status === 'empty' && (
                    <span className="text-xs text-amber-500">0 matches</span>
                  )}
                  {state.status === 'error' && (
                    <span className="text-xs text-red-400">unavailable</span>
                  )}
                </div>
              )
            })}
          </div>
          {usedFallback && (
            <div className="px-5 py-3 bg-amber-50 border-t border-amber-100">
              <p className="text-xs text-amber-700">
                <span className="font-semibold">Note:</span> All live sources returned empty results — showing deterministic fallback prompts based on your inputs. Try a broader topic or check your internet connection.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────────────────────── */}
      {results && (
        <div className="space-y-6">

          {/* Summary bar */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-5">
                <div>
                  <span className="text-2xl font-extrabold text-emerald-700">{results.prompts.length}</span>
                  <span className="text-xs text-gray-500 ml-1.5">prompts generated</span>
                </div>
                {allSourceTypes.map((st) => {
                  const count = results.prompts.filter((p) => p.sourceType === st).length
                  return (
                    <div key={st} className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${SOURCE_DOTS[st]}`} />
                      <span className="text-xs text-gray-500">{count} {st}</span>
                    </div>
                  )
                })}
              </div>
              <button
                onClick={handleCSV}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Export CSV
              </button>
            </div>
          </div>

          {/* Tab navigation */}
          <div className="border-b border-gray-200">
            <div className="flex gap-1 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-emerald-700 text-emerald-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Tab: All Prompts ─────────────────────────────────────────── */}
          {activeTab === 'prompts' && (
            <div className="space-y-4">
              {/* Source filter */}
              <div className="flex flex-wrap gap-2">
                {(['All', ...allSourceTypes] as Array<'All' | SourceType>).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterSource(st)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      filterSource === st
                        ? 'bg-emerald-700 text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {st}
                    {st !== 'All' && (
                      <span className="ml-1 opacity-75">
                        ({results.prompts.filter((p) => p.sourceType === st).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Table */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide w-6">#</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Prompt / Query</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">Source</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Intent</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Funnel</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wide" title="Search Demand">SD</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wide" title="AI Answer Potential">AI</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wide" title="Commercial Intent">CI</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wide" title="Content Gap">Gap</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredPrompts.map((p, i) => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900 text-sm leading-snug">{p.prompt}</div>
                            <div className="text-xs text-gray-400 mt-1 leading-relaxed">{p.recommendedSection}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-semibold whitespace-nowrap ${SOURCE_STYLES[p.sourceType]}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${SOURCE_DOTS[p.sourceType]}`} />
                              {p.sourceType}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[0.65rem] font-semibold whitespace-nowrap ${INTENT_STYLES[p.intent]}`}>
                              {p.intent}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[0.65rem] font-semibold whitespace-nowrap ${FUNNEL_STYLES[p.funnelStage]}`}>
                              {p.funnelStage}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center"><ScoreDot value={p.scores.searchDemand} /></td>
                          <td className="px-4 py-3 text-center"><ScoreDot value={p.scores.aiAnswerPotential} /></td>
                          <td className="px-4 py-3 text-center"><ScoreDot value={p.scores.commercialIntent} /></td>
                          <td className="px-4 py-3 text-center"><ScoreDot value={p.scores.contentGap} /></td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-sm font-extrabold ${p.scores.total >= 16 ? 'text-emerald-700' : p.scores.total >= 12 ? 'text-amber-600' : 'text-gray-400'}`}>
                              {p.scores.total}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Score legend */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Score key</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600">
                  {[
                    { label: 'SD — Search Demand', desc: 'How widely searched this query type is likely to be' },
                    { label: 'AI — AI Answer Potential', desc: 'How likely AI engines are to use this as a question to answer' },
                    { label: 'CI — Commercial Intent', desc: 'How directly related to purchase or conversion' },
                    { label: 'Gap — Content Gap', desc: 'How underserved this query likely is on your site' },
                  ].map((item) => (
                    <div key={item.label}>
                      <span className="font-semibold text-gray-700">{item.label}</span>
                      <p className="text-gray-400 mt-0.5 leading-snug">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: By Intent ───────────────────────────────────────────── */}
          {activeTab === 'intent' && (
            <div className="space-y-6">
              {Object.entries(byIntent).map(([intent, prompts]) => (
                <div key={intent} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${INTENT_STYLES[intent as IntentType]}`}>
                      {intent}
                    </span>
                    <span className="text-xs text-gray-400">{prompts.length} prompt{prompts.length !== 1 ? 's' : ''}</span>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {prompts.map((p) => (
                      <li key={p.id} className="px-5 py-3.5 flex items-start gap-3">
                        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${SOURCE_DOTS[p.sourceType]}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 font-medium leading-snug">{p.prompt}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[0.6rem] font-semibold ${FUNNEL_STYLES[p.funnelStage]}`}>
                              {p.funnelStage}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6rem] font-semibold ${SOURCE_STYLES[p.sourceType]}`}>
                              {p.sourceType}
                            </span>
                            <span className="text-[0.6rem] text-gray-400">Score: <strong>{p.scores.total}</strong>/20</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{p.contentAction}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* ── Tab: Content Plan ────────────────────────────────────────── */}
          {activeTab === 'plan' && (
            <div className="space-y-8">
              {/* Recommended sections */}
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 mb-4">Recommended website sections</h3>
                <div className="space-y-3">
                  {results.recommendedSections.map((s, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 flex gap-4">
                      <div className="w-7 h-7 rounded-full bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center shrink-0">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-gray-900">{s.title}</h4>
                          <span className={`text-[0.6rem] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-50 border border-gray-100 ${PRIORITY_COLORS[s.priority]}`}>
                            {s.priority}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{s.purpose}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-[0.65rem] text-gray-400">
                          <span className="bg-gray-50 border border-gray-100 px-2 py-0.5 rounded">{s.contentType}</span>
                          {s.wordCount > 0 && <span className="bg-gray-50 border border-gray-100 px-2 py-0.5 rounded">{s.wordCount} target words</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ questions */}
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 mb-4">FAQ questions to publish</h3>
                <div className="space-y-3">
                  {results.faqItems.map((faq, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{faq.question}</p>
                      </div>
                      <div className="px-5 py-3">
                        <p className="text-xs text-gray-500 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Internal links */}
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 mb-4">Internal linking suggestions</h3>
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Anchor text</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Target page</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {results.internalLinks.map((link, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-xs font-medium text-emerald-700">{link.anchorText}</td>
                          <td className="px-4 py-3 text-xs text-gray-500 font-mono">{link.targetPage}</td>
                          <td className="px-4 py-3 text-xs text-gray-500 leading-snug">{link.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Schema ──────────────────────────────────────────────── */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 leading-relaxed">
                Implementing these schema types helps AI engines reliably parse, understand and cite your content.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.schemaRecommendations.map((s, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <div className="px-2.5 py-1 bg-purple-50 border border-purple-100 rounded-lg shrink-0">
                        <span className="text-xs font-bold text-purple-700 font-mono">{s.schemaType}</span>
                      </div>
                      <span className={`ml-auto text-[0.6rem] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-50 border border-gray-100 ${PRIORITY_COLORS[s.priority]}`}>
                        {s.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium mt-3">{s.reason}</p>
                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                      <span className="font-semibold text-gray-500">Placement:</span> {s.placement}
                    </p>
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-bold text-amber-800 mb-1">Build your schema now</p>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      Use the <strong>SaySEO Schema Markup Generator</strong> to build valid JSON-LD for FAQPage, HowTo, Article and LocalBusiness schemas — copy-paste ready for WordPress or any CMS.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Content Brief ───────────────────────────────────────── */}
          {activeTab === 'brief' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">WordPress-ready content brief — hand to a writer or paste into an AI assistant.</p>
                <button
                  onClick={handleCopyBrief}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                >
                  {briefCopied ? (
                    <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Copied!</>
                  ) : (
                    <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy brief</>
                  )}
                </button>
              </div>

              {(() => {
                const b = results.contentBrief
                return (
                  <div className="space-y-5">
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Page meta</p>
                      </div>
                      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Page title</p>
                          <p className="text-gray-900 font-medium">{b.pageTitle}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">H1</p>
                          <p className="text-gray-900 font-medium">{b.h1}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Meta description</p>
                          <p className="text-gray-700">{b.metaDescription}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Primary keyword</p>
                          <p className="text-gray-900 font-mono text-xs bg-gray-50 border border-gray-100 px-2 py-1 rounded inline-block">{b.primaryKeyword}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Target word count</p>
                          <p className="text-2xl font-extrabold text-emerald-700">{b.targetWordCount.toLocaleString()}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Secondary keywords</p>
                          <div className="flex flex-wrap gap-1.5">
                            {b.secondaryKeywords.map((kw) => (
                              <span key={kw} className="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600 font-mono">{kw}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Page structure</p>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {b.sections.map((s, i) => (
                          <div key={i} className="p-5">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-1.5 py-0.5 bg-emerald-50 border border-emerald-100 rounded text-[0.65rem] font-bold text-emerald-700">H2</span>
                              <p className="text-sm font-bold text-gray-900">{s.h2}</p>
                              <span className="ml-auto text-xs text-gray-400">{s.wordCount} words</span>
                            </div>
                            {s.h3s.length > 0 && (
                              <div className="ml-4 space-y-1 mb-2">
                                {s.h3s.map((h3) => (
                                  <div key={h3} className="flex items-center gap-2">
                                    <span className="px-1.5 py-0.5 bg-gray-50 border border-gray-100 rounded text-[0.6rem] font-bold text-gray-500">H3</span>
                                    <p className="text-xs text-gray-700">{h3}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-gray-500 leading-relaxed">{s.notes}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Required schema types</p>
                        <div className="flex flex-wrap gap-1.5">
                          {b.schemaTypes.map((t) => (
                            <span key={t} className="px-2 py-0.5 bg-purple-50 border border-purple-100 rounded text-xs font-semibold text-purple-700 font-mono">{t}</span>
                          ))}
                        </div>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                        <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">Primary CTA</p>
                        <p className="text-sm font-medium text-emerald-900">{b.cta}</p>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
