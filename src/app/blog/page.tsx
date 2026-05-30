import Link from 'next/link'
import type { Metadata } from 'next'
import { AffiliateNav } from '@/components/affiliate/AffiliateNav'
import { AffiliateFooter } from '@/components/affiliate/AffiliateFooter'

export const metadata: Metadata = {
  title: 'Blog — SEO Guides, Tool Reviews & Digital Marketing Insights | SaySEO',
  description: 'In-depth guides on AI search, SEO strategy, tool reviews, and digital marketing from the SaySEO team.',
  alternates: { canonical: 'https://sayseo.co.uk/blog' },
  openGraph: {
    type: 'website',
    title: 'Blog — SaySEO',
    description: 'In-depth guides on AI search, SEO strategy, and digital marketing.',
    url: 'https://sayseo.co.uk/blog',
    locale: 'en_GB',
  },
}

const posts = [
  {
    href: '/blog/how-to-track-chatgpt-traffic',
    category: 'AI Traffic',
    date: '9 May 2026',
    readTime: '7 min read',
    title: 'How to Track if ChatGPT is Sending You Traffic',
    excerpt:
      'ChatGPT is sending referral traffic to websites, but Google Analytics will not show you clearly. Here is exactly how to find it, measure it, and act on it.',
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <AffiliateNav />

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-10 pb-8">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
            <Link href="/" className="hover:text-emerald-700 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-600 font-medium">Blog</span>
          </nav>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700 mb-3">Blog</p>
          <h1 className="text-[clamp(1.875rem,4vw,2.75rem)] font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
            SaySEO Blog
          </h1>
          <p className="text-base text-gray-500 leading-relaxed max-w-[540px]">
            In-depth guides on AI search, SEO strategy, tool reviews, and digital marketing.
          </p>
        </div>
      </div>

      {/* ── Posts grid ────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-10 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {posts.map((post) => (
            <Link
              key={post.href}
              href={post.href}
              className="group flex flex-col gap-4 bg-white border border-gray-200 rounded-xl p-7 hover:shadow-sm hover:border-emerald-200 transition-all duration-200"
            >
              <div className="flex flex-wrap items-center gap-2.5 text-xs text-gray-400">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold tracking-wide uppercase">
                  {post.category}
                </span>
                <span>{post.date}</span>
                <span>·</span>
                <span>{post.readTime}</span>
              </div>

              <h2 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-emerald-700 transition-colors">
                {post.title}
              </h2>

              <p className="text-sm text-gray-500 leading-relaxed">
                {post.excerpt}
              </p>

              <span className="mt-auto text-sm font-semibold text-emerald-700 group-hover:underline">
                Read the guide →
              </span>
            </Link>
          ))}
        </div>
      </main>

      <AffiliateFooter />
    </div>
  )
}
