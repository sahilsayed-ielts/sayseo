import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { AffiliateNav } from '@/components/affiliate/AffiliateNav'
import { AffiliateFooter } from '@/components/affiliate/AffiliateFooter'

// ─── Tool data ────────────────────────────────────────────────────────────────

const tools: Record<string, ToolData> = {
  semrush: {
    name: 'Semrush',
    tagline: 'All-in-one SEO & digital marketing platform',
    rating: 4.8,
    ratingBreakdown: { features: 5.0, value: 4.3, easeOfUse: 4.5, support: 4.7, dataQuality: 4.9 },
    badge: 'Best Overall',
    badgeColor: '#00D4AA',
    category: 'All-in-One',
    price: 'From $139.95/mo',
    trialInfo: '7-day free trial available',
    affiliateUrl: 'https://www.semrush.com',
    summary:
      'Semrush is the most complete SEO and digital marketing platform on the market. It covers keyword research, site auditing, backlink analysis, rank tracking, competitor research, content marketing, and paid advertising — all under one roof.',
    pros: [
      'Enormous keyword database with 25+ billion keywords',
      'Comprehensive site audit with 140+ checks',
      'Industry-leading competitor research and traffic analytics',
      'Content marketing toolkit with SEO Writing Assistant',
      'PPC research and ad monitoring',
      'Excellent agency features and white-label reporting',
    ],
    cons: [
      'Most expensive tier-one SEO tool — starts at $139.95/mo',
      'Steep learning curve for new users',
      'Some data discrepancies in smaller markets',
      'User limits on lower tiers can feel restrictive',
    ],
    bestFor: 'Agencies, in-house SEO teams, and serious digital marketers who need one platform for everything.',
    verdict:
      'If budget is not the primary constraint, Semrush is the strongest single-platform investment in SEO. The breadth of data — keyword, competitor, content, backlink, and PPC — makes it the default choice for agencies and enterprise teams. Solo practitioners or those on a tight budget should look at SE Ranking first.',
    keyFeatures: [
      { name: 'Keyword Magic Tool', description: 'Access 25B+ keywords with intent, difficulty, and SERP feature data.' },
      { name: 'Site Audit', description: '140+ technical checks with prioritised fixes and progress tracking.' },
      { name: 'Backlink Analytics', description: 'Analyse any domain\'s link profile with authority scores and toxicity flags.' },
      { name: 'Position Tracking', description: 'Daily rank tracking with device, location, and SERP feature visibility.' },
      { name: 'Traffic Analytics', description: 'Estimate any competitor\'s traffic without their GA4 access.' },
      { name: '.Trends', description: 'Market intelligence and industry trend data (add-on).' },
    ],
    pricing: [
      { plan: 'Pro', price: '$139.95/mo', users: 1, projects: 5, keywords: 500 },
      { plan: 'Guru', price: '$249.95/mo', users: 3, projects: 15, keywords: 1500 },
      { plan: 'Business', price: '$499.95/mo', users: 5, projects: 40, keywords: 5000 },
    ],
    alternatives: ['ahrefs', 'se-ranking', 'moz-pro'],
  },
  ahrefs: {
    name: 'Ahrefs',
    tagline: 'Industry-leading backlink analysis & keyword research',
    rating: 4.7,
    ratingBreakdown: { features: 4.8, value: 4.3, easeOfUse: 4.5, support: 4.4, dataQuality: 5.0 },
    badge: 'Best for Links',
    badgeColor: '#f59e0b',
    category: 'All-in-One',
    price: 'From $129/mo',
    trialInfo: '$7 for 7-day trial (Starter)',
    affiliateUrl: 'https://ahrefs.com',
    summary:
      "Ahrefs is the gold standard for backlink analysis. It runs one of the world's largest link databases and is favoured by SEO professionals who live and breathe link building, content gap analysis, and keyword research.",
    pros: [
      "World's most comprehensive backlink database",
      'Highly accurate keyword difficulty scores',
      'Content Explorer for finding link-worthy content opportunities',
      'Fast and frequent crawler updates',
      'Site Audit with clean visual reporting',
      'AWT (Ahrefs Web Tools) with free tier',
    ],
    cons: [
      'No Google Analytics or Search Console integration',
      'More expensive than SE Ranking or Mangools',
      'Technical SEO audit less deep than Screaming Frog',
      'No PPC competitor data',
    ],
    bestFor: 'Link builders, content strategists, and SEO professionals who prioritise data quality over breadth of features.',
    verdict:
      "Ahrefs is the tool that serious SEOs reach for when accuracy matters. Its backlink data is unmatched and its keyword research is among the most reliable available. If you're primarily focused on link building and content-driven SEO, Ahrefs is the clear choice. Teams needing a fuller marketing suite should consider Semrush.",
    keyFeatures: [
      { name: 'Site Explorer', description: 'Complete backlink and organic search analysis for any domain.' },
      { name: 'Keywords Explorer', description: '10B+ keywords with accurate difficulty and traffic potential scores.' },
      { name: 'Content Explorer', description: 'Find the most linked, shared, and trafficked content in any niche.' },
      { name: 'Rank Tracker', description: 'Daily SERP position monitoring with share of voice reporting.' },
      { name: 'Site Audit', description: 'Technical SEO crawler with health score and priority issues.' },
      { name: 'Competitive Analysis', description: 'Identify content gaps and keyword opportunities vs competitors.' },
    ],
    pricing: [
      { plan: 'Lite', price: '$129/mo', users: 1, projects: 5, keywords: 750 },
      { plan: 'Standard', price: '$249/mo', users: 1, projects: 20, keywords: 2000 },
      { plan: 'Advanced', price: '$449/mo', users: 3, projects: 50, keywords: 5000 },
    ],
    alternatives: ['semrush', 'se-ranking', 'moz-pro'],
  },
  'se-ranking': {
    name: 'SE Ranking',
    tagline: 'Affordable all-in-one SEO for growing teams',
    rating: 4.5,
    ratingBreakdown: { features: 4.4, value: 4.9, easeOfUse: 4.7, support: 4.5, dataQuality: 4.2 },
    badge: 'Best Value',
    badgeColor: '#8b5cf6',
    category: 'All-in-One',
    price: 'From $65/mo',
    trialInfo: '14-day free trial, no card required',
    affiliateUrl: 'https://seranking.com',
    summary:
      'SE Ranking is the best affordable alternative to Semrush and Ahrefs. It packs a full SEO toolkit — rank tracking, site audits, backlink analysis, keyword research, and on-page analysis — at a fraction of the cost of tier-one tools.',
    pros: [
      'Best price-to-feature ratio in the category',
      'Accurate and flexible rank tracking',
      'Clean, beginner-friendly interface',
      'White-label reporting for agencies',
      '14-day free trial with no credit card',
      'Good API access on higher tiers',
    ],
    cons: [
      'Smaller backlink database than Ahrefs or Semrush',
      'Traffic estimates less reliable in niche markets',
      'Fewer third-party integrations',
      'Content marketing features are basic',
    ],
    bestFor: 'Freelance SEOs, small agencies, and SMBs who need a capable all-in-one tool without the enterprise price tag.',
    verdict:
      "SE Ranking is the smartest buy for teams who don't need the absolute depth of Semrush or Ahrefs but want a complete, well-designed SEO platform. The 14-day free trial makes it a no-risk way to find out if it fits your workflow.",
    keyFeatures: [
      { name: 'Rank Tracker', description: 'Accurate daily or on-demand tracking across any search engine and location.' },
      { name: 'Website Audit', description: 'Technical SEO audit with health scores and actionable fix lists.' },
      { name: 'Competitive Research', description: 'Analyse competitors\' organic and paid keyword strategies.' },
      { name: 'Backlink Checker', description: 'Backlink monitoring with authority and toxicity scoring.' },
      { name: 'On-Page SEO Checker', description: 'Page-level optimisation recommendations against top competitors.' },
      { name: 'White-Label Reports', description: 'Branded PDF and live reports for clients.' },
    ],
    pricing: [
      { plan: 'Essential', price: '$65/mo', users: 1, projects: 10, keywords: 750 },
      { plan: 'Pro', price: '$119/mo', users: 3, projects: 30, keywords: 2000 },
      { plan: 'Business', price: '$259/mo', users: 5, projects: 'Unlimited', keywords: 5000 },
    ],
    alternatives: ['semrush', 'ahrefs', 'mangools'],
  },
  'surfer-seo': {
    name: 'Surfer SEO',
    tagline: 'Data-driven content optimization platform',
    rating: 4.4,
    ratingBreakdown: { features: 4.5, value: 4.2, easeOfUse: 4.6, support: 4.3, dataQuality: 4.4 },
    badge: 'Best for Content',
    badgeColor: '#3b82f6',
    category: 'Content',
    price: 'From $99/mo',
    trialInfo: '7-day money-back guarantee',
    affiliateUrl: 'https://surferseo.com',
    summary:
      'Surfer SEO is a content optimization platform that analyses the top-ranking pages for your target keyword and gives you real-time NLP-based recommendations to match — or beat — them. It integrates directly with Google Docs and WordPress.',
    pros: [
      'Real-time content score as you write',
      'NLP-powered keyword and entity recommendations',
      'Direct Google Docs and WordPress integration',
      'SERP Analyser for deep competitive content research',
      'AI content generation (Surfer AI)',
      'Content audit tool for existing pages',
    ],
    cons: [
      'Narrow use case — primarily for content optimisation',
      'No backlink or technical SEO data',
      'Expensive for teams needing multiple content editors',
      'AI writing quality is average vs dedicated tools',
    ],
    bestFor: 'Content writers, SEO content strategists, and teams producing large volumes of optimised content.',
    verdict:
      "Surfer fills a specific gap: it tells you exactly what to include in your content to compete at the top of Google. It doesn't replace Semrush or Ahrefs but works brilliantly alongside them. If you're serious about content-driven SEO, Surfer is worth the investment.",
    keyFeatures: [
      { name: 'Content Editor', description: 'Real-time optimisation guidance with content score as you write.' },
      { name: 'SERP Analyser', description: 'Deep analysis of any keyword\'s top-ranking pages with structure data.' },
      { name: 'Audit', description: 'Identify optimisation gaps on your existing published pages.' },
      { name: 'Keyword Research', description: 'Cluster and plan content around related keyword groups.' },
      { name: 'Surfer AI', description: 'AI-generated, optimised article drafts from a keyword prompt.' },
      { name: 'Integrations', description: 'Google Docs, WordPress, and Jasper.ai integrations.' },
    ],
    pricing: [
      { plan: 'Essential', price: '$99/mo', users: 1, projects: 'Unlimited', keywords: '30 articles/mo' },
      { plan: 'Scale', price: '$219/mo', users: 3, projects: 'Unlimited', keywords: '100 articles/mo' },
      { plan: 'Enterprise', price: 'Custom', users: 'Custom', projects: 'Unlimited', keywords: 'Custom' },
    ],
    alternatives: ['semrush', 'se-ranking', 'moz-pro'],
  },
  'screaming-frog': {
    name: 'Screaming Frog',
    tagline: 'The most powerful website crawler for technical SEO',
    rating: 4.6,
    ratingBreakdown: { features: 5.0, value: 4.9, easeOfUse: 3.5, support: 4.0, dataQuality: 5.0 },
    badge: 'Best Technical',
    badgeColor: '#ef4444',
    category: 'Technical',
    price: 'Free / £259/yr',
    trialInfo: 'Free version crawls up to 500 URLs',
    affiliateUrl: 'https://www.screamingfrog.co.uk/seo-spider/',
    summary:
      'Screaming Frog SEO Spider is the industry-standard desktop crawler for technical SEO audits. It crawls any website to surface broken links, duplicate content, missing metadata, redirect chains, and hundreds of other technical issues.',
    pros: [
      'Unmatched depth and flexibility for technical crawling',
      'Free version crawls up to 500 URLs — ideal for small sites',
      'Integrates with GA4, Google Search Console, PageSpeed Insights',
      'Highly customisable with custom extraction and JavaScript rendering',
      'Constantly updated with new technical SEO features',
      'One of the best value paid tools in SEO',
    ],
    cons: [
      'Desktop application only — not cloud-based',
      'Steep learning curve for beginners',
      'Resource-intensive on large crawls',
      'No backlink or keyword data built-in',
    ],
    bestFor: 'Technical SEO professionals, site auditors, and developers who need granular crawl data.',
    verdict:
      'Every SEO professional should have Screaming Frog in their toolkit. Nothing else comes close for pure technical audit depth. The free tier is genuinely useful for small sites, and the paid licence is exceptional value at £259/year. The learning curve is real, but worth the investment.',
    keyFeatures: [
      { name: 'Full Site Crawl', description: 'Crawl any website and audit 100+ technical SEO issues.' },
      { name: 'JavaScript Rendering', description: 'Render JS-heavy pages to audit SPAs and dynamic content.' },
      { name: 'Structured Data', description: 'Extract and validate schema markup across your site.' },
      { name: 'GA4 & GSC Integration', description: 'Layer in real traffic and performance data during audits.' },
      { name: 'Custom Extraction', description: 'Extract any data point from pages using CSS selectors or XPath.' },
      { name: 'Log File Analysis', description: 'Import server log files to analyse Googlebot crawl behaviour.' },
    ],
    pricing: [
      { plan: 'Free', price: '£0', users: 1, projects: 'Unlimited', keywords: '500 URLs/crawl' },
      { plan: 'Paid Licence', price: '£259/yr', users: 1, projects: 'Unlimited', keywords: 'Unlimited URLs' },
    ],
    alternatives: ['semrush', 'se-ranking', 'ahrefs'],
  },
  'moz-pro': {
    name: 'Moz Pro',
    tagline: 'Trusted SEO metrics and link analysis platform',
    rating: 4.2,
    ratingBreakdown: { features: 4.0, value: 4.2, easeOfUse: 4.7, support: 4.3, dataQuality: 4.0 },
    badge: 'Best for DA/PA',
    badgeColor: '#06b6d4',
    category: 'All-in-One',
    price: 'From $99/mo',
    trialInfo: '30-day free trial',
    affiliateUrl: 'https://moz.com/products/pro',
    summary:
      "Moz Pro is a long-standing SEO platform best known for its Domain Authority (DA) and Page Authority (PA) metrics. It offers a solid all-round toolkit with a focus on beginner accessibility and link analysis.",
    pros: [
      'Trusted and widely-recognised DA metric',
      'Most beginner-friendly interface in the category',
      'Free MozBar Chrome extension',
      '30-day free trial — the longest in the category',
      'Strong educational resources and community',
      'Good local SEO features',
    ],
    cons: [
      'Smaller backlink index than Ahrefs or Semrush',
      'Keyword database less comprehensive than competitors',
      'Slower to release new features',
      'Site crawl limits on lower tiers',
    ],
    bestFor: 'Beginners, teams who rely on DA as a reporting metric, and those who want the longest free trial.',
    verdict:
      'Moz Pro is a solid choice for teams getting started with SEO or those who have workflows built around Domain Authority metrics. It is not the most powerful tool in the category, but its ease of use and 30-day trial make it a low-risk way to get started with a paid SEO platform.',
    keyFeatures: [
      { name: 'Keyword Explorer', description: 'Research keywords with difficulty, opportunity, and priority scores.' },
      { name: 'Link Explorer', description: 'Analyse domain authority, link profiles, and spam scores.' },
      { name: 'Rank Tracker', description: 'Track keyword rankings with SERP feature and location data.' },
      { name: 'Site Crawl', description: 'Technical audit identifying crawl errors, redirects, and metadata issues.' },
      { name: 'On-Page Grader', description: 'Page-level optimisation recommendations for target keywords.' },
      { name: 'MozBar', description: 'Free Chrome extension showing DA/PA metrics on any web page.' },
    ],
    pricing: [
      { plan: 'Starter', price: '$99/mo', users: 1, projects: 5, keywords: 50 },
      { plan: 'Standard', price: '$179/mo', users: 1, projects: 10, keywords: 300 },
      { plan: 'Medium', price: '$299/mo', users: 2, projects: 25, keywords: 700 },
    ],
    alternatives: ['semrush', 'ahrefs', 'se-ranking'],
  },
  mangools: {
    name: 'Mangools',
    tagline: 'Affordable keyword research & rank tracking suite',
    rating: 4.3,
    ratingBreakdown: { features: 4.1, value: 4.8, easeOfUse: 5.0, support: 4.4, dataQuality: 4.1 },
    badge: 'Easiest to Use',
    badgeColor: '#10b981',
    category: 'Keyword Research',
    price: 'From $29/mo',
    trialInfo: '10-day free trial',
    affiliateUrl: 'https://mangools.com',
    summary:
      'Mangools is a suite of five SEO tools — KWFinder, SERPChecker, SERPWatcher, LinkMiner, and SiteProfiler — designed with a beautiful interface and focus on ease of use. It delivers accurate local keyword data at a price point that is hard to beat.',
    pros: [
      'Most affordable full-suite option at $29/mo',
      'Beautiful, intuitive UI — easiest to learn',
      'KWFinder is among the best for local keyword research',
      'SERPChecker provides excellent SERP visualisation',
      'All five tools included in every plan',
      '10-day free trial',
    ],
    cons: [
      'Smaller backlink database than Ahrefs or Semrush',
      'No site audit or technical SEO features',
      'Limited API access',
      'Not suitable for large enterprise use cases',
    ],
    bestFor: 'Bloggers, affiliate marketers, small business owners, and freelancers who prioritise ease of use and value.',
    verdict:
      "Mangools punches above its weight for the price. KWFinder is one of the best tools for finding low-competition keywords, and the whole suite is a joy to use. If you're a solo operator or blogger who wants solid keyword and rank tracking without complexity, Mangools is hard to beat at $29/mo.",
    keyFeatures: [
      { name: 'KWFinder', description: 'Find low-competition keywords with accurate difficulty scores and local data.' },
      { name: 'SERPChecker', description: 'Analyse any SERP with visual competitor strength breakdowns.' },
      { name: 'SERPWatcher', description: 'Track keyword rankings with Dominance Index reporting.' },
      { name: 'LinkMiner', description: 'Backlink analysis and link prospecting tool.' },
      { name: 'SiteProfiler', description: 'Domain-level authority and competitive metrics overview.' },
    ],
    pricing: [
      { plan: 'Entry', price: '$29/mo', users: 1, projects: 'Unlimited', keywords: '100 lookups/day' },
      { plan: 'Basic', price: '$49/mo', users: 1, projects: 'Unlimited', keywords: '200 lookups/day' },
      { plan: 'Premium', price: '$69/mo', users: 3, projects: 'Unlimited', keywords: '500 lookups/day' },
    ],
    alternatives: ['se-ranking', 'moz-pro', 'semrush'],
  },
  spyfu: {
    name: 'SpyFu',
    tagline: 'Competitor keyword and PPC research tool',
    rating: 4.1,
    ratingBreakdown: { features: 4.0, value: 4.6, easeOfUse: 4.2, support: 3.9, dataQuality: 4.1 },
    badge: 'Best for Competitor Intel',
    badgeColor: '#f97316',
    category: 'Competitor Research',
    price: 'From $39/mo',
    trialInfo: 'Free plan with limited access',
    affiliateUrl: 'https://www.spyfu.com',
    summary:
      "SpyFu specialises in competitive intelligence — revealing the exact keywords your competitors rank for organically and what they're spending on Google Ads. It's especially powerful for PPC research alongside SEO.",
    pros: [
      'Deep organic and PPC competitor keyword data',
      'Historical keyword and ad data going back years',
      'Very affordable — from $39/mo',
      'Free plan with basic access',
      'Useful backlink outreach tools',
      'Good for US market data specifically',
    ],
    cons: [
      'Dated interface compared to modern tools',
      'Data quality weaker outside the US',
      'Limited technical SEO features',
      'Smaller dataset than Semrush or Ahrefs',
    ],
    bestFor: 'PPC managers, SEOs focused on competitive keyword research, and teams with mixed organic/paid search workflows.',
    verdict:
      "SpyFu is a niche tool that excels at competitive intelligence. If you want to know exactly what your competitors are doing in both organic and paid search, it's one of the most affordable ways to find out. Not a full SEO platform replacement, but a powerful research add-on.",
    keyFeatures: [
      { name: 'Competitor Keyword Research', description: 'See every keyword a competitor ranks for organically or bids on in PPC.' },
      { name: 'PPC Research', description: 'Analyse ad copy, budget estimates, and keyword spend for any domain.' },
      { name: 'Rank Tracking', description: 'Track keyword positions with daily updates.' },
      { name: 'Backlink Research', description: 'Identify backlink opportunities from competitor link profiles.' },
      { name: 'SERP Analysis', description: 'View historical ranking data for any keyword.' },
    ],
    pricing: [
      { plan: 'Basic', price: '$39/mo', users: 1, projects: 'Unlimited', keywords: 'Unlimited searches' },
      { plan: 'Professional', price: '$79/mo', users: 5, projects: 'Unlimited', keywords: 'Unlimited + API' },
    ],
    alternatives: ['semrush', 'se-ranking', 'ahrefs'],
  },
}

