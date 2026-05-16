import Link from 'next/link'
import type { Metadata } from 'next'
import { AffiliateNav } from '@/components/affiliate/AffiliateNav'
import { AffiliateFooter } from '@/components/affiliate/AffiliateFooter'

export const metadata: Metadata = {
  title: 'SEO Tool Reviews — In-Depth Analysis & Ratings | SaySEO',
  description:
    'Independent, in-depth reviews of the best SEO tools. Semrush, Ahrefs, Moz, SE Ranking, Surfer SEO, and more — tested and rated by SEO professionals.',
  keywords: [
    'SEO tool reviews',
    'Semrush review',
    'Ahrefs review',
    'Moz Pro review',
    'SE Ranking review',
    'Surfer SEO review',
    'best SEO software',
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
    badgeColor: '#00D4AA',
    category: 'All-in-One',
    price: 'From $139.95/mo',
    description: 'The most comprehensive SEO platform on the market, covering keyword research, site audits, backlinks, competitor analysis, and content marketing tools.',
    pros: ['Enormous keyword database', 'Comprehensive site audits', 'Competitor research', 'Content marketing tools'],
    cons: ['Expensive for solo users', 'Steep learning curve'],
    bestFor: 'Agencies & in-house teams',
  },
  {
    slug: 'ahrefs',
    name: 'Ahrefs',
    tagline: 'Industry-leading backlink analysis & keyword research',
    rating: 4.7,
    badge: 'Best for Links',
    badgeColor: '#f59e0b',
    category: 'All-in-One',
    price: 'From $129/mo',
    description: "The gold standard for backlink analysis. Ahrefs' link database is the most comprehensive available, with excellent keyword and content research tools alongside.",
    pros: ['Best backlink database', 'Accurate keyword data', 'Content Explorer', 'Fast crawler'],
    cons: ['Pricier entry tier', 'No Google integration'],
    bestFor: 'Link builders & content strategists',
  },
  {
    slug: 'moz-pro',
    name: 'Moz Pro',
    tagline: 'Trusted SEO metrics and link analysis platform',
    rating: 4.2,
    badge: 'Best for DA/PA',
    badgeColor: '#06b6d4',
    category: 'All-in-One',
    price: 'From $99/mo',
    description: 'A well-established SEO platform known for its Domain Authority and Page Authority metrics, with solid rank tracking and site auditing tools.',
    pros: ['Trusted DA metric', 'Beginner-friendly UI', 'MozBar Chrome extension', 'Strong community'],
    cons: ['Smaller data index', 'Slower feature updates'],
    bestFor: 'Beginners & DA-focused teams',
  },
  {
    slug: 'se-ranking',
    name: 'SE Ranking',
    tagline: 'Affordable all-in-one SEO for growing teams',
    rating: 4.5,
    badge: 'Best Value',
    badgeColor: '#8b5cf6',
    category: 'All-in-One',
    price: 'From $65/mo',
    description: 'The best affordable alternative to Semrush and Ahrefs. SE Ranking offers a surprisingly full feature set at a fraction of the price, making it ideal for freelancers and SMBs.',
    pros: ['Great price-to-feature ratio', 'Clean UI', 'Accurate rank tracking', 'White-label reports'],
    cons: ['Smaller backlink database', 'Fewer integrations'],
    bestFor: 'Freelancers & SMBs',
  },
  {
    slug: 'surfer-seo',
    name: 'Surfer SEO',
    tagline: 'Data-driven content optimization platform',
    rating: 4.4,
    badge: 'Best for Content',
    badgeColor: '#3b82f6',
    category: 'Content',
    price: 'From $99/mo',
    description: 'A content optimization platform that analyses top-ranking pages and provides real-time NLP-based recommendations for your content. Integrates with Google Docs and WordPress.',
    pros: ['Real-time content scoring', 'NLP recommendations', 'Google Docs integration', 'SERP Analyser'],
    cons: ['Narrow use case', 'No backlink data'],
    bestFor: 'Content writers & SEO strategists',
  },
  {
    slug: 'screaming-frog',
    name: 'Screaming Frog',
    tagline: 'The most powerful website crawler for technical SEO',
    rating: 4.6,
    badge: 'Best Technical',
    badgeColor: '#ef4444',
    category: 'Technical',
    price: 'Free / £259/yr',
    description: 'The industry-standard desktop crawler for technical SEO audits. Crawls any website to surface broken links, duplicate content, missing metadata, and hundreds of other issues.',
    pros: ['Unmatched crawl depth', 'Free for up to 500 URLs', 'GA4 & GSC integration', 'Highly customisable'],
    cons: ['Desktop app (not cloud)', 'Technical to configure'],
    bestFor: 'Technical SEO professionals',
  },
  {
    slug: 'mangools',
    name: 'Mangools',
    tagline: 'Affordable keyword research & rank tracking suite',
    rating: 4.3,
    badge: 'Easiest to Use',
    badgeColor: '#10b981',
    category: 'Keyword Research',
    price: 'From $29/mo',
    description: 'A suite of five tools — KWFinder, SERPChecker, SERPWatcher, LinkMiner, and SiteProfiler — designed for ease of use without sacrificing power.',
    pros: ['Very affordable', 'Beautiful UI', 'Accurate local keyword data', 'SERPChecker visuals'],
    cons: ['Limited audit features', 'Smaller database vs tier-1 tools'],
    bestFor: 'Bloggers & small business owners',
  },
  {
    slug: 'spyfu',
    name: 'SpyFu',
    tagline: 'Competitor keyword and PPC research tool',
    rating: 4.1,
    badge: 'Best for Competitor Intel',
    badgeColor: '#f97316',
    category: 'Competitor Research',
    price: 'From $39/mo',
    description: 'SpyFu specialises in competitive intelligence — revealing exactly which keywords competitors rank for organically and what they spend on PPC.',
    pros: ['Deep competitor keyword data', 'PPC research', 'Affordable', 'Historical data'],
    cons: ['Dated interface', 'Weaker technical SEO features'],
    bestFor: 'PPC managers & competitor researchers',
  },
]

