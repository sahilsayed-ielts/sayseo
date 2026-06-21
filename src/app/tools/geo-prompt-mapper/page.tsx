import Link from 'next/link'
import type { Metadata } from 'next'
import { AffiliateNav } from '@/components/affiliate/AffiliateNav'
import { AffiliateFooter } from '@/components/affiliate/AffiliateFooter'
import { GeoPromptMapperClient } from './GeoPromptMapperClient'

export const metadata: Metadata = {
  title: 'Free GEO Prompt Mapper — Map AI Search Queries Without Paid Tools | SaySEO',
  description:
    'Map Generative Engine Optimisation prompts using free data sources only. Discover real queries, extract on-page questions, predict AI-style prompts, and identify GEO opportunities — no Ahrefs, SEMrush, or Moz required.',
  keywords: [
    'GEO prompt mapper', 'generative engine optimisation', 'AI search prompts',
    'free SEO tools', 'AI visibility', 'prompt mapping tool', 'GEO tool',
    'answer engine optimisation', 'ChatGPT SEO', 'free keyword research',
  ],
  alternates: { canonical: 'https://sayseo.co.uk/tools/geo-prompt-mapper' },
  openGraph: {
    type: 'website',
    siteName: 'SaySEO',
    title: 'Free GEO Prompt Mapper | SaySEO',
    description: 'Map AI search prompts using free sources — autocomplete, PAA, Reddit, Wikipedia, sitemaps, and predicted prompts. No paid SEO APIs.',
    url: 'https://sayseo.co.uk/tools/geo-prompt-mapper',
    locale: 'en_GB',
  },
  robots: { index: true, follow: true },
}

const faqs = [
  {
    q: 'What is a GEO prompt mapper?',
    a: 'A GEO (Generative Engine Optimisation) prompt mapper identifies the questions and queries people ask AI assistants like ChatGPT, Perplexity, and Gemini about your topic. It helps you create content that AI systems are more likely to cite when generating answers — the equivalent of keyword research for the AI search era.',
  },
  {
    q: 'Does this tool use Ahrefs, SEMrush, or other paid SEO APIs?',
    a: 'No. The GEO Prompt Mapper uses only free data sources: Google Autocomplete suggestions, People Also Ask questions, related searches, Reddit discussion patterns, Wikipedia and Wikidata entities, Google Trends related topics, website sitemap parsing, and on-page content extraction. Predicted AI-style prompts are generated locally and clearly labelled as predicted, not verified.',
  },
  {
    q: 'What is the difference between discovered, extracted, predicted, and GEO opportunity prompts?',
    a: 'Discovered queries come from free search-intent sources like autocomplete, related searches, trends, Reddit, and knowledge graphs. Extracted questions are pulled from your website\'s sitemap and page content. Predicted AI prompts are generated using AlsoAsked-style logic and labelled as predicted — they represent likely AI assistant queries but are not verified from a live source. GEO opportunity prompts are strategic prompts designed to maximise your visibility in AI-generated answers.',
  },
  {
    q: 'What do the confidence labels mean?',
    a: 'Verified free source means the prompt pattern comes from a real free data source (autocomplete, PAA, trends, Reddit, Wikipedia, etc.). Extracted from website means the question was found in your sitemap or page content. Predicted AI prompt means the prompt was generated algorithmically and has not been verified against a live search or AI platform.',
  },
  {
    q: 'Can I export the prompt map?',
    a: 'Yes. Click Export CSV to download all visible prompts with their category, source, confidence label, intent, priority score, and recommended page section. Filter by category before exporting to get a focused list.',
  },
  {
    q: 'Will this tool fetch live data from Google and Reddit?',
    a: 'Version 1 runs entirely in your browser with mock free-source logic that mirrors real data patterns. The underlying functions in lib/geo/freeSources.ts are modular — API routes can later plug in live fetches from public endpoints without changing the UI or export format.',
  },
]

export default function GeoPromptMapperPage() {
  const toolJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'GEO Prompt Mapper',
    applicationCategory: 'SEOApplication',
    operatingSystem: 'Web Browser',
    url: 'https://sayseo.co.uk/tools/geo-prompt-mapper',
    description: 'Map Generative Engine Optimisation prompts using free data sources. Discover queries, extract questions, predict AI prompts, and identify GEO opportunities.',
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
            <span className="text-gray-600 font-medium">GEO Prompt Mapper</span>
          </nav>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🗺️</span>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">Free GEO Tool</p>
          </div>
          <h1 className="text-[clamp(1.875rem,4vw,2.5rem)] font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
            GEO Prompt Mapper
          </h1>
          <p className="text-base text-gray-500 leading-relaxed max-w-[640px]">
            Map the prompts AI assistants answer about your topic — using free sources only. Separate discovered queries, extracted questions, predicted AI prompts, and GEO opportunities with source attribution and confidence labels.
          </p>
        </div>
      </div>

      <GeoPromptMapperClient />

      {/* ── Category guide ──────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-[1.25rem] font-extrabold text-gray-900 tracking-tight mb-6">
            Four prompt categories explained
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Discovered Queries', color: '#047857', bg: '#ECFDF5', border: '#6EE7B7', detail: 'Real search-intent patterns from Google Autocomplete, related searches, Google Trends, Reddit discussions, Wikipedia, and Wikidata. These reflect what people actually type and discuss — the strongest signals for content planning.' },
              { label: 'Extracted Questions', color: '#1D4ED8', bg: '#EFF6FF', border: '#93C5FD', detail: 'Questions found on your website via sitemap URL analysis and page content extraction, plus verified People Also Ask patterns. Use these to close gaps between what your site answers and what AI systems are asked.' },
              { label: 'Predicted AI Prompts', color: '#B45309', bg: '#FFFBEB', border: '#FCD34D', detail: 'AlsoAsked-style prompts generated algorithmically to mirror how users phrase questions to ChatGPT, Claude, and Perplexity. Clearly labelled as predicted — useful for brainstorming, not verified search volume.' },
              { label: 'GEO Opportunity Prompts', color: '#7C3AED', bg: '#F5F3FF', border: '#C4B5FD', detail: 'Strategic prompts designed to maximise AI citation potential — comparative queries, entity-rich definitions, platform-specific visibility questions, and content-format recommendations for answer engines.' },
            ].map((row) => (
              <div
                key={row.label}
                className="flex gap-4 rounded-xl border p-4"
                style={{ backgroundColor: row.bg, borderColor: row.border }}
              >
                <div className="shrink-0">
                  <span className="text-xs font-extrabold" style={{ color: row.color }}>{row.label}</span>
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