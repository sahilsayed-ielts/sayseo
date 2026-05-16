import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { AffiliateNav } from '@/components/affiliate/AffiliateNav'
import { AffiliateFooter } from '@/components/affiliate/AffiliateFooter'

export const metadata: Metadata = {
  title: 'AI Visibility Tracker — Free SEO Tool | SaySEO',
  description:
    'Track when ChatGPT, Gemini, and Perplexity cite your website. Monitor AI-generated traffic, citation mentions, and Google AI Overviews — all in one free dashboard.',
  keywords: [
    'AI visibility tracker',
    'ChatGPT SEO tool',
    'AI citation monitoring',
    'Google AI Overview tracker',
    'free SEO tool',
    'AI traffic analytics',
  ],
  alternates: { canonical: 'https://sayseo.co.uk/app' },
  openGraph: {
    type: 'website',
    siteName: 'SaySEO',
    title: 'AI Visibility Tracker — Free SEO Tool | SaySEO',
    description:
      'Track when ChatGPT, Gemini, and Perplexity cite your website. Free dashboard for SEO professionals.',
    url: 'https://sayseo.co.uk/app',
    locale: 'en_GB',
  },
  robots: { index: true, follow: true },
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconSearch() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="1.75" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
    </svg>
  )
}

function IconGlobe() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="1.75" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" strokeLinecap="round" />
    </svg>
  )
}

function IconBarChart() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="1.75" aria-hidden="true">
      <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" />
    </svg>
  )
}

function IconConnect() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="1.75" aria-hidden="true">
      <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconAnalyse() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="1.75" aria-hidden="true">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconScore() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="1.75" aria-hidden="true">
      <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Dashboard Mockup ─────────────────────────────────────────────────────────

