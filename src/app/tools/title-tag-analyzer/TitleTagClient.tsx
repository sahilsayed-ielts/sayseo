'use client'

import { useState, useMemo } from 'react'

// ─── Scoring ──────────────────────────────────────────────────────────────────

const POWER_WORDS = new Set([
  'best', 'top', 'ultimate', 'complete', 'free', 'guide', 'how', 'step', 'proven',
  'expert', 'official', 'exclusive', 'new', 'easy', 'fast', 'quick', 'simple',
  'review', 'reviews', 'comparison', 'vs', 'versus', 'ranked', 'ranking',
  'checklist', 'template', 'examples', 'tips', 'tricks', 'secrets', 'mistakes',
])

const STOP_WORDS_START = new Set(['a', 'an', 'the', 'this', 'these', 'those', 'your', 'our'])
const SEPARATORS = ['|', '–', '—', '-', '·', ':']
const YEAR_RE = /\b(20\d{2})\b/

function hasNumber(text: string): boolean {
  return /\d/.test(text)
}

function hasPowerWord(words: string[]): boolean {
  return words.some((w) => POWER_WORDS.has(w.toLowerCase()))
}

function hasSeparator(text: string): boolean {
  return SEPARATORS.some((s) => text.includes(s))
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function keywordInFirst30(title: string, kw: string): boolean {
  if (!kw.trim()) return false
  return title.toLowerCase().slice(0, 30).includes(kw.toLowerCase().trim())
}

function keywordCount(title: string, kw: string): number {
  if (!kw.trim()) return 0
  const re = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
  return (title.match(re) || []).length
}

function wordRepetition(title: string): boolean {
  const words = title.toLowerCase().split(/\s+/).filter((w) => w.length > 3)
  const freq = new Map<string, number>()
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1)
  return Array.from(freq.values()).some((v) => v >= 3)
}

interface ScoreBreakdown {
  total: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  items: Array<{ label: string; score: number; max: number; pass: boolean; detail: string }>
}

