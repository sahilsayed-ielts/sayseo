import Link from 'next/link'
import type { Metadata } from 'next'
import { AffiliateNav } from '@/components/affiliate/AffiliateNav'
import { AffiliateFooter } from '@/components/affiliate/AffiliateFooter'
import { SchemaGeneratorClient } from './SchemaGeneratorClient'

export const metadata: Metadata = {
  title: 'Free Schema Markup Generator — JSON-LD for FAQ, HowTo & More | SaySEO',
  description:
    'Generate valid JSON-LD structured data for Google. Supports FAQPage, HowTo, Article, LocalBusiness, and BreadcrumbList schemas. Copy-paste ready — no coding required.',
  keywords: [
    'schema markup generator', 'JSON-LD generator', 'FAQ schema generator', 'HowTo schema',
    'structured data generator', 'LocalBusiness schema', 'rich results generator', 'schema.org generator',
  ],
  alternates: { canonical: 'https://sayseo.co.uk/tools/schema-generator' },
  openGraph: {
    type: 'website',
    siteName: 'SaySEO',
    title: 'Free Schema Markup Generator | SaySEO',
    description: 'Generate valid JSON-LD structured data for FAQ, HowTo, Article, LocalBusiness, and BreadcrumbList.',
    url: 'https://sayseo.co.uk/tools/schema-generator',
    locale: 'en_GB',
  },
  robots: { index: true, follow: true },
}

const faqs = [
  {
    q: 'What is schema markup and why does it matter for SEO?',
    a: 'Schema markup (structured data) is code added to a web page that helps search engines understand the content\'s meaning and context — not just its keywords. When Google can interpret your content as a FAQ, a recipe, a product, or a local business, it can display rich results (enhanced search snippets) with star ratings, step counts, FAQs, and more. Rich results typically earn higher click-through rates than standard blue-link results.',
  },
  {
    q: 'What is JSON-LD and should I use it?',
    a: 'JSON-LD (JavaScript Object Notation for Linked Data) is the schema markup format recommended by Google. It sits in a <script type="application/ld+json"> tag and does not need to be embedded throughout your HTML. This makes it easier to add and update compared to Microdata or RDFa. All SaySEO schema outputs use JSON-LD format.',
  },
  {
    q: 'Does FAQ schema still work in 2026?',
    a: 'Google announced in 2023 that FAQ rich results would be limited to authoritative government and health sites. However, FAQPage schema still provides structured signals to Google and other search engines (Bing, DuckDuckGo), and it\'s increasingly used to influence AI overview answers (Google\'s AI Overviews and Gemini). The structured Q&A format helps AI systems cite and summarise your content accurately.',
  },
  {
    q: 'How do I add the generated schema to my website?',
    a: 'Paste the generated JSON-LD code inside a <script type="application/ld+json"> tag in the <head> section of your page, or just before the closing </body> tag. In WordPress, you can use a plugin like RankMath or Yoast, or paste it directly into a custom HTML block. In Next.js, use dangerouslySetInnerHTML inside a <script> tag. After adding it, test with Google\'s Rich Results Test.',
  },
  {
    q: 'What is the difference between LocalBusiness and Organization schema?',
    a: 'LocalBusiness schema is used for physical businesses with a location that customers visit — shops, restaurants, clinics, and agencies. It includes address, opening hours, and telephone. Organization schema is used for companies with an online presence but no customer-facing location — SaaS companies, publishers, and charities. Use LocalBusiness for local SEO clients and Organization for purely digital businesses.',
  },
]

export default function SchemaGeneratorPage() {
  const toolJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Schema Markup Generator',
    applicationCategory: 'SEOApplication',
    operatingSystem: 'Web Browser',
    url: 'https://sayseo.co.uk/tools/schema-generator',
    description: 'Generate valid JSON-LD structured data for FAQ, HowTo, Article, LocalBusiness, and BreadcrumbList schemas.',
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
            <span className="text-gray-600 font-medium">Schema Generator</span>
          </nav>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🏷️</span>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">Free SEO Tool</p>
          </div>
          <h1 className="text-[clamp(1.875rem,4vw,2.5rem)] font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
            Schema Markup Generator
          </h1>
          <p className="text-base text-gray-500 leading-relaxed max-w-[620px]">
            Generate valid JSON-LD structured data for Google without writing any code. Supports FAQPage, HowTo, Article, LocalBusiness, and BreadcrumbList schemas — all formatted for Google&apos;s Rich Results.
          </p>

          {/* Schema type pills */}
          <div className="flex flex-wrap gap-2 mt-5">
            {[
              { label: 'FAQ', color: '#047857' },
              { label: 'HowTo', color: '#1D4ED8' },
              { label: 'Article', color: '#B45309' },
              { label: 'LocalBusiness', color: '#6D28D9' },
              { label: 'BreadcrumbList', color: '#0E7490' },
            ].map((s) => (
              <span
                key={s.label}
                className="px-3 py-1 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: s.color }}
              >
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <SchemaGeneratorClient />

      {/* ── Schema types explained ────────────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-[1.25rem] font-extrabold text-gray-900 tracking-tight mb-6">
            When to use each schema type
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                type: 'FAQPage',
                icon: '❓',
                use: 'Pages with a FAQ section or Q&A content format.',
                richResult: 'Expandable Q&A in search results. Also helps AI Overviews surface your answers.',
                pages: 'Product pages, service pages, help centre articles, blog posts with FAQs',
              },
              {
                type: 'HowTo',
                icon: '📋',
                use: 'Step-by-step instructional guides.',
                richResult: 'Step-by-step carousel with numbered steps directly in search results.',
                pages: 'Tutorial posts, how-to guides, setup walkthroughs, DIY content',
              },
              {
                type: 'Article',
                icon: '📰',
                use: 'Blog posts, news articles, editorial content.',
                richResult: 'Enhanced article display, eligible for Top Stories carousel (news sites).',
                pages: 'Blog articles, case studies, news posts, opinion pieces',
              },
              {
                type: 'LocalBusiness',
                icon: '📍',
                use: 'Physical businesses with a customer-facing location.',
                richResult: 'Knowledge panel, map pack, star ratings, opening hours in SERPs.',
                pages: 'Homepage and contact page of any local business or agency',
              },
              {
                type: 'BreadcrumbList',
                icon: '🍞',
                use: 'Any site with a clear hierarchical URL structure.',
                richResult: 'Breadcrumb trail below the title in search results instead of the raw URL.',
                pages: 'All pages with meaningful URL depth (blog posts, product pages, category pages)',
              },
            ].map((schema) => (
              <div key={schema.type} className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="text-xl">{schema.icon}</span>
                  <h3 className="font-extrabold text-gray-900 text-[0.9375rem]">{schema.type}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed"><strong>Use when:</strong> {schema.use}</p>
                <p className="text-xs text-emerald-700 font-semibold mb-1">Rich result unlock:</p>
                <p className="text-xs text-gray-500 mb-2 leading-relaxed">{schema.richResult}</p>
                <p className="text-xs text-gray-400"><span className="font-semibold">Best pages:</span> {schema.pages}</p>
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
              { name: 'Keyword Density Checker', href: '/tools/keyword-density', icon: '📊' },
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
