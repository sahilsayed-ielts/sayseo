'use client'

import { useState, useMemo, useCallback } from 'react'
import { buildCsvFilename, downloadPromptsCsv } from '@/lib/geo/csvExport'
import {
  generateGeoPrompts,
  CATEGORY_LABELS,
  CONFIDENCE_LABELS,
  INTENT_LABELS,
  type GeoPrompt,
  type GeoPromptMapperResult,
  type PromptCategory,
  type ConfidenceLabel,
} from '@/lib/geo/promptGenerator'

// ─── Style config ─────────────────────────────────────────────────────────────

const CATEGORY_STYLES: Record<PromptCategory, { color: string; bg: string; border: string }> = {
  discovered_query: { color: '#047857', bg: '#ECFDF5', border: '#6EE7B7' },
  extracted_question: { color: '#1D4ED8', bg: '#EFF6FF', border: '#93C5FD' },
  predicted_prompt: { color: '#B45309', bg: '#FFFBEB', border: '#FCD34D' },
  geo_opportunity: { color: '#7C3AED', bg: '#F5F3FF', border: '#C4B5FD' },
}

const CONFIDENCE_STYLES: Record<ConfidenceLabel, { color: string; bg: string }> = {
  verified_free_source: { color: '#047857', bg: '#ECFDF5' },
  extracted_from_website: { color: '#1D4ED8', bg: '#EFF6FF' },
  predicted_ai_prompt: { color: '#B45309', bg: '#FFFBEB' },
}

type FilterCategory = PromptCategory | 'all'

// ─── Component ────────────────────────────────────────────────────────────────