function scoreTitle(title: string, keyword: string, brand: string): ScoreBreakdown {
  const len = title.length
  const words = title.toLowerCase().split(/\s+/).filter(Boolean)
  const firstWord = words[0] || ''

  // 1. Length (25pts)
  let lengthScore = 0
  let lengthDetail = ''
  if (len >= 50 && len <= 60) {
    lengthScore = 25
    lengthDetail = `${len} characters — perfect length.`
  } else if (len >= 40 && len < 50) {
    lengthScore = 18
    lengthDetail = `${len} characters — slightly short. Try to reach 50.`
  } else if (len > 60 && len <= 70) {
    lengthScore = 15
    lengthDetail = `${len} characters — slightly long. Google may truncate above 580px.`
  } else if (len > 70) {
    lengthScore = 5
    lengthDetail = `${len} characters — too long. Likely to be truncated in SERPs.`
  } else if (len > 0) {
    lengthScore = 8
    lengthDetail = `${len} characters — too short. Expand to 50–60 characters.`
  } else {
    lengthScore = 0
    lengthDetail = 'No title entered.'
  }

  // 2. Keyword at start (20pts)
  const kwAtStart = keyword ? keywordInFirst30(title, keyword) : false
  const kwScore = keyword ? (kwAtStart ? 20 : 0) : 20
  const kwDetail = !keyword
    ? 'No keyword provided — enter a target keyword to check placement.'
    : kwAtStart
    ? `"${keyword}" found in first 30 characters — great placement.`
    : `"${keyword}" not in the first 30 characters. Move it earlier.`

  // 3. No all-caps (10pts)
  const hasAllCaps = title === title.toUpperCase() && /[A-Z]/.test(title)
  const capsScore = hasAllCaps ? 0 : 10
  const capsDetail = hasAllCaps
    ? 'Title is in ALL CAPS — use standard sentence or title case.'
    : 'Not in all caps — good.'

  // 4. Has number (10pts)
  const numPass = hasNumber(title) || YEAR_RE.test(title)
  const numScore = numPass ? 10 : 0
  const numDetail = numPass
    ? 'Contains a number — numbers improve CTR.'
    : 'No numbers. Adding a number (e.g. "7 Best…" or "2026 Guide") can boost CTR.'

  // 5. Power word (10pts)
  const pwPass = hasPowerWord(words)
  const pwScore = pwPass ? 10 : 0
  const pwDetail = pwPass
    ? 'Contains a power word — good for click-through appeal.'
    : 'No power words found. Try adding: best, top, guide, ultimate, free, review, etc.'

  // 6. No keyword stuffing (10pts)
  const kwOveruse = keyword ? keywordCount(title, keyword) > 2 : false
  const wordRep = wordRepetition(title)
  const stuffPass = !kwOveruse && !wordRep
  const stuffScore = stuffPass ? 10 : 0
  const stuffDetail = !stuffPass
    ? keyword && kwOveruse
      ? `"${keyword}" appears ${keywordCount(title, keyword)} times — reduce to 1–2.`
      : 'A word is repeated 3+ times — this looks like keyword stuffing.'
    : 'No stuffing detected.'

  // 7. Doesn't start with stop word (5pts)
  const stopPass = !STOP_WORDS_START.has(firstWord)
  const stopScore = stopPass ? 5 : 0
  const stopDetail = !stopPass
    ? `Starts with "${firstWord}" — move the keyword to the front instead.`
    : 'Doesn\'t start with a weak stop word — good.'

  // 8. Separator / brand (10pts)
  const sepPass = hasSeparator(title) || (brand && title.toLowerCase().includes(brand.toLowerCase()))
  const sepScore = sepPass ? 10 : 0
  const sepDetail = !sepPass
    ? 'No separator (|, –) or brand name detected. Consider "Keyword — Context | Brand".'
    : 'Separator or brand name found — well-structured.'

  const total = lengthScore + kwScore + capsScore + numScore + pwScore + stuffScore + stopScore + sepScore

  let grade: ScoreBreakdown['grade']
  if (total >= 90) grade = 'A'
  else if (total >= 75) grade = 'B'
  else if (total >= 60) grade = 'C'
  else if (total >= 40) grade = 'D'
  else grade = 'F'

  return {
    total,
    grade,
    items: [
      { label: 'Optimal length', score: lengthScore, max: 25, pass: lengthScore >= 20, detail: lengthDetail },
      { label: 'Keyword at front', score: kwScore, max: 20, pass: kwScore === 20, detail: kwDetail },
      { label: 'No all-caps', score: capsScore, max: 10, pass: capsScore === 10, detail: capsDetail },
      { label: 'Contains a number', score: numScore, max: 10, pass: numScore === 10, detail: numDetail },
      { label: 'Power word present', score: pwScore, max: 10, pass: pwScore === 10, detail: pwDetail },
      { label: 'No keyword stuffing', score: stuffScore, max: 10, pass: stuffScore === 10, detail: stuffDetail },
      { label: 'Doesn\'t start weak', score: stopScore, max: 5, pass: stopScore === 5, detail: stopDetail },
      { label: 'Separator / brand', score: sepScore, max: 10, pass: sepScore === 10, detail: sepDetail },
    ],
  }
}

// ─── Grade styling ────────────────────────────────────────────────────────────

