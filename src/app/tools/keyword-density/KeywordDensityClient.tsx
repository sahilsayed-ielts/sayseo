'use client'

import { useState, useMemo } from 'react'

// ─── Stop words ───────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with','by',
  'from','as','is','was','are','were','be','been','being','have','has','had',
  'do','does','did','will','would','could','should','may','might','shall','can',
  'it','its','this','that','these','those','he','she','they','we','you','i',
  'me','my','your','his','her','their','our','us','him','what','which','who',
  'when','where','why','how','all','any','both','each','every','more','most',
  'other','some','such','no','not','only','same','so','than','too','very',
  'just','also','up','out','if','about','into','through','during','before',
  'after','above','below','between','while','then','there','here','get','got',
  'make','made','use','used','using','been','them','then','than','now','new',
  'one','two','three','four','five','six','seven','eight','nine','ten',
])

// ─── Analysis helpers ─────────────────────────────────────────────────────────

function tokenise(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s'-]/g, ' ').split(/\s+/).filter((w) => w.length > 1)
}

function countPhrase(text: string, phrase: string): number {
  if (!phrase.trim()) return 0
  const escaped = phrase.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`\\b${escaped}\\b`, 'gi')
  return (text.match(re) || []).length
}

function density(count: number, total: number): number {
  if (total === 0) return 0
  return Math.round((count / total) * 1000) / 10
}

type DensityStatus = 'not-found' | 'too-low' | 'optimal' | 'high' | 'stuffed'

function getStatus(pct: number): DensityStatus {
  if (pct === 0) return 'not-found'
  if (pct < 0.5) return 'too-low'
  if (pct <= 2) return 'optimal'
  if (pct <= 3) return 'high'
  return 'stuffed'
}

