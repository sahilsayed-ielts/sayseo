import Link from 'next/link'

export function AffiliateFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center mb-3">
              <span className="text-[1.0625rem] font-extrabold text-gray-900 tracking-tight">Say</span>
              <span className="text-[1.0625rem] font-extrabold text-emerald-700 tracking-tight">SEO</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Independent reviews and expert guides for SEO professionals and digital marketers.
            </p>
            <Link
              href="/tools"
              className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors"
            >
              Free SEO Tools →
            </Link>
          </div>

          {/* Reviews */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.1em] mb-4">Reviews</p>
            <ul className="space-y-2.5">
              {[
                { label: 'Semrush Review', href: '/reviews/semrush' },
                { label: 'Ahrefs Review', href: '/reviews/ahrefs' },
                { label: 'Moz Pro Review', href: '/reviews/moz-pro' },
                { label: 'SE Ranking Review', href: '/reviews/se-ranking' },
                { label: 'Surfer SEO Review', href: '/reviews/surfer-seo' },
                { label: 'All Reviews →', href: '/reviews' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-gray-500 hover:text-emerald-700 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Free Tools */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.1em] mb-4">Free Tools</p>
            <ul className="space-y-2.5">
              {[
                { label: 'All Free Tools', href: '/tools' },
                { label: 'SERP Preview', href: '/tools/serp-preview' },
                { label: 'Title Tag Analyser', href: '/tools/title-tag-analyzer' },
                { label: 'Schema Generator', href: '/tools/schema-generator' },
                { label: 'Keyword Density', href: '/tools/keyword-density' },
                { label: 'SEO ROI Calculator', href: '/tools/seo-roi-calculator' },
                { label: 'Robots.txt Generator', href: '/tools/robots-txt-generator' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-gray-500 hover:text-emerald-700 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.1em] mb-4">Categories</p>
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
                  <Link href={href} className="text-sm text-gray-500 hover:text-emerald-700 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Advertiser Disclosure box */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-[0.08em] mb-2">Advertiser Disclosure</p>
          <p className="text-sm text-gray-500 leading-relaxed">
            SaySEO participates in affiliate programmes. When you click links and make purchases through our site, we may earn a commission — at no extra cost to you. Our editorial team independently selects, tests, and rates every tool. Affiliate relationships never influence our scores or recommendations.{' '}
            <Link href="/affiliate-disclosure" className="text-emerald-700 hover:underline font-medium">
              Read our full disclosure →
            </Link>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">© 2026 SaySEO. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/affiliate-disclosure" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Disclosure</Link>
            <Link href="/tools" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Free Tools</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
