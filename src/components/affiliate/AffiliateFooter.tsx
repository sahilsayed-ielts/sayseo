import Link from 'next/link'

export function AffiliateFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center mb-3">
              <span className="text-[1.0625rem] font-extrabold text-white tracking-tight">Say</span>
              <span className="text-[1.0625rem] font-extrabold text-[#00D4AA] tracking-tight">SEO</span>
            </div>
            <p className="text-[0.8125rem] text-white/35 leading-relaxed mb-4">
              Independent reviews, comparisons, and guides for SEO professionals and digital marketers.
            </p>
            <Link
              href="/app"
              className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-bold text-[#0A0A0A] bg-[#00D4AA] hover:opacity-88 transition-opacity"
            >
              Free SEO Tools →
            </Link>
          </div>

          {/* Reviews */}
          <div>
            <p className="text-[0.75rem] font-bold text-white/45 uppercase tracking-[0.1em] mb-4">Reviews</p>
            <ul className="space-y-2.5">
              {[
                { label: 'Semrush Review', href: '/reviews/semrush' },
                { label: 'Ahrefs Review', href: '/reviews/ahrefs' },
                { label: 'Moz Pro Review', href: '/reviews/moz-pro' },
                { label: 'SE Ranking Review', href: '/reviews/se-ranking' },
                { label: 'Surfer SEO Review', href: '/reviews/surfer-seo' },
                { label: 'All Reviews', href: '/reviews' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-[0.8125rem] text-white/35 hover:text-white/70 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <p className="text-[0.75rem] font-bold text-white/45 uppercase tracking-[0.1em] mb-4">Resources</p>
            <ul className="space-y-2.5">
              {[
                { label: 'Best SEO Tools', href: '/best-seo-tools' },
                { label: 'Tool Comparisons', href: '/comparisons' },
                { label: 'Blog', href: '/blog' },
                { label: 'Free SEO Tools', href: '/app' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-[0.8125rem] text-white/35 hover:text-white/70 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <p className="text-[0.75rem] font-bold text-white/45 uppercase tracking-[0.1em] mb-4">Categories</p>
            <ul className="space-y-2.5">
              {[
                { label: 'Keyword Research', href: '/best-seo-tools#keyword-research' },
                { label: 'Backlink Analysis', href: '/best-seo-tools#backlink-analysis' },
                { label: 'Technical SEO', href: '/best-seo-tools#technical-seo' },
                { label: 'Rank Tracking', href: '/best-seo-tools#rank-tracking' },
                { label: 'Content Optimization', href: '/best-seo-tools#content' },
                { label: 'AI Visibility', href: '/app' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-[0.8125rem] text-white/35 hover:text-white/70 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.05] pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-[0.8rem] text-white/22">
            &copy; 2026 SaySEO. All rights reserved.
          </p>
          <p className="text-[0.75rem] text-white/20 leading-relaxed max-w-xl">
            <span className="text-white/35 font-semibold">Affiliate Disclosure:</span> SaySEO participates in affiliate programmes. Some links on this site may earn us a commission at no extra cost to you. All reviews are independent and based on our own testing and analysis.
          </p>
        </div>
      </div>
    </footer>
  )
}
