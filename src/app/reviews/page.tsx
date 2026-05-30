import Link from 'next/link'
import type { Metadata } from 'next'
import { AffiliateNav } from '@/components/affiliate/AffiliateNav'
import { AffiliateFooter } from '@/components/affiliate/AffiliateFooter'

export const metadata: Metadata = {
  title: 'SEO Tool Reviews — In-Depth Analysis & Ratings | SaySEO',
  description:
    'Independent, in-depth reviews of the best SEO tools. Semrush, Ahrefs, Moz, SE Ranking, Surfer SEO, and more — tested and rated by SEO professionals.',
  keywords: [
    'SEO tool reviews', 'Semrush review', 'Ahrefs review', 'Moz Pro review',
    'SE Ranking review', 'Surfer SEO review', 'best SEO software',
  ],
  alternates: { canonical: 'https://sayseo.co.uk/reviews' },
  openGraph: {
    type: 'website',
    title: 'SEO Tool Reviews | SaySEO',
    description: 'Independent, in-depth reviews of the best SEO tools — tested and rated.',
    url: 'https://sayseo.co.uk/reviews',
    locale: 'en_GB',
  },
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const allReviews = [
  {
    slug: 'semrush',
    name: 'Semrush',
    tagline: 'All-in-one SEO & digital marketing platform',
    rating: 4.8,
    badge: 'Best Overall',
    badgeColor: '#047857',
    category: 'All-in-One',
    price: 'From $139.95/mo',
    trial: '7-day free trial',
    description: 'The most comprehensive SEO platform on the market, covering keyword research, site audits, backlinks, competitor analysis, and content marketing tools.',
    pros: ['Enormous keyword database', 'Comprehensive site audits', 'Competitor research', 'Content marketing tools'],
    cons: ['Expensive for solo users', 'Steep learning curve'],
    bestFor: 'Agencies & in-house teams',
    initial: 'S',
    initialBg: '#1D4ED8',
  },
  {
    slug: 'ahrefs',
    name: 'Ahrefs',
    tagline: 'Industry-leading backlink analysis & keyword research',
    rating: 4.7,
    badge: 'Best for Links',
    badgeColor: '#B45309',
    category: 'All-in-One',
    price: 'From $129/mo',
    trial: '$7 for 7-day trial',
    description: "The gold standard for backlink analysis. Ahrefs' link database is the most comprehensive available, with excellent keyword and content research tools.",
    pros: ['Best backlink database', 'Accurate keyword data', 'Content Explorer', 'Fast crawler'],
    cons: ['Pricier entry tier', 'No Google integration'],
    bestFor: 'Link builders & content strategists',
    initial: 'A',
    initialBg: '#D97706',
  },
  {
    slug: 'moz-pro',
    name: 'Moz Pro',
    tagline: 'Trusted SEO metrics and link analysis platform',
    rating: 4.2,
    badge: 'Best for DA/PA',
    badgeColor: '#0891B2',
    category: 'All-in-One',
    price: 'From $99/mo',
    trial: '30-day free trial',
    description: 'A well-established SEO platform known for its Domain Authority and Page Authority metrics, with solid rank tracking and site auditing tools.',
    pros: ['Trusted DA metric', 'Beginner-friendly UI', 'MozBar Chrome extension', 'Strong community'],
    cons: ['Smaller data index', 'Slower feature updates'],
    bestFor: 'Beginners & DA-focused teams',
    initial: 'M',
    initialBg: '#0891B2',
  },
  {
    slug: 'se-ranking',
    name: 'SE Ranking',
    tagline: 'Affordable all-in-one SEO for growing teams',
    rating: 4.5,
    badge: 'Best Value',
    badgeColor: '#6D28D9',
    category: 'All-in-One',
    price: 'From $65/mo',
    trial: '14-day free trial',
    description: 'The best affordable alternative to Semrush and Ahrefs. SE Ranking offers a surprisingly full feature set at a fraction of the price.',
    pros: ['Great price-to-feature ratio', 'Clean UI', 'Accurate rank tracking', 'White-label reports'],
    cons: ['Smaller backlink database', 'Fewer integrations'],
    bestFor: 'Freelancers & SMBs',
    initial: 'SE',
    initialBg: '#7C3AED',
  },
  {
    slug: 'surfer-seo',
    name: 'Surfer SEO',
    tagline: 'Data-driven content optimization platform',
    rating: 4.4,
    badge: 'Best for Content',
    badgeColor: '#1D4ED8',
    category: 'Content',
    price: 'From $99/mo',
    trial: '7-day money-back guarantee',
    description: 'A content optimization platform that analyses top-ranking pages and gives real-time NLP-based recommendations. Integrates with Google Docs and WordPress.',
    pros: ['Real-time content score', 'NLP recommendations', 'Google Docs integration', 'SERP Analyser'],
    cons: ['Narrow use case', 'No backlink data'],
    bestFor: 'Content writers & SEO strategists',
    initial: 'Su',
    initialBg: '#2563EB',
  },
  {
    slug: 'screaming-frog',
    name: 'Screaming Frog',
    tagline: 'The most powerful website crawler for technical SEO',
    rating: 4.6,
    badge: 'Best Technical',
    badgeColor: '#B91C1C',
    category: 'Technical',
    price: 'Free / £259/yr',
    trial: 'Free for up to 500 URLs',
    description: 'The industry-standard desktop crawler for technical SEO audits. Surfaces broken links, duplicate content, missing metadata, and hundreds of other issues.',
    pros: ['Unmatched crawl depth', 'Free for 500 URLs', 'GA4 & GSC integration', 'Highly customisable'],
    cons: ['Desktop app only', 'Technical to configure'],
    bestFor: 'Technical SEO professionals',
    initial: 'SF',
    initialBg: '#DC2626',
  },
  {
    slug: 'mangools',
    name: 'Mangools',
    tagline: 'Affordable keyword research & rank tracking suite',
    rating: 4.3,
    badge: 'Easiest to Use',
    badgeColor: '#047857',
    category: 'Keyword Research',
    price: 'From $29/mo',
    trial: '10-day free trial',
    description: 'A suite of five tools designed for ease of use without sacrificing power. KWFinder delivers accurate local keyword data at an unbeatable price.',
    pros: ['Very affordable', 'Beautiful UI', 'Accurate local keyword data', 'SERPChecker visuals'],
    cons: ['Limited audit features', 'Smaller database than tier-1 tools'],
    bestFor: 'Bloggers & small business owners',
    initial: 'Ma',
    initialBg: '#059669',
  },
  {
    slug: 'spyfu',
    name: 'SpyFu',
    tagline: 'Competitor keyword and PPC research tool',
    rating: 4.1,
    badge: 'Best for Competitor Intel',
    badgeColor: '#C2410C',
    category: 'Competitor Research',
    price: 'From $39/mo',
    trial: 'Free plan with limited access',
    description: 'SpyFu specialises in competitive intelligence — revealing exactly which keywords competitors rank for organically and what they spend on PPC.',
    pros: ['Deep competitor keyword data', 'PPC research', 'Affordable', 'Historical data'],
    cons: ['Dated interface', 'Weaker technical SEO features'],
    bestFor: 'PPC managers & competitor researchers',
    initial: 'Sp',
    initialBg: '#EA580C',
  },
]

const categories = ['All', 'All-in-One', 'Content', 'Technical', 'Keyword Research', 'Competitor Research'] as const
type Category = (typeof categories)[number]
function isCategory(v: string): v is Category { return categories.includes(v as Category) }

// ─── Components ───────────────────────────────────────────────────────────────

function ScoreCircle({ score }: { score: number }) {
  const bg = score >= 4.5 ? '#047857' : score >= 4.0 ? '#059669' : score >= 3.5 ? '#D97706' : '#DC2626'
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-white text-base shrink-0"
      style={{ backgroundColor: bg, width: 48, height: 48 }}
      aria-label={`${score} out of 5`}
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
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>
}) {
  const resolvedParams = await searchParams
  const raw = Array.isArray(resolvedParams.category) ? resolvedParams.category[0] : resolvedParams.category
  const activeCategory: Category = raw && isCategory(raw) ? raw : 'All'
  const filtered = activeCategory === 'All' ? allReviews : allReviews.filter((t) => t.category === activeCategory)

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <AffiliateNav />

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
            <Link href="/" className="hover:text-emerald-700 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-600 font-medium">Reviews</span>
          </nav>

          <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700 mb-3">Reviews</p>
          <h1 className="text-[clamp(1.875rem,4vw,2.75rem)] font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
            SEO Tool Reviews
          </h1>
          <p className="text-base text-gray-500 leading-relaxed max-w-[540px] mb-6">
            Independent, in-depth reviews of every major SEO platform — tested, rated, and honestly assessed by working SEO professionals.
          </p>

          {/* Editorial note */}
          <div className="inline-flex items-start gap-2.5 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">
            <svg className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span><strong className="font-semibold">Editorial note:</strong> All reviews are based on independent hands-on testing. We never accept payment for positive placements.</span>
          </div>
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 sticky top-[60px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1.5 py-3 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={cat === 'All' ? '/reviews' : `/reviews?category=${cat}`}
                className={`px-3.5 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap border transition-colors ${
                  cat === activeCategory
                    ? 'bg-emerald-700 border-emerald-700 text-white'
                    : 'border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 bg-white'
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Reviews Grid ─────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-10 pb-16">
        <p className="text-sm text-gray-400 mb-6">
          Showing <span className="font-semibold text-gray-700">{filtered.length}</span> {filtered.length === 1 ? 'review' : 'reviews'}
          {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}.
        </p>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((tool) => (
              <div
                key={tool.slug}
                className="flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center gap-3 p-5 border-b border-gray-100">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-extrabold text-white shrink-0"
                    style={{ backgroundColor: tool.initialBg }}
                  >
                    {tool.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-[0.9375rem] font-extrabold text-gray-900">{tool.name}</h2>
                      <span
                        className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold text-white whitespace-nowrap"
                        style={{ backgroundColor: tool.badgeColor }}
                      >
                        {tool.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{tool.tagline}</p>
                  </div>
                </div>

                {/* Rating row */}
                <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <ScoreCircle score={tool.rating} />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Stars rating={tool.rating} />
                      <span className="text-xs font-bold text-gray-700">{tool.rating}/5</span>
                    </div>
                    <p className="text-[0.65rem] text-gray-400">SaySEO Rating</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-sm font-bold text-gray-900">{tool.price}</p>
                    <p className="text-xs text-gray-400">{tool.trial}</p>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 p-5 flex flex-col gap-4">
                  <p className="text-sm text-gray-600 leading-relaxed">{tool.description}</p>

                  {/* Pros/cons */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[0.65rem] font-bold text-emerald-700 uppercase tracking-[0.08em] mb-1.5">Pros</p>
                      <ul className="space-y-1">
                        {tool.pros.slice(0, 3).map((pro) => (
                          <li key={pro} className="flex items-start gap-1.5 text-xs text-gray-600">
                            <svg className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[0.65rem] font-bold text-red-500 uppercase tracking-[0.08em] mb-1.5">Cons</p>
                      <ul className="space-y-1">
                        {tool.cons.map((con) => (
                          <li key={con} className="flex items-start gap-1.5 text-xs text-gray-600">
                            <svg className="w-3 h-3 text-red-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mt-auto pt-1">
                    <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-xs text-gray-500"><span className="font-semibold text-gray-700">Best for:</span> {tool.bestFor}</p>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex gap-2 p-4 border-t border-gray-100 bg-gray-50">
                  <Link
                    href={`/reviews/${tool.slug}`}
                    className="flex-1 text-center px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors"
                  >
                    Full Review
                  </Link>
                  <Link
                    href={`/reviews/${tool.slug}#try`}
                    className="flex-1 text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-white transition-colors"
                  >
                    Try Free
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-2">No reviews in this category yet</h2>
            <p className="text-sm text-gray-500 mb-6">
              Try another filter or browse all reviews to see everything we have covered.
            </p>
            <Link href="/reviews" className="inline-flex items-center px-6 py-3 rounded-lg text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors">
              View all reviews
            </Link>
          </div>
        )}
      </main>

      <AffiliateFooter />
    </div>
  )
}
