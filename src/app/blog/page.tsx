import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog — SaySEO',
  description: 'Insights on AI search, citation tracking, and the future of SEO from the SaySEO team.',
  alternates: { canonical: 'https://sayseo.co.uk/blog' },
  openGraph: {
    type: 'website',
    title: 'Blog — SaySEO',
    description: 'Insights on AI search, citation tracking, and the future of SEO from the SaySEO team.',
    url: 'https://sayseo.co.uk/blog',
    locale: 'en_GB',
  },
}

// ─── Post data ────────────────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">

      {/* ── Nav ────────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center shrink-0 no-underline">
            <span className="text-[1.1875rem] font-extrabold text-white tracking-tight leading-none">Say</span>
            <span className="text-[1.1875rem] font-extrabold text-[#00D4AA] tracking-tight leading-none">SEO</span>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-sm text-white/50">
            {[
              { label: 'Features', href: '/#features' },
              { label: 'Pricing', href: '/#pricing' },
              { label: 'Blog', href: '/blog' },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className={`hover:text-white/90 transition-colors duration-150 ${label === 'Blog' ? 'text-white/80' : ''}`}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/auth/login"
              className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white/60 border border-white/[0.14] hover:border-white/25 hover:text-white/90 transition-colors duration-150"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-[#0A0A0A] bg-[#00D4AA] hover:opacity-88 transition-opacity duration-150 whitespace-nowrap"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto w-full px-6 pt-16 pb-12">
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[#00D4AA] mb-4">
          Blog
        </p>
        <h1 className="text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold text-white tracking-[-0.03em] leading-[1.07] mb-4">
          SaySEO Blog
        </h1>
        <p className="text-[1.0625rem] text-white/50 leading-[1.75] max-w-[560px]">
          Insights on AI search, citation tracking, and the future of SEO.
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
              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-2.5 text-[0.8125rem] font-semibold text-white/45">
                <span className="px-2.5 py-1 rounded-full border border-[#00D4AA]/40 text-[#00D4AA] text-[0.6875rem] font-bold tracking-[0.1em] uppercase">
                  {post.category}
                </span>
                <span>{post.date}</span>
                <span className="text-white/25">&middot;</span>
                <span>{post.readTime}</span>
              </div>

              {/* Title */}
              <h2 className="text-[1.25rem] font-bold text-white leading-snug tracking-[-0.015em] m-0">
                {post.title}
              </h2>

              {/* Excerpt */}
              <p className="text-[0.9375rem] text-white/50 leading-[1.7] m-0">
                {post.excerpt}
              </p>

              {/* Read link */}
              <span className="mt-auto text-[0.9rem] font-bold text-[#00D4AA] group-hover:underline">
                Read the guide →
              </span>
            </Link>
          ))}
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center mb-1.5">
                <span className="text-[1.0625rem] font-extrabold text-white tracking-tight">Say</span>
                <span className="text-[1.0625rem] font-extrabold text-[#00D4AA] tracking-tight">SEO</span>
              </div>
              <p className="text-[0.8125rem] text-white/30 leading-snug">
                AI Visibility for the modern SEO team.
              </p>
            </div>

            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[0.8125rem] text-white/35">
              {[
                { label: 'Features', href: '/#features' },
                { label: 'Pricing', href: '/#pricing' },
                { label: 'Blog', href: '/blog' },
                { label: 'Login', href: '/auth/login' },
              ].map(({ label, href }) => (
                <Link key={label} href={href} className="hover:text-white/65 transition-colors">
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="border-t border-white/[0.05] pt-6">
            <p className="text-[0.8rem] text-white/22">
              &copy; 2026 SaySEO. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
