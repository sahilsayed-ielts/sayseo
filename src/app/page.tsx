import Link from 'next/link'
import type { Metadata } from 'next'
import { AffiliateNav } from '@/components/affiliate/AffiliateNav'
import { AffiliateFooter } from '@/components/affiliate/AffiliateFooter'

export const metadata: Metadata = {
  title: 'SaySEO — Independent SEO Tool Reviews & Comparisons',
  description:
    'Honest, in-depth reviews of the best SEO tools, software comparisons, and expert guides for SEO professionals and digital marketers. Find the right tool for every job.',
  keywords: [
    'SEO tools',
    'SEO software reviews',
    'best SEO tools',
    'Semrush review',
    'Ahrefs review',
    'keyword research tools',
    'backlink analysis tools',
    'SEO tool comparisons',
    'digital marketing tools',
  ],
  alternates: { canonical: 'https://sayseo.co.uk' },
  openGraph: {
    type: 'website',
    siteName: 'SaySEO',
    title: 'SaySEO — Independent SEO Tool Reviews & Comparisons',
    description:
      'Honest, in-depth reviews of the best SEO tools for SEO professionals and digital marketers.',
    url: 'https://sayseo.co.uk',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SaySEO — Independent SEO Tool Reviews & Comparisons',
    description:
      'Honest, in-depth reviews of the best SEO tools for SEO professionals and digital marketers.',
  },
  robots: { index: true, follow: true },
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const categories = [
  {
    icon: '🔍',
    title: 'Keyword Research',
    count: 8,
    href: '/best-seo-tools#keyword-research',
    description: 'Find the best tools for discovering search opportunities.',
  },
  {
    icon: '🔗',
    title: 'Backlink Analysis',
    count: 6,
    href: '/best-seo-tools#backlink-analysis',
    description: 'Analyse link profiles and build authority.',
  },
  {
    icon: '⚙️',
    title: 'Technical SEO',
    count: 7,
    href: '/best-seo-tools#technical-seo',
    description: 'Crawl, audit, and fix technical issues at scale.',
  },
  {
    icon: '📈',
    title: 'Rank Tracking',
    count: 9,
    href: '/best-seo-tools#rank-tracking',
    description: 'Monitor keyword positions across search engines.',
  },
  {
    icon: '✍️',
    title: 'Content Optimization',
    count: 5,
    href: '/best-seo-tools#content',
    description: 'Optimise content for relevance and search visibility.',
  },
  {
    icon: '🤖',
    title: 'AI Visibility',
    count: 3,
    href: '/best-seo-tools#ai-visibility',
    description: 'Track citations and traffic from ChatGPT, Gemini, and Perplexity.',
  },
]

const featuredReviews = [
  {
    slug: 'semrush',
    name: 'Semrush',
    tagline: 'All-in-one SEO & digital marketing platform',
    rating: 4.8,
    badge: 'Best Overall',
    badgeColor: '#00D4AA',
    price: 'From $139.95/mo',
    pros: ['Enormous keyword database', 'Comprehensive site audits', 'Competitor research'],
    verdict: 'The most complete SEO platform on the market. Worth it for agencies and serious in-house teams.',
  },
  {
    slug: 'ahrefs',
    name: 'Ahrefs',
    tagline: 'Industry-leading backlink analysis & keyword research',
    rating: 4.7,
    badge: 'Best for Links',
    badgeColor: '#f59e0b',
    price: 'From $129/mo',
    pros: ['Best backlink database', 'Accurate keyword data', 'Excellent content explorer'],
    verdict: 'The gold standard for link analysis. If backlinks are your priority, Ahrefs is unmatched.',
  },
  {
    slug: 'se-ranking',
    name: 'SE Ranking',
    tagline: 'Affordable all-in-one SEO for growing teams',
    rating: 4.5,
    badge: 'Best Value',
    badgeColor: '#8b5cf6',
    price: 'From $65/mo',
    pros: ['Great price-to-feature ratio', 'Clean UI', 'Accurate rank tracking'],
    verdict: 'The best affordable alternative to Semrush and Ahrefs. Ideal for freelancers and SMBs.',
  },
  {
    slug: 'surfer-seo',
    name: 'Surfer SEO',
    tagline: 'Data-driven content optimization platform',
    rating: 4.4,
    badge: 'Best for Content',
    badgeColor: '#3b82f6',
    price: 'From $99/mo',
    pros: ['Real-time content scoring', 'NLP-powered recommendations', 'AI content generation'],
    verdict: 'The go-to tool for content writers and SEO strategists who live inside Google Docs.',
  },
  {
    slug: 'screaming-frog',
    name: 'Screaming Frog',
    tagline: 'The most powerful website crawler for technical SEO',
    rating: 4.6,
    badge: 'Best Technical',
    badgeColor: '#ef4444',
    price: 'Free / £259/yr',
    pros: ['Unmatched crawl depth', 'Free for up to 500 URLs', 'Integrates with GA4 & GSC'],
    verdict: 'Every SEO professional needs this in their toolkit. Nothing comes close for technical audits.',
  },
  {
    slug: 'moz-pro',
    name: 'Moz Pro',
    tagline: 'Trusted SEO metrics and link analysis platform',
    rating: 4.2,
    badge: 'Best for DA/PA',
    badgeColor: '#06b6d4',
    price: 'From $99/mo',
    pros: ['Trusted DA metric', 'Beginner-friendly', 'Strong community & learning resources'],
    verdict: 'Great for teams who rely on Domain Authority metrics and want an approachable platform.',
  },
]

const comparisons = [
  {
    title: 'Semrush vs Ahrefs',
    description: 'Two giants. One budget. We break down which is worth it for your workflow.',
    href: '/comparisons/semrush-vs-ahrefs',
    tag: 'All-in-one',
  },
  {
    title: 'SE Ranking vs Semrush',
    description: 'Is the cheaper alternative good enough? We tested both side by side.',
    href: '/comparisons/se-ranking-vs-semrush',
    tag: 'Value',
  },
  {
    title: 'Ahrefs vs Moz Pro',
    description: 'Link intelligence showdown. Which backlink tool gives you the edge?',
    href: '/comparisons/ahrefs-vs-moz',
    tag: 'Links',
  },
]

const latestPosts = [
  {
    href: '/blog/how-to-track-chatgpt-traffic',
    category: 'AI Traffic',
    date: '9 May 2026',
    title: 'How to Track if ChatGPT is Sending You Traffic',
    excerpt:
      'ChatGPT is sending referral traffic to websites, but Google Analytics will not show you clearly. Here is exactly how to find it.',
  },
]

// ─── Star rating component ────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} width="13" height="13" viewBox="0 0 24 24" fill={star <= Math.floor(rating) ? '#f59e0b' : star - 0.5 <= rating ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="1.5" aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="text-[0.8125rem] font-bold text-white/70 ml-1">{rating}</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AffiliateLandingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SaySEO',
    url: 'https://sayseo.co.uk',
    description:
      'Independent SEO tool reviews, comparisons, and guides for SEO professionals and digital marketers.',
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <AffiliateNav />

      {/* ── Hero ───────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 lg:pt-28 lg:pb-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00D4AA]/[0.08] border border-[#00D4AA]/20 mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] shrink-0" />
            <span className="text-[0.6875rem] font-bold text-[#00D4AA] tracking-[0.1em] uppercase">
              Independent SEO Tool Reviews
            </span>
          </div>

          <h1 className="text-[clamp(2.5rem,5.5vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-white mb-6">
            Find the Right SEO Tool<br />
            <span className="text-[#00D4AA]">for Every Job.</span>
          </h1>

          <p className="text-[1.0625rem] text-white/50 leading-[1.75] mb-10 max-w-[580px]">
            Honest, in-depth reviews of every major SEO platform. Side-by-side comparisons, best-of lists, and expert buying guides — so you spend money on tools that actually move the needle.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg text-[0.9375rem] font-bold text-[#0A0A0A] bg-[#00D4AA] hover:opacity-88 transition-opacity"
            >
              Browse All Reviews
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              href="/comparisons"
              className="inline-flex items-center px-6 py-3.5 rounded-lg text-[0.9375rem] font-semibold text-white/55 border border-white/[0.13] hover:border-white/25 hover:text-white/80 transition-colors"
            >
              Compare Tools
            </Link>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center gap-6 mt-10">
            {[
              { value: '40+', label: 'Tools Reviewed' },
              { value: '100%', label: 'Independent' },
              { value: '10K+', label: 'Monthly Readers' },
            ].map(({ value, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-[1rem] font-extrabold text-[#00D4AA]">{value}</span>
                <span className="text-[0.8125rem] text-white/35">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tool Categories ─────────────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-[#00D4AA] mb-2">
                Browse by Category
              </p>
              <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-white tracking-[-0.025em]">
                What are you looking for?
              </h2>
            </div>
            <Link href="/best-seo-tools" className="hidden md:inline-flex text-sm text-[#00D4AA] hover:opacity-80 transition-opacity">
              View all categories →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.title}
                href={cat.href}
                className="group flex items-start gap-4 bg-[#111111] border border-white/[0.07] rounded-xl p-5 hover:border-[#00D4AA]/25 hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className="text-[1.75rem] shrink-0 mt-0.5">{cat.icon}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[0.9375rem] font-bold text-white tracking-[-0.01em]">{cat.title}</h3>
                    <span className="text-[0.7rem] font-semibold text-white/35">{cat.count} tools</span>
                  </div>
                  <p className="text-[0.8125rem] text-white/40 leading-snug">{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Reviews ────────────────────────────────────────────────────── */}
      <section className="bg-[#0d0d0d] border-t border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-[#00D4AA] mb-2">
                Expert Reviews
              </p>
              <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-white tracking-[-0.025em]">
                Top-rated SEO tools
              </h2>
            </div>
            <Link href="/reviews" className="hidden md:inline-flex text-sm text-[#00D4AA] hover:opacity-80 transition-opacity">
              See all reviews →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {featuredReviews.map((tool) => (
              <div
                key={tool.slug}
                className="flex flex-col bg-[#111111] border border-white/[0.08] rounded-xl p-6 hover:border-white/[0.14] transition-colors"
              >
                {/* Badge + name */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-[1.0625rem] font-extrabold text-white tracking-[-0.015em]">{tool.name}</h3>
                    <p className="text-[0.8125rem] text-white/40 mt-0.5">{tool.tagline}</p>
                  </div>
                  <span
                    className="shrink-0 px-2.5 py-1 rounded-full text-[0.6875rem] font-bold text-[#0A0A0A] whitespace-nowrap"
                    style={{ backgroundColor: tool.badgeColor }}
                  >
                    {tool.badge}
                  </span>
                </div>

                {/* Rating + price */}
                <div className="flex items-center justify-between mb-5">
                  <Stars rating={tool.rating} />
                  <span className="text-[0.8125rem] text-white/45 font-medium">{tool.price}</span>
                </div>

                {/* Pros */}
                <ul className="space-y-1.5 mb-5 flex-1">
                  {tool.pros.map((pro) => (
                    <li key={pro} className="flex items-start gap-2 text-[0.8125rem] text-white/55">
                      <svg className="w-3.5 h-3.5 text-[#00D4AA] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {pro}
                    </li>
                  ))}
                </ul>

                {/* Verdict */}
                <p className="text-[0.8125rem] text-white/38 italic leading-relaxed mb-5 border-l-2 border-[#00D4AA]/25 pl-3">
                  {tool.verdict}
                </p>

                {/* CTAs */}
                <div className="flex gap-2 mt-auto">
                  <Link
                    href={`/reviews/${tool.slug}`}
                    className="flex-1 text-center px-4 py-2.5 rounded-lg text-[0.875rem] font-bold text-[#0A0A0A] bg-[#00D4AA] hover:opacity-88 transition-opacity"
                  >
                    Read Review
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
        </div>
      </section>

      {/* ── Comparisons ─────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-[#00D4AA] mb-2">
              Head-to-Head
            </p>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-white tracking-[-0.025em]">
              Compare top tools
            </h2>
          </div>
          <Link href="/comparisons" className="hidden md:inline-flex text-sm text-[#00D4AA] hover:opacity-80 transition-opacity">
            All comparisons →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {comparisons.map((comp) => (
            <Link
              key={comp.title}
              href={comp.href}
              className="group flex flex-col gap-3 bg-[#111111] border border-white/[0.07] rounded-xl p-6 hover:border-[#00D4AA]/25 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-[#00D4AA]/[0.1] border border-[#00D4AA]/20 text-[0.6875rem] font-bold text-[#00D4AA] tracking-[0.1em] uppercase">
                  {comp.tag}
                </span>
              </div>
              <h3 className="text-[1rem] font-bold text-white tracking-[-0.01em]">{comp.title}</h3>
              <p className="text-[0.8125rem] text-white/45 leading-relaxed">{comp.description}</p>
              <span className="mt-auto text-[0.875rem] font-bold text-[#00D4AA] group-hover:underline">
                Read comparison →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Own Tools Promo ─────────────────────────────────────────────────────── */}
      <section className="border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div
            className="rounded-2xl p-10 md:p-12 flex flex-col md:flex-row md:items-center gap-8 border border-[#00D4AA]/20"
            style={{
              background: 'radial-gradient(ellipse at 0% 50%, rgba(0,212,170,0.07) 0%, transparent 60%), #111111',
            }}
          >
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00D4AA]/[0.1] border border-[#00D4AA]/20 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA]" />
                <span className="text-[0.6875rem] font-bold text-[#00D4AA] tracking-[0.1em] uppercase">Built by SaySEO</span>
              </div>
              <h2 className="text-[clamp(1.375rem,2.5vw,1.875rem)] font-extrabold text-white tracking-[-0.025em] mb-3">
                Track your AI visibility — free.
              </h2>
              <p className="text-[0.9375rem] text-white/45 leading-relaxed max-w-lg">
                Our own free tool tracks when ChatGPT, Gemini, and Perplexity cite your site. Monitor AI-generated traffic and Google AI Overview appearances in one dashboard.
              </p>
            </div>
            <div className="flex flex-col gap-3 shrink-0">
              <Link
                href="/app"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-[0.9375rem] font-bold text-[#0A0A0A] bg-[#00D4AA] hover:opacity-88 transition-opacity whitespace-nowrap"
              >
                Try It Free
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <p className="text-[0.75rem] text-white/30 text-center">No credit card required</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Latest from Blog ─────────────────────────────────────────────────────── */}
      <section className="bg-[#0d0d0d] border-t border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-[#00D4AA] mb-2">
                Latest Guides
              </p>
              <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-white tracking-[-0.025em]">
                From the SaySEO blog
              </h2>
            </div>
            <Link href="/blog" className="hidden md:inline-flex text-sm text-[#00D4AA] hover:opacity-80 transition-opacity">
              All articles →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {latestPosts.map((post) => (
              <Link
                key={post.href}
                href={post.href}
                className="group flex flex-col gap-4 bg-[#111111] border border-white/[0.08] border-l-[3px] border-l-transparent rounded-xl p-7 hover:border-l-[#00D4AA] hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-center gap-2.5 text-[0.8125rem] text-white/45">
                  <span className="px-2.5 py-1 rounded-full border border-[#00D4AA]/40 text-[#00D4AA] text-[0.6875rem] font-bold tracking-[0.1em] uppercase">
                    {post.category}
                  </span>
                  <span>{post.date}</span>
                </div>
                <h3 className="text-[1.125rem] font-bold text-white leading-snug tracking-[-0.015em]">{post.title}</h3>
                <p className="text-[0.875rem] text-white/45 leading-[1.7]">{post.excerpt}</p>
                <span className="mt-auto text-[0.875rem] font-bold text-[#00D4AA] group-hover:underline">
                  Read the guide →
                </span>
              </Link>
            ))}

            {/* Newsletter teaser card */}
            <div className="flex flex-col gap-4 bg-[#111111] border border-[#00D4AA]/15 rounded-xl p-7">
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-[#00D4AA]">Newsletter</p>
              <h3 className="text-[1.125rem] font-bold text-white leading-snug">
                Get new reviews & guides in your inbox
              </h3>
              <p className="text-[0.875rem] text-white/45 leading-[1.7]">
                Weekly roundups of the best SEO tool reviews, comparison posts, and industry guides. No spam, unsubscribe any time.
              </p>
              <Link
                href="/blog"
                className="mt-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[0.875rem] font-bold text-[#0A0A0A] bg-[#00D4AA] hover:opacity-88 transition-opacity self-start"
              >
                Browse the blog →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div
          className="rounded-2xl p-12 text-center border border-[#00D4AA]/22"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(0,212,170,0.06) 0%, transparent 70%), #111111',
            boxShadow: '0 0 0 1px rgba(0,212,170,0.06), 0 32px 64px rgba(0,0,0,0.3)',
          }}
        >
          <h2 className="text-[clamp(1.625rem,3.5vw,2.25rem)] font-extrabold text-white tracking-[-0.025em] mb-3">
            Stop guessing. Start using the right tools.
          </h2>
          <p className="text-[1rem] text-white/45 mb-8 max-w-md mx-auto">
            Read our independent reviews and comparisons before you spend money on SEO software.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg text-[0.9375rem] font-bold text-[#0A0A0A] bg-[#00D4AA] hover:opacity-88 transition-opacity"
            >
              Browse Reviews
            </Link>
            <Link
              href="/best-seo-tools"
              className="inline-flex items-center px-7 py-3.5 rounded-lg text-[0.9375rem] font-semibold text-white/55 border border-white/[0.13] hover:border-white/25 hover:text-white/80 transition-colors"
            >
              Best-of Lists
            </Link>
          </div>
        </div>
      </section>

      <AffiliateFooter />
    </div>
  )
}
