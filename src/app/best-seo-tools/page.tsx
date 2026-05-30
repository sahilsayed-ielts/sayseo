import Link from 'next/link'
import type { Metadata } from 'next'
import { AffiliateNav } from '@/components/affiliate/AffiliateNav'
import { AffiliateFooter } from '@/components/affiliate/AffiliateFooter'

export const metadata: Metadata = {
  title: 'Best SEO Tools 2026 — Top Picks by Category | SaySEO',
  description:
    'The best SEO tools in 2026, ranked by category. Keyword research, backlink analysis, technical SEO, rank tracking, content optimization, and AI visibility — all independently reviewed.',
  keywords: [
    'best SEO tools', 'best keyword research tools', 'best backlink tools',
    'best technical SEO tools', 'best rank tracking tools', 'SEO software 2026',
  ],
  alternates: { canonical: 'https://sayseo.co.uk/best-seo-tools' },
  openGraph: {
    title: 'Best SEO Tools 2026 | SaySEO',
    description: 'Top-rated SEO tools by category — independently reviewed and ranked.',
    url: 'https://sayseo.co.uk/best-seo-tools',
    locale: 'en_GB',
  },
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const categories = [
  {
    id: 'keyword-research',
    title: 'Best Keyword Research Tools',
    description: 'Find search opportunities, understand user intent, and map content strategy with these keyword research tools.',
    tools: [
      { rank: 1, slug: 'semrush', name: 'Semrush', badge: 'Best Overall', badgeColor: '#047857', rating: 4.8, price: 'From $139.95/mo', reason: 'The most comprehensive keyword database with the best intent classification and SERP feature data.' },
      { rank: 2, slug: 'ahrefs', name: 'Ahrefs', badge: 'Best Accuracy', badgeColor: '#B45309', rating: 4.7, price: 'From $129/mo', reason: 'Consistently accurate keyword difficulty scores and traffic potential estimates.' },
      { rank: 3, slug: 'mangools', name: 'Mangools (KWFinder)', badge: 'Best Budget', badgeColor: '#059669', rating: 4.3, price: 'From $29/mo', reason: 'The most affordable option with excellent local keyword data and a beautiful interface.' },
      { rank: 4, slug: 'se-ranking', name: 'SE Ranking', badge: 'Best Value', badgeColor: '#6D28D9', rating: 4.5, price: 'From $65/mo', reason: 'Strong keyword research at a fraction of the price of tier-one tools.' },
    ],
  },
  {
    id: 'backlink-analysis',
    title: 'Best Backlink Analysis Tools',
    description: 'Understand your link profile, find link building opportunities, and monitor your backlink growth.',
    tools: [
      { rank: 1, slug: 'ahrefs', name: 'Ahrefs', badge: 'Best Overall', badgeColor: '#B45309', rating: 4.7, price: 'From $129/mo', reason: 'The largest and most frequently updated backlink database in the industry.' },
      { rank: 2, slug: 'semrush', name: 'Semrush', badge: 'Best for Agencies', badgeColor: '#047857', rating: 4.8, price: 'From $139.95/mo', reason: 'Excellent backlink analytics combined with a full suite of SEO tools.' },
      { rank: 3, slug: 'moz-pro', name: 'Moz Pro', badge: 'Best Metrics', badgeColor: '#0891B2', rating: 4.2, price: 'From $99/mo', reason: 'Trusted Domain Authority and Page Authority metrics widely used in reporting.' },
    ],
  },
  {
    id: 'technical-seo',
    title: 'Best Technical SEO Tools',
    description: 'Crawl, audit, and fix technical issues across any site — from small blogs to enterprise content estates.',
    tools: [
      { rank: 1, slug: 'screaming-frog', name: 'Screaming Frog', badge: 'Best Overall', badgeColor: '#B91C1C', rating: 4.6, price: 'Free / £259/yr', reason: 'The industry-standard crawler. Unmatched depth, customisability, and value.' },
      { rank: 2, slug: 'semrush', name: 'Semrush Site Audit', badge: 'Best Cloud Tool', badgeColor: '#047857', rating: 4.8, price: 'From $139.95/mo', reason: 'The most user-friendly cloud-based site audit with visual reporting and fix tracking.' },
      { rank: 3, slug: 'se-ranking', name: 'SE Ranking', badge: 'Best Value', badgeColor: '#6D28D9', rating: 4.5, price: 'From $65/mo', reason: 'Solid technical audit at an affordable price, integrated with other SEO data.' },
    ],
  },
  {
    id: 'rank-tracking',
    title: 'Best Rank Tracking Tools',
    description: 'Monitor keyword positions daily, track SERP features, and measure share of voice across any location.',
    tools: [
      { rank: 1, slug: 'semrush', name: 'Semrush', badge: 'Best Overall', badgeColor: '#047857', rating: 4.8, price: 'From $139.95/mo', reason: 'The most flexible rank tracker with device, location, and SERP feature visibility built in.' },
      { rank: 2, slug: 'se-ranking', name: 'SE Ranking', badge: 'Best Value', badgeColor: '#6D28D9', rating: 4.5, price: 'From $65/mo', reason: 'Highly accurate rank tracking with the most flexible update frequency options.' },
      { rank: 3, slug: 'mangools', name: 'Mangools (SERPWatcher)', badge: 'Easiest to Use', badgeColor: '#059669', rating: 4.3, price: 'From $29/mo', reason: 'Clean rank tracking with the unique Dominance Index metric for measuring overall visibility.' },
    ],
  },
  {
    id: 'content',
    title: 'Best Content Optimization Tools',
    description: 'Optimise your content against top-ranking competitors with NLP-based recommendations and real-time scoring.',
    tools: [
      { rank: 1, slug: 'surfer-seo', name: 'Surfer SEO', badge: 'Best Overall', badgeColor: '#1D4ED8', rating: 4.4, price: 'From $99/mo', reason: 'The market leader for real-time content scoring with deep SERP analysis.' },
      { rank: 2, slug: 'semrush', name: 'Semrush SEO Writing Assistant', badge: 'Best Value Add', badgeColor: '#047857', rating: 4.8, price: 'Included with Semrush', reason: 'Solid content optimisation included in Semrush subscriptions — great value if you already use the platform.' },
    ],
  },
  {
    id: 'ai-visibility',
    title: 'Best AI Visibility Tools',
    description: 'Track citations from ChatGPT, Gemini, and Perplexity, and monitor your presence in Google AI Overviews.',
    tools: [
      { rank: 1, slug: 'app', name: 'SaySEO (Free)', badge: 'Best Free Tool', badgeColor: '#047857', rating: 4.7, price: 'Free / £19/mo', reason: 'The only dedicated AI visibility tracker with citation monitoring, AI Overview tracking, and GA4 integration.', isOwn: true },
    ],
  },
]

function ScoreCircle({ score }: { score: number }) {
  const bg = score >= 4.5 ? '#047857' : score >= 4.0 ? '#059669' : '#D97706'
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold text-white shrink-0"
      style={{ backgroundColor: bg, width: 32, height: 32 }}
    >
      {score}
    </div>
  )
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} width="12" height="12" viewBox="0 0 24 24"
          fill={star <= Math.floor(rating) ? '#F59E0B' : 'none'}
          stroke="#F59E0B" strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="text-xs font-bold text-gray-600 ml-1">{rating}</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BestSEOToolsPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <AffiliateNav />

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-10 pb-8">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
            <Link href="/" className="hover:text-emerald-700 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-600 font-medium">Best SEO Tools</span>
          </nav>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700 mb-3">Best Lists</p>
          <h1 className="text-[clamp(1.875rem,4vw,2.75rem)] font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
            Best SEO Tools 2026
          </h1>
          <p className="text-base text-gray-500 leading-relaxed max-w-[600px] mb-6">
            The top SEO tools by category — independently tested and ranked. Jump to the category that matches your priority.
          </p>

          {/* Category jump links */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="px-3.5 py-1.5 rounded-full text-sm font-medium border border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-colors bg-white"
              >
                {cat.title.replace('Best ', '').replace(' Tools', '')}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Categories ────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-10 pb-16 space-y-12">
        {categories.map((cat) => (
          <section key={cat.id} id={cat.id} className="scroll-mt-20">
            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight mb-2">
                {cat.title}
              </h2>
              <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">{cat.description}</p>
            </div>

            <div className="space-y-3">
              {cat.tools.map((tool, idx) => (
                <div
                  key={tool.slug + idx}
                  className={`flex flex-col sm:flex-row sm:items-center gap-4 bg-white border rounded-xl p-5 shadow-sm ${
                    idx === 0
                      ? 'border-emerald-200 ring-1 ring-emerald-100'
                      : 'border-gray-200'
                  }`}
                >
                  {/* Rank */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-extrabold ${
                    idx === 0 ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {tool.rank}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-bold text-gray-900">{tool.name}</span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold text-white"
                        style={{ backgroundColor: tool.badgeColor }}
                      >
                        {tool.badge}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Stars rating={tool.rating} />
                      <ScoreCircle score={tool.rating} />
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{tool.reason}</p>
                  </div>

                  {/* Price + CTA */}
                  <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                    <span className="text-sm font-semibold text-gray-700">{tool.price}</span>
                    {'isOwn' in tool && tool.isOwn ? (
                      <Link
                        href="/app"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors"
                      >
                        Try Free →
                      </Link>
                    ) : (
                      <Link
                        href={`/reviews/${tool.slug}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-50 transition-colors"
                      >
                        Read Review →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight mb-3">
            Read the full reviews before you buy
          </h2>
          <p className="text-sm text-gray-500 mb-7">
            Every tool above has a detailed review with pricing breakdowns, feature deep-dives, and our honest verdict.
          </p>
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-sm"
          >
            Browse All Reviews
          </Link>
        </div>
      </section>

      <AffiliateFooter />
    </div>
  )
}