type PricingRow = {
  plan: string
  price: string
  users: number | string
  projects: number | string
  keywords: number | string
}

type ToolData = {
  name: string
  tagline: string
  rating: number
  ratingBreakdown: Record<string, number>
  badge: string
  badgeColor: string
  category: string
  price: string
  trialInfo: string
  affiliateUrl: string
  summary: string
  pros: string[]
  cons: string[]
  bestFor: string
  verdict: string
  keyFeatures: { name: string; description: string }[]
  pricing: PricingRow[]
  alternatives: string[]
}

// ─── Generate static params ───────────────────────────────────────────────────

export function generateStaticParams() {
  return Object.keys(tools).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const tool = tools[slug]
  if (!tool) return {}
  return {
    title: `${tool.name} Review ${new Date().getFullYear()} — Is It Worth It? | SaySEO`,
    description: `In-depth ${tool.name} review: pricing, features, pros & cons, and who it's best for. ${tool.tagline}.`,
    alternates: { canonical: `https://sayseo.co.uk/reviews/${slug}` },
    openGraph: {
      title: `${tool.name} Review | SaySEO`,
      description: `Honest ${tool.name} review with pricing breakdown, key features, and our verdict.`,
      url: `https://sayseo.co.uk/reviews/${slug}`,
      locale: 'en_GB',
    },
  }
}

