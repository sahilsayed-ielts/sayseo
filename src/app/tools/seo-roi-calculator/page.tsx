import Link from 'next/link'
import type { Metadata } from 'next'
import { AffiliateNav } from '@/components/affiliate/AffiliateNav'
import { AffiliateFooter } from '@/components/affiliate/AffiliateFooter'
import { SeoRoiClient } from './SeoRoiClient'

export const metadata: Metadata = {
  title: 'Free SEO ROI Calculator — Traffic, Revenue & Return on Investment | SaySEO',
  description:
    'Calculate the expected ROI from your SEO investment. Enter search volume, current and target positions, conversion rate, and order value — get monthly traffic projections, revenue estimates, and payback period.',
  keywords: [
    'SEO ROI calculator', 'SEO return on investment', 'organic traffic value calculator',
    'SEO revenue calculator', 'SEO business case calculator', 'keyword ROI calculator',
    'SEO proposal calculator', 'organic search ROI',
  ],
  alternates: { canonical: 'https://sayseo.co.uk/tools/seo-roi-calculator' },
  openGraph: {
    type: 'website',
    siteName: 'SaySEO',
    title: 'Free SEO ROI Calculator | SaySEO',
    description: 'Calculate monthly traffic, revenue, and ROI from improving SERP rankings. Built for agency client proposals.',
    url: 'https://sayseo.co.uk/tools/seo-roi-calculator',
    locale: 'en_GB',
  },
  robots: { index: true, follow: true },
}

const faqs = [
  {
    q: 'How does the SEO ROI calculator work?',
    a: 'The calculator uses industry-standard click-through rate (CTR) benchmarks for each SERP position. It multiplies your keyword\'s monthly search volume by the position CTR to estimate monthly organic traffic. Your conversion rate and average conversion value then translate that traffic into projected monthly revenue. The difference between current and target revenue, minus your SEO investment cost, gives the ROI.',
  },
  {
    q: 'What CTR data does the calculator use?',
    a: 'The calculator uses widely cited organic CTR benchmarks: position 1 ≈ 39.8%, position 2 ≈ 18.7%, position 3 ≈ 10.2%, position 4 ≈ 7.4%, position 5 ≈ 5.1%, position 6 ≈ 4.0%, position 7 ≈ 3.1%, position 8 ≈ 2.6%, position 9 ≈ 2.2%, position 10 ≈ 2.0%, positions 11–20 ≈ 0.8%, positions 21–30 ≈ 0.4%, positions 31+ ≈ 0.2%. These are directional averages — actual CTR varies by query type, brand presence, and SERP features.',
  },
  {
    q: 'Can I use this for a client proposal?',
    a: 'Yes — this calculator is designed for agency use in client proposals and sales pitches. Use it to demonstrate the revenue upside of moving from page 3 to page 1 for target keywords. Present projections as directional estimates rather than guarantees, and note that actual results depend on content quality, competition, seasonality, and brand recognition. Pair the output with keyword data from Semrush or Ahrefs for a complete business case.',
  },
  {
    q: 'Why is my current position\'s revenue showing as £0?',
    a: 'If you\'re currently ranking on page 3 or beyond (position 21+), the CTR is very low (0.2–0.4%), which means the monthly traffic estimate may be close to zero depending on search volume. This is actually a useful illustration — it shows stakeholders that ranking below page 1 generates almost no organic traffic, making the case for SEO investment even stronger.',
  },
  {
    q: 'What conversion rate should I use?',
    a: 'For e-commerce sites, average conversion rates typically range from 1% to 4%. For B2B lead generation (form fills, quote requests), 1%–3% is common. SaaS free trials typically convert at 2%–5%. If you don\'t know your actual conversion rate, start with 2% as a conservative estimate. For the most accurate projections, use your actual Google Analytics conversion data segmented by organic channel.',
  },
  {
    q: 'How accurate are the projections?',
    a: 'The projections are directionally accurate for business case purposes, not financially precise forecasts. Real-world results depend on many factors the calculator cannot account for: SERP features (AI Overviews, featured snippets, ads), seasonal demand variation, brand strength, landing page conversion rate changes, and ranking position volatility. Use the numbers to show the scale of opportunity, not as promised outcomes.',
  },
]

