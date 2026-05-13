'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

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
    const updateProgress = () => {
      const scrollTop = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      setProgress(maxScroll > 0 ? Math.min((scrollTop / maxScroll) * 100, 100) : 0)
    }

    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)
    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
    }
  }, [])

  return (
    <div
      className="fixed top-0 left-0 z-[100] h-[3px] bg-[#00D4AA] transition-[width] duration-150"
      style={{ width: `${progress}%` }}
    />
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
      <div
        className={`rounded-xl border p-5 transition-all duration-300 ${
          !revealed ? 'border-white/20 bg-[#111]' : 'border-white/[0.06] bg-[#0D0D0D] opacity-50'
        }`}
      >
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-white/40 mb-3">What GA4 shows</p>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <span className="text-white/50">source</span><strong className="text-white">(direct)</strong>
          <span className="text-white/50">medium</span><strong className="text-white">(none)</strong>
          <span className="text-white/50">sessions</span><strong className="text-white">312</strong>
        </div>
      </div>
      <button
        onClick={() => setRevealed((v) => !v)}
        className="self-start px-4 py-2 rounded-lg text-sm font-bold text-[#0A0A0A] bg-[#00D4AA] hover:opacity-90 transition-opacity"
      >
        {revealed ? 'Hide' : 'Reveal the truth'}
      </button>
      <div
        className={`rounded-xl border p-5 transition-all duration-300 ${
          revealed ? 'border-[#00D4AA]/30 bg-[#0A1F1A]' : 'border-white/[0.06] bg-[#0D0D0D] opacity-50'
        }`}
      >
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-[#00D4AA] mb-3">What is actually happening</p>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <span className="text-white/50">source</span><strong className="text-white">chatgpt.com</strong>
          <span className="text-white/50">medium</span><strong className="text-white">referral</strong>
          <span className="text-white/50">sessions</span><strong className="text-white">312</strong>
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
    <div className="relative my-6 rounded-xl bg-[#111] border border-white/[0.08] overflow-hidden">
      <button
        onClick={copy}
        className="absolute top-3 right-3 px-3 py-1 rounded-md text-xs font-bold text-[#00D4AA] border border-[#00D4AA]/30 hover:bg-[#00D4AA]/10 transition-colors"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre className="p-5 pr-20 text-sm leading-[1.8] overflow-x-auto m-0">
        <code className="text-[#D1D5DB]">
          <span className="text-white/50">Session source contains:</span> chatgpt.com{'\n'}
          <span className="text-white/50">Session source contains:</span> chat.openai.com
        </code>
      </pre>
    </div>
  )
}

