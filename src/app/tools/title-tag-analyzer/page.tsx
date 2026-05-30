import Link from 'next/link'
import type { Metadata } from 'next'
import { AffiliateNav } from '@/components/affiliate/AffiliateNav'
import { AffiliateFooter } from '@/components/affiliate/AffiliateFooter'
import { TitleTagClient } from './TitleTagClient'

export const metadata: Metadata = {
  title: 'Free Title Tag Analyser — Score & Optimise Page Titles | SaySEO',
  description:
    'Analyse and score your SEO title tags instantly. Get an A–F grade on length, keyword placement, power words, and clickability — with specific recommendations to improve your titles.',
  keywords: [
    'title tag analyser', 'title tag checker', 'SEO title analyser', 'title tag optimizer',
    'title tag length checker', 'page title SEO tool', 'title tag score',
  ],
  alternates: { canonical: 'https://sayseo.co.uk/tools/title-tag-analyzer' },
  openGraph: {
    type: 'website',
    siteName: 'SaySEO',
    title: 'Free Title Tag Analyser | SaySEO',
    description: 'Score your title tags on length, keyword placement, power words, and click-through potential.',
    url: 'https://sayseo.co.uk/tools/title-tag-analyzer',
    locale: 'en_GB',
  },
  robots: { index: true, follow: true },
}

const faqs = [
  {
    q: 'What makes a good SEO title tag?',
    a: 'A good title tag is 50–60 characters long, starts with the primary keyword, reads naturally to humans, avoids keyword stuffing, and ends with a brand name (separated by a pipe or dash). It should also be unique — no two pages on a site should share the same title. Titles that include numbers, power words (best, guide, top, free), or emotional triggers tend to earn higher click-through rates.',
  },
  {
    q: 'Does Google use my title tag as the displayed headline?',
    a: 'Google uses your written title tag as the starting point but may replace it with text from your page\'s H1, anchor text pointing to the page, or other on-page content if it decides your written title is too long, keyword-stuffed, or not descriptive of the page\'s actual content. Writing accurate, concise title tags reduces the chance of rewriting.',
  },
  {
    q: 'Should I include my brand name in the title tag?',
    a: 'Yes, for most pages — particularly if you\'re building brand recognition. The convention is "Primary Keyword – Context | Brand Name". Place the brand name at the end so that truncation removes the brand, not the keyword. For your homepage, you may choose to lead with the brand name instead.',
  },
  {
    q: 'What are power words in a title tag?',
    a: 'Power words are terms that increase emotional engagement and click-through rate. In SEO title tags, common power words include: best, top, ultimate, complete, free, guide, how to, step-by-step, proven, expert, and year indicators (e.g., "2026"). These terms signal value and relevance to searchers scanning results.',
  },
  {
    q: 'How many keywords should be in a title tag?',
    a: 'Typically one primary keyword (or phrase) plus one closely related secondary term. Trying to include three or more distinct keywords makes the title feel awkward, increases character count, and risks looking spammy — which may prompt Google to rewrite it. Focus on the single most important search term for each page.',
  },
]

export default function TitleTagAnalyzerPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Title Tag Analyser',
    applicationCategory: 'SEOApplication',
    operatingSystem: 'Web Browser',
    url: 'https://sayseo.co.uk/tools/title-tag-analyzer',
    description: 'Score your SEO title tags on length, keyword placement, power words, and clickability.',
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

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-8">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
            <Link href="/" className="hover:text-emerald-700 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-emerald-700 transition-colors">Free Tools</Link>
            <span>/</span>
            <span className="text-gray-600 font-medium">Title Tag Analyser</span>
          </nav>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">✍️</span>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">Free SEO Tool</p>
          </div>
          <h1 className="text-[clamp(1.875rem,4vw,2.5rem)] font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
            Title Tag Analyser
          </h1>
          <p className="text-base text-gray-500 leading-relaxed max-w-[600px]">
            Score your page titles against eight SEO best-practice criteria. Get an A–F grade with specific, actionable recommendations to improve length, keyword placement, and click-through potential.
          </p>
        </div>
      </div>

      <TitleTagClient />

      {/* ── Scoring criteria explained ────────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-[1.25rem] font-extrabold text-gray-900 tracking-tight mb-6">
            How the title tag score is calculated
          </h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            The analyser scores each title out of 100 across eight criteria. The grade (A–F) maps to: A = 90+, B = 75–89, C = 60–74, D = 40–59, F = below 40.
          </p>
          <div className="space-y-3">
            {[
              { label: 'Optimal length (50–60 chars)', points: 25, detail: 'Titles in the 50–60 character range are highly weighted. Scores reduce proportionally for titles that are very short (<30) or too long (>70).' },
              { label: 'Starts with target keyword', points: 20, detail: 'If you supply a target keyword, the tool checks whether it (or close variants) appear in the first 30 characters. Front-loading the keyword has the biggest impact on perceived relevance.' },
              { label: 'No all-caps text', points: 10, detail: 'TITLE TAGS IN ALL CAPS look spammy and may trigger Google rewrites. Mixed case scores full marks.' },
              { label: 'Contains a number', points: 10, detail: 'Numbers in titles ("7 Best", "2026 Guide", "£49/month") improve click-through by making the benefit concrete and specific.' },
              { label: 'Contains power words', points: 10, detail: 'Power words include: best, top, ultimate, complete, free, guide, how to, proven, expert, review, and year tokens. One or more earns full marks.' },
              { label: 'No keyword stuffing', points: 10, detail: 'If your target keyword appears more than twice in the title, or if any single word (excluding common short words) appears 3+ times, you lose points for over-optimisation.' },
              { label: 'Not starting with stop word', points: 5, detail: 'Titles beginning with "The", "A", "An" waste prime front-of-title real estate on low-value words.' },
              { label: 'Has a brand / separator', points: 10, detail: 'Titles containing a pipe (|), dash (–), or hyphen (-) suggest a structured "Keyword | Brand" format, which correlates with professional, trustworthy results.' },
            ].map((c) => (
              <div key={c.label} className="flex gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                  {c.points}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm mb-1">{c.label}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{c.detail}</p>
                </div>
              </div>
            ))}
          </div>
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

      <section className="bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400 mb-5">Related Free Tools</p>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'SERP Snippet Preview', href: '/tools/serp-preview', icon: '🔍' },
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
