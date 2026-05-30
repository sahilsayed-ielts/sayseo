'use client'

import { useState, useMemo } from 'react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseUrl(raw: string): { siteName: string; breadcrumb: string } {
  try {
    const cleaned = raw.startsWith('http') ? raw : `https://${raw}`
    const u = new URL(cleaned)
    const parts = u.pathname.split('/').filter(Boolean)
    const breadcrumb = parts.length
      ? `${u.hostname} › ${parts.map((p) => p.replace(/-/g, ' ')).join(' › ')}`
      : u.hostname
    const hostParts = u.hostname.replace(/^www\./, '').split('.')
    const siteName = hostParts[0].charAt(0).toUpperCase() + hostParts[0].slice(1)
    return { siteName, breadcrumb }
  } catch {
    return {
      siteName: raw || 'yoursite.com',
      breadcrumb: raw || 'yoursite.com',
    }
  }
}

// Google truncates titles at ~580px (desktop) and ~500px (mobile)
// Rough estimate: 1 average char ≈ 9.5px at 20px Roboto
const TITLE_DESKTOP_PX = 580
const TITLE_MOBILE_PX = 500
const META_PX = 920
const AVG_CHAR_PX_TITLE = 9.5
const AVG_CHAR_PX_META = 7.5

function estimatePx(text: string, charPx: number): number {
  return Math.round(text.length * charPx)
}

function truncateAtPx(text: string, maxPx: number, charPx: number): string {
  const maxChars = Math.floor(maxPx / charPx)
  return text.length > maxChars ? text.slice(0, maxChars - 1) + '…' : text
}

// ─── Status helpers ────────────────────────────────────────────────────────────

type Status = 'good' | 'warn' | 'error' | 'empty'

function titleStatus(len: number): Status {
  if (len === 0) return 'empty'
  if (len <= 55) return 'good'
  if (len <= 65) return 'warn'
  return 'error'
}

function metaStatus(len: number): Status {
  if (len === 0) return 'empty'
  if (len < 80) return 'warn'
  if (len <= 155) return 'good'
  if (len <= 170) return 'warn'
  return 'error'
}

const statusColour: Record<Status, string> = {
  good: '#059669',
  warn: '#D97706',
  error: '#DC2626',
  empty: '#9CA3AF',
}
const statusLabel: Record<Status, string> = {
  good: 'Good',
  warn: 'Warning',
  error: 'Too long',
  empty: 'Empty',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FaviconPlaceholder() {
  return (
    <div
      className="w-[18px] h-[18px] rounded-full shrink-0 flex items-center justify-center text-[9px] font-bold text-white"
      style={{ background: 'linear-gradient(135deg,#059669,#1D4ED8)' }}
      aria-hidden="true"
    >
      G
    </div>
  )
}

interface PreviewProps {
  url: string
  title: string
  meta: string
  isMobile: boolean
}

function SerpPreview({ url, title, meta, isMobile }: PreviewProps) {
  const { siteName, breadcrumb } = useMemo(() => parseUrl(url), [url])
  const maxTitlePx = isMobile ? TITLE_MOBILE_PX : TITLE_DESKTOP_PX

  const displayTitle = title
    ? truncateAtPx(title, maxTitlePx, AVG_CHAR_PX_TITLE)
    : undefined
  const displayMeta = meta
    ? truncateAtPx(meta, META_PX, AVG_CHAR_PX_META)
    : undefined

  return (
    <div
      className="font-[Arial,sans-serif] rounded-lg border border-gray-200 bg-white p-4"
      style={{ maxWidth: isMobile ? 380 : 600 }}
      aria-label={`${isMobile ? 'Mobile' : 'Desktop'} Google search result preview`}
    >
      {/* URL / breadcrumb row */}
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="flex items-center gap-2.5 min-w-0">
          <FaviconPlaceholder />
          <div className="min-w-0">
            <div style={{ fontSize: 14, color: '#202124', lineHeight: '18px', fontFamily: 'Arial,sans-serif' }}>
              {siteName}
            </div>
            <div style={{ fontSize: 12, color: '#4d5156', lineHeight: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: isMobile ? 280 : 500, fontFamily: 'Arial,sans-serif' }}>
              {breadcrumb || 'yoursite.com'}
            </div>
          </div>
        </div>
        <svg className="shrink-0 mt-1 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
        </svg>
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: isMobile ? 18 : 20,
          color: displayTitle ? '#1a0dab' : '#9CA3AF',
          lineHeight: '1.3',
          fontFamily: 'Arial,sans-serif',
          marginBottom: 4,
          cursor: 'pointer',
          fontStyle: displayTitle ? 'normal' : 'italic',
        }}
      >
        {displayTitle ?? 'Your page title will appear here…'}
      </div>

      {/* Meta description */}
      <div
        style={{
          fontSize: 14,
          color: displayMeta ? '#4d5156' : '#9CA3AF',
          lineHeight: '1.6',
          fontFamily: 'Arial,sans-serif',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          fontStyle: displayMeta ? 'normal' : 'italic',
        }}
      >
        {displayMeta ?? 'Your meta description will appear here. Write 120–155 characters to fill two lines naturally…'}
      </div>
    </div>
  )
}

