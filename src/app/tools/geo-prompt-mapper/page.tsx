import Link from 'next/link'
import type { Metadata } from 'next'
import { AffiliateNav } from '@/components/affiliate/AffiliateNav'
import { AffiliateFooter } from '@/components/affiliate/AffiliateFooter'
import GeoPromptClient from './GeoPromptClient'

export const metadata: Metadata = {
  title: 'GEO Prompt Mapper | Free AI Search Prompt Generator | SaySEO',
  description:
    'Generate GEO-friendly prompt clusters, AI search questions, content briefs and schema recommendations using free data sources. Optimise your content for ChatGPT, Gemini, Perplexity and Google AI Overviews.',
  keywords: [
    'GEO prompt mapper', 'AI search optimisation', 'generative engine optimisation', 'AI search prompts',
    'GEO content strategy', 'ChatGPT SEO', 'Perplexity SEO', 'AI Overview optimisation',
    'free GEO tool', 'prompt cluster generator', 'AI search content brief',
  ],
  alternates: { canonical: 'https://sayseo.co.uk/tools/geo-prompt-mapper' },
  openGraph: {
    type: 'website',
    siteName: 'SaySEO',
    title: 'GEO Prompt Mapper | Free AI Search Prompt Generator | SaySEO',
    description: 'Generate AI search prompt clusters, content briefs and schema recommendations using only free data sources.',
    url: 'https://sayseo.co.uk/tools/geo-prompt-mapper',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GEO Prompt Mapper | Free AI Search Prompt Generator | SaySEO',
    description: 'Generate GEO prompt clusters and content briefs using free data sources.',
  },
  robots: { index: true, follow: true },
}

// ─── FAQ data ─────────────────────────────────────────────────────────────────

