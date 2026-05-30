'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AffiliateNav } from '@/components/affiliate/AffiliateNav'
import { AffiliateFooter } from '@/components/affiliate/AffiliateFooter'

const sections = [
  { id: 'ga4-problem', label: 'GA4 problem' },
  { id: 'source-report', label: 'Check source reports' },
  { id: 'gsc-patterns', label: 'Find GSC patterns' },
  { id: 'utm-builder', label: 'Build UTM links' },
  { id: 'data-patterns', label: 'Read the data' },
  { id: 'fastest-way', label: 'Track with SaySEO' },
]

function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min((window.scrollY / max) * 100, 100) : 0)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [])

  return (
    <div className="fixed top-0 left-0 z-[100] h-[3px] bg-emerald-600 transition-[width] duration-150" style={{ width: `${progress}%` }} />
  )
}

function useArticleObservers() {
  const [activeSection, setActiveSection] = useState(sections[0].id)
  const [chartVisible, setChartVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
            if (entry.target.id === 'gsc-patterns') setChartVisible(true)
          }
        })
      },
      { rootMargin: '-34% 0px -54% 0px', threshold: 0.1 }
    )
    const targets = document.querySelectorAll('[data-observe-section]')
    targets.forEach((t) => observer.observe(t))
    return () => observer.disconnect()
  }, [])

  return { activeSection, chartVisible }
}

function SourceRevealCard() {
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="my-8 flex flex-col gap-3">
      <div className={`rounded-xl border p-5 transition-all duration-300 ${!revealed ? 'border-gray-200 bg-white shadow-sm' : 'border-gray-100 bg-gray-50 opacity-50'}`}>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400 mb-3">What GA4 shows</p>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <span className="text-gray-500">source</span><strong className="text-gray-900">(direct)</strong>
          <span className="text-gray-500">medium</span><strong className="text-gray-900">(none)</strong>
          <span className="text-gray-500">sessions</span><strong className="text-gray-900">312</strong>
        </div>
      </div>
      <button
        onClick={() => setRevealed((v) => !v)}
        className="self-start px-4 py-2 rounded-lg text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors"
      >
        {revealed ? 'Hide' : 'Reveal the truth'}
      </button>
      <div className={`rounded-xl border p-5 transition-all duration-300 ${revealed ? 'border-emerald-200 bg-emerald-50' : 'border-gray-100 bg-gray-50 opacity-50'}`}>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700 mb-3">What is actually happening</p>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <span className="text-gray-500">source</span><strong className="text-gray-900">chatgpt.com</strong>
          <span className="text-gray-500">medium</span><strong className="text-gray-900">referral</strong>
          <span className="text-gray-500">sessions</span><strong className="text-gray-900">312</strong>
        </div>
      </div>
    </div>
  )
}

function CopyCodeBlock() {
  const code = 'Session source contains: chatgpt.com\nSession source contains: chat.openai.com'
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="relative my-6 rounded-xl bg-gray-900 border border-gray-700 overflow-hidden">
      <button
        onClick={copy}
        className="absolute top-3 right-3 px-3 py-1 rounded-md text-xs font-bold text-emerald-400 border border-emerald-700/50 hover:bg-emerald-900/30 transition-colors"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre className="p-5 pr-20 text-sm leading-[1.8] overflow-x-auto m-0">
        <code className="text-gray-300">
          <span className="text-gray-500">Session source contains:</span> chatgpt.com{'\n'}
          <span className="text-gray-500">Session source contains:</span> chat.openai.com
        </code>
      </pre>
    </div>
  )
}

