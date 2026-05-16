import Link from 'next/link'
import type { Metadata } from 'next'
import { AffiliateNav } from '@/components/affiliate/AffiliateNav'
import { AffiliateFooter } from '@/components/affiliate/AffiliateFooter'

export const metadata: Metadata = {
  title: 'SEO Tool Comparisons 2026 — Head-to-Head Reviews | SaySEO',
  description:
    'Side-by-side comparisons of the top SEO tools. Semrush vs Ahrefs, SE Ranking vs Semrush, Ahrefs vs Moz, and more — find out which tool wins for your use case.',
  keywords: [
    'Semrush vs Ahrefs',
    'SE Ranking vs Semrush',
    'Ahrefs vs Moz',
    'SEO tool comparison',
    'best SEO tool for agencies',
    'cheap SEO tools',
  ],
  alternates: { canonical: 'https://sayseo.co.uk/comparisons' },
  openGraph: {
    title: 'SEO Tool Comparisons | SaySEO',
    description: 'Head-to-head SEO tool comparisons — find out which tool wins for your use case.',
    url: 'https://sayseo.co.uk/comparisons',
    locale: 'en_GB',
  },
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const comparisons = [
  {
    href: '/comparisons/semrush-vs-ahrefs',
    tool1: { name: 'Semrush', badge: 'Best Overall', badgeColor: '#00D4AA', winner: true },
    tool2: { name: 'Ahrefs', badge: 'Best for Links', badgeColor: '#f59e0b', winner: false },
    tag: 'All-in-One',
    summary: 'The two most popular SEO platforms go head-to-head. We test both across keyword research, backlinks, site audits, and competitive analysis to tell you which is worth it for your workflow.',
    verdict: 'Semrush wins on breadth; Ahrefs wins on backlink data quality.',
  },
  {
    href: '/comparisons/se-ranking-vs-semrush',
    tool1: { name: 'SE Ranking', badge: 'Best Value', badgeColor: '#8b5cf6', winner: false },
    tool2: { name: 'Semrush', badge: 'Most Powerful', badgeColor: '#00D4AA', winner: true },
    tag: 'Value',
    summary: "SE Ranking is less than half the price of Semrush. But is the cheaper tool good enough for professional SEO? We test both side by side across every major feature category.",
    verdict: 'Semrush wins on data depth; SE Ranking wins on value for freelancers.',
  },
  {
    href: '/comparisons/ahrefs-vs-moz',
    tool1: { name: 'Ahrefs', badge: 'Best Links', badgeColor: '#f59e0b', winner: true },
    tool2: { name: 'Moz Pro', badge: 'Best for DA', badgeColor: '#06b6d4', winner: false },
    tag: 'Link Analysis',
    summary: 'Ahrefs and Moz both focus heavily on backlink analysis, but their data sources and strengths differ significantly. Which link intelligence tool gives you the edge?',
    verdict: "Ahrefs wins on data quality and features; Moz wins on the DA metric's brand recognition.",
  },
  {
    href: '/comparisons/surfer-vs-semrush',
    tool1: { name: 'Surfer SEO', badge: 'Best for Content', badgeColor: '#3b82f6', winner: false },
    tool2: { name: 'Semrush', badge: 'All-in-One', badgeColor: '#00D4AA', winner: false },
    tag: 'Content',
    summary: "Surfer SEO is purpose-built for content optimisation, while Semrush's Writing Assistant is a feature within a broader platform. Which is the better choice for your content team?",
    verdict: 'Surfer wins for dedicated content teams; Semrush wins if you need the full SEO suite too.',
  },
  {
    href: '/comparisons/screaming-frog-vs-semrush',
    tool1: { name: 'Screaming Frog', badge: 'Best Technical', badgeColor: '#ef4444', winner: true },
    tool2: { name: 'Semrush Site Audit', badge: 'Best Cloud', badgeColor: '#00D4AA', winner: false },
    tag: 'Technical SEO',
    summary: 'Screaming Frog is the industry-standard desktop crawler, while Semrush Site Audit is the leading cloud-based alternative. We compare crawl depth, ease of use, and value.',
    verdict: 'Screaming Frog wins on depth and value; Semrush wins on accessibility and team collaboration.',
  },
  {
    href: '/comparisons/mangools-vs-se-ranking',
    tool1: { name: 'Mangools', badge: 'Easiest to Use', badgeColor: '#10b981', winner: false },
    tool2: { name: 'SE Ranking', badge: 'Best Value', badgeColor: '#8b5cf6', winner: true },
    tag: 'Budget',
    summary: 'Both tools target budget-conscious SEOs, but they make different trade-offs. Mangools prioritises ease of use while SE Ranking offers more features. Which is the better buy?',
    verdict: 'SE Ranking wins on features and depth; Mangools wins on ease of use and UX.',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ComparisonsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      <AffiliateNav />

      {/* ── Hero ───────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto w-full px-6 pt-16 pb-12">
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[#00D4AA] mb-4">
          Comparisons
        </p>
        <h1 className="text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold text-white tracking-[-0.03em] leading-[1.07] mb-4">
          SEO Tool Comparisons
        </h1>
        <p className="text-[1.0625rem] text-white/50 leading-[1.75] max-w-[560px]">
          Deciding between two tools? Our head-to-head comparisons test both side by side so you spend your money wisely.
        </p>
      </section>

      {/* ── Comparisons grid ───────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {comparisons.map((comp) => (
            <Link
              key={comp.href}
              href={comp.href}
              className="group flex flex-col bg-[#111111] border border-white/[0.08] rounded-xl p-6 hover:border-[#00D4AA]/25 hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Tag */}
              <div className="flex items-center gap-2 mb-5">
                <span className="px-2.5 py-1 rounded-full bg-[#00D4AA]/[0.1] border border-[#00D4AA]/20 text-[0.6875rem] font-bold text-[#00D4AA] tracking-[0.1em] uppercase">
                  {comp.tag}
                </span>
              </div>

              {/* Versus */}
              <div className="flex items-center gap-4 mb-5">
                <div className="flex-1 text-center p-3 bg-[#0A0A0A] rounded-lg border border-white/[0.06]">
                  <p className="font-extrabold text-white text-[1.0625rem]">{comp.tool1.name}</p>
                  <span
                    className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[0.6rem] font-bold text-[#0A0A0A]"
                    style={{ backgroundColor: comp.tool1.badgeColor }}
                  >
                    {comp.tool1.badge}
                  </span>
                </div>

                <div className="shrink-0 w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center">
                  <span className="text-[0.75rem] font-extrabold text-white/40">vs</span>
                </div>

                <div className="flex-1 text-center p-3 bg-[#0A0A0A] rounded-lg border border-white/[0.06]">
                  <p className="font-extrabold text-white text-[1.0625rem]">{comp.tool2.name}</p>
                  <span
                    className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[0.6rem] font-bold text-[#0A0A0A]"
                    style={{ backgroundColor: comp.tool2.badgeColor }}
                  >
                    {comp.tool2.badge}
                  </span>
                </div>
              </div>

              {/* Summary */}
              <p className="text-[0.875rem] text-white/48 leading-[1.7] mb-4 flex-1">{comp.summary}</p>

              {/* Verdict */}
              <p className="text-[0.8125rem] text-white/55 italic border-l-2 border-[#00D4AA]/30 pl-3 mb-4">
                {comp.verdict}
              </p>

              <span className="text-[0.9rem] font-bold text-[#00D4AA] group-hover:underline">
                Read full comparison →
              </span>
            </Link>
          ))}
        </div>
      </main>

      {/* ── CTA row ────────────────────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.05]">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-[clamp(1.375rem,2.5vw,1.875rem)] font-extrabold text-white tracking-[-0.025em] mb-3">
            Not sure which tool to start with?
          </h2>
          <p className="text-[0.9375rem] text-white/45 mb-7 max-w-md mx-auto">
            Read our curated best-of lists by category to find the top tool for your specific use case.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/best-seo-tools"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg text-[0.9375rem] font-bold text-[#0A0A0A] bg-[#00D4AA] hover:opacity-88 transition-opacity"
            >
              Browse Best Lists
            </Link>
            <Link
              href="/reviews"
              className="inline-flex items-center px-7 py-3.5 rounded-lg text-[0.9375rem] font-semibold text-white/55 border border-white/[0.13] hover:border-white/25 hover:text-white/80 transition-colors"
            >
              All Reviews
            </Link>
          </div>
        </div>
      </section>

      <AffiliateFooter />
    </div>
  )
}