function DashboardMockup() {
  const font = 'ui-sans-serif, system-ui, -apple-system, sans-serif'
  return (
    <div className="relative w-full">
      <div className="absolute inset-x-8 top-1/3 h-48 bg-[#00D4AA]/[0.06] blur-3xl rounded-full pointer-events-none" />
      <svg
        viewBox="0 0 520 372"
        className="relative w-full"
        style={{ filter: 'drop-shadow(0 32px 72px rgba(0,0,0,0.6))' }}
        role="img"
        aria-label="SaySEO dashboard preview showing an AI Visibility Score of 72, citation monitoring results, and AI traffic sources"
      >
        <rect x="0" y="0" width="520" height="372" rx="14" fill="#111111" stroke="#222222" strokeWidth="1" />
        <rect x="0" y="0" width="520" height="46" rx="14" fill="#0D0D0D" />
        <rect x="0" y="32" width="520" height="14" fill="#0D0D0D" />
        <circle cx="18" cy="23" r="5" fill="#00D4AA" />
        <text x="30" y="28" fill="rgba(255,255,255,0.75)" fontSize="12" fontWeight="600" fontFamily={font}>sayseo.co.uk</text>
        <circle cx="372" cy="23" r="4" fill="#00D4AA" />
        <text x="382" y="28" fill="#00D4AA" fontSize="11" fontWeight="600" fontFamily={font}>Connected</text>
        <line x1="0" y1="46" x2="520" y2="46" stroke="#1E1E1E" strokeWidth="1" />

        <text x="20" y="65" fill="rgba(255,255,255,0.28)" fontSize="9" fontWeight="700" letterSpacing="1.4" fontFamily={font}>AI VISIBILITY SCORE</text>
        <circle cx="124" cy="158" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="9" />
        <circle cx="124" cy="158" r="54" fill="none" stroke="#00D4AA" strokeWidth="9" strokeLinecap="round" strokeDasharray="100" strokeDashoffset="28" pathLength="100" transform="rotate(-90 124 158)" />
        <text x="124" y="151" fill="#ffffff" fontSize="32" fontWeight="800" textAnchor="middle" fontFamily={font}>72</text>
        <text x="124" y="170" fill="rgba(255,255,255,0.3)" fontSize="11" textAnchor="middle" fontFamily={font}>/100</text>
        <rect x="80" y="224" width="88" height="22" rx="11" fill="rgba(251,191,36,0.1)" stroke="rgba(251,191,36,0.18)" strokeWidth="1" />
        <text x="124" y="239" fill="#fbbf24" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily={font}>Developing</text>
        <text x="124" y="260" fill="rgba(52,211,153,0.7)" fontSize="10.5" textAnchor="middle" fontFamily={font}>↑ 8 pts this week</text>
        <line x1="254" y1="52" x2="254" y2="270" stroke="#1E1E1E" strokeWidth="1" />

        <text x="272" y="65" fill="rgba(255,255,255,0.28)" fontSize="9" fontWeight="700" letterSpacing="1.4" fontFamily={font}>CITATION MONITOR</text>
        <text x="272" y="91" fill="rgba(255,255,255,0.72)" fontSize="12" fontFamily={font}>chatgpt.com</text>
        <rect x="444" y="78" width="52" height="19" rx="9.5" fill="rgba(0,212,170,0.12)" />
        <text x="470" y="91" fill="#00D4AA" fontSize="10.5" fontWeight="700" textAnchor="middle" fontFamily={font}>Cited</text>
        <line x1="272" y1="105" x2="504" y2="105" stroke="#1A1A1A" strokeWidth="1" />
        <text x="272" y="124" fill="rgba(255,255,255,0.72)" fontSize="12" fontFamily={font}>perplexity.ai</text>
        <rect x="444" y="111" width="52" height="19" rx="9.5" fill="rgba(0,212,170,0.12)" />
        <text x="470" y="124" fill="#00D4AA" fontSize="10.5" fontWeight="700" textAnchor="middle" fontFamily={font}>Cited</text>
        <line x1="272" y1="138" x2="504" y2="138" stroke="#1A1A1A" strokeWidth="1" />
        <text x="272" y="157" fill="rgba(255,255,255,0.72)" fontSize="12" fontFamily={font}>gemini.google.com</text>
        <rect x="432" y="144" width="66" height="19" rx="9.5" fill="rgba(248,113,113,0.1)" />
        <text x="465" y="157" fill="#f87171" fontSize="10.5" fontWeight="700" textAnchor="middle" fontFamily={font}>Not cited</text>
        <line x1="272" y1="171" x2="504" y2="171" stroke="#1A1A1A" strokeWidth="1" />
        <text x="272" y="190" fill="rgba(255,255,255,0.72)" fontSize="12" fontFamily={font}>claude.ai</text>
        <rect x="444" y="177" width="52" height="19" rx="9.5" fill="rgba(0,212,170,0.12)" />
        <text x="470" y="190" fill="#00D4AA" fontSize="10.5" fontWeight="700" textAnchor="middle" fontFamily={font}>Cited</text>
        <line x1="272" y1="204" x2="504" y2="204" stroke="#1A1A1A" strokeWidth="1" />
        <text x="272" y="223" fill="rgba(255,255,255,0.45)" fontSize="11" fontFamily={font}>Google AI Overview</text>
        <rect x="430" y="210" width="74" height="19" rx="9.5" fill="rgba(0,212,170,0.12)" />
        <text x="467" y="223" fill="#00D4AA" fontSize="10.5" fontWeight="700" textAnchor="middle" fontFamily={font}>Appearing</text>

        <line x1="0" y1="272" x2="520" y2="272" stroke="#1E1E1E" strokeWidth="1" />
        <text x="20" y="292" fill="rgba(255,255,255,0.28)" fontSize="9" fontWeight="700" letterSpacing="1.4" fontFamily={font}>AI TRAFFIC SOURCES — LAST 30 DAYS</text>
        <text x="20" y="316" fill="rgba(255,255,255,0.6)" fontSize="11" fontFamily={font}>ChatGPT</text>
        <rect x="100" y="305" width="290" height="10" rx="5" fill="rgba(255,255,255,0.05)" />
        <rect x="100" y="305" width="210" height="10" rx="5" fill="#00D4AA" opacity="0.65" />
        <text x="402" y="315" fill="rgba(255,255,255,0.38)" fontSize="11" fontFamily={font}>1,240</text>
        <text x="20" y="338" fill="rgba(255,255,255,0.6)" fontSize="11" fontFamily={font}>Perplexity</text>
        <rect x="100" y="327" width="290" height="10" rx="5" fill="rgba(255,255,255,0.05)" />
        <rect x="100" y="327" width="122" height="10" rx="5" fill="#00D4AA" opacity="0.45" />
        <text x="402" y="337" fill="rgba(255,255,255,0.38)" fontSize="11" fontFamily={font}>586</text>
        <text x="20" y="360" fill="rgba(255,255,255,0.6)" fontSize="11" fontFamily={font}>Gemini</text>
        <rect x="100" y="349" width="290" height="10" rx="5" fill="rgba(255,255,255,0.05)" />
        <rect x="100" y="349" width="62" height="10" rx="5" fill="#00D4AA" opacity="0.28" />
        <text x="402" y="359" fill="rgba(255,255,255,0.38)" fontSize="11" fontFamily={font}>312</text>
      </svg>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AppLandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <AffiliateNav />

      {/* ── Hero ───────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 lg:pt-24 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00D4AA]/[0.08] border border-[#00D4AA]/20 mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] shrink-0" />
              <span className="text-[0.6875rem] font-bold text-[#00D4AA] tracking-[0.1em] uppercase">
                Free AI Visibility Tool
              </span>
            </div>

            <h1 className="text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold leading-[1.07] tracking-[-0.03em] text-white mb-6">
              Your AI Visibility,<br />
              <span className="text-[#00D4AA]">Finally Measurable.</span>
            </h1>

            <p className="text-[1.0625rem] text-white/50 leading-[1.75] mb-8 max-w-[520px]">
              Track when ChatGPT, Gemini, and Perplexity cite your site. Monitor AI-generated traffic and Google AI Overview appearances — all in one free dashboard.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-[0.9375rem] font-bold text-[#0A0A0A] bg-[#00D4AA] hover:opacity-88 transition-opacity duration-150"
              >
                Connect Your Site Free
                <IconArrowRight />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center px-6 py-3 rounded-lg text-[0.9375rem] font-semibold text-white/55 border border-white/[0.13] hover:border-white/25 hover:text-white/80 transition-colors duration-150"
              >
                Log in
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex">
                {['#4ade80', '#60a5fa', '#c084fc'].map((colour, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-[#0A0A0A]"
                    style={{ backgroundColor: colour + '33', marginLeft: i === 0 ? 0 : -10 }}
                  />
                ))}
              </div>
              <p className="text-[0.8125rem] text-white/38">
                Trusted by <span className="text-white/65 font-semibold">200+ SEO professionals</span>
              </p>
            </div>
          </div>

          <div className="w-full max-w-[540px] mx-auto lg:mx-0 lg:max-w-none">
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-[#00D4AA] mb-3">Features</p>
            <h2 className="text-[clamp(1.75rem,3.5vw,2.375rem)] font-extrabold text-white tracking-[-0.025em]">
              Everything you need to measure AI visibility
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: <IconSearch />,
                title: 'Citation Monitoring',
                description:
                  'Find out whether ChatGPT, Perplexity, Claude, and Gemini cite your domain — even when there is no click to track.',
              },
              {
                icon: <IconGlobe />,
                title: 'AI Overview Tracker',
                description:
                  'Detect which of your target queries trigger a Google AI Overview and whether your domain appears.',
              },
              {
                icon: <IconBarChart />,
                title: 'AI Traffic Intelligence',
                description:
                  'Measure sessions arriving from ChatGPT, Gemini, and Perplexity using your GA4 data.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-[#111111] border border-white/[0.07] rounded-xl p-7 hover:-translate-y-1 hover:border-[#00D4AA]/20 transition-all duration-200"
                style={{ borderTop: '2px solid #00D4AA' }}
              >
                <div className="w-11 h-11 rounded-lg bg-[#00D4AA]/[0.09] flex items-center justify-center mb-5">
                  {f.icon}
                </div>
                <h3 className="text-[0.9375rem] font-bold text-white mb-2 tracking-[-0.01em]">{f.title}</h3>
                <p className="text-[0.875rem] text-white/45 leading-[1.7]">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────────────── */}
      <section className="bg-[#0d0d0d] border-t border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-[#00D4AA] mb-3">How It Works</p>
            <h2 className="text-[clamp(1.75rem,3.5vw,2.375rem)] font-extrabold text-white tracking-[-0.025em]">
              Up and running in minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            <div className="hidden md:block absolute top-5 left-[calc(33.33%+16px)] right-[calc(33.33%+16px)] h-px bg-[#00D4AA]/15" />

            {[
              {
                step: 1,
                icon: <IconConnect />,
                title: 'Connect your Google account',
                description: 'Authorise read-only access to your GA4 property and Search Console site with a single OAuth click.',
              },
              {
                step: 2,
                icon: <IconAnalyse />,
                title: 'SaySEO analyses your AI visibility',
                description: 'We pull your GA4 sessions, filter for AI referrers, surface your top AI-driven pages, and identify your highest-traffic queries.',
              },
              {
                step: 3,
                icon: <IconScore />,
                title: 'Get your AI Visibility Score',
                description: 'Receive a 0–100 AI Visibility Score, a prioritised list of fixes, and real-time citation and AI Overview data.',
              },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-start">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#00D4AA]/[0.1] border border-[#00D4AA]/25 mb-5 shrink-0 relative z-10">
                  <span className="text-[0.875rem] font-bold text-[#00D4AA]">{s.step}</span>
                </div>
                <h3 className="text-[0.9375rem] font-bold text-white mb-2 tracking-[-0.01em]">{s.title}</h3>
                <p className="text-[0.875rem] text-white/45 leading-[1.7]">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.07] border border-white/[0.07] rounded-xl bg-[#111111] overflow-hidden">
          {[
            { value: '200+', label: 'Sites Tracked', sub: 'Across SEO teams and agencies' },
            { value: '50K+', label: 'Citation Checks Run', sub: 'Across ChatGPT, Gemini, Perplexity' },
            { value: '60s', label: 'Time to First Score', sub: 'From connecting your Google account' },
          ].map((stat) => (
            <div key={stat.label} className="px-8 py-8 text-center">
              <p className="text-[clamp(2rem,4vw,2.625rem)] font-extrabold text-[#00D4AA] tracking-[-0.04em] leading-none mb-1.5">
                {stat.value}
              </p>
              <p className="text-[0.9375rem] font-bold text-white mb-1">{stat.label}</p>
              <p className="text-[0.8rem] text-white/32 leading-snug">{stat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────────────── */}
      <section className="bg-[#0d0d0d] border-t border-b border-white/[0.05]">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-[#00D4AA] mb-3">Pricing</p>
            <h2 className="text-[clamp(1.75rem,3.5vw,2.375rem)] font-extrabold text-white tracking-[-0.025em]">
              Start free, scale when ready
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-8">
              <p className="text-[0.8125rem] font-semibold text-white/45 mb-3 tracking-tight">Free Forever</p>
              <div className="flex items-baseline gap-1 mb-1.5">
                <span className="text-[2.5rem] font-extrabold text-white tracking-[-0.03em]">£0</span>
                <span className="text-[0.875rem] text-white/38">/month</span>
              </div>
              <p className="text-[0.875rem] text-white/38 mb-7 leading-relaxed">Connect one site and start tracking today.</p>
              <ul className="space-y-3 mb-8">
                {[
                  '1 connected site',
                  'AI Traffic Analytics (GA4)',
                  'Citation Monitor — 5 checks/day',
                  'AI Overview Tracker — 1 check/day',
                  'GSC query integration',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <svg className="w-3.5 h-3.5 text-[#00D4AA] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[0.875rem] text-white/58 leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className="block text-center px-5 py-3 rounded-lg text-[0.9375rem] font-bold text-[#0A0A0A] bg-[#00D4AA] hover:opacity-88 transition-opacity"
              >
                Get Started Free
              </Link>
            </div>

            <div className="relative bg-[#111111] border border-[#00D4AA]/30 rounded-2xl p-8 shadow-[0_0_0_1px_rgba(0,212,170,0.06),0_8px_48px_rgba(0,212,170,0.06)]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-[#00D4AA] text-[0.6875rem] font-bold text-[#0A0A0A] tracking-[0.06em] uppercase whitespace-nowrap">
                Most Popular
              </div>
              <p className="text-[0.8125rem] font-semibold text-[#00D4AA] mb-3 tracking-tight">Pro</p>
              <div className="flex items-baseline gap-1 mb-1.5">
                <span className="text-[2.5rem] font-extrabold text-white tracking-[-0.03em]">£19</span>
                <span className="text-[0.875rem] text-white/38">/month</span>
              </div>
              <p className="text-[0.875rem] text-white/38 mb-7 leading-relaxed">For professionals managing multiple sites.</p>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited sites',
                  'Everything in Free',
                  'Unlimited daily citation checks',
                  'Daily AI Overview scans',
                  'Weekly trend reports',
                  'Priority support',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <svg className="w-3.5 h-3.5 text-[#00D4AA] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[0.875rem] text-white/58 leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="block text-center px-5 py-3 rounded-lg text-[0.9375rem] font-bold text-white/40 bg-white/[0.05] border border-white/[0.07] cursor-default select-none">
                Coming Soon
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div
          className="rounded-2xl p-12 text-center border border-[#00D4AA]/22"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(0,212,170,0.06) 0%, transparent 70%), #111111',
            boxShadow: '0 0 0 1px rgba(0,212,170,0.06), 0 32px 64px rgba(0,0,0,0.3)',
          }}
        >
          <h2 className="text-[clamp(1.625rem,3.5vw,2.25rem)] font-extrabold text-white tracking-[-0.025em] mb-3">
            Start measuring your AI visibility today
          </h2>
          <p className="text-[1rem] text-white/45 mb-8">Free to connect. No credit card required.</p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg text-[0.9375rem] font-bold text-[#0A0A0A] bg-[#00D4AA] hover:opacity-88 transition-opacity"
          >
            Get Started Free
            <IconArrowRight />
          </Link>
        </div>
      </section>

      <AffiliateFooter />
    </div>
  )
}
