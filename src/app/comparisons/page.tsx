import Link from 'next/link'
import type { Metadata } from 'next'
import { AffiliateNav } from '@/components/affiliate/AffiliateNav'
import { AffiliateFooter } from '@/components/affiliate/AffiliateFooter'

export const metadata: Metadata = {
  title: 'SEO Tool Comparisons 2026 — Head-to-Head Reviews | SaySEO',
  description:
    'Side-by-side comparisons of the top SEO tools. Semrush vs Ahrefs, SE Ranking vs Semrush, Ahrefs vs Moz, and more — find out which tool wins for your use case.',
  keywords: ['Semrush vs Ahrefs', 'SE Ranking vs Semrush', 'Ahrefs vs Moz', 'SEO tool comparison', 'best SEO tool for agencies', 'cheap SEO tools'],
  alternates: { canonical: 'https://sayseo.co.uk/comparisons' },
  openGraph: {
    title: 'SEO Tool Comparisons | SaySEO',
    description: 'Head-to-head SEO tool comparisons — find out which tool wins for your use case.',
    url: 'https://sayseo.co.uk/comparisons',
    locale: 'en_GB',
  },
}

const comparisons = [
  {
    href: '/comparisons/semrush-vs-ahrefs',
    tool1: { name: 'Semrush', badge: 'Best Overall', badgeColor: '#047857', winner: true },
    tool2: { name: 'Ahrefs', badge: 'Best for Links', badgeColor: '#B45309', winner: false },
    tag: 'All-in-One',
    summary: 'The two most popular SEO platforms go head-to-head. We test both across keyword research, backlinks, site audits, and competitive analysis to tell you which is worth it for your workflow.',
    verdict: 'Semrush wins on breadth; Ahrefs wins on backlink data quality.',
  },
  {
    href: '/comparisons/se-ranking-vs-semrush',
    tool1: { name: 'SE Ranking', badge: 'Best Value', badgeColor: '#6D28D9', winner: false },
    tool2: { name: 'Semrush', badge: 'Most Powerful', badgeColor: '#047857', winner: true },
    tag: 'Value',
    summary: "SE Ranking is less than half the price of Semrush. But is the cheaper tool good enough for professional SEO? We test both side by side across every major feature category.",
    verdict: 'Semrush wins on data depth; SE Ranking wins on value for freelancers.',
  },
  {
    href: '/comparisons/ahrefs-vs-moz',
    tool1: { name: 'Ahrefs', badge: 'Best Links', badgeColor: '#B45309', winner: true },
    tool2: { name: 'Moz Pro', badge: 'Best for DA', badgeColor: '#0891B2', winner: false },
    tag: 'Link Analysis',
    summary: 'Ahrefs and Moz both focus heavily on backlink analysis, but their data sources and strengths differ significantly. Which link intelligence tool gives you the edge?',
    verdict: "Ahrefs wins on data quality and features; Moz wins on the DA metric's brand recognition.",
  },
  {
    href: '/comparisons/surfer-vs-semrush',
    tool1: { name: 'Surfer SEO', badge: 'Best for Content', badgeColor: '#1D4ED8', winner: false },
    tool2: { name: 'Semrush', badge: 'All-in-One', badgeColor: '#047857', winner: false },
    tag: 'Content',
    summary: "Surfer SEO is purpose-built for content optimisation, while Semrush's Writing Assistant is a feature within a broader platform. Which is the better choice for your content team?",
    verdict: 'Surfer wins for dedicated content teams; Semrush wins if you need the full SEO suite too.',
  },
  {
    href: '/comparisons/screaming-frog-vs-semrush',
    tool1: { name: 'Screaming Frog', badge: 'Best Technical', badgeColor: '#B91C1C', winner: true },
    tool2: { name: 'Semrush Site Audit', badge: 'Best Cloud', badgeColor: '#047857', winner: false },
    tag: 'Technical SEO',
    summary: 'Screaming Frog is the industry-standard desktop crawler, while Semrush Site Audit is the leading cloud-based alternative. We compare crawl depth, ease of use, and value.',
    verdict: 'Screaming Frog wins on depth and value; Semrush wins on accessibility and team collaboration.',
  },
  {
    href: '/comparisons/mangools-vs-se-ranking',
    tool1: { name: 'Mangools', badge: 'Easiest to Use', badgeColor: '#059669', winner: false },
    tool2: { name: 'SE Ranking', badge: 'Best Value', badgeColor: '#6D28D9', winner: true },
    tag: 'Budget',
    summary: 'Both tools target budget-conscious SEOs, but they make different trade-offs. Mangools prioritises ease of use while SE Ranking offers more features. Which is the better buy?',
    verdict: 'SE Ranking wins on features and depth; Mangools wins on ease of use and UX.',
  },
]

export default function ComparisonsPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <AffiliateNav />

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-10 pb-8">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
            <Link href="/" className="hover:text-emerald-700 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-600 font-medium">Comparisons</span>
          </nav>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700 mb-3">Comparisons</p>
          <h1 className="text-[clamp(1.875rem,4vw,2.75rem)] font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
            SEO Tool Comparisons
          </h1>
          <p className="text-base text-gray-500 leading-relaxed max-w-[540px]">
            Deciding between two tools? Our head-to-head comparisons test both side by side so you spend your money wisely.
          </p>
        </div>
      </div>

      {/* ── Comparisons grid ──────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-10 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {comparisons.map((comp) => (
            <Link
              key={comp.href}
              href={comp.href}
              className="group flex flex-col bg-white border border-gray-200 rounded-xl p-6 hover:shadow-sm hover:border-emerald-200 transition-all duration-200"
            >
              {/* Tag */}
              <div className="mb-4">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 tracking-wide uppercase">
                  {comp.tag}
                </span>
              </div>

              {/* Versus */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 text-center p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="font-extrabold text-gray-900">{comp.tool1.name}</p>
                  <span
                    className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[0.6rem] font-bold text-white"
                    style={{ backgroundColor: comp.tool1.badgeColor }}
                  >
                    {comp.tool1.badge}
                  </span>
                </div>
                <div className="shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-xs font-extrabold text-gray-400">vs</span>
                </div>
                <div className="flex-1 text-center p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="font-extrabold text-gray-900">{comp.tool2.name}</p>
                  <span
                    className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[0.6rem] font-bold text-white"
                    style={{ backgroundColor: comp.tool2.badgeColor }}
                  >
                    {comp.tool2.badge}
                  </span>
                </div>
              </div>

              {/* Summary */}
              <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">{comp.summary}</p>

              {/* Verdict */}
              <p className="text-sm text-gray-600 italic border-l-2 border-emerald-300 pl-3 mb-4">
                {comp.verdict}
              </p>

              <span className="text-sm font-semibold text-emerald-700 group-hover:underline">
                Read full comparison →
              </span>
            </Link>
          ))}
        </div>
      </main>

      {/* ── CTA row ───────────────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight mb-3">
            Not sure which tool to start with?
          </h2>
          <p className="text-sm text-gray-500 mb-7 max-w-md mx-auto">
            Read our curated best-of lists by category to find the top tool for your specific use case.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/best-seo-tools" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-sm">
              Browse Best Lists
            </Link>
            <Link href="/reviews" className="inline-flex items-center px-7 py-3.5 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
              All Reviews
            </Link>
          </div>
        </div>
      </section>

      <AffiliateFooter />
    </div>
  )
}