const STATUS_CONFIG: Record<DensityStatus, { label: string; color: string; bg: string; border: string }> = {
  'not-found': { label: 'Not found', color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' },
  'too-low':   { label: 'Too low', color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' },
  'optimal':   { label: 'Optimal', color: '#059669', bg: '#ECFDF5', border: '#6EE7B7' },
  'high':      { label: 'Slightly high', color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' },
  'stuffed':   { label: 'Stuffing risk', color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' },
}

function readingTime(words: number): string {
  const mins = Math.max(1, Math.round(words / 250))
  return `~${mins} min read`
}

// ─── Component ────────────────────────────────────────────────────────────────

export function KeywordDensityClient() {
  const [content, setContent] = useState('')
  const [focusKw, setFocusKw] = useState('')
  const [secondaryRaw, setSecondaryRaw] = useState('')

  const analysis = useMemo(() => {
    const totalWords = tokenise(content).length
    const charCount = content.length

    // Focus keyword
    const focusCount = countPhrase(content, focusKw)
    const focusDensity = density(focusCount, totalWords)
    const focusStatus = getStatus(focusDensity)

    // Secondary keywords
    const secondaryKws = secondaryRaw.split(',').map((s) => s.trim()).filter(Boolean)
    const secondary = secondaryKws.map((kw) => {
      const count = countPhrase(content, kw)
      const pct = density(count, totalWords)
      return { kw, count, pct, status: getStatus(pct) }
    })

    // Top words (excluding stop words)
    const allTokens = tokenise(content)
    const freq = new Map<string, number>()
    for (const token of allTokens) {
      if (!STOP_WORDS.has(token) && token.length > 2) {
        freq.set(token, (freq.get(token) || 0) + 1)
      }
    }
    const topWords = Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({ word, count, pct: density(count, totalWords) }))

    const uniqueWords = new Set(allTokens).size
    const avgWordLength = totalWords > 0
      ? Math.round(content.replace(/\s+/g, '').length / totalWords * 10) / 10
      : 0

    return {
      totalWords,
      charCount,
      uniqueWords,
      avgWordLength,
      readTime: readingTime(totalWords),
      focusCount,
      focusDensity,
      focusStatus,
      secondary,
      topWords,
    }
  }, [content, focusKw, secondaryRaw])

  const hasContent = content.trim().length > 0

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

        {/* ── Input panel ──────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">Paste your content</h2>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-600" htmlFor="content-input">Content</label>
                <span className="text-xs text-gray-400">{analysis.totalWords} words</span>
              </div>
              <textarea
                id="content-input"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your full page content here — including headings, body paragraphs, and any on-page text you want to analyse…"
                rows={10}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5" htmlFor="focus-kw">
                Focus keyword
              </label>
              <input
                id="focus-kw"
                type="text"
                value={focusKw}
                onChange={(e) => setFocusKw(e.target.value)}
                placeholder="e.g. SEO tools for agencies"
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5" htmlFor="secondary-kws">
                Secondary keywords <span className="text-gray-400 font-normal">(comma-separated)</span>
              </label>
              <input
                id="secondary-kws"
                type="text"
                value={secondaryRaw}
                onChange={(e) => setSecondaryRaw(e.target.value)}
                placeholder="e.g. keyword research, rank tracking"
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
          </div>
        </div>

        {/* ── Results ──────────────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-5">

          {!hasContent ? (
            <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
              <p className="text-3xl mb-3">📊</p>
              <p className="font-bold text-gray-900 mb-1">Paste content to analyse</p>
              <p className="text-sm text-gray-400">Enter your content and keyword on the left to see density analysis.</p>
            </div>
          ) : (
            <>
              {/* Content stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total words', value: analysis.totalWords.toLocaleString() },
                  { label: 'Unique words', value: analysis.uniqueWords.toLocaleString() },
                  { label: 'Characters', value: analysis.charCount.toLocaleString() },
                  { label: 'Read time', value: analysis.readTime },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
                    <p className="text-xl font-extrabold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Focus keyword */}
              {focusKw && (
                <div
                  className="bg-white border rounded-xl p-5 shadow-sm"
                  style={{ borderColor: STATUS_CONFIG[analysis.focusStatus].border }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Focus keyword</p>
                      <p className="font-extrabold text-gray-900">"{focusKw}"</p>
                    </div>
                    <div
                      className="px-3 py-1.5 rounded-full text-xs font-bold"
                      style={{ backgroundColor: STATUS_CONFIG[analysis.focusStatus].bg, color: STATUS_CONFIG[analysis.focusStatus].color, border: `1px solid ${STATUS_CONFIG[analysis.focusStatus].border}` }}
                    >
                      {STATUS_CONFIG[analysis.focusStatus].label}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xl font-extrabold text-gray-900">{analysis.focusCount}</p>
                      <p className="text-xs text-gray-400">Occurrences</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xl font-extrabold" style={{ color: STATUS_CONFIG[analysis.focusStatus].color }}>{analysis.focusDensity}%</p>
                      <p className="text-xs text-gray-400">Density</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xl font-extrabold text-gray-900">{analysis.totalWords > 0 ? Math.round(analysis.totalWords / Math.max(analysis.focusCount, 1)) : '—'}</p>
                      <p className="text-xs text-gray-400">Words per use</p>
                    </div>
                  </div>

                  {/* Density bar */}
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(analysis.focusDensity * 25, 100)}%`,
                        backgroundColor: STATUS_CONFIG[analysis.focusStatus].color,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[0.6rem] text-gray-400 mt-1">
                    <span>0%</span><span>0.5%</span><span>1%</span><span>2%</span><span>3%+</span>
                  </div>
                </div>
              )}

              {/* Secondary keywords */}
              {analysis.secondary.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-100">
                    <h2 className="text-sm font-extrabold text-gray-900">Secondary keywords</h2>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {analysis.secondary.map((kw) => {
                      const cfg = STATUS_CONFIG[kw.status]
                      return (
                        <div key={kw.kw} className="px-5 py-3.5 flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">"{kw.kw}"</p>
                            <p className="text-xs text-gray-400">{kw.count} occurrences</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-extrabold" style={{ color: cfg.color }}>{kw.pct}%</p>
                            <p className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Top words table */}
              {analysis.topWords.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-100">
                    <h2 className="text-sm font-extrabold text-gray-900">Top 20 content words <span className="font-normal text-gray-400">(stop words excluded)</span></h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                          <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 w-8">#</th>
                          <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500">Word</th>
                          <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500">Count</th>
                          <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500">Density</th>
                          <th className="px-5 py-2.5 w-32" />
                        </tr>
                      </thead>
                      <tbody>
                        {analysis.topWords.map((row, idx) => {
                          const barPct = analysis.topWords[0]?.count
                            ? (row.count / analysis.topWords[0].count) * 100
                            : 0
                          return (
                            <tr key={row.word} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                              <td className="px-5 py-2.5 text-xs text-gray-400">{idx + 1}</td>
                              <td className="px-5 py-2.5 font-semibold text-gray-800">{row.word}</td>
                              <td className="px-5 py-2.5 text-gray-600">{row.count}</td>
                              <td className="px-5 py-2.5 text-gray-600">{row.pct}%</td>
                              <td className="px-5 py-2.5">
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${barPct}%` }} />
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
