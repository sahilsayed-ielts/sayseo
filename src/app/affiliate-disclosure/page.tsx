import type { Metadata } from 'next'
import Link from 'next/link'
import { AffiliateNav } from '@/components/affiliate/AffiliateNav'
import { AffiliateFooter } from '@/components/affiliate/AffiliateFooter'

export const metadata: Metadata = {
  title: 'Affiliate Disclosure | SaySEO',
  description: 'Read how SaySEO uses affiliate links, how commissions work, and how we keep our SEO software reviews independent.',
  alternates: { canonical: 'https://sayseo.co.uk/affiliate-disclosure' },
  openGraph: {
    title: 'Affiliate Disclosure | SaySEO',
    description: 'How SaySEO uses affiliate links and maintains editorial independence.',
    url: 'https://sayseo.co.uk/affiliate-disclosure',
    locale: 'en_GB',
  },
}

const principles = [
  {
    title: 'We may earn a commission',
    body: 'Some links on SaySEO are affiliate links. If you click one of those links and later sign up or buy, we may earn a commission from the provider at no extra cost to you.',
  },
  {
    title: 'Our editorial process stays independent',
    body: 'Commissions do not decide our ratings, verdicts, or comparisons. We aim to recommend the best-fit tool for a use case, not the tool with the highest payout.',
  },
  {
    title: 'Not every tool has an affiliate relationship',
    body: 'We may review or mention tools even when we do not earn anything from them. If a non-affiliate tool is the better recommendation for a specific workflow, we will say so.',
  },
  {
    title: 'Prices and offers can change',
    body: 'We try to keep pricing, free-trial details, and promotional offers current, but software vendors can change them at any time. Always verify the latest terms on the provider website before purchasing.',
  },
]

export default function AffiliateDisclosurePage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <AffiliateNav />

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-10 pb-8">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
            <Link href="/" className="hover:text-emerald-700 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-600 font-medium">Affiliate Disclosure</span>
          </nav>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700 mb-3">Disclosure</p>
          <h1 className="text-[clamp(1.875rem,4vw,2.75rem)] font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
            Affiliate Disclosure
          </h1>
          <p className="text-base text-gray-500 leading-relaxed max-w-[640px]">
            SaySEO publishes independent reviews, comparisons, and buying guides for SEO software. This page explains how affiliate links work on the site and how we handle them responsibly.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 pb-16 space-y-8">

        {/* Short version */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-7">
          <h2 className="text-base font-bold text-emerald-800 mb-3">Short version</h2>
          <p className="text-sm text-emerald-900/80 leading-relaxed">
            Some outbound links to SEO tools are affiliate links. If you buy through them, we may earn a commission. That does not increase your price, and it does not change our commitment to honest recommendations.
          </p>
        </div>

        {/* Principles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {principles.map((item) => (
            <div key={item.title} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900 mb-2.5">{item.title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>

        {/* How we review */}
        <div className="bg-white border border-gray-200 rounded-xl p-7 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4">How we review tools</h2>
          <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
            <p>
              We assess SEO tools based on practical buying criteria such as data quality, workflow coverage, ease of use, pricing, support, and the type of user the tool best serves.
            </p>
            <p>
              We also try to be explicit about trade-offs. A tool can be the best option for agencies and still be a poor fit for solo users. A lower-cost platform can be the smarter buy even if it loses on raw feature depth.
            </p>
            <p>
              Where possible, we compare tools against realistic alternatives so readers can make a decision based on fit, not just brand size.
            </p>
          </div>
        </div>

        {/* What affiliate links fund */}
        <div className="bg-white border border-gray-200 rounded-xl p-7 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4">What affiliate links fund</h2>
          <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
            <p>
              Affiliate revenue helps fund the time and cost required to publish detailed reviews, maintain comparison pages, keep pricing information current, and build free tools for SEO professionals.
            </p>
            <p>
              It also supports the ongoing development of SaySEO&apos;s own AI visibility tooling and editorial content.
            </p>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white border border-gray-200 rounded-xl p-7 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4">Questions?</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            If you have a question about a specific recommendation or want clarification on how we make money from a page, use the site as you normally would and treat this disclosure as the governing policy for affiliate content on SaySEO.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/reviews" className="inline-flex items-center px-6 py-3 rounded-lg text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors">
              Browse Reviews
            </Link>
            <Link href="/comparisons" className="inline-flex items-center px-6 py-3 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
              Browse Comparisons
            </Link>
          </div>
        </div>
      </main>

      <AffiliateFooter />
    </div>
  )
}