export default function SeoRoiCalculatorPage() {
  const toolJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SEO ROI Calculator',
    applicationCategory: 'SEOApplication',
    operatingSystem: 'Web Browser',
    url: 'https://sayseo.co.uk/tools/seo-roi-calculator',
    description: 'Calculate monthly traffic, revenue, and ROI from improving SERP rankings.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
    publisher: { '@type': 'Organization', name: 'SaySEO', url: 'https://sayseo.co.uk' },
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <AffiliateNav />

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-8">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
            <Link href="/" className="hover:text-emerald-700 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-emerald-700 transition-colors">Free Tools</Link>
            <span>/</span>
            <span className="text-gray-600 font-medium">SEO ROI Calculator</span>
          </nav>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">💷</span>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">Free SEO Tool</p>
          </div>
          <h1 className="text-[clamp(1.875rem,4vw,2.5rem)] font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
            SEO ROI Calculator
          </h1>
          <p className="text-base text-gray-500 leading-relaxed max-w-[600px]">
            Calculate the expected traffic, leads, and revenue return from moving up the SERPs. Uses position-to-CTR benchmarks and your actual conversion data. Perfect for building client proposals and internal SEO business cases.
          </p>
        </div>
      </div>

      <SeoRoiClient />

      {/* ── CTR table ─────────────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-[1.25rem] font-extrabold text-gray-900 tracking-tight mb-3">
            Organic CTR benchmarks by SERP position
          </h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            These industry-average click-through rates are used in the calculator. Actual CTR varies significantly based on brand recognition, SERP feature presence (AI Overviews, featured snippets), and query type (navigational vs informational vs commercial).
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Position</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">CTR</th>
                  <th className="px-5 py-3 w-48" />
                </tr>
              </thead>
              <tbody>
                {[
                  { pos: '1', ctr: 39.8 }, { pos: '2', ctr: 18.7 }, { pos: '3', ctr: 10.2 },
                  { pos: '4', ctr: 7.4 }, { pos: '5', ctr: 5.1 }, { pos: '6', ctr: 4.0 },
                  { pos: '7', ctr: 3.1 }, { pos: '8', ctr: 2.6 }, { pos: '9', ctr: 2.2 },
                  { pos: '10', ctr: 2.0 }, { pos: '11–20 (page 2)', ctr: 0.8 },
                  { pos: '21–30 (page 3)', ctr: 0.4 }, { pos: '31+ (page 4+)', ctr: 0.2 },
                ].map((row, i) => (
                  <tr key={row.pos} className={`border-b border-gray-100 last:border-0 ${i % 2 === 1 ? 'bg-gray-50/40' : ''}`}>
                    <td className="px-5 py-2.5 font-semibold text-gray-900">#{row.pos}</td>
                    <td className="px-5 py-2.5">
                      <span className={`font-bold ${row.ctr >= 10 ? 'text-emerald-700' : row.ctr >= 3 ? 'text-amber-600' : 'text-gray-500'}`}>
                        {row.ctr}%
                      </span>
                    </td>
                    <td className="px-5 py-2.5">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(row.ctr / 39.8) * 100}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-[1.25rem] font-extrabold text-gray-900 tracking-tight mb-6">Frequently asked questions</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.q} className="border border-gray-200 rounded-xl bg-white overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm">{faq.q}</h3>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400 mb-5">Related Free Tools</p>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'SERP Snippet Preview', href: '/tools/serp-preview', icon: '🔍' },
              { name: 'Title Tag Analyser', href: '/tools/title-tag-analyzer', icon: '✍️' },
              { name: 'Schema Markup Generator', href: '/tools/schema-generator', icon: '🏷️' },
              { name: 'Keyword Density Checker', href: '/tools/keyword-density', icon: '📊' },
              { name: 'Robots.txt Generator', href: '/tools/robots-txt-generator', icon: '🤖' },
            ].map((t) => (
              <Link key={t.href} href={t.href} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-sm font-medium text-gray-600 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-colors">
                <span>{t.icon}</span>{t.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <AffiliateFooter />
    </div>
  )
}