export function GeoPromptMapperClient() {
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [seedTopic, setSeedTopic] = useState('')
  const [brandName, setBrandName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<GeoPromptMapperResult | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all')

  const handleGenerate = useCallback(async () => {
    if (!websiteUrl.trim() || !seedTopic.trim()) {
      setError('Enter both a website URL and seed topic.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const data = await generateGeoPrompts({
        websiteUrl: websiteUrl.trim(),
        seedTopic: seedTopic.trim(),
        brandName: brandName.trim() || undefined,
      })
      setResult(data)
      setActiveFilter('all')
    } catch {
      setError('Generation failed. Check your inputs and try again.')
    } finally {
      setLoading(false)
    }
  }, [websiteUrl, seedTopic, brandName])

  const filteredPrompts = useMemo(() => {
    if (!result) return []
    if (activeFilter === 'all') return result.prompts
    return result.prompts.filter((p) => p.category === activeFilter)
  }, [result, activeFilter])

  const handleExport = useCallback(() => {
    if (!result || !filteredPrompts.length) return
    const filename = buildCsvFilename(result.input.websiteUrl, result.input.seedTopic)
    downloadPromptsCsv(filteredPrompts, filename)
  }, [result, filteredPrompts])

  const canGenerate = websiteUrl.trim().length > 0 && seedTopic.trim().length > 0

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

        {/* ── Input panel ──────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide mb-1">
                Map GEO prompts
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Uses free sources only — no Ahrefs, SEMrush, Moz, or paid APIs. v1 runs client-side with mock data patterns ready for live API routes.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5" htmlFor="website-url">
                Website URL <span className="text-red-500">*</span>
              </label>
              <input
                id="website-url"
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://yoursite.com"
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5" htmlFor="seed-topic">
                Seed topic <span className="text-red-500">*</span>
              </label>
              <input
                id="seed-topic"
                type="text"
                value={seedTopic}
                onChange={(e) => setSeedTopic(e.target.value)}
                placeholder="e.g. generative engine optimisation"
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5" htmlFor="brand-name">
                Brand name <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="brand-name"
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Defaults to domain name"
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate || loading}
              className="w-full px-4 py-3 rounded-lg text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Generating prompts…' : 'Generate GEO prompt map'}
            </button>
          </div>

          {/* Free sources legend */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">Free data sources</p>
            <ul className="space-y-1.5 text-xs text-gray-600">
              {[
                'Google Autocomplete suggestions',
                'People Also Ask questions',
                'Related search expansions',
                'Reddit discussion patterns',
                'Wikipedia & Wikidata entities',
                'Google Trends related topics',
                'Website sitemap parsing',
                'Page content extraction',
                'AI-predicted prompts (labelled)',
              ].map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <span className="text-emerald-600 shrink-0 mt-0.5">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Results ──────────────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-5">
          {!result ? (
            <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
              <p className="text-3xl mb-3">🗺️</p>
              <p className="font-bold text-gray-900 mb-1">Enter a site and topic to begin</p>
              <p className="text-sm text-gray-400 max-w-sm mx-auto">
                The mapper separates discovered queries, extracted questions, predicted AI prompts, and GEO opportunities — each with source and confidence labels.
              </p>
            </div>
          ) : (
            <>
              {/* Summary stats */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { label: 'Total', value: result.summary.total, highlight: true },
                  { label: 'Discovered', value: result.summary.discovered, cat: 'discovered_query' as PromptCategory },
                  { label: 'Extracted', value: result.summary.extracted, cat: 'extracted_question' as PromptCategory },
                  { label: 'Predicted', value: result.summary.predicted, cat: 'predicted_prompt' as PromptCategory },
                  { label: 'GEO Ops', value: result.summary.geoOpportunity, cat: 'geo_opportunity' as PromptCategory },
                ].map((stat) => {
                  const style = stat.cat ? CATEGORY_STYLES[stat.cat] : null
                  return (
                    <button
                      key={stat.label}
                      type="button"
                      onClick={() => stat.cat && setActiveFilter(stat.cat)}
                      className={`rounded-xl border p-3 text-center shadow-sm transition-colors ${
                        stat.highlight ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <p
                        className="text-xl font-extrabold"
                        style={style ? { color: style.color } : { color: '#047857' }}
                      >
                        {stat.value}
                      </p>
                      <p className="text-[0.65rem] text-gray-400 mt-0.5">{stat.label}</p>
                    </button>
                  )
                })}
              </div>

              {/* Filter + export bar */}
              <div className="flex flex-wrap items-center gap-2 justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                <div className="flex flex-wrap gap-1.5">
                  <FilterChip
                    label="All"
                    active={activeFilter === 'all'}
                    onClick={() => setActiveFilter('all')}
                  />
                  {(Object.keys(CATEGORY_LABELS) as PromptCategory[]).map((cat) => (
                    <FilterChip
                      key={cat}
                      label={CATEGORY_LABELS[cat]}
                      active={activeFilter === cat}
                      onClick={() => setActiveFilter(cat)}
                      style={CATEGORY_STYLES[cat]}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={filteredPrompts.length === 0}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Export CSV ({filteredPrompts.length})
                </button>
              </div>

              {/* Results table */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[800px]">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/80">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-[28%]">Prompt</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Category</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Source</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Confidence</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Intent</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 w-16">Priority</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Section</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPrompts.map((prompt) => (
                        <PromptRow key={prompt.id} prompt={prompt} />
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredPrompts.length === 0 && (
                  <p className="text-center text-sm text-gray-400 py-8">No prompts in this category.</p>
                )}
              </div>

              <p className="text-[0.65rem] text-gray-400 text-center">
                Generated {new Date(result.generatedAt).toLocaleString('en-GB')} · v1 uses mock free-source patterns — API routes can plug in live data via <code className="text-gray-500">lib/geo/freeSources.ts</code>
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FilterChip({
  label,
  active,
  onClick,
  style,
}: {
  label: string
  active: boolean
  onClick: () => void
  style?: { color: string; bg: string; border: string }
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-[0.65rem] font-bold transition-colors border ${
        active
          ? style
            ? ''
            : 'bg-emerald-700 text-white border-emerald-700'
          : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'
      }`}
      style={
        active && style
          ? { backgroundColor: style.bg, color: style.color, borderColor: style.border }
          : undefined
      }
    >
      {label}
    </button>
  )
}

function PromptRow({ prompt }: { prompt: GeoPrompt }) {
  const catStyle = CATEGORY_STYLES[prompt.category]
  const confStyle = CONFIDENCE_STYLES[prompt.confidence]

  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 align-top">
      <td className="px-4 py-3.5 text-sm text-gray-800 leading-snug">{prompt.prompt}</td>
      <td className="px-4 py-3.5">
        <span
          className="inline-block px-2 py-0.5 rounded-full text-[0.6rem] font-bold whitespace-nowrap"
          style={{ backgroundColor: catStyle.bg, color: catStyle.color, border: `1px solid ${catStyle.border}` }}
        >
          {CATEGORY_LABELS[prompt.category]}
        </span>
      </td>
      <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap">{prompt.source}</td>
      <td className="px-4 py-3.5">
        <span
          className="inline-block px-2 py-0.5 rounded-full text-[0.6rem] font-bold whitespace-nowrap"
          style={{ backgroundColor: confStyle.bg, color: confStyle.color }}
        >
          {CONFIDENCE_LABELS[prompt.confidence]}
        </span>
      </td>
      <td className="px-4 py-3.5 text-xs text-gray-600 whitespace-nowrap">{INTENT_LABELS[prompt.intent]}</td>
      <td className="px-4 py-3.5 text-center">
        <PriorityBadge score={prompt.priorityScore} />
      </td>
      <td className="px-4 py-3.5 text-xs text-gray-500 leading-snug">{prompt.recommendedSection}</td>
    </tr>
  )
}

function PriorityBadge({ score }: { score: number }) {
  const color = score >= 80 ? '#047857' : score >= 60 ? '#1D4ED8' : score >= 40 ? '#B45309' : '#9CA3AF'
  const bg = score >= 80 ? '#ECFDF5' : score >= 60 ? '#EFF6FF' : score >= 40 ? '#FFFBEB' : '#F9FAFB'
  return (
    <span
      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-extrabold"
      style={{ color, backgroundColor: bg }}
    >
      {score}
    </span>
  )
}