function PatternChart({ active }: { active: boolean }) {
  return (
    <div className="my-6 rounded-xl bg-[#111] border border-white/[0.08] p-5">
      <svg viewBox="0 0 680 320" role="img" aria-label="Line chart showing flat organic search and a spike in AI referral traffic">
        <line x1="70" y1="250" x2="620" y2="250" stroke="#292929" />
        <line x1="70" y1="60" x2="70" y2="250" stroke="#292929" />
        <path d="M80 166 C155 160 218 166 284 162 C352 158 416 165 488 161 C540 159 584 160 616 158" fill="none" stroke="#777" strokeWidth="5" strokeLinecap="round" />
        <path
          d="M80 238 C154 236 218 237 278 232 C348 226 396 208 438 154 C476 106 534 84 616 72"
          fill="none"
          stroke="#00D4AA"
          strokeWidth="6"
          strokeLinecap="round"
          style={{ opacity: active ? 1 : 0.3, transition: 'opacity 0.6s ease' }}
        />
        <circle cx="504" cy="95" r="7" fill="#00D4AA" style={{ opacity: active ? 1 : 0, transition: 'opacity 0.6s ease 0.3s' }} />
        <g style={{ opacity: active ? 1 : 0, transition: 'opacity 0.4s ease 0.5s' }}>
          <rect x="386" y="30" width="218" height="42" rx="12" fill="#111" stroke="#00D4AA" />
          <text x="408" y="56" fill="#D1D5DB" fontSize="15" fontWeight="700">ChatGPT mentioned this page</text>
        </g>
        <text x="86" y="288" fill="#777" fontSize="14">Organic Search</text>
        <text x="260" y="288" fill="#00D4AA" fontSize="14">AI Referral</text>
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
    const params = new URLSearchParams({
      utm_source: source,
      utm_medium: medium,
      utm_campaign: campaign || 'your-page-name',
    })
    return `https://example.com/your-page?${params.toString()}`
  }, [source, medium, campaign])

  const copy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="my-6 rounded-xl bg-[#111] border border-white/[0.08] p-5 flex flex-col gap-4">
      {[
        { label: 'Campaign Source', value: source, onChange: setSource, placeholder: 'chatgpt' },
        { label: 'Campaign Medium', value: medium, onChange: setMedium, placeholder: 'ai-referral' },
        { label: 'Campaign Name', value: campaign, onChange: setCampaign, placeholder: 'chatgpt-traffic-guide' },
      ].map(({ label, value, onChange, placeholder }) => (
        <label key={label} className="flex flex-col gap-1.5 text-sm">
          <span className="text-white/50 font-medium">{label}</span>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="bg-[#0A0A0A] border border-white/[0.1] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00D4AA]/50 placeholder:text-white/20"
          />
        </label>
      ))}
      <div className="flex items-center gap-3 mt-1 p-3 rounded-lg bg-[#0A0A0A] border border-white/[0.08]">
        <code className="flex-1 text-[0.8125rem] text-[#00D4AA] break-all">{output}</code>
        <button
          onClick={copy}
          className="shrink-0 px-3 py-1.5 rounded-md text-xs font-bold text-[#0A0A0A] bg-[#00D4AA] hover:opacity-90 transition-opacity"
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
      <div className="rounded-xl bg-[#111] border border-white/[0.08] p-5 flex flex-col gap-3">
        <p className="text-sm font-semibold text-white/50 m-0">No AI visibility</p>
        {[['Organic', '82%'], ['Direct', '58%'], ['ChatGPT', '0%']].map(([label, width]) => (
          <div key={label} className="flex items-center gap-3 text-sm">
            <span className="w-16 text-white/40 shrink-0">{label}</span>
            <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full bg-white/20 rounded-full" style={{ width }} />
            </div>
          </div>
        ))}
        <strong className="text-sm text-white/30">0% AI traffic</strong>
      </div>
      <div className="rounded-xl bg-[#0A1F1A] border border-[#00D4AA]/20 p-5 flex flex-col gap-3">
        <p className="text-sm font-semibold text-[#00D4AA] m-0">AI-optimised site</p>
        {[['Organic', '72%'], ['Direct', '42%'], ['ChatGPT', '64%']].map(([label, width]) => (
          <div key={label} className="flex items-center gap-3 text-sm">
            <span className="w-16 text-white/60 shrink-0">{label}</span>
            <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${label === 'ChatGPT' ? 'bg-[#00D4AA]' : 'bg-white/30'}`}
                style={{ width }}
              />
            </div>
          </div>
        ))}
        <strong className="text-sm text-[#00D4AA]">15% AI traffic</strong>
      </div>
    </div>
  )
}

function WorksWithLogos() {
  const logos = ['GA4', 'GSC', 'GPT', 'CLD', 'PPLX']
  return (
    <div className="flex items-center gap-3 flex-wrap mt-6">
      <span className="text-sm text-white/35">Works with</span>
      {logos.map((logo) => (
        <svg key={logo} className="w-10 h-10" viewBox="0 0 64 64" aria-label={logo} role="img">
          <rect x="6" y="6" width="52" height="52" rx="16" fill="#0A0A0A" stroke="#2A2A2A" />
          <text x="32" y="38" textAnchor="middle" fill="#D1D5DB" fontSize="15" fontWeight="800">{logo}</text>
        </svg>
      ))}
    </div>
  )
}

export default function BlogPostClient() {
  const { activeSection, chartVisible } = useArticleObservers()

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      <ReadingProgress />

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center no-underline">
            <span className="text-[1.1875rem] font-extrabold text-white tracking-tight leading-none">Say</span>
            <span className="text-[1.1875rem] font-extrabold text-[#00D4AA] tracking-tight leading-none">SEO</span>
          </Link>
          <Link href="/blog" className="text-sm text-white/50 hover:text-white/80 transition-colors no-underline">
            ← Blog
          </Link>
        </div>
      </nav>

      {/* Article header */}
      <div className="max-w-7xl mx-auto w-full px-6 pt-14 pb-10">
        <div className="max-w-[800px]">
          <span className="inline-block px-2.5 py-1 rounded-full border border-[#00D4AA]/40 text-[#00D4AA] text-[0.6875rem] font-bold tracking-[0.1em] uppercase mb-5">
            AI Traffic
          </span>
          <h1 className="text-[clamp(2rem,4.5vw,3rem)] font-extrabold text-white tracking-[-0.03em] leading-[1.1] mb-5">
            How to Track if ChatGPT is Sending You Traffic
          </h1>
          <p className="text-[0.9375rem] text-white/40 m-0">
            SaySEO Team · 9 May 2026 · 7 min read
          </p>
          <div className="mt-8 h-px bg-[#00D4AA]/30" />
        </div>
      </div>

      {/* Shell: article + sidebar */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 pb-20">
        <div className="flex gap-16 items-start">

          {/* Article body */}
          <main className="flex-1 min-w-0 max-w-[720px]">

            <section id="ga4-problem" data-observe-section className="mb-14 scroll-mt-24">
              <p className="text-[1.125rem] text-[#D1D5DB] leading-[1.8] mb-6">
                ChatGPT is already shaping how people discover websites, but most analytics setups still treat that traffic as invisible. The click lands, the session appears, and the source often dissolves into direct traffic or an unhelpful default bucket.
              </p>
              <h2 className="text-[1.375rem] font-bold text-white leading-tight mb-4 mt-10">
                The Problem with GA4 and AI Traffic
              </h2>
              <p className="text-[#D1D5DB] leading-[1.8] mb-5">
                By default, ChatGPT referrals can appear as{' '}
                <code className="text-[#00D4AA] bg-[#0A1F1A] px-1.5 py-0.5 rounded text-[0.9em] font-mono">direct</code>{' '}
                or{' '}
                <code className="text-[#00D4AA] bg-[#0A1F1A] px-1.5 py-0.5 rounded text-[0.9em] font-mono">(not set)</code>{' '}
                in GA4 because many clicks do not pass a reliable referrer header. That means a page can be recommended by ChatGPT, receive qualified visitors, and still look like it gained mystery traffic from nowhere.
              </p>
              <SourceRevealCard />
            </section>

            <section id="source-report" data-observe-section className="mb-14 scroll-mt-24">
              <span className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[#00D4AA] mb-2 block">01</span>
              <h2 className="text-[1.375rem] font-bold text-white leading-tight mb-4">
                Step 1 — Check for chatgpt.com in Your Source Report
              </h2>
              <p className="text-[#D1D5DB] leading-[1.8] mb-5">
                Open GA4, go to Reports, then Acquisition, then Traffic Acquisition. Add the secondary dimension{' '}
                <strong className="text-white font-semibold">Session source</strong>, and filter for known ChatGPT sources. You are looking for the sessions GA4 does identify before you estimate the hidden share.
              </p>
              <CopyCodeBlock />
            </section>

            <section id="gsc-patterns" data-observe-section className="mb-14 scroll-mt-24">
              <span className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[#00D4AA] mb-2 block">02</span>
              <h2 className="text-[1.375rem] font-bold text-white leading-tight mb-4">
                Step 2 — Check GSC for AI Referral Patterns
              </h2>
              <p className="text-[#D1D5DB] leading-[1.8] mb-5">
                Google Search Console will not label ChatGPT traffic, but it does show which landing pages are being discovered. If a page suddenly receives more engaged traffic without a matching ranking or impressions change, it is often being referred from an AI answer.
              </p>
              <PatternChart active={chartVisible} />
            </section>

            <section id="utm-builder" data-observe-section className="mb-14 scroll-mt-24">
              <span className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[#00D4AA] mb-2 block">03</span>
              <h2 className="text-[1.375rem] font-bold text-white leading-tight mb-4">
                Step 3 — UTM Tag Your Content for AI Platforms
              </h2>
              <p className="text-[#D1D5DB] leading-[1.8] mb-5">
                Add UTM parameters to important internal links, templates, and reference pages. If AI platforms scrape and surface those links, more of the click path becomes measurable when visitors arrive.
              </p>
              <UTMBuilder />
            </section>

            <section id="data-patterns" data-observe-section className="mb-14 scroll-mt-24">
              <h2 className="text-[1.375rem] font-bold text-white leading-tight mb-4">
                What the Data Actually Looks Like
              </h2>
              <p className="text-[#D1D5DB] leading-[1.8] mb-5">
                A site with little AI visibility usually has flat referral data and no recognisable AI sources. A healthy pattern looks different: a small but growing share from ChatGPT, Claude, Perplexity, and similar platforms, often concentrated around high-authority guides and comparison pages.
              </p>
              <DashboardMockups />
            </section>

            <section id="fastest-way" data-observe-section className="mb-14 scroll-mt-24 rounded-2xl bg-[#0A1F1A] border border-[#00D4AA]/20 p-8">
              <h2 className="text-[1.375rem] font-bold text-white leading-tight mb-3 mt-0">
                Stop guessing. Start measuring.
              </h2>
              <p className="text-[#D1D5DB] leading-[1.8] mb-6">
                SaySEO connects GA4, GSC, and AI citation tracking in one dashboard. Free to start.
              </p>
              <Link
                href="/auth/signup"
                className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-bold text-[#0A0A0A] bg-[#00D4AA] hover:opacity-90 transition-opacity no-underline"
              >
                Track My AI Traffic Free →
              </Link>
              <WorksWithLogos />
            </section>

            {/* Post footer */}
            <footer className="mt-6 pt-10 border-t border-white/[0.08]">
              <div className="flex items-center gap-4 mb-8">
                <svg className="w-12 h-12 shrink-0" viewBox="0 0 64 64" aria-hidden="true">
                  <rect width="64" height="64" rx="18" fill="#102D27" />
                  <path d="M20 40c6 5 18 5 24-1 5-5 2-12-6-13l-9-1c-7-1-10-8-5-13 5-5 16-5 22 0" fill="none" stroke="#00D4AA" strokeWidth="5" strokeLinecap="round" />
                </svg>
                <div>
                  <h3 className="text-sm font-bold text-white mb-0.5">Written by the SaySEO Team</h3>
                  <p className="text-[0.8125rem] text-white/40 m-0">We build AI visibility tools for modern SEO professionals.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-8">
                {['AI Traffic', 'ChatGPT', 'GA4', 'GSC', 'AI SEO'].map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-white/[0.06] text-xs text-white/50 font-medium">
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                href="/blog"
                className="block rounded-xl bg-[#111] border border-white/[0.08] p-6 mb-6 no-underline hover:border-white/20 transition-colors"
              >
                <span className="text-xs text-white/35 mb-2 block">Next post coming soon</span>
                <strong className="text-white font-semibold">More field notes on AI visibility are on the way.</strong>
              </Link>
              <Link href="/blog" className="text-sm text-white/40 hover:text-white/70 transition-colors no-underline">
                ← Back to blog
              </Link>
            </footer>
          </main>

          {/* Sidebar (desktop only) */}
          <aside className="hidden lg:block w-[220px] shrink-0 sticky top-24">
            <nav aria-label="Table of contents">
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-white/35 mb-4">In this article</p>
              <div className="flex flex-col gap-1">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className={`text-[0.875rem] py-1.5 transition-colors duration-150 no-underline ${
                      activeSection === section.id
                        ? 'text-[#00D4AA] font-semibold'
                        : 'text-white/35 hover:text-white/60'
                    }`}
                  >
                    {section.label}
                  </a>
                ))}
              </div>
            </nav>
            <div className="mt-8 p-4 rounded-xl bg-[#0A1F1A] border border-[#00D4AA]/20">
              <p className="text-sm font-bold text-white mb-1.5">Track this with SaySEO</p>
              <span className="text-[0.8125rem] text-white/50 leading-snug block mb-3">
                Connect GA4 and GSC, then see AI traffic patterns in one focused dashboard.
              </span>
              <Link href="/auth/signup" className="text-sm font-bold text-[#00D4AA] hover:underline no-underline">
                Connect your site free →
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* Site footer */}
      <footer className="border-t border-white/[0.06] bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center mb-1.5">
                <span className="text-[1.0625rem] font-extrabold text-white tracking-tight">Say</span>
                <span className="text-[1.0625rem] font-extrabold text-[#00D4AA] tracking-tight">SEO</span>
              </div>
              <p className="text-[0.8125rem] text-white/30 leading-snug">
                AI Visibility for the modern SEO team.
              </p>
            </div>
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[0.8125rem] text-white/35">
              {[
                { label: 'Features', href: '/#features' },
                { label: 'Pricing', href: '/#pricing' },
                { label: 'Blog', href: '/blog' },
                { label: 'Login', href: '/auth/login' },
              ].map(({ label, href }) => (
                <Link key={label} href={href} className="hover:text-white/65 transition-colors no-underline">
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="border-t border-white/[0.05] pt-6">
            <p className="text-[0.8rem] text-white/[0.22]">&copy; 2026 SaySEO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