const faqs = [
  {
    q: 'What is a GEO prompt?',
    a: 'A GEO prompt is a question or query written in the natural, conversational style that people use when asking AI search engines like ChatGPT, Perplexity or Google AI Overviews. Unlike traditional keyword phrases, GEO prompts are often full sentences or direct questions — and AI engines use the most helpful, clearly structured content they can find to answer them.',
  },
  {
    q: 'How is GEO different from traditional SEO?',
    a: 'Traditional SEO focuses on keyword optimisation for document-based search results (ten blue links). Generative Engine Optimisation (GEO) focuses on creating structured, authoritative content that AI answer engines can confidently parse, cite and summarise. GEO content needs to answer questions directly, demonstrate expertise, and be clearly structured with headings, FAQs and schema markup.',
  },
  {
    q: 'What are the four source confidence labels?',
    a: 'Each prompt in the GEO Prompt Mapper is labelled with one of four confidence types: (1) Verified free source — derived from Google Autocomplete or PAA-style patterns that reflect real search behaviour; (2) Extracted from website — based on your entered website URL; (3) Predicted AI prompt — AI-native questions predicted to appear in ChatGPT, Gemini or Perplexity; (4) GEO opportunity — high-priority prompts where structured content could earn a citation in an AI overview or AI-generated response.',
  },
  {
    q: 'What does the priority score mean?',
    a: 'Each prompt is scored across four dimensions (1–5 each): Search Demand Potential, AI Answer Potential, Commercial Intent, and Content Gap Opportunity. The total score (out of 20) indicates which prompts will deliver the most combined value if addressed with content. Scores of 16+ are high-priority; 12–15 are medium; below 12 are supporting content opportunities.',
  },
  {
    q: 'How do I use these prompts in my content plan?',
    a: 'Start with the Content Brief tab — it gives you a page structure you can hand to a writer or paste into an AI assistant. Then use the Content Plan tab to identify which sections of your website need to be created or updated. Use the Schema tab to implement structured data. Finally, export the CSV to track and prioritise all prompts in a spreadsheet.',
  },
  {
    q: 'Does this tool use paid SEO APIs?',
    a: 'No. The GEO Prompt Mapper uses only free or publicly accessible data sources — Google Autocomplete patterns, People Also Ask question structures, Reddit-style discussion patterns, website URL extraction, and AI-predicted prompt generation. No Ahrefs, SEMrush, Moz or paid keyword data is used.',
  },
  {
    q: 'What is the CSV export for?',
    a: 'The CSV export gives you a spreadsheet-ready table of all generated prompts with their source type, intent, funnel stage, priority scores and recommended content actions. You can use this to build a content calendar, brief writers, track content gaps, or share the prompt strategy with a client or stakeholder.',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GeoPromptMapperPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'GEO Prompt Mapper',
    applicationCategory: 'SEOApplication',
    operatingSystem: 'Web Browser',
    url: 'https://sayseo.co.uk/tools/geo-prompt-mapper',
    description: 'Free tool to generate GEO-friendly AI search prompts, content briefs and schema recommendations.',
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

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
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
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">Free GEO Tool — No Signup Required</p>
          </div>
          <h1 className="text-[clamp(1.875rem,4vw,2.5rem)] font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
            GEO Prompt Mapper
          </h1>
          <p className="text-base text-gray-500 leading-relaxed max-w-[640px] mb-6">
            Generate AI search prompt clusters, predicted GEO questions, content briefs and schema recommendations — using only free data sources. Built for content teams who want their pages cited by ChatGPT, Gemini, Perplexity and Google AI Overviews.
          </p>

          {/* Source type legend */}
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Verified free source', color: 'bg-emerald-500', bg: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
              { label: 'Extracted from website', color: 'bg-blue-500', bg: 'bg-blue-50 border-blue-200 text-blue-700' },
              { label: 'Predicted AI prompt', color: 'bg-purple-500', bg: 'bg-purple-50 border-purple-200 text-purple-700' },
              { label: 'GEO opportunity', color: 'bg-amber-500', bg: 'bg-amber-50 border-amber-200 text-amber-700' },
            ].map((s) => (
              <span key={s.label} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${s.color}`} />
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Interactive tool ──────────────────────────────────────────────────── */}
      <GeoPromptClient />

      {/* ── Explanatory copy ──────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700 mb-3">Understanding GEO</p>
          <h2 className="text-[clamp(1.375rem,2.5vw,1.875rem)] font-extrabold text-gray-900 tracking-tight mb-10">
            Why AI search prompts are different from traditional keywords
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: '🤖',
                title: 'What are GEO prompts?',
                body: 'GEO (Generative Engine Optimisation) prompts are the natural, conversational questions people type or speak into AI search engines. Instead of "IELTS courses India", a user might ask "What is the best online IELTS course for Indian students who need Band 7 for a UK visa?" Your content needs to be structured to answer these full-sentence queries clearly and confidently so AI engines choose to cite your page.',
              },
              {
                icon: '🔍',
                title: 'How AI search differs from traditional search',
                body: 'Traditional search returns a ranked list of URLs. AI search synthesises an answer from multiple sources and cites the most helpful ones. This means ranking position matters less — being clearly understood, authoritative and citable matters more. Pages with FAQ schema, clear headings, direct answers, and demonstrated expertise are cited significantly more often.',
              },
              {
                icon: '📝',
                title: 'Why content must answer real questions',
                body: 'AI engines are trained to find the most direct, complete answer to a question. Content that talks around a topic without giving a clear, structured answer will not be cited. Each section of your page should address a specific user question with a concise, accurate response. FAQPage schema then signals the structure of those answers to the AI engine.',
              },
              {
                icon: '🏷️',
                title: 'Why source confidence labels matter',
                body: 'Not all generated prompts carry the same confidence. A query derived from Google Autocomplete data reflects real search behaviour. A predicted AI prompt reflects what AI engines are likely to be asked, based on patterns — useful, but speculative. A GEO opportunity is a high-value gap where structured content could earn a direct citation. Labelling these separately helps you prioritise where to invest content effort.',
              },
              {
                icon: '📊',
                title: 'How to use the priority scores',
                body: 'Each prompt is scored on four dimensions: Search Demand (how widely searched), AI Answer Potential (how likely an AI would use this), Commercial Intent (proximity to conversion), and Content Gap (how underserved this query is on your site). The total score out of 20 helps you build a prioritised content roadmap — tackle the highest-scoring prompts first.',
              },
              {
                icon: '🗂️',
                title: 'Turning prompts into a content plan',
                body: 'Export the CSV and sort by total priority score. Map the highest-scoring prompts to existing or new pages on your website. Use the Content Brief tab to generate a structured brief for each priority page. Implement the recommended schema types. Publish, then monitor whether your pages appear in AI-generated answers using a tool like Perplexity or ChatGPT for self-testing.',
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <span className="text-2xl shrink-0">{item.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2 text-[0.9375rem]">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700 mb-3 text-center">FAQ</p>
        <h2 className="text-[clamp(1.375rem,2.5vw,1.75rem)] font-extrabold text-gray-900 tracking-tight mb-8 text-center">
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
              { name: 'Schema Markup Generator', href: '/tools/schema-generator', icon: '🏷️' },
              { name: 'SERP Snippet Preview', href: '/tools/serp-preview', icon: '🔍' },
              { name: 'Title Tag Analyser', href: '/tools/title-tag-analyzer', icon: '✍️' },
              { name: 'Keyword Density Checker', href: '/tools/keyword-density', icon: '📊' },
              { name: 'Robots.txt Generator', href: '/tools/robots-txt-generator', icon: '🤖' },
              { name: 'SEO ROI Calculator', href: '/tools/seo-roi-calculator', icon: '💷' },
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