// ─── Bar ──────────────────────────────────────────────────────────────────────

interface CountBarProps {
  label: string
  value: number
  max: number
  status: Status
  hint: string
}

function CountBar({ label, value, max, status, hint }: CountBarProps) {
  const pct = Math.min((value / max) * 100, 100)
  const colour = statusColour[status]

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-gray-600">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{hint}</span>
          <span className="text-xs font-bold" style={{ color: colour }}>
            {value} chars · {statusLabel[status]}
          </span>
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-200"
          style={{ width: `${pct}%`, backgroundColor: colour }}
        />
      </div>
    </div>
  )
}

// ─── Main client component ────────────────────────────────────────────────────

export function SerpPreviewClient() {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [meta, setMeta] = useState('')
  const [tab, setTab] = useState<'desktop' | 'mobile'>('desktop')

  const tStatus = titleStatus(title.length)
  const mStatus = metaStatus(meta.length)

  const titleHint = 'Optimal: 50–55 chars'
  const metaHint = 'Optimal: 120–155 chars'

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* ── Inputs ─────────────────────────────────────────────────────── */}
        <div className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-extrabold text-gray-900 mb-5 uppercase tracking-wide">
              Your snippet details
            </h2>

            {/* URL */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5" htmlFor="url-input">
                Page URL
              </label>
              <input
                id="url-input"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://yoursite.com/your-page"
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            {/* Title */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-600" htmlFor="title-input">
                  Page Title (title tag)
                </label>
                <span
                  className="text-xs font-bold"
                  style={{ color: statusColour[tStatus] }}
                >
                  {title.length} / 65
                </span>
              </div>
              <input
                id="title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Primary Keyword — Secondary Context | Brand"
                maxLength={120}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            {/* Meta */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-600" htmlFor="meta-input">
                  Meta Description
                </label>
                <span
                  className="text-xs font-bold"
                  style={{ color: statusColour[mStatus] }}
                >
                  {meta.length} / 160
                </span>
              </div>
              <textarea
                id="meta-input"
                value={meta}
                onChange={(e) => setMeta(e.target.value)}
                placeholder="Describe this page in 120–155 characters. Include a clear benefit and a call-to-action."
                maxLength={320}
                rows={3}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
              />
            </div>
          </div>

          {/* ── Analysis bars ──────────────────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
              Character analysis
            </h2>
            <CountBar label="Title tag" value={title.length} max={65} status={tStatus} hint={titleHint} />
            <CountBar label="Meta description" value={meta.length} max={160} status={mStatus} hint={metaHint} />

            {/* Pixel estimates */}
            <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs text-gray-500">
              <div>
                <span className="font-semibold text-gray-700">Desktop title</span><br />
                {estimatePx(title, AVG_CHAR_PX_TITLE)}px of {TITLE_DESKTOP_PX}px
                {estimatePx(title, AVG_CHAR_PX_TITLE) > TITLE_DESKTOP_PX && (
                  <span className="ml-1 text-red-500 font-semibold">⚠ may truncate</span>
                )}
              </div>
              <div>
                <span className="font-semibold text-gray-700">Mobile title</span><br />
                {estimatePx(title, AVG_CHAR_PX_TITLE)}px of {TITLE_MOBILE_PX}px
                {estimatePx(title, AVG_CHAR_PX_TITLE) > TITLE_MOBILE_PX && (
                  <span className="ml-1 text-red-500 font-semibold">⚠ may truncate</span>
                )}
              </div>
            </div>
          </div>

          {/* ── Tips ───────────────────────────────────────────────────── */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-3">Quick tips</p>
            <ul className="space-y-2 text-sm text-emerald-800">
              <li className="flex items-start gap-2">
                <span className="shrink-0 mt-0.5">•</span>
                Put your primary keyword in the first 30 characters of the title
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0 mt-0.5">•</span>
                Avoid ALL CAPS — Google may rewrite titles that appear spammy
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0 mt-0.5">•</span>
                End the meta with an action ("Learn more", "See the guide", "Find out how")
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0 mt-0.5">•</span>
                Don't duplicate the title word-for-word in the meta description
              </li>
            </ul>
          </div>
        </div>

        {/* ── Preview ──────────────────────────────────────────────────────── */}
        <div>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-gray-200">
              {(['desktop', 'mobile'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                    tab === t
                      ? 'bg-white text-emerald-700 border-b-2 border-emerald-600'
                      : 'bg-gray-50 text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t === 'desktop' ? '🖥 Desktop' : '📱 Mobile'}
                </button>
              ))}
            </div>

            {/* Search bar mock */}
            <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-blue-600">
                <div className="w-5 h-5 rounded-full" style={{ background: 'linear-gradient(135deg,#4285F4,#0F9D58,#F4B400,#DB4437)', opacity: 0.9 }} />
                <span className="text-[0.6875rem] font-bold" style={{ color: '#4285F4' }}>G</span>
                <span className="text-[0.6875rem] font-bold" style={{ color: '#EA4335' }}>o</span>
                <span className="text-[0.6875rem] font-bold" style={{ color: '#FBBC05' }}>o</span>
                <span className="text-[0.6875rem] font-bold" style={{ color: '#4285F4' }}>g</span>
                <span className="text-[0.6875rem] font-bold" style={{ color: '#34A853' }}>l</span>
                <span className="text-[0.6875rem] font-bold" style={{ color: '#EA4335' }}>e</span>
              </div>
              <div className="flex-1 bg-white rounded-full border border-gray-200 px-4 py-1.5 text-xs text-gray-400">
                your search query here…
              </div>
            </div>

            {/* Preview */}
            <div className={`p-5 ${tab === 'mobile' ? 'flex justify-center' : ''}`}>
              <SerpPreview url={url} title={title} meta={meta} isMobile={tab === 'mobile'} />
            </div>

            {/* Footer note */}
            <div className="border-t border-gray-100 bg-gray-50 px-5 py-3">
              <p className="text-[0.65rem] text-gray-400">
                Pixel-width estimates are approximate. Actual truncation depends on character widths and Google's dynamic rendering. Always test live with a real search.
              </p>
            </div>
          </div>

          {/* Status summary */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: 'Title tag', status: tStatus },
              { label: 'Meta description', status: mStatus },
            ].map(({ label, status }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl px-4 py-3"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: statusColour[status] }}
                />
                <div>
                  <p className="text-xs font-semibold text-gray-700">{label}</p>
                  <p className="text-[0.65rem] text-gray-400" style={{ color: statusColour[status] }}>
                    {statusLabel[status]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
