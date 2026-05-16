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
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      <AffiliateNav />

      {/* ── Hero ───────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto w-full px-6 pt-16 pb-12">
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[#00D4AA] mb-4">
          Blog
        </p>
        <h1 className="text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold text-white tracking-[-0.03em] leading-[1.07] mb-4">
          SaySEO Blog
        </h1>
        <p className="text-[1.0625rem] text-white/50 leading-[1.75] max-w-[560px]">
          In-depth guides on AI search, SEO strategy, tool reviews, and digital marketing.
        </p>
      </section>

      {/* ── Posts grid ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {posts.map((post) => (
            <Link
              key={post.href}
              href={post.href}
              className="group flex flex-col gap-4 bg-[#111111] border border-white/[0.08] border-l-[3px] border-l-transparent rounded-xl p-7 no-underline hover:border-l-[#00D4AA] hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3),0_0_0_1px_rgba(0,212,170,0.12)] transition-all duration-200"
            >
              <div className="flex flex-wrap items-center gap-2.5 text-[0.8125rem] font-semibold text-white/45">
                <span className="px-2.5 py-1 rounded-full border border-[#00D4AA]/40 text-[#00D4AA] text-[0.6875rem] font-bold tracking-[0.1em] uppercase">
                  {post.category}
                </span>
                <span>{post.date}</span>
                <span className="text-white/25">&middot;</span>
                <span>{post.readTime}</span>
              </div>

              <h2 className="text-[1.25rem] font-bold text-white leading-snug tracking-[-0.015em] m-0">
                {post.title}
              </h2>

              <p className="text-[0.9375rem] text-white/50 leading-[1.7] m-0">
                {post.excerpt}
              </p>

              <span className="mt-auto text-[0.9rem] font-bold text-[#00D4AA] group-hover:underline">
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
