import Link from 'next/link'
import type { Metadata } from 'next'
import { AffiliateNav } from '@/components/affiliate/AffiliateNav'
import { AffiliateFooter } from '@/components/affiliate/AffiliateFooter'
import { KeywordDensityClient } from './KeywordDensityClient'

export const metadata: Metadata = {
  title: 'Free Keyword Density Checker — Analyse Content Keyword Frequency | SaySEO',
  description:
    'Check keyword density and frequency in any content. Paste your text, enter your target keyword, and get instant density percentages, word count, top keyword table, and over-optimisation warnings.',
  keywords: [
    'keyword density checker', 'keyword density tool', 'keyword frequency analyser',
    'content keyword analysis', 'over-optimisation checker', 'keyword stuffing detector',
    'SEO content analyser', 'keyword density percentage',
  ],
  alternates: { canonical: 'https://sayseo.co.uk/tools/keyword-density' },
  openGraph: {
    type: 'website',
    siteName: 'SaySEO',
    title: 'Free Keyword Density Checker | SaySEO',
    description: 'Analyse keyword density and frequency in any content. Get instant density %, word count, and top words table.',
    url: 'https://sayseo.co.uk/tools/keyword-density',
    locale: 'en_GB',
  },
  robots: { index: true, follow: true },
}

const faqs = [
  {
    q: 'What is keyword density and what percentage is ideal?',
    a: 'Keyword density is the percentage of times a target keyword appears in a piece of content relative to the total word count. The formula is: (keyword occurrences ÷ total words) × 100. An ideal keyword density for SEO is generally considered to be between 0.5% and 2%. Below 0.5% means the keyword may not appear prominent enough; above 2.5%–3% risks appearing as keyword stuffing to search engines.',
  },
  {
    q: 'Does keyword density directly affect Google rankings?',
    a: 'Google no longer uses raw keyword density as a direct ranking signal the way it did in the early 2000s. Modern Google algorithms use natural language processing (NLP) and entity recognition, so they can understand context, synonyms, and related terms. That said, keyword density remains a useful proxy for ensuring your content is topically relevant and not over-optimised. Focus on natural language and full topic coverage rather than hitting a specific density number.',
  },
  {
    q: 'What is keyword stuffing and how do I avoid it?',
    a: 'Keyword stuffing is the practice of cramming a keyword unnaturally into content to manipulate search rankings. Signs include repeating the exact keyword phrase in every paragraph, using a keyword where a pronoun ("it", "this") would read more naturally, or creating content that sounds robotic and unnatural to human readers. Google can algorithmically detect and penalise keyword stuffing. Aim to use natural language variations and related terms rather than repeating the exact keyword phrase.',
  },
  {
    q: 'Should I analyse keyword density before or after writing?',
    a: 'Both. Write your content naturally first without worrying about keyword density — this produces better-quality writing. Then use this tool after drafting to check you haven\'t unintentionally over-optimised, that your focus keyword appears enough times to signal relevance, and that important secondary keywords are present. Think of it as a quality-control step, not a writing constraint.',
  },
  {
    q: 'What are stop words in keyword density analysis?',
    a: 'Stop words are common English words like "the", "a", "an", "and", "or", "in", "on", "at", "to", "for" that appear frequently in all content but carry no meaningful keyword signal. This tool excludes stop words from the top-words frequency table so the results focus on meaningful content words. Stop words are still included in the total word count for accurate density calculations.',
  },
]

export default function KeywordDensityPage() {
  const toolJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Keyword Density Checker',
    applicationCategory: 'SEOApplication',
    operatingSystem: 'Web Browser',
    url: 'https://sayseo.co.uk/tools/keyword-density',
    description: 'Analyse keyword density and frequency in any content. Get instant density %, word count, and keyword frequency table.',
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
            <span className="text-gray-600 font-medium">Keyword Density</span>
          </nav>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">📊</span>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">Free SEO Tool</p>
          </div>
          <h1 className="text-[clamp(1.875rem,4vw,2.5rem)] font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
            Keyword Density Checker
          </h1>
          <p className="text-base text-gray-500 leading-relaxed max-w-[600px]">
            Paste your content, enter your focus and secondary keywords, and instantly see density percentages, occurrence counts, total word count, and the top 20 keywords by frequency. Spot over-optimisation before you publish.
          </p>
        </div>
      </div>

      <KeywordDensityClient />

      {/* ── Density guide ─────────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-[1.25rem] font-extrabold text-gray-900 tracking-tight mb-6">
            Keyword density reference guide
          </h2>
          <div className="space-y-3">
            {[
              { range: '0%', label: 'Not found', color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5', detail: 'The keyword does not appear in the content. For a page targeting this keyword, the absence signals low relevance. Add the keyword naturally — in the introduction, at least one subheading, and throughout the body.' },
              { range: '< 0.5%', label: 'Too low', color: '#D97706', bg: '#FFFBEB', border: '#FCD34D', detail: 'The keyword appears infrequently. This may be fine for very long-form content (5,000+ words) where dilution is natural. For standard-length pages (800–2,000 words), consider adding the keyword more frequently to clearly signal relevance.' },
              { range: '0.5–2%', label: 'Optimal', color: '#059669', bg: '#ECFDF5', border: '#6EE7B7', detail: 'The keyword appears naturally and frequently enough to signal relevance without looking forced. Most well-written SEO content falls in this range organically when the topic is covered thoroughly.' },
              { range: '2–3%', label: 'Slightly high', color: '#D97706', bg: '#FFFBEB', border: '#FCD34D', detail: 'The keyword is starting to appear often. This isn\'t automatically problematic, but review the surrounding sentences — if the keyword could be replaced with a pronoun or synonym and still read naturally, consider doing so.' },
              { range: '> 3%', label: 'Keyword stuffing risk', color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5', detail: 'The keyword appears so frequently that it likely sounds unnatural to readers and may trigger over-optimisation signals. Reduce occurrences, replace some with synonyms or related terms, and ensure every use flows naturally in context.' },
            ].map((row) => (
              <div
                key={row.range}
                className="flex gap-4 rounded-xl border p-4"
                style={{ backgroundColor: row.bg, borderColor: row.border }}
              >
                <div className="shrink-0">
                  <span className="text-xs font-extrabold" style={{ color: row.color }}>{row.range}</span>
                  <div className="text-[0.65rem] font-bold mt-0.5" style={{ color: row.color }}>{row.label}</div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{row.detail}</p>
              </div>
            ))}
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
              { name: 'SEO ROI Calculator', href: '/tools/seo-roi-calculator', icon: '💷' },
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