function PatternChart({ active }: { active: boolean }) {
  return (
    <div className="my-6 rounded-xl bg-white border border-gray-200 p-5 shadow-sm">
      <svg viewBox="0 0 680 320" role="img" aria-label="Line chart showing flat organic search and a spike in AI referral traffic">
        <line x1="70" y1="250" x2="620" y2="250" stroke="#E5E7EB" />
        <line x1="70" y1="60" x2="70" y2="250" stroke="#E5E7EB" />
        <path d="M80 166 C155 160 218 166 284 162 C352 158 416 165 488 161 C540 159 584 160 616 158" fill="none" stroke="#9CA3AF" strokeWidth="5" strokeLinecap="round" />
        <path
          d="M80 238 C154 236 218 237 278 232 C348 226 396 208 438 154 C476 106 534 84 616 72"
          fill="none"
          stroke="#047857"
          strokeWidth="6"
          strokeLinecap="round"
          style={{ opacity: active ? 1 : 0.3, transition: 'opacity 0.6s ease' }}
        />
        <circle cx="504" cy="95" r="7" fill="#047857" style={{ opacity: active ? 1 : 0, transition: 'opacity 0.6s ease 0.3s' }} />
        <g style={{ opacity: active ? 1 : 0, transition: 'opacity 0.4s ease 0.5s' }}>
          <rect x="386" y="30" width="218" height="42" rx="12" fill="white" stroke="#047857" strokeWidth="1.5" />
          <text x="408" y="56" fill="#1F2937" fontSize="15" fontWeight="700">ChatGPT mentioned this page</text>
        </g>
        <text x="86" y="288" fill="#9CA3AF" fontSize="14">Organic Search</text>
        <text x="260" y="288" fill="#047857" fontSize="14">AI Referral</text>
      </svg>
    </div>
  )
}

function UTMBuilder() {
  const [source, setSource] = useState('chatgpt')
  const [medium, setMedium] = useState('ai-referral')
  const [campaign, setCampaign] = useState('')
  const [copied, setCopied] = useState(false)

  const output = useMemo(() => {
    const params = new URLSearchParams({ utm_source: source, utm_medium: medium, utm_campaign: campaign || 'your-page-name' })
    return `https://example.com/your-page?${params.toString()}`
  }, [source, medium, campaign])

  const copy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="my-6 rounded-xl bg-white border border-gray-200 p-5 flex flex-col gap-4 shadow-sm">
      {[
        { label: 'Campaign Source', value: source, onChange: setSource, placeholder: 'chatgpt' },
        { label: 'Campaign Medium', value: medium, onChange: setMedium, placeholder: 'ai-referral' },
        { label: 'Campaign Name', value: campaign, onChange: setCampaign, placeholder: 'chatgpt-traffic-guide' },
      ].map(({ label, value, onChange, placeholder }) => (
        <label key={label} className="flex flex-col gap-1.5 text-sm">
          <span className="text-gray-600 font-medium">{label}</span>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 placeholder:text-gray-400"
            style={{ backgroundColor: '#F9FAFB', color: '#111827' }}
          />
        </label>
      ))}
      <div className="flex items-center gap-3 mt-1 p-3 rounded-lg bg-gray-50 border border-gray-200">
        <code className="flex-1 text-xs text-emerald-700 break-all">{output}</code>
        <button
          onClick={copy}
          className="shrink-0 px-3 py-1.5 rounded-md text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors"
        >
          {copied ? 'Copied' : 'Copy URL'}
        </button>
      </div>
    </div>
  )
}

function DashboardMockups() {
  return (
    <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="rounded-xl bg-white border border-gray-200 p-5 flex flex-col gap-3 shadow-sm">
        <p className="text-sm font-semibold text-gray-500">No AI visibility</p>
        {[['Organic', '82%'], ['Direct', '58%'], ['ChatGPT', '0%']].map(([label, width]) => (
          <div key={label} className="flex items-center gap-3 text-sm">
            <span className="w-16 text-gray-400 shrink-0">{label}</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gray-300 rounded-full" style={{ width }} />
            </div>
          </div>
        ))}
        <strong className="text-sm text-gray-400">0% AI traffic</strong>
      </div>
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-5 flex flex-col gap-3">
        <p className="text-sm font-semibold text-emerald-700">AI-optimised site</p>
        {[['Organic', '72%'], ['Direct', '42%'], ['ChatGPT', '64%']].map(([label, width]) => (
          <div key={label} className="flex items-center gap-3 text-sm">
            <span className="w-16 text-gray-600 shrink-0">{label}</span>
            <div className="flex-1 h-2 bg-emerald-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${label === 'ChatGPT' ? 'bg-emerald-600' : 'bg-emerald-300'}`}
                style={{ width }}
              />
            </div>
          </div>
        ))}
        <strong className="text-sm text-emerald-700">15% AI traffic</strong>
      </div>
    </div>
  )
}