const gradeStyle: Record<string, { bg: string; text: string; border: string }> = {
  A: { bg: '#ECFDF5', text: '#065F46', border: '#6EE7B7' },
  B: { bg: '#EFF6FF', text: '#1E40AF', border: '#93C5FD' },
  C: { bg: '#FFFBEB', text: '#92400E', border: '#FCD34D' },
  D: { bg: '#FFF7ED', text: '#9A3412', border: '#FDBA74' },
  F: { bg: '#FEF2F2', text: '#991B1B', border: '#FCA5A5' },
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TitleTagClient() {
  const [title, setTitle] = useState('')
  const [keyword, setKeyword] = useState('')
  const [brand, setBrand] = useState('')

  const result = useMemo(() => scoreTitle(title, keyword, brand), [title, keyword, brand])
  const gs = gradeStyle[result.grade]

  const failedItems = result.items.filter((i) => !i.pass)
  const passedItems = result.items.filter((i) => i.pass)

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

        {/* ── Input panel ──────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">Enter your title</h2>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-600" htmlFor="title-input">
                  Page title tag <span className="text-red-400">*</span>
                </label>
                <span className={`text-xs font-bold ${title.length > 65 ? 'text-red-500' : title.length > 55 ? 'text-amber-500' : 'text-gray-400'}`}>
                  {title.length} chars
                </span>
              </div>
              <textarea
                id="title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Best SEO Tools for Agencies in 2026 | SaySEO"
                rows={2}
                maxLength={160}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5" htmlFor="keyword-input">
                Target keyword <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="keyword-input"
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. SEO tools for agencies"
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5" htmlFor="brand-input">
                Brand name <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="brand-input"
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. SaySEO"
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Progress bar */}
          {title.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-600">Overall Score</span>
                <span className="text-xs font-bold text-gray-700">{result.total}/100</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${result.total}%`,
                    backgroundColor: result.total >= 75 ? '#059669' : result.total >= 50 ? '#D97706' : '#DC2626',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Results panel ────────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-5">

          {title.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
              <p className="text-3xl mb-3">✍️</p>
              <p className="font-bold text-gray-900 mb-1">Enter a title to analyse</p>
              <p className="text-sm text-gray-400">Type your title tag on the left to see your score and recommendations.</p>
            </div>
          ) : (
            <>
              {/* Grade card */}
              <div
                className="rounded-xl border p-6 flex items-center gap-5"
                style={{ backgroundColor: gs.bg, borderColor: gs.border }}
              >
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-extrabold shrink-0"
                  style={{ backgroundColor: gs.text, color: '#fff' }}
                >
                  {result.grade}
                </div>
                <div>
                  <p className="text-2xl font-extrabold mb-0.5" style={{ color: gs.text }}>
                    {result.total}/100
                  </p>
                  <p className="font-bold text-sm mb-1" style={{ color: gs.text }}>
                    {result.grade === 'A' ? 'Excellent title tag'
                      : result.grade === 'B' ? 'Good — minor improvements possible'
                      : result.grade === 'C' ? 'Average — needs work'
                      : result.grade === 'D' ? 'Below average — significant improvements needed'
                      : 'Poor — rewrite recommended'}
                  </p>
                  {failedItems.length > 0 && (
                    <p className="text-xs" style={{ color: gs.text, opacity: 0.75 }}>
                      {failedItems.length} issue{failedItems.length > 1 ? 's' : ''} to fix
                    </p>
                  )}
                </div>
              </div>

              {/* Criteria breakdown */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-sm font-extrabold text-gray-900">Score breakdown</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {result.items.map((item) => (
                    <div key={item.label} className="px-5 py-3.5 flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${item.pass ? 'bg-emerald-100' : 'bg-red-100'}`}>
                        {item.pass ? (
                          <svg className="w-3 h-3 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                          <span className={`text-xs font-bold shrink-0 ${item.pass ? 'text-emerald-600' : 'text-red-500'}`}>
                            {item.score}/{item.max}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              {failedItems.length > 0 && (
                <div className="bg-white border border-amber-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-amber-100 bg-amber-50">
                    <h2 className="text-sm font-extrabold text-amber-900">Recommendations to improve your score</h2>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {failedItems.map((item) => (
                      <li key={item.label} className="px-5 py-3.5 flex items-start gap-3">
                        <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 mb-0.5">{item.label}</p>
                          <p className="text-xs text-gray-500 leading-relaxed">{item.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* All passed */}
              {passedItems.length === result.items.length && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
                  <p className="text-2xl mb-2">🎉</p>
                  <p className="font-bold text-emerald-900">Perfect score on all criteria!</p>
                  <p className="text-sm text-emerald-700 mt-1">Your title tag meets every best-practice criterion.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
