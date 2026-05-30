import Link from 'next/link'
import type { Metadata } from 'next'
import { AffiliateNav } from '@/components/affiliate/AffiliateNav'
import { AffiliateFooter } from '@/components/affiliate/AffiliateFooter'
import { SerpPreviewClient } from './SerpPreviewClient'

export const metadata: Metadata = {
  title: 'Free SERP Snippet Preview Tool — See How You Appear in Google | SaySEO',
  description:
    'Preview your page title and meta description exactly as they appear in Google desktop and mobile search results. Live character counts, pixel-width estimates, and truncation warnings.',
  keywords: [
    'SERP preview tool', 'Google snippet preview', 'title tag preview', 'meta description preview',
    'SERP snippet checker', 'Google title preview free', 'SEO snippet tool',
  ],
  alternates: { canonical: 'https://sayseo.co.uk/tools/serp-preview' },
  openGraph: {
    type: 'website',
    siteName: 'SaySEO',
    title: 'Free SERP Snippet Preview Tool | SaySEO',
    description: 'Preview your page title and meta description in Google search results — desktop and mobile.',
    url: 'https://sayseo.co.uk/tools/serp-preview',
    locale: 'en_GB',
  },
  robots: { index: true, follow: true },
}

const faqs = [
  {
    q: 'How many characters should a title tag be?',
    a: 'Google displays title tags up to approximately 580 pixels wide, which corresponds to roughly 50–60 characters for typical text. Titles under 55 characters are safe; titles over 65 characters risk truncation with an ellipsis (...). Character limits vary slightly based on the width of individual characters — narrow characters (like "i" or "l") take less space than wide ones (like "W" or "M").',
  },
  {
    q: 'How long should a meta description be?',
    a: 'Google truncates meta descriptions at around 920 pixels, which is approximately 150–160 characters for typical text. Descriptions between 120 and 155 characters are considered optimal. Google sometimes generates its own snippet from page content if it deems the written meta description less relevant to the query.',
  },
  {
    q: 'Does Google always show my title tag and meta description?',
    a: 'Not always. Google may rewrite your title tag if it considers the written version too short, too long, keyword-stuffed, or not descriptive enough. Meta descriptions are frequently replaced by Google with content extracted from the page that better matches the user\'s search query. Writing a compelling, accurate meta description still matters — it will be used when it matches intent.',
  },
  {
    q: 'What is the difference between desktop and mobile SERP previews?',
    a: 'Desktop and mobile Google SERPs render differently. Mobile results have a narrower viewport, so title tags truncate at a shorter pixel width — roughly 500–530px versus 580px on desktop. The preview tool shows both so you can ensure your snippet looks correct on both device types.',
  },
  {
    q: 'Should I include my brand name in the title tag?',
    a: 'Generally yes — particularly for brand recall and click-through rate. The standard format is "Primary Keyword — Secondary Context | Brand Name". Keep the brand name at the end so the most important keywords appear first and are not truncated on narrower displays.',
  },
]

export default function SerpPreviewPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SERP Snippet Preview Tool',
    applicationCategory: 'SEOApplication',
    operatingSystem: 'Web Browser',
    url: 'https://sayseo.co.uk/tools/serp-preview',
    description: 'Preview your page title and meta description in Google search results — desktop and mobile.',
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <AffiliateNav />

      {/* ── Page header ───────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-8">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
            <Link href="/" className="hover:text-emerald-700 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-emerald-700 transition-colors">Free Tools</Link>
            <span>/</span>
            <span className="text-gray-600 font-medium">SERP Preview</span>
          </nav>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🔍</span>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">Free SEO Tool</p>
          </div>
          <h1 className="text-[clamp(1.875rem,4vw,2.5rem)] font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
            SERP Snippet Preview Tool
          </h1>
          <p className="text-base text-gray-500 leading-relaxed max-w-[600px]">
            See exactly how your page title and meta description will appear in Google search results before you publish. Supports desktop and mobile previews with live character counts and truncation warnings.
          </p>
        </div>
      </div>

      {/* ── Interactive tool ──────────────────────────────────────────────────── */}
      <SerpPreviewClient />

      {/* ── How to use ────────────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-[1.25rem] font-extrabold text-gray-900 tracking-tight mb-5">
            How to use the SERP preview tool
          </h2>
          <ol className="space-y-4">
            {[
              { step: '1', title: 'Enter your page URL', body: 'Type or paste the full URL of the page (e.g. https://example.com/seo-tools). The tool parses the domain and path into a Google-style breadcrumb.' },
              { step: '2', title: 'Write your title tag', body: 'Enter the title tag you plan to use. The live counter shows character count and pixel-width estimate. The preview updates as you type — watch for the truncation warning at 60+ characters.' },
              { step: '3', title: 'Write your meta description', body: 'Type your meta description. Aim for 120–155 characters. Use the preview to verify the text reads naturally when cut short — Google may truncate even within the recommended limit.' },
              { step: '4', title: 'Switch between desktop and mobile', body: 'Toggle the preview between desktop and mobile view. Mobile SERPs truncate titles slightly earlier (~52 characters). Check both to ensure your most important information appears before the cut-off.' },
              { step: '5', title: 'Iterate and copy', body: 'Adjust your title and description until the preview looks right. Copy the values directly into your CMS or content brief.' },
            ].map((item) => (
              <li key={item.step} className="flex gap-4">
                <div className="w-7 h-7 rounded-full bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-[1.25rem] font-extrabold text-gray-900 tracking-tight mb-6">
          Frequently asked questions
        </h2>
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

      {/* ── Related tools ─────────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400 mb-5">Related Free Tools</p>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'Title Tag Analyser', href: '/tools/title-tag-analyzer', icon: '✍️' },
              { name: 'Schema Markup Generator', href: '/tools/schema-generator', icon: '🏷️' },
              { name: 'Keyword Density Checker', href: '/tools/keyword-density', icon: '📊' },
              { name: 'SEO ROI Calculator', href: '/tools/seo-roi-calculator', icon: '💷' },
              { name: 'Robots.txt Generator', href: '/tools/robots-txt-generator', icon: '🤖' },
            ].map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-sm font-medium text-gray-600 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
              >
                <span>{t.icon}</span>
                {t.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <AffiliateFooter />
    </div>
  )
}