function WorksWithLogos() {
  const logos = ['GA4', 'GSC', 'GPT', 'CLD', 'PPLX']
  return (
    <div className="flex items-center gap-3 flex-wrap mt-6">
      <span className="text-sm text-white/60">Works with</span>
      {logos.map((logo) => (
        <svg key={logo} className="w-10 h-10" viewBox="0 0 64 64" aria-label={logo} role="img">
          <rect x="6" y="6" width="52" height="52" rx="16" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" />
          <text x="32" y="38" textAnchor="middle" fill="white" fontSize="15" fontWeight="800">{logo}</text>
        </svg>
      ))}
    </div>
  )
}

export default function BlogPostClient() {
  const { activeSection, chartVisible } = useArticleObservers()

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <ReadingProgress />
      <AffiliateNav />

      {/* Article header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-10 pb-8">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
            <Link href="/" className="hover:text-emerald-700 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-emerald-700 transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-gray-600 font-medium">ChatGPT Traffic</span>
          </nav>
          <div className="max-w-[800px]">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold tracking-wide uppercase mb-5">
              AI Traffic
            </span>
            <h1 className="text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
              How to Track if ChatGPT is Sending You Traffic
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span>SaySEO Team</span>
              <span>·</span>
              <span>9 May 2026</span>
              <span>·</span>
              <span>7 min read</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shell: article + sidebar */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-10 pb-16">
        <div className="flex gap-14 items-start">

          {/* Article body */}
          <main className="flex-1 min-w-0 max-w-[720px]">

            <section id="ga4-problem" data-observe-section className="mb-12 scroll-mt-24">
              <p className="text-base text-gray-700 leading-relaxed mb-6">
                ChatGPT is already shaping how people discover websites, but most analytics setups still treat that traffic as invisible. The click lands, the session appears, and the source often dissolves into direct traffic or an unhelpful default bucket.
              </p>
              <h2 className="text-xl font-bold text-gray-900 leading-tight mb-4 mt-10 tracking-tight">
                The Problem with GA4 and AI Traffic
              </h2>
              <p className="text-gray-600 leading-relaxed mb-5">
                By default, ChatGPT referrals can appear as{' '}
                <code className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[0.9em] font-mono">direct</code>{' '}
                or{' '}
                <code className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[0.9em] font-mono">(not set)</code>{' '}
                in GA4 because many clicks do not pass a reliable referrer header. That means a page can be recommended by ChatGPT, receive qualified visitors, and still look like it gained mystery traffic from nowhere.
              </p>
              <SourceRevealCard />
            </section>

            <section id="source-report" data-observe-section className="mb-12 scroll-mt-24">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700 mb-2 block">01</span>
              <h2 className="text-xl font-bold text-gray-900 leading-tight mb-4 tracking-tight">
                Step 1 — Check for chatgpt.com in Your Source Report
              </h2>
              <p className="text-gray-600 leading-relaxed mb-5">
                Open GA4, go to Reports, then Acquisition, then Traffic Acquisition. Add the secondary dimension{' '}
                <strong className="text-gray-900 font-semibold">Session source</strong>, and filter for known ChatGPT sources.
              </p>
              <CopyCodeBlock />
            </section>

            <section id="gsc-patterns" data-observe-section className="mb-12 scroll-mt-24">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700 mb-2 block">02</span>
              <h2 className="text-xl font-bold text-gray-900 leading-tight mb-4 tracking-tight">
                Step 2 — Check GSC for AI Referral Patterns
              </h2>
              <p className="text-gray-600 leading-relaxed mb-5">
                Google Search Console will not label ChatGPT traffic, but it does show which landing pages are being discovered. If a page suddenly receives more engaged traffic without a matching ranking or impressions change, it is often being referred from an AI answer.
              </p>
              <PatternChart active={chartVisible} />
            </section>

            <section id="utm-builder" data-observe-section className="mb-12 scroll-mt-24">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700 mb-2 block">03</span>
              <h2 className="text-xl font-bold text-gray-900 leading-tight mb-4 tracking-tight">
                Step 3 — UTM Tag Your Content for AI Platforms
              </h2>
              <p className="text-gray-600 leading-relaxed mb-5">
                Add UTM parameters to important internal links, templates, and reference pages. If AI platforms scrape and surface those links, more of the click path becomes measurable.
              </p>
              <UTMBuilder />
            </section>

            <section id="data-patterns" data-observe-section className="mb-12 scroll-mt-24">
              <h2 className="text-xl font-bold text-gray-900 leading-tight mb-4 tracking-tight">
                What the Data Actually Looks Like
              </h2>
              <p className="text-gray-600 leading-relaxed mb-5">
                A site with little AI visibility usually has flat referral data and no recognisable AI sources. A healthy pattern looks different: a small but growing share from ChatGPT, Claude, Perplexity, and similar platforms.
              </p>
              <DashboardMockups />
            </section>

            <section id="fastest-way" data-observe-section className="mb-12 scroll-mt-24 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 p-8">
              <h2 className="text-xl font-bold text-white leading-tight mb-3 mt-0 tracking-tight">
                Stop guessing. Start measuring.
              </h2>
              <p className="text-white/80 leading-relaxed mb-6 text-sm">
                SaySEO connects GA4, GSC, and AI citation tracking in one dashboard. Free to start.
              </p>
              <Link
                href="/auth/signup"
                className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-bold text-emerald-800 bg-white hover:bg-gray-50 transition-colors"
              >
                Track My AI Traffic Free →
              </Link>
              <WorksWithLogos />
            </section>

            {/* Post footer */}
            <footer className="mt-6 pt-10 border-t border-gray-200">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <span className="text-emerald-700 font-extrabold text-sm">SE</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-0.5">Written by the SaySEO Team</h3>
                  <p className="text-xs text-gray-500">We build AI visibility tools for modern SEO professionals.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-8">
                {['AI Traffic', 'ChatGPT', 'GA4', 'GSC', 'AI SEO'].map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-gray-100 text-xs text-gray-500 font-medium">
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                href="/blog"
                className="block rounded-xl bg-white border border-gray-200 p-6 mb-6 hover:border-emerald-200 hover:shadow-sm transition-all"
              >
                <span className="text-xs text-gray-400 mb-2 block">Next post coming soon</span>
                <strong className="text-gray-900 font-semibold text-sm">More field notes on AI visibility are on the way.</strong>
              </Link>
              <Link href="/blog" className="text-sm text-gray-400 hover:text-emerald-700 transition-colors">
                ← Back to blog
              </Link>
            </footer>
          </main>

          {/* Sidebar (desktop only) */}
          <aside className="hidden lg:block w-[220px] shrink-0 sticky top-24">
            <nav aria-label="Table of contents">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400 mb-4">In this article</p>
              <div className="flex flex-col gap-0.5">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className={`text-sm py-1.5 px-2 rounded transition-colors duration-150 ${
                      activeSection === section.id
                        ? 'text-emerald-700 font-semibold bg-emerald-50'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {section.label}
                  </a>
                ))}
              </div>
            </nav>
            <div className="mt-8 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <p className="text-sm font-bold text-gray-900 mb-1.5">Track this with SaySEO</p>
              <span className="text-xs text-gray-600 leading-snug block mb-3">
                Connect GA4 and GSC, then see AI traffic patterns in one focused dashboard.
              </span>
              <Link href="/auth/signup" className="text-sm font-bold text-emerald-700 hover:underline">
                Connect your site free →
              </Link>
            </div>
          </aside>
        </div>
      </div>

      <AffiliateFooter />
    </div>
  )
}
