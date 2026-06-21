import Link from 'next/link'
import type { Metadata } from 'next'
import { AffiliateNav } from '@/components/affiliate/AffiliateNav'
import { AffiliateFooter } from '@/components/affiliate/AffiliateFooter'

export const metadata: Metadata = {
  title: 'Free SEO Tools for Professionals — No Signup Required | SaySEO',
  description:
    'Free online SEO tools built for agency professionals. SERP snippet preview, title tag analyser, schema markup generator, keyword density checker, SEO ROI calculator, and robots.txt generator — all in your browser, no signup required.',
  keywords: [
    'free SEO tools', 'SERP preview tool', 'title tag analyser', 'schema markup generator',
    'keyword density checker', 'SEO ROI calculator', 'robots txt generator', 'SEO tools UK',
    'free SEO tools for agencies', 'online SEO tools no signup',
  ],
  alternates: { canonical: 'https://sayseo.co.uk/tools' },
  openGraph: {
    type: 'website',
    siteName: 'SaySEO',
    title: 'Free SEO Tools for Professionals | SaySEO',
    description: 'Six free SEO tools built for agency professionals. No signup, no API keys, no data sent anywhere.',
    url: 'https://sayseo.co.uk/tools',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free SEO Tools for Professionals | SaySEO',
    description: 'Six free SEO tools built for agency professionals. No signup required.',
  },
  robots: { index: true, follow: true },
}

// ─── Tool data ────────────────────────────────────────────────────────────────

const toolCategories = [
  {
    id: 'on-page',
    label: 'On-Page SEO',
    icon: '📄',
    description: 'Analyse and optimise what search engines read on every page.',
    tools: [
      {
        slug: 'serp-preview',
        name: 'SERP Snippet Preview',
        description: 'See exactly how your page title and meta description render in Google desktop and mobile results — live, as you type.',
        time: 'Instant',
        badge: 'Most Popular',
        badgeColor: '#047857',
        icon: '🔍',
        use: 'Spot truncation before publishing. Share previews with clients for approval.',
      },
      {
        slug: 'title-tag-analyzer',
        name: 'Title Tag Analyser',
        description: 'Score your title tags on length, keyword placement, power words, and click-through potential. Get an A–F grade with specific recommendations.',
        time: 'Instant',
        badge: null,
        icon: '✍️',
        use: 'QA title tags at scale across a client site before a relaunch.',
      },
      {
        slug: 'keyword-density',
        name: 'Keyword Density Checker',
        description: 'Analyse keyword frequency and density across any pasted content. Avoid over-optimisation and surface coverage gaps before you publish.',
        time: 'Instant',
        badge: null,
        icon: '📊',
        use: 'Review content against target keywords before publication.',
      },
    ],
  },
  {
    id: 'technical',
    label: 'Technical SEO',
    icon: '⚙️',
    description: 'Build technical SEO assets that search engines require.',
    tools: [
      {
        slug: 'schema-generator',
        name: 'Schema Markup Generator',
        description: 'Generate valid JSON-LD structured data for FAQ, HowTo, Article, LocalBusiness, and BreadcrumbList schemas. Copy-paste ready.',
        time: '2 mins',
        badge: 'Agency Essential',
        badgeColor: '#1D4ED8',
        icon: '🏷️',
        use: 'Create rich-result markup for client pages without writing JSON by hand.',
      },
      {
        slug: 'robots-txt-generator',
        name: 'Robots.txt Generator',
        description: 'Build a robots.txt file with a visual rule editor. Apply presets for AI crawler blocking, private path exclusions, and clean all-allow configurations.',
        time: '2 mins',
        badge: null,
        icon: '🤖',
        use: 'New site launches, technical audits, and blocking AI training crawlers.',
      },
    ],
  },
  {
    id: 'strategy',
    label: 'Strategy & ROI',
    icon: '📈',
    description: 'Quantify the value of SEO to stakeholders and clients.',
    tools: [
      {
        slug: 'seo-roi-calculator',
        name: 'SEO ROI Calculator',
        description: 'Calculate the expected traffic, leads, and revenue return from moving up the SERPs. Uses position-to-CTR data for accurate projections.',
        time: '3 mins',
        badge: 'Client-Ready',
        badgeColor: '#B45309',
        icon: '💷',
        use: 'Build compelling SEO business cases for prospects and internal stakeholders.',
      },
    ],
  },
  {
    id: 'geo',
    label: 'GEO & AI Search',
    icon: '🤖',
    description: 'Optimise content to be cited by AI search engines and answer engines.',
    tools: [
      {
        slug: 'geo-prompt-mapper',
        name: 'GEO Prompt Mapper',
        description: 'Generate AI search prompt clusters, predicted GEO questions, content briefs and schema recommendations using only free data sources. Optimise for ChatGPT, Gemini, Perplexity and Google AI Overviews.',
        time: '5 mins',
        badge: 'New',
        badgeColor: '#7C3AED',
        icon: '🗺️',
        use: 'Build citation-worthy content strategies for AI search engines without any paid tools.',
      },
    ],
  },
]

