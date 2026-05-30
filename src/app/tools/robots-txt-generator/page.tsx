import Link from 'next/link'
import type { Metadata } from 'next'
import { AffiliateNav } from '@/components/affiliate/AffiliateNav'
import { AffiliateFooter } from '@/components/affiliate/AffiliateFooter'
import { RobotsTxtClient } from './RobotsTxtClient'

export const metadata: Metadata = {
  title: 'Free Robots.txt Generator — Visual Builder with AI Crawler Presets | SaySEO',
  description:
    'Build a robots.txt file with a visual rule editor. Presets for blocking AI training crawlers (GPTBot, ClaudeBot, Google-Extended), private paths, and custom rules. Live preview and one-click copy.',
  keywords: [
    'robots.txt generator', 'robots txt builder', 'block AI crawlers robots.txt',
    'GPTBot block', 'robots.txt creator', 'disallow robots.txt',
    'robots txt tool free', 'block AI training robots.txt',
  ],
  alternates: { canonical: 'https://sayseo.co.uk/tools/robots-txt-generator' },
  openGraph: {
    type: 'website',
    siteName: 'SaySEO',
    title: 'Free Robots.txt Generator | SaySEO',
    description: 'Build and preview a robots.txt file with AI crawler blocking presets. Visual editor, instant preview, copy-paste ready.',
    url: 'https://sayseo.co.uk/tools/robots-txt-generator',
    locale: 'en_GB',
  },
  robots: { index: true, follow: true },
}

const faqs = [
  {
    q: 'What is a robots.txt file?',
    a: 'A robots.txt file is a plain-text file placed at the root of a website (e.g. yoursite.com/robots.txt) that tells web crawlers which pages or sections they are and are not allowed to access. It uses the Robots Exclusion Protocol — a set of simple directives like "User-agent" (which crawler), "Disallow" (paths to block), "Allow" (paths to permit), and "Sitemap" (your XML sitemap URL). Robots.txt is one of the first files search engine crawlers check when visiting a site.',
  },
  {
    q: 'Should I block AI crawlers in my robots.txt?',
    a: 'Whether to block AI training crawlers depends on your priorities. Blocking them prevents your content from being used to train AI language models (like GPT and Gemini), which some publishers and content creators prefer for copyright and commercial reasons. However, some AI systems (like Bing\'s AI and Google\'s AI Overviews) use crawlers that also power their search indexing — blocking them may reduce your visibility in those features. The decision is yours: the tool provides ready-made presets for blocking specific AI crawlers while leaving major search engine bots unaffected.',
  },
  {
    q: 'Does robots.txt prevent pages from being indexed?',
    a: 'Robots.txt prevents crawlers from accessing your pages, but it does not guarantee those pages won\'t appear in search results. Google can still index a page it hasn\'t crawled if other sites link to it — it will just show minimal information without a snippet. To completely prevent indexing, use a "noindex" meta tag or X-Robots-Tag HTTP header instead of (or in addition to) robots.txt.',
  },
  {
    q: 'What AI crawlers are included in the blocking preset?',
    a: 'The "Block AI Crawlers" preset blocks the following known AI training bots: GPTBot (OpenAI), ChatGPT-User (OpenAI), ClaudeBot (Anthropic), anthropic-ai, CCBot (Common Crawl, used by many AI companies), Google-Extended (Google AI training, separate from Googlebot), PerplexityBot, Bytespider (ByteDance/TikTok), Meta-ExternalAgent (Meta), and Amazonbot. Googlebot and Bingbot are NOT included — these bots also power search indexing and should typically be allowed.',
  },
  {
    q: 'What happens if I block Googlebot?',
    a: 'Blocking Googlebot entirely with "Disallow: /" will prevent Google from crawling your site, which will eventually remove your pages from Google search results as they become stale and unapproved. This is almost never intentional. Be very careful when configuring User-agent rules — always explicitly target only the bots you want to block. The generator uses named User-agent directives for each bot rather than a catch-all wildcard, making it safer to use.',
  },
  {
    q: 'How do I verify my robots.txt is working correctly?',
    a: 'After uploading your robots.txt to your site\'s root directory, you can verify it using Google Search Console\'s robots.txt tester (found under Settings > Crawling). Enter specific URLs to test whether Googlebot can access them under your current rules. You can also visit yoursite.com/robots.txt directly in a browser to confirm the file is live and readable. Allow 24–48 hours for crawlers to re-read an updated robots.txt.',
  },
]

