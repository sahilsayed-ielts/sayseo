import Link from 'next/link'
import type { Metadata } from 'next'
import { AffiliateNav } from '@/components/affiliate/AffiliateNav'
import { AffiliateFooter } from '@/components/affiliate/AffiliateFooter'

export const metadata: Metadata = {
  title: 'SaySEO — Independent SEO Tool Reviews & Comparisons',
  description:
    'Honest, in-depth reviews of the best SEO tools, software comparisons, and expert buying guides for SEO professionals and digital marketers.',
  keywords: [
    'SEO tools', 'SEO software reviews', 'best SEO tools', 'Semrush review',
    'Ahrefs review', 'keyword research tools', 'backlink analysis tools',
    'SEO tool comparisons', 'digital marketing tools',
  ],
  alternates: { canonical: 'https://sayseo.co.uk' },
  openGraph: {
    type: 'website',
    siteName: 'SaySEO',
    title: 'SaySEO — Independent SEO Tool Reviews & Comparisons',
    description: 'Honest, in-depth reviews of the best SEO tools for SEO professionals and digital marketers.',
    url: 'https://sayseo.co.uk',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SaySEO — Independent SEO Tool Reviews & Comparisons',
    description: 'Honest, in-depth reviews of the best SEO tools for SEO professionals and digital marketers.',
  },
  robots: { index: true, follow: true },
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const categories = [
  { icon: '🔍', title: 'Keyword Research', count: 8, href: '/best-seo-tools#keyword-research', description: 'Find search opportunities and low-competition keywords.' },
  { icon: '🔗', title: 'Backlink Analysis', count: 6, href: '/best-seo-tools#backlink-analysis', description: 'Analyse link profiles and build domain authority.' },
  { icon: '⚙️', title: 'Technical SEO', count: 7, href: '/best-seo-tools#technical-seo', description: 'Crawl, audit, and fix technical issues at scale.' },
  { icon: '📈', title: 'Rank Tracking', count: 9, href: '/best-seo-tools#rank-tracking', description: 'Monitor keyword positions across search engines.' },
  { icon: '✍️', title: 'Content Optimization', count: 5, href: '/best-seo-tools#content', description: 'Optimise content for relevance and search visibility.' },
  { icon: '🤖', title: 'AI Visibility', count: 3, href: '/best-seo-tools#ai-visibility', description: 'Track citations from ChatGPT, Gemini, and Perplexity.' },
]

const topPicks = [
  {
    slug: 'semrush',
    name: 'Semrush',
    tagline: 'All-in-one SEO & digital marketing platform',
    rating: 4.8,
    badge: 'Best Overall',
    badgeColor: '#047857',
    price: 'From $139.95/mo',
    trial: '7-day free trial',
    bestFor: 'Agencies & in-house teams',
    summary: 'The most complete SEO platform on the market. Covers keyword research, site audits, backlinks, competitor analysis, and content marketing in one tool.',
    pros: ['Largest keyword database', 'Comprehensive site audits', 'Best competitor intelligence'],
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
    price: 'From $129/mo',
    trial: '$7 for 7-day trial',
    bestFor: 'Link builders & content strategists',
    summary: 'The gold standard for backlink analysis with the most comprehensive link database available. Excellent keyword and content research alongside.',
    pros: ['Best backlink database', 'Accurate keyword data', 'Fast crawler updates'],
    initial: 'A',
    initialBg: '#F59E0B',
  },
  {
    slug: 'se-ranking',
    name: 'SE Ranking',
    tagline: 'Affordable all-in-one SEO for growing teams',
    rating: 4.5,
    badge: 'Best Value',
    badgeColor: '#6D28D9',
    price: 'From $65/mo',
    trial: '14-day free trial',
    bestFor: 'Freelancers & SMBs',
    summary: 'The smartest buy for teams who need a capable all-in-one SEO platform without the enterprise price tag. Full-featured at a fraction of the cost.',
    pros: ['Best price-to-feature ratio', 'Clean, beginner-friendly UI', 'White-label reports'],
    initial: 'SE',
    initialBg: '#7C3AED',
  },
]

const comparisonData = [
  { slug: 'semrush', name: 'Semrush', rating: 4.8, price: '$139.95/mo', bestFor: 'Agencies', trial: '7-day trial', initial: 'S', color: '#1D4ED8' },
  { slug: 'ahrefs', name: 'Ahrefs', rating: 4.7, price: '$129/mo', bestFor: 'Link builders', trial: '$7 trial', initial: 'A', color: '#D97706' },
  { slug: 'se-ranking', name: 'SE Ranking', rating: 4.5, price: '$65/mo', bestFor: 'Freelancers', trial: '14-day free', initial: 'SE', color: '#7C3AED' },
  { slug: 'moz-pro', name: 'Moz Pro', rating: 4.2, price: '$99/mo', bestFor: 'Beginners', trial: '30-day free', initial: 'M', color: '#0891B2' },
  { slug: 'screaming-frog', name: 'Screaming Frog', rating: 4.6, price: 'Free / £259/yr', bestFor: 'Technical SEO', trial: 'Free tier (500 URLs)', initial: 'SF', color: '#DC2626' },
]

const latestPosts = [
  {
    href: '/blog/how-to-track-chatgpt-traffic',
    category: 'AI Traffic',
    date: '9 May 2026',
    title: 'How to Track if ChatGPT is Sending You Traffic',
    excerpt: 'ChatGPT is sending referral traffic to websites, but Google Analytics won\'t show it clearly. Here\'s exactly how to find it.',
    readTime: '7 min read',
  },
]

// ─── Shared components ────────────────────────────────────────────────────────

function ScoreCircle({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const bg = score >= 4.5 ? '#047857' : score >= 4.0 ? '#059669' : score >= 3.5 ? '#D97706' : '#DC2626'
  const cls = size === 'lg'
    ? 'w-16 h-16 text-xl'
    : size === 'sm'
      ? 'w-10 h-10 text-sm'
      : 'w-13 h-13 text-base'
  return (
    <div
      className={`rounded-full flex items-center justify-center font-extrabold text-white shrink-0 ${cls}`}
      style={{ backgroundColor: bg, width: size === 'lg' ? 64 : size === 'sm' ? 40 : 52, height: size === 'lg' ? 64 : size === 'sm' ? 40 : 52 }}
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
        <svg key={star} width="13" height="13" viewBox="0 0 24 24"
          fill={star <= Math.floor(rating) ? '#F59E0B' : star - 0.5 <= rating ? '#F59E0B' : 'none'}
          stroke="#F59E0B" strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SaySEO',
    url: 'https://sayseo.co.uk',
    description: 'Independent SEO tool reviews, comparisons, and guides.',
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AffiliateNav />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-14 lg:pt-20 lg:pb-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
              <span className="text-[0.6875rem] font-bold text-emerald-700 tracking-[0.1em] uppercase">
                Independent SEO Tool Reviews
              </span>
            </div>

            <h1 className="text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold text-gray-900 leading-[1.08] tracking-[-0.03em] mb-5">
              Find the Right SEO Tool<br />
              <span className="text-emerald-700">for Every Job.</span>
            </h1>

            <p className="text-lg text-gray-500 leading-[1.75] mb-8 max-w-[600px]">
              Honest, hands-on reviews of every major SEO platform. Side-by-side comparisons, best-of lists, and expert buying guides — so you spend money on tools that actually move the needle.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/reviews"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg text-[0.9375rem] font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-sm"
              >
                Browse All Reviews
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/comparisons"
                className="inline-flex items-center px-6 py-3.5 rounded-lg text-[0.9375rem] font-semibold text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Compare Tools
              </Link>
            </div>

            {/* Trust bar */}
            <div className="flex flex-wrap items-center gap-6 mt-10 pt-8 border-t border-gray-100">
              {[
                { value: '40+', label: 'Tools Reviewed' },
                { value: '100%', label: 'Independent' },
                { value: '10K+', label: 'Monthly Readers' },
                { value: 'May 2026', label: 'Last Updated' },
              ].map(({ value, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-[0.9375rem] font-extrabold text-emerald-700">{value}</span>
                  <span className="text-sm text-gray-400">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Browse by Category ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700 mb-2">Browse by Category</p>
            <h2 className="text-[clamp(1.375rem,2.5vw,1.75rem)] font-extrabold text-gray-900 tracking-tight">
              What are you looking for?
            </h2>
          </div>
          <Link href="/best-seo-tools" className="hidden sm:inline-flex text-sm font-semibold text-emerald-700 hover:underline">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className="group flex items-start gap-4 bg-white border border-gray-200 rounded-xl p-5 hover:border-emerald-300 hover:shadow-sm transition-all duration-200"
            >
              <span className="text-2xl shrink-0 mt-0.5">{cat.icon}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-gray-900">{cat.title}</h3>
                  <span className="text-xs text-gray-400">{cat.count} tools</span>
                </div>
                <p className="text-xs text-gray-500 leading-snug">{cat.description}</p>
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-emerald-600 shrink-0 mt-0.5 ml-auto transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Editor's Top Picks ────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700 mb-2">Editor&apos;s Picks</p>
              <h2 className="text-[clamp(1.375rem,2.5vw,1.75rem)] font-extrabold text-gray-900 tracking-tight">
                Best SEO tools for 2026
              </h2>
            </div>
            <Link href="/reviews" className="hidden sm:inline-flex text-sm font-semibold text-emerald-700 hover:underline">
              See all reviews →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {topPicks.map((tool) => (
              <div key={tool.slug} className="flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">

                {/* Card header */}
                <div className="flex items-center gap-4 p-5 border-b border-gray-100">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-extrabold text-white shrink-0"
                    style={{ backgroundColor: tool.initialBg }}
                  >
                    {tool.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-[0.9375rem] font-extrabold text-gray-900">{tool.name}</h3>
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
                <div className="flex items-center gap-4 px-5 py-3.5 bg-gray-50 border-b border-gray-100">
                  <ScoreCircle score={tool.rating} size="sm" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Stars rating={tool.rating} />
                      <span className="text-xs font-bold text-gray-700">{tool.rating}/5</span>
                    </div>
                    <p className="text-[0.65rem] text-gray-400 mt-0.5">SaySEO Rating</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-sm font-bold text-gray-900">{tool.price}</p>
                    <p className="text-xs text-gray-400">{tool.trial}</p>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 p-5 flex flex-col gap-4">
                  <p className="text-sm text-gray-600 leading-relaxed">{tool.summary}</p>

                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.08em] mb-2">Key Strengths</p>
                    <ul className="space-y-1.5">
                      {tool.pros.map((pro) => (
                        <li key={pro} className="flex items-start gap-2 text-sm text-gray-600">
                          <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center gap-1.5 mt-auto">
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
                    Read Review
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
        </div>
      </section>

      {/* ── Comparison Table ──────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700 mb-2">Quick Comparison</p>
            <h2 className="text-[clamp(1.375rem,2.5vw,1.75rem)] font-extrabold text-gray-900 tracking-tight">
              Top SEO tools at a glance
            </h2>
          </div>
          <Link href="/comparisons" className="hidden sm:inline-flex text-sm font-semibold text-emerald-700 hover:underline">
            Full comparisons →
          </Link>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
          <table className="w-full text-sm min-w-[680px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 min-w-[160px]">Tool</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500">Rating</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500">Price</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500">Best For</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500">Free Trial</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((tool, i) => (
                <tr key={tool.slug} className={`border-b border-gray-100 last:border-0 ${i % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ backgroundColor: tool.color }}
                      >
                        {tool.initial}
                      </div>
                      <span className="font-semibold text-gray-900">{tool.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <ScoreCircle score={tool.rating} size="sm" />
                      <span className="text-gray-500 text-xs">/5</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-semibold text-gray-900">{tool.price}</td>
                  <td className="px-5 py-4 text-gray-600">{tool.bestFor}</td>
                  <td className="px-5 py-4 text-gray-600">{tool.trial}</td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/reviews/${tool.slug}`}
                      className="text-emerald-700 font-semibold hover:underline whitespace-nowrap"
                    >
                      Read Review →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── How We Review ─────────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700 mb-2">Our Methodology</p>
            <h2 className="text-[clamp(1.375rem,2.5vw,1.75rem)] font-extrabold text-gray-900 tracking-tight mb-3">
              Independent. Honest. Practical.
            </h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto">
              Every review is based on hands-on testing. We never accept payment for positive coverage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '🔬',
                title: 'Hands-On Testing',
                description: 'We subscribe to and actively use each tool for at least 30 days before writing our review. No press releases, no vendor demos.',
              },
              {
                icon: '⚖️',
                title: 'No Pay-for-Play',
                description: 'Our scores and rankings are never influenced by affiliate commissions, sponsorships, or vendor relationships. We disclose all affiliate links.',
              },
              {
                icon: '🎯',
                title: 'Practical Focus',
                description: 'We review tools from the perspective of working SEO professionals — not academics. Our verdict tells you who should actually buy it.',
              },
            ].map((pillar) => (
              <div key={pillar.title} className="flex gap-4 p-6 bg-gray-50 border border-gray-200 rounded-xl">
                <span className="text-2xl shrink-0 mt-0.5">{pillar.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">{pillar.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{pillar.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest Guides ─────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700 mb-2">Latest Guides</p>
            <h2 className="text-[clamp(1.375rem,2.5vw,1.75rem)] font-extrabold text-gray-900 tracking-tight">
              From the SaySEO blog
            </h2>
          </div>
          <Link href="/blog" className="hidden sm:inline-flex text-sm font-semibold text-emerald-700 hover:underline">
            All articles →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {latestPosts.map((post) => (
            <Link
              key={post.href}
              href={post.href}
              className="group flex flex-col gap-3 bg-white border border-gray-200 rounded-xl p-6 hover:shadow-sm hover:border-emerald-200 transition-all duration-200"
            >
              <div className="flex items-center gap-2.5 text-xs text-gray-400">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold tracking-wide uppercase">
                  {post.category}
                </span>
                <span>{post.date}</span>
                <span>·</span>
                <span>{post.readTime}</span>
              </div>
              <h3 className="text-base font-bold text-gray-900 leading-snug group-hover:text-emerald-700 transition-colors">
                {post.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{post.excerpt}</p>
              <span className="mt-auto text-sm font-semibold text-emerald-700 group-hover:underline">
                Read the guide →
              </span>
            </Link>
          ))}

          {/* Newsletter / CTA card */}
          <div className="flex flex-col gap-4 bg-emerald-50 border border-emerald-200 rounded-xl p-6">
            <div className="inline-flex items-center gap-2 self-start">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-emerald-700">Free Newsletter</p>
            </div>
            <h3 className="text-base font-bold text-gray-900 leading-snug">
              Get new reviews & guides in your inbox
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Weekly roundups of the best SEO tool reviews, comparison posts, and industry guides. No spam, unsubscribe any time.
            </p>
            <Link
              href="/blog"
              className="mt-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors self-start shadow-sm"
            >
              Browse the blog →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Own Tool Promo ────────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 p-8 md:p-12 flex flex-col md:flex-row md:items-center gap-8 shadow-lg">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                <span className="text-[0.6875rem] font-bold text-white/80 tracking-[0.1em] uppercase">Built by SaySEO</span>
              </div>
              <h2 className="text-[clamp(1.375rem,2.5vw,1.875rem)] font-extrabold text-white tracking-tight mb-3">
                Track your AI visibility — free.
              </h2>
              <p className="text-[0.9375rem] text-white/75 leading-relaxed max-w-lg">
                Our free tool tracks when ChatGPT, Gemini, and Perplexity cite your site. Monitor AI-generated traffic and Google AI Overview appearances in one dashboard.
              </p>
            </div>
            <div className="flex flex-col gap-3 shrink-0">
              <Link
                href="/app"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-[0.9375rem] font-bold text-emerald-800 bg-white hover:bg-gray-50 transition-colors whitespace-nowrap shadow-sm"
              >
                Try It Free
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <p className="text-xs text-white/50 text-center">No credit card required</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="rounded-2xl bg-white border border-gray-200 p-10 md:p-12 text-center shadow-sm">
          <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-gray-900 tracking-tight mb-3">
            Stop guessing. Use the right tools.
          </h2>
          <p className="text-base text-gray-500 mb-8 max-w-md mx-auto">
            Read our independent reviews and comparisons before you spend money on SEO software.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg text-[0.9375rem] font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-sm"
            >
              Browse Reviews
            </Link>
            <Link
              href="/best-seo-tools"
              className="inline-flex items-center px-7 py-3.5 rounded-lg text-[0.9375rem] font-semibold text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
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