const categories = ['All', 'All-in-One', 'Content', 'Technical', 'Keyword Research', 'Competitor Research']

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} width="12" height="12" viewBox="0 0 24 24" fill={star <= Math.floor(rating) ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="1.5" aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="text-[0.8125rem] font-bold text-white/65 ml-1">{rating}/5</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReviewsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      <AffiliateNav />

      {/* ── Hero ───────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto w-full px-6 pt-16 pb-12">
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[#00D4AA] mb-4">
          Reviews
        </p>
        <h1 className="text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold text-white tracking-[-0.03em] leading-[1.07] mb-4">
          SEO Tool Reviews
        </h1>
        <p className="text-[1.0625rem] text-white/50 leading-[1.75] max-w-[560px]">
          Independent, in-depth reviews of every major SEO platform — tested, rated, and honestly assessed.
        </p>
      </section>

      {/* ── Filters ────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto w-full px-6 pb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <span
              key={cat}
              className={`px-3.5 py-1.5 rounded-full text-[0.8125rem] font-semibold border transition-colors cursor-default ${
                cat === 'All'
                  ? 'bg-[#00D4AA]/[0.12] border-[#00D4AA]/30 text-[#00D4AA]'
                  : 'border-white/[0.1] text-white/45 hover:text-white/70 hover:border-white/20'
              }`}
            >
              {cat}
            </span>
          ))}
        </div>
      </section>

      {/* ── Reviews grid ───────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {allReviews.map((tool) => (
            <div
              key={tool.slug}
              className="flex flex-col bg-[#111111] border border-white/[0.08] rounded-xl p-6 hover:border-white/[0.14] transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h2 className="text-[1.0625rem] font-extrabold text-white tracking-[-0.015em]">{tool.name}</h2>
                  <p className="text-[0.8125rem] text-white/40 mt-0.5">{tool.tagline}</p>
                </div>
                <span
                  className="shrink-0 px-2.5 py-1 rounded-full text-[0.6875rem] font-bold text-[#0A0A0A] whitespace-nowrap"
                  style={{ backgroundColor: tool.badgeColor }}
                >
                  {tool.badge}
                </span>
              </div>

              {/* Rating + meta */}
              <div className="flex items-center justify-between mb-4">
                <Stars rating={tool.rating} />
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/[0.05] text-[0.6875rem] text-white/40 font-medium">
                    {tool.category}
                  </span>
                  <span className="text-[0.8125rem] text-white/40">{tool.price}</span>
                </div>
              </div>

              <p className="text-[0.875rem] text-white/45 leading-[1.65] mb-4 flex-1">{tool.description}</p>

              {/* Pros/cons */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div>
                  <p className="text-[0.7rem] font-bold text-[#00D4AA] uppercase tracking-[0.08em] mb-2">Pros</p>
                  <ul className="space-y-1">
                    {tool.pros.slice(0, 3).map((pro) => (
                      <li key={pro} className="flex items-start gap-1.5 text-[0.78rem] text-white/50">
                        <span className="text-[#00D4AA] mt-0.5">+</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[0.7rem] font-bold text-red-400/70 uppercase tracking-[0.08em] mb-2">Cons</p>
                  <ul className="space-y-1">
                    {tool.cons.map((con) => (
                      <li key={con} className="flex items-start gap-1.5 text-[0.78rem] text-white/50">
                        <span className="text-red-400/60 mt-0.5">−</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="text-[0.78rem] text-white/35 mb-5">
                <span className="text-white/50 font-semibold">Best for:</span> {tool.bestFor}
              </p>

              {/* CTAs */}
              <div className="flex gap-2 mt-auto">
                <Link
                  href={`/reviews/${tool.slug}`}
                  className="flex-1 text-center px-4 py-2.5 rounded-lg text-[0.875rem] font-bold text-[#0A0A0A] bg-[#00D4AA] hover:opacity-88 transition-opacity"
                >
                  Full Review
                </Link>
                <Link
                  href={`/reviews/${tool.slug}#try`}
                  className="flex-1 text-center px-4 py-2.5 rounded-lg text-[0.875rem] font-semibold text-white/55 border border-white/[0.12] hover:border-white/25 hover:text-white/80 transition-colors"
                >
                  Try Free
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <AffiliateFooter />
    </div>
  )
}