export default function RobotsTxtGeneratorPage() {
  const toolJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Robots.txt Generator',
    applicationCategory: 'SEOApplication',
    operatingSystem: 'Web Browser',
    url: 'https://sayseo.co.uk/tools/robots-txt-generator',
    description: 'Visual robots.txt builder with AI crawler blocking presets. Generate and copy robots.txt files instantly.',
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
            <span className="text-gray-600 font-medium">Robots.txt Generator</span>
          </nav>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🤖</span>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">Free SEO Tool</p>
          </div>
          <h1 className="text-[clamp(1.875rem,4vw,2.5rem)] font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
            Robots.txt Generator
          </h1>
          <p className="text-base text-gray-500 leading-relaxed max-w-[620px]">
            Build a robots.txt file with a visual rule editor. Apply presets for allowing all bots, blocking AI training crawlers, or protecting private site sections. Live preview and instant copy — no coding required.
          </p>
        </div>
      </div>

      <RobotsTxtClient />

      {/* ── Common crawlers reference ──────────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-[1.25rem] font-extrabold text-gray-900 tracking-tight mb-6">
            Common web crawlers reference
          </h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">User-agent</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Owner</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Purpose</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Block?</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { agent: 'Googlebot', owner: 'Google', purpose: 'Google Search indexing', block: 'No', blockColor: '#DC2626' },
                  { agent: 'Bingbot', owner: 'Microsoft', purpose: 'Bing Search indexing', block: 'No', blockColor: '#DC2626' },
                  { agent: 'Google-Extended', owner: 'Google', purpose: 'AI training (Gemini)', block: 'Optional', blockColor: '#D97706' },
                  { agent: 'GPTBot', owner: 'OpenAI', purpose: 'AI training (GPT models)', block: 'Optional', blockColor: '#D97706' },
                  { agent: 'ChatGPT-User', owner: 'OpenAI', purpose: 'ChatGPT browsing plugin', block: 'Optional', blockColor: '#D97706' },
                  { agent: 'ClaudeBot', owner: 'Anthropic', purpose: 'AI training (Claude)', block: 'Optional', blockColor: '#D97706' },
                  { agent: 'CCBot', owner: 'Common Crawl', purpose: 'Open data (used in AI training)', block: 'Optional', blockColor: '#D97706' },
                  { agent: 'PerplexityBot', owner: 'Perplexity AI', purpose: 'Perplexity search/AI answers', block: 'Optional', blockColor: '#D97706' },
                  { agent: 'Bytespider', owner: 'ByteDance', purpose: 'TikTok/AI data collection', block: 'Recommended', blockColor: '#059669' },
                  { agent: 'Amazonbot', owner: 'Amazon', purpose: 'Alexa/AI training', block: 'Optional', blockColor: '#D97706' },
                  { agent: 'AhrefsBot', owner: 'Ahrefs', purpose: 'SEO backlink index', block: 'Optional', blockColor: '#D97706' },
                  { agent: 'SemrushBot', owner: 'Semrush', purpose: 'SEO data collection', block: 'Optional', blockColor: '#D97706' },
                ].map((row, i) => (
                  <tr key={row.agent} className={`border-b border-gray-100 last:border-0 ${i % 2 === 1 ? 'bg-gray-50/40' : ''}`}>
                    <td className="px-5 py-2.5 font-mono text-xs text-gray-800 font-semibold">{row.agent}</td>
                    <td className="px-5 py-2.5 text-gray-600 text-xs">{row.owner}</td>
                    <td className="px-5 py-2.5 text-gray-600 text-xs">{row.purpose}</td>
                    <td className="px-5 py-2.5">
                      <span className="text-xs font-bold" style={{ color: row.blockColor }}>{row.block}</span>
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
              { name: 'SEO ROI Calculator', href: '/tools/seo-roi-calculator', icon: '💷' },
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