const allTools = toolCategories.flatMap((c) => c.tools.map((t) => ({ ...t, category: c.label })))

// ─── FAQ data ─────────────────────────────────────────────────────────────────

const faqs = [
  {
    q: 'Are these SEO tools really free?',
    a: 'Yes. All SaySEO tools are completely free with no account required. They run entirely in your browser — no data is sent to any server. There are no paid tiers, upsells, or rate limits.',
  },
  {
    q: 'Do I need to create an account to use the tools?',
    a: 'No account is required. Open any tool page and start using it immediately. We deliberately built these tools to work without authentication because we know SEO professionals need to move fast.',
  },
  {
    q: 'Who are these tools designed for?',
    a: 'SaySEO\'s free tools are built primarily for agency-side SEO professionals — consultants and in-house teams who need quick, reliable utilities for daily tasks like writing title tags, building schema markup, and justifying SEO spend to clients. They also work well for freelancers and in-house SEOs.',
  },
  {
    q: 'How is the SERP preview tool different from Google Search Console?',
    a: 'Google Search Console shows historical performance data after your pages are live and indexed. The SaySEO SERP preview tool lets you check and refine your title tags and meta descriptions before publishing — catching truncation issues, length problems, and click-through weaknesses at the content creation stage.',
  },
  {
    q: 'What schema types does the schema generator support?',
    a: 'The SaySEO schema markup generator supports five schema types: FAQPage (for Q&A content), HowTo (step-by-step guides), Article (blog posts and news), LocalBusiness (for local SEO clients), and BreadcrumbList (navigation breadcrumbs). All output is valid JSON-LD formatted for Google\'s Rich Results.',
  },
  {
    q: 'How accurate is the SEO ROI calculator?',
    a: 'The calculator uses industry-standard CTR benchmarks by SERP position (position 1 ≈ 39.8% CTR, position 3 ≈ 10.2%, position 10 ≈ 2.0%) combined with your actual conversion rate and average order value. Projections are directionally accurate for business cases, though real-world results vary based on brand, intent, and seasonality.',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ToolsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Free SEO Tools for Professionals',
    description: 'Six free SEO tools built for agency professionals — SERP preview, title tag analyser, schema generator, keyword density, SEO ROI calculator, robots.txt generator.',
    url: 'https://sayseo.co.uk/tools',
    publisher: {
      '@type': 'Organization',
      name: 'SaySEO',
      url: 'https://sayseo.co.uk',
    },
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
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-12">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
            <Link href="/" className="hover:text-emerald-700 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-600 font-medium">Free Tools</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
              <span className="text-[0.6875rem] font-bold text-emerald-700 tracking-[0.1em] uppercase">
                No Signup · No API Keys · No Data Sent
              </span>
            </div>

            <h1 className="text-[clamp(2rem,4.5vw,3rem)] font-extrabold text-gray-900 leading-[1.1] tracking-[-0.03em] mb-4">
              Free SEO Tools Built for<br />
              <span className="text-emerald-700">Agency Professionals</span>
            </h1>

            <p className="text-lg text-gray-500 leading-[1.75] mb-8 max-w-[600px]">
              Seven purpose-built tools for the tasks SEO professionals do every day — previewing snippets, building schema markup, checking keyword density, calculating ROI, and generating GEO prompt clusters for AI search. All free, all in-browser.
            </p>

            {/* Trust bar */}
            <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-gray-100">
              {[
                { value: '7', label: 'Free Tools' },
                { value: '0', label: 'Signup Required' },
                { value: '100%', label: 'Browser-Based' },
                { value: 'Agency', label: 'Focused' },
              ].map(({ value, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-[0.9375rem] font-extrabold text-emerald-700">{value}</span>
                  <span className="text-sm text-gray-400">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Tool categories ───────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-14 space-y-14">
        {toolCategories.map((cat) => (
          <section key={cat.id} id={cat.id}>
            {/* Category header */}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{cat.icon}</span>
              <div>
                <h2 className="text-[clamp(1.25rem,2.5vw,1.5rem)] font-extrabold text-gray-900 tracking-tight">
                  {cat.label}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">{cat.description}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {cat.tools.map((tool) => (
                <div
                  key={tool.slug}
                  className="flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  {/* Card header */}
                  <div className="flex items-start gap-3 p-5 border-b border-gray-100">
                    <span className="text-2xl shrink-0 mt-0.5">{tool.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-[0.9375rem] font-extrabold text-gray-900">{tool.name}</h3>
                        {tool.badge && (
                          <span
                            className="px-2 py-0.5 rounded-full text-[0.6rem] font-bold text-white whitespace-nowrap"
                            style={{ backgroundColor: tool.badgeColor! }}
                          >
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-gray-100 text-[0.65rem] font-semibold text-gray-500 uppercase tracking-wide">
                        {cat.label}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 p-5 flex flex-col gap-3">
                    <p className="text-sm text-gray-600 leading-relaxed">{tool.description}</p>

                    <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                      <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="text-xs text-emerald-700 leading-snug"><span className="font-semibold">Best for:</span> {tool.use}</p>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <Link
                      href={`/tools/${tool.slug}`}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors"
                    >
                      Use Tool
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* ── Quick access strip ────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400 mb-4">Quick Access — All Tools</p>
          <div className="flex flex-wrap gap-2">
            {allTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-sm font-medium text-gray-600 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
              >
                <span className="text-base">{tool.icon}</span>
                {tool.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why we built these ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700 mb-3">Why These Tools Exist</p>
            <h2 className="text-[clamp(1.375rem,2.5vw,1.875rem)] font-extrabold text-gray-900 tracking-tight mb-4">
              Built for the daily reality of agency SEO
            </h2>
            <div className="space-y-4 text-gray-600 text-[0.9375rem] leading-relaxed">
              <p>
                Agency SEO work is relentless. You're writing title tags for 200 pages, generating schema markup for a local chain, justifying spend to a sceptical CFO, and catching technical issues before launch — all in the same week.
              </p>
              <p>
                Most free SEO tools are either stripped-down trial versions of paid software (with forced sign-ups and daily limits) or so basic they're barely useful. SaySEO's tools are different: they're standalone utilities that do one thing well, with no account wall in the way.
              </p>
              <p>
                Every tool on this page runs entirely in your browser. No data is sent to any server. You can use them on client data without any privacy concerns.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: '🔒', title: 'Private by default', body: 'Everything runs in your browser. No data leaves your machine — safe to use with confidential client projects.' },
              { icon: '⚡', title: 'Instant results', body: 'No loading spinners or server round-trips. All analysis happens locally in milliseconds.' },
              { icon: '🆓', title: 'Free forever', body: 'No freemium tricks. No daily limits. No sign-up wall. These tools are free because useful tools build trust.' },
              { icon: '🎯', title: 'Agency-shaped', body: 'Built around real agency workflows — title tag QA, schema generation, client ROI reports, and new-site technical setup.' },
            ].map((item) => (
              <div key={item.title} className="bg-white border border-gray-200 rounded-xl p-5">
                <span className="text-2xl block mb-3">{item.icon}</span>
                <h3 className="font-bold text-gray-900 mb-1.5 text-sm">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700 mb-3 text-center">FAQ</p>
          <h2 className="text-[clamp(1.375rem,2.5vw,1.75rem)] font-extrabold text-gray-900 tracking-tight mb-8 text-center">
            Frequently asked questions
          </h2>

          <div className="space-y-5">
            {faqs.map((faq) => (
              <div key={faq.q} className="border border-gray-200 rounded-xl bg-white overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 text-[0.9375rem]">{faq.q}</h3>
                </div>
                <div className="px-6 py-4">
                  <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA — reviews ─────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <div className="rounded-2xl bg-white border border-gray-200 p-10 text-center shadow-sm">
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight mb-3">
            Need to buy a tool, not just use one?
          </h2>
          <p className="text-sm text-gray-500 mb-7 max-w-md mx-auto">
            Read our independent reviews of Semrush, Ahrefs, SE Ranking, and 30+ more SEO platforms before spending a penny.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-sm"
            >
              Browse Reviews
            </Link>
            <Link
              href="/comparisons"
              className="inline-flex items-center px-7 py-3.5 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Compare Tools
            </Link>
          </div>
        </div>
      </section>

      <AffiliateFooter />
    </div>
  )
}