// ─── Components ───────────────────────────────────────────────────────────────

function Stars({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'lg' ? 18 : size === 'sm' ? 12 : 14
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} width={dim} height={dim} viewBox="0 0 24 24" fill={star <= Math.floor(rating) ? '#f59e0b' : star - 0.5 <= rating ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="1.5" aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className={`font-bold text-white/70 ml-1 ${size === 'lg' ? 'text-base' : 'text-[0.8125rem]'}`}>{rating}/5</span>
    </div>
  )
}

function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[0.8125rem] text-white/50 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-[#00D4AA]"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
      <span className="text-[0.8125rem] font-bold text-white/60 w-6 text-right">{value}</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tool = tools[slug]
  if (!tool) notFound()

  const altTools = tool.alternatives
    .filter((s) => tools[s])
    .map((s) => ({ slug: s, ...tools[s] }))

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <AffiliateNav />

      {/* ── Breadcrumb ─────────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 pt-6 pb-2">
        <nav className="flex items-center gap-1.5 text-[0.8125rem] text-white/35">
          <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/reviews" className="hover:text-white/60 transition-colors">Reviews</Link>
          <span>/</span>
          <span className="text-white/55">{tool.name}</span>
        </nav>
      </div>

      {/* ── Hero ───────────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pt-8 pb-12">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <span
                className="px-3 py-1 rounded-full text-[0.75rem] font-bold text-[#0A0A0A]"
                style={{ backgroundColor: tool.badgeColor }}
              >
                {tool.badge}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/[0.06] text-[0.75rem] text-white/45">
                {tool.category}
              </span>
            </div>
            <h1 className="text-[clamp(2rem,5vw,3rem)] font-extrabold text-white tracking-[-0.03em] leading-tight mb-2">
              {tool.name} Review
            </h1>
            <p className="text-[1rem] text-white/50">{tool.tagline}</p>
          </div>
        </div>

        {/* Rating + price + CTA row */}
        <div className="flex flex-wrap items-center gap-5 p-6 bg-[#111111] border border-white/[0.08] rounded-xl mb-8">
          <div>
            <Stars rating={tool.rating} size="lg" />
            <p className="text-[0.75rem] text-white/35 mt-1">Our rating</p>
          </div>
          <div className="h-10 w-px bg-white/[0.06] hidden sm:block" />
          <div>
            <p className="text-[0.9375rem] font-bold text-white">{tool.price}</p>
            <p className="text-[0.75rem] text-white/35 mt-0.5">{tool.trialInfo}</p>
          </div>
          <div className="h-10 w-px bg-white/[0.06] hidden sm:block" />
          <div className="flex gap-3 ml-auto">
            <a
              href={tool.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              id="try"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-[0.9375rem] font-bold text-[#0A0A0A] bg-[#00D4AA] hover:opacity-88 transition-opacity"
            >
              Try {tool.name} Free
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>

        {/* Summary */}
        <p className="text-[1.0625rem] text-white/55 leading-[1.8]">{tool.summary}</p>
      </section>

      {/* ── Pros & Cons ────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-[#111111] border border-[#00D4AA]/15 rounded-xl p-6">
            <h2 className="text-[0.9375rem] font-bold text-[#00D4AA] mb-4">What we like</h2>
            <ul className="space-y-3">
              {tool.pros.map((pro) => (
                <li key={pro} className="flex items-start gap-2.5 text-[0.9rem] text-white/65">
                  <svg className="w-4 h-4 text-[#00D4AA] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {pro}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#111111] border border-red-500/15 rounded-xl p-6">
            <h2 className="text-[0.9375rem] font-bold text-red-400/80 mb-4">What to watch out for</h2>
            <ul className="space-y-3">
              {tool.cons.map((con) => (
                <li key={con} className="flex items-start gap-2.5 text-[0.9rem] text-white/65">
                  <svg className="w-4 h-4 text-red-400/70 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {con}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Rating Breakdown ───────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <div className="bg-[#111111] border border-white/[0.08] rounded-xl p-7">
          <h2 className="text-[1.0625rem] font-bold text-white mb-6">Rating breakdown</h2>
          <div className="space-y-4">
            {Object.entries(tool.ratingBreakdown).map(([label, value]) => (
              <RatingBar
                key={label}
                label={label.replace(/([A-Z])/g, ' $1').replace(/^\w/, (c) => c.toUpperCase())}
                value={value}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Key Features ───────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <h2 className="text-[1.25rem] font-bold text-white mb-6 tracking-[-0.015em]">Key features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tool.keyFeatures.map((f) => (
            <div key={f.name} className="bg-[#111111] border border-white/[0.07] rounded-xl p-5">
              <h3 className="text-[0.9375rem] font-bold text-white mb-1.5">{f.name}</h3>
              <p className="text-[0.875rem] text-white/45 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <h2 className="text-[1.25rem] font-bold text-white mb-6 tracking-[-0.015em]">Pricing</h2>
        <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
          <table className="w-full text-[0.875rem]">
            <thead>
              <tr className="border-b border-white/[0.07] bg-[#111111]">
                <th className="text-left px-5 py-3.5 text-white/45 font-semibold">Plan</th>
                <th className="text-left px-5 py-3.5 text-white/45 font-semibold">Price</th>
                <th className="text-left px-5 py-3.5 text-white/45 font-semibold">Users</th>
                <th className="text-left px-5 py-3.5 text-white/45 font-semibold">Projects</th>
                <th className="text-left px-5 py-3.5 text-white/45 font-semibold">Keywords / Limit</th>
              </tr>
            </thead>
            <tbody>
              {tool.pricing.map((row, i) => (
                <tr key={row.plan} className={`border-b border-white/[0.05] ${i % 2 === 0 ? 'bg-[#0E0E0E]' : 'bg-[#111111]'}`}>
                  <td className="px-5 py-3.5 font-semibold text-white">{row.plan}</td>
                  <td className="px-5 py-3.5 text-[#00D4AA] font-bold">{row.price}</td>
                  <td className="px-5 py-3.5 text-white/55">{row.users}</td>
                  <td className="px-5 py-3.5 text-white/55">{row.projects}</td>
                  <td className="px-5 py-3.5 text-white/55">{row.keywords}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[0.75rem] text-white/30 mt-3">Pricing accurate as of 2026. Check the tool's website for current rates.</p>
      </section>

      {/* ── Best for + Verdict ─────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-[#111111] border border-white/[0.08] rounded-xl p-6">
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-[#00D4AA] mb-3">Best for</p>
            <p className="text-[0.9375rem] text-white/70 leading-relaxed">{tool.bestFor}</p>
          </div>
          <div
            className="bg-[#111111] border border-[#00D4AA]/20 rounded-xl p-6"
            style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(0,212,170,0.05) 0%, transparent 60%), #111111' }}
          >
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-[#00D4AA] mb-3">Our verdict</p>
            <p className="text-[0.9375rem] text-white/70 leading-relaxed italic">{tool.verdict}</p>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div
          className="rounded-2xl p-10 text-center border border-[#00D4AA]/22 flex flex-col items-center"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,212,170,0.07) 0%, transparent 70%), #111111' }}
        >
          <h2 className="text-[1.5rem] font-extrabold text-white tracking-[-0.025em] mb-2">
            Ready to try {tool.name}?
          </h2>
          <p className="text-[0.9375rem] text-white/45 mb-7">{tool.trialInfo}</p>
          <a
            href={tool.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg text-[0.9375rem] font-bold text-[#0A0A0A] bg-[#00D4AA] hover:opacity-88 transition-opacity"
          >
            Get Started with {tool.name}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <p className="text-[0.75rem] text-white/25 mt-3">
            Affiliate link — we may earn a commission at no cost to you.
          </p>
        </div>
      </section>

      {/* ── Alternatives ───────────────────────────────────────────────────────── */}
      {altTools.length > 0 && (
        <section className="border-t border-white/[0.05]">
          <div className="max-w-4xl mx-auto px-6 py-14">
            <h2 className="text-[1.25rem] font-bold text-white mb-6 tracking-[-0.015em]">
              Compare alternatives
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {altTools.map((alt) => (
                <Link
                  key={alt.slug}
                  href={`/reviews/${alt.slug}`}
                  className="flex flex-col gap-2 bg-[#111111] border border-white/[0.08] rounded-xl p-5 hover:border-[#00D4AA]/25 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{alt.name}</span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold text-[#0A0A0A]"
                      style={{ backgroundColor: alt.badgeColor }}
                    >
                      {alt.badge}
                    </span>
                  </div>
                  <Stars rating={alt.rating} size="sm" />
                  <p className="text-[0.8125rem] text-white/40">{alt.price}</p>
                  <span className="text-[0.875rem] font-semibold text-[#00D4AA] mt-1">Read review →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <AffiliateFooter />
    </div>
  )
}
