import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { AffiliateNav } from '@/components/affiliate/AffiliateNav'
import { AffiliateFooter } from '@/components/affiliate/AffiliateFooter'

type PlanTier = {
  name: string
  price: string
  annualPrice?: string
  users: string
  bestFor: string
  limits: string[]
  ctaLabel: string
  recommended?: boolean
}

type DecisionGuide = {
  title: string
  recommendation: string
}

type FAQItem = {
  question: string
  answer: string
}

type PricingPageData = {
  slug: string
  toolName: string
  badge: string
  badgeColor: string
  startingPrice: string
  trialInfo: string
  affiliateUrl: string
  heroSummary: string
  annualSavingsCallout: string
  promotion: string
  plans: PlanTier[]
  decisionGuide: DecisionGuide[]
  faqs: FAQItem[]
}

const pricingPages: Record<string, PricingPageData> = {
  semrush: {
    slug: 'semrush',
    toolName: 'Semrush',
    badge: 'Best Overall',
    badgeColor: '#00D4AA',
    startingPrice: 'From $139.95/mo',
    trialInfo: '7-day free trial available',
    affiliateUrl: 'https://www.semrush.com',
    heroSummary:
      'Semrush pricing starts at the premium end of the SEO software market, but it also covers far more workflows than most competitors. This guide breaks down every major Semrush plan, who each tier is really for, and when the extra spend is justified.',
    annualSavingsCallout:
      'Semrush annual billing typically works out cheaper than paying month to month, and the savings become more noticeable once you know you will keep the platform for ongoing SEO, PPC, and reporting work.',
    promotion:
      'The main Semrush entry offer is usually a short free trial. The real buying question is less about coupon hunting and more about choosing the smallest plan that still covers your projects and users.',
    plans: [
      {
        name: 'Pro',
        price: '$139.95/mo',
        annualPrice: 'Lower effective monthly rate on annual billing',
        users: '1 user',
        bestFor: 'Freelancers, consultants, and very small in-house teams.',
        limits: ['5 projects', '500 tracked keywords', 'Core research, audits, and reporting'],
        ctaLabel: 'Start Pro trial',
      },
      {
        name: 'Guru',
        price: '$249.95/mo',
        annualPrice: 'Lower effective monthly rate on annual billing',
        users: '3 users',
        bestFor: 'Growing agencies and in-house teams that need more collaboration.',
        limits: ['15 projects', '1,500 tracked keywords', 'Historical data and stronger content workflows'],
        ctaLabel: 'Try Guru',
        recommended: true,
      },
      {
        name: 'Business',
        price: '$499.95/mo',
        annualPrice: 'Lower effective monthly rate on annual billing',
        users: '5 users',
        bestFor: 'Agencies with multiple clients and large in-house SEO teams.',
        limits: ['40 projects', '5,000 tracked keywords', 'Larger reporting and workflow capacity'],
        ctaLabel: 'Explore Business',
      },
    ],
    decisionGuide: [
      {
        title: 'Choose Pro if you are the main operator',
        recommendation:
          'Pro is enough when one person is handling research, site audits, and reporting. If you are not sharing the tool widely, it is the safest starting point.',
      },
      {
        title: 'Choose Guru for the best balance',
        recommendation:
          'Guru is the best fit for most growing teams because it adds user capacity, project headroom, and better content-oriented workflows without jumping straight to enterprise pricing.',
      },
      {
        title: 'Choose Business when team capacity becomes the bottleneck',
        recommendation:
          'Business is justified when projects, tracked keywords, and shared access matter more than the headline subscription price.',
      },
    ],
    faqs: [
      {
        question: 'How much does Semrush cost in 2026?',
        answer:
          'Semrush starts at $139.95 per month for Pro, with Guru at $249.95 per month and Business at $499.95 per month before any annual-billing savings.',
      },
      {
        question: 'Which Semrush plan is best for agencies?',
        answer:
          'Guru is the best Semrush plan for many smaller agencies, while Business becomes more appropriate once user seats, project count, and tracked keywords start to constrain delivery.',
      },
      {
        question: 'Does Semrush offer a free trial?',
        answer:
          'Yes. Semrush commonly offers a short free trial, which is the best way to validate whether the workflow justifies the premium recurring cost.',
      },
      {
        question: 'Is annual Semrush billing cheaper?',
        answer:
          'Yes. Annual billing usually reduces the effective monthly cost, which matters most if you already know Semrush will be a long-term tool in your stack.',
      },
      {
        question: 'Is Semrush worth the price?',
        answer:
          'It is worth it when your team uses the broader suite for research, audits, reporting, and competitive intelligence. If you only need a narrower slice of SEO functionality, a cheaper alternative may be better value.',
      },
    ],
  },
  ahrefs: {
    slug: 'ahrefs',
    toolName: 'Ahrefs',
    badge: 'Best for Links',
    badgeColor: '#f59e0b',
    startingPrice: 'From $129/mo',
    trialInfo: '$7 for 7-day trial (Starter)',
    affiliateUrl: 'https://ahrefs.com',
    heroSummary:
      'Ahrefs pricing sits close to Semrush in premium territory, but the value proposition is different: you are paying for elite backlink and research depth rather than the broadest all-in-one marketing stack. This guide breaks down the current Ahrefs plans and who they suit best.',
    annualSavingsCallout:
      'Ahrefs annual billing generally lowers the effective monthly rate, which matters more if the platform is central to your long-term link building or content research workflow.',
    promotion:
      'Ahrefs usually leads with a low-cost trial-style entry rather than a generous free trial. Treat that as a test window to confirm the data depth is worth the premium spend.',
    plans: [
      {
        name: 'Lite',
        price: '$129/mo',
        annualPrice: 'Lower effective monthly rate on annual billing',
        users: '1 user',
        bestFor: 'Solo SEOs and small teams focused on core research.',
        limits: ['5 projects', '750 tracked keywords', 'Core backlink, keyword, and site audit features'],
        ctaLabel: 'Try Lite',
      },
      {
        name: 'Standard',
        price: '$249/mo',
        annualPrice: 'Lower effective monthly rate on annual billing',
        users: '1 user',
        bestFor: 'Content and SEO teams that need deeper project capacity.',
        limits: ['20 projects', '2,000 tracked keywords', 'Stronger room for ongoing research workflows'],
        ctaLabel: 'Try Standard',
        recommended: true,
      },
      {
        name: 'Advanced',
        price: '$449/mo',
        annualPrice: 'Lower effective monthly rate on annual billing',
        users: '3 users',
        bestFor: 'Teams that need more seats and significantly more tracking headroom.',
        limits: ['50 projects', '5,000 tracked keywords', 'Better fit for shared team usage'],
        ctaLabel: 'Explore Advanced',
      },
    ],
    decisionGuide: [
      {
        title: 'Choose Lite if one person owns the workflow',
        recommendation:
          'Lite is the easiest way to access Ahrefs without overspending, especially if backlinks and keyword research are the main jobs.',
      },
      {
        title: 'Choose Standard for serious day-to-day use',
        recommendation:
          'Standard is the best plan for most content and SEO teams because it gives you enough project and tracking room to use Ahrefs as an always-on research platform.',
      },
      {
        title: 'Choose Advanced when collaboration and tracking scale matter',
        recommendation:
          'Advanced makes sense once multiple users and a much larger keyword footprint are essential to the way your team works.',
      },
    ],
    faqs: [
      {
        question: 'How much does Ahrefs cost in 2026?',
        answer:
          'Ahrefs starts at $129 per month for Lite, with Standard at $249 per month and Advanced at $449 per month before annual-billing savings.',
      },
      {
        question: 'Which Ahrefs plan is best for most teams?',
        answer:
          'Standard is the best Ahrefs plan for most teams because it offers the most balanced mix of project capacity and tracking headroom without jumping to the higher enterprise-style spend.',
      },
      {
        question: 'Does Ahrefs offer a free trial?',
        answer:
          'Ahrefs usually uses a low-cost limited trial-style entry rather than a broad free trial, so you should use that period to validate whether the data depth is worth the price.',
      },
      {
        question: 'Is Ahrefs cheaper than Semrush?',
        answer:
          'At entry level, Ahrefs is slightly cheaper on paper, but the better value depends on whether you need broader workflows like PPC research and reporting or mainly care about research depth.',
      },
      {
        question: 'Is Ahrefs worth paying for?',
        answer:
          'Ahrefs is worth the price when backlinks, keyword research, and content gap analysis are central to your SEO workflow. If you need a broader suite, another platform may justify the spend better.',
      },
    ],
  },
  'moz-pro': {
    slug: 'moz-pro',
    toolName: 'Moz Pro',
    badge: 'Best for DA',
    badgeColor: '#06b6d4',
    startingPrice: 'From $99/mo',
    trialInfo: '30-day free trial',
    affiliateUrl: 'https://moz.com/products/pro',
    heroSummary:
      'Moz Pro pricing is easier to enter than Semrush or Ahrefs, and its long trial makes it one of the lower-risk premium platforms to test. This page explains the main Moz Pro plans, what each tier is good at, and where the value starts to drop off.',
    annualSavingsCallout:
      'Moz Pro annual billing generally improves the effective monthly cost, which can matter if you rely on DA-led reporting and want to minimize long-term spend.',
    promotion:
      'Moz Pro usually stands out more for its generous 30-day free trial than for aggressive discounts, which makes it easier to test before you commit.',
    plans: [
      {
        name: 'Starter',
        price: '$99/mo',
        annualPrice: 'Lower effective monthly rate on annual billing',
        users: '1 user',
        bestFor: 'Beginners and smaller businesses entering paid SEO software.',
        limits: ['5 projects', '50 tracked keywords', 'Core keyword, link, and audit workflows'],
        ctaLabel: 'Start Starter trial',
      },
      {
        name: 'Standard',
        price: '$179/mo',
        annualPrice: 'Lower effective monthly rate on annual billing',
        users: '1 user',
        bestFor: 'Smaller teams that need more campaign headroom.',
        limits: ['10 projects', '300 tracked keywords', 'Better balance for recurring SEO work'],
        ctaLabel: 'Try Standard',
        recommended: true,
      },
      {
        name: 'Medium',
        price: '$299/mo',
        annualPrice: 'Lower effective monthly rate on annual billing',
        users: '2 users',
        bestFor: 'Teams that need more tracking and another seat without moving to bigger enterprise platforms.',
        limits: ['25 projects', '700 tracked keywords', 'More room for agencies or multi-site teams'],
        ctaLabel: 'Explore Medium',
      },
    ],
    decisionGuide: [
      {
        title: 'Choose Starter if you are trialing paid SEO software',
        recommendation:
          'Starter is the right entry plan when you want Moz Pro’s beginner-friendly workflow and do not yet need heavy tracking or lots of projects.',
      },
      {
        title: 'Choose Standard for the best value',
        recommendation:
          'Standard is the best Moz Pro plan for most serious small teams because it fixes the tightest Starter limits without pushing pricing too high.',
      },
      {
        title: 'Choose Medium when tracking limits matter more than entry price',
        recommendation:
          'Medium is justified when you need more keyword and project capacity plus an additional user seat, especially in agency-style environments.',
      },
    ],
    faqs: [
      {
        question: 'How much does Moz Pro cost in 2026?',
        answer:
          'Moz Pro starts at $99 per month for Starter, with Standard at $179 per month and Medium at $299 per month before annual-billing savings.',
      },
      {
        question: 'Does Moz Pro offer a free trial?',
        answer:
          'Yes. Moz Pro commonly offers a 30-day free trial, which is one of the longest trials in the premium SEO software category.',
      },
      {
        question: 'Which Moz Pro plan is best for small businesses?',
        answer:
          'Starter can be enough for very small teams, but Standard is usually the better long-term choice once ongoing keyword tracking and multiple projects become important.',
      },
      {
        question: 'Is Moz Pro cheaper than Semrush and Ahrefs?',
        answer:
          'Yes, Moz Pro starts lower than both Semrush and Ahrefs, although the trade-off is lighter overall data depth and platform breadth.',
      },
      {
        question: 'Is Moz Pro worth it?',
        answer:
          'Moz Pro is worth it for buyers who want a more approachable interface, rely on Domain Authority, and value the lower-risk trial period. Power users may outgrow it faster.',
      },
    ],
  },
  'se-ranking': {
    slug: 'se-ranking',
    toolName: 'SE Ranking',
    badge: 'Best Value',
    badgeColor: '#8b5cf6',
    startingPrice: 'From $65/mo',
    trialInfo: '14-day free trial, no card required',
    affiliateUrl: 'https://seranking.com',
    heroSummary:
      'SE Ranking pricing is where the platform stands out most clearly. It aims to give smaller teams a true all-in-one SEO suite without forcing them into Semrush or Ahrefs-level spend. This guide breaks down the main plans and where the value is strongest.',
    annualSavingsCallout:
      'SE Ranking annual billing usually improves the effective monthly cost significantly, which is a big part of why the platform feels so competitive on value.',
    promotion:
      'The standout offer here is the 14-day free trial with no credit card, which makes SE Ranking one of the easiest premium platforms to test without purchase friction.',
    plans: [
      {
        name: 'Essential',
        price: '$65/mo',
        annualPrice: 'Lower effective monthly rate on annual billing',
        users: '1 user',
        bestFor: 'Freelancers and solo consultants.',
        limits: ['10 projects', '750 tracked keywords', 'Strong entry-level all-in-one coverage'],
        ctaLabel: 'Start Essential trial',
      },
      {
        name: 'Pro',
        price: '$119/mo',
        annualPrice: 'Lower effective monthly rate on annual billing',
        users: '3 users',
        bestFor: 'Small agencies and growing in-house teams.',
        limits: ['30 projects', '2,000 tracked keywords', 'Better collaboration and workflow flexibility'],
        ctaLabel: 'Try Pro',
        recommended: true,
      },
      {
        name: 'Business',
        price: '$259/mo',
        annualPrice: 'Lower effective monthly rate on annual billing',
        users: '5 users',
        bestFor: 'Larger agencies and teams that need more capacity without paying top-tier suite prices.',
        limits: ['Unlimited projects', '5,000 tracked keywords', 'Much more headroom for scale'],
        ctaLabel: 'Explore Business',
      },
    ],
    decisionGuide: [
      {
        title: 'Choose Essential if you are the main delivery owner',
        recommendation:
          'Essential is strong value when one person needs a complete SEO toolkit without heavy collaboration requirements.',
      },
      {
        title: 'Choose Pro for the best overall buy',
        recommendation:
          'Pro is the best SE Ranking plan for most teams because it opens up more users, more projects, and more keyword headroom while still staying well below many premium competitors.',
      },
      {
        title: 'Choose Business when capacity is the real driver',
        recommendation:
          'Business is the right move once project scale and tracked keyword volume matter more than keeping entry cost as low as possible.',
      },
    ],
    faqs: [
      {
        question: 'How much does SE Ranking cost in 2026?',
        answer:
          'SE Ranking starts at $65 per month for Essential, with Pro at $119 per month and Business at $259 per month before annual-billing savings.',
      },
      {
        question: 'Does SE Ranking offer a free trial?',
        answer:
          'Yes. SE Ranking offers a 14-day free trial with no credit card, which makes it one of the easiest all-in-one SEO platforms to test.',
      },
      {
        question: 'Which SE Ranking plan is best for agencies?',
        answer:
          'Pro is the best fit for many smaller agencies, while Business is the better choice once you need more user seats, more tracked keywords, and larger project capacity.',
      },
      {
        question: 'Is SE Ranking cheaper than Semrush?',
        answer:
          'Yes. SE Ranking is substantially cheaper than Semrush at every core tier, which is a big reason it is often recommended as the best-value alternative.',
      },
      {
        question: 'Is SE Ranking worth it?',
        answer:
          'SE Ranking is worth it for buyers who want a broad SEO toolkit at a much lower price than the leading premium suites, especially freelancers, small agencies, and SMBs.',
      },
    ],
  },
}

export function generateStaticParams() {
  return Object.keys(pricingPages).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const page = pricingPages[slug]

  if (!page) return {}

  const title = `${page.toolName} Pricing ${new Date().getFullYear()} — All Plans Explained | SaySEO`
  const description = `Compare ${page.toolName} pricing plans, annual savings, trial details, and the best plan for your SEO workflow.`

  return {
    title,
    description,
    alternates: { canonical: `https://sayseo.co.uk/pricing/${slug}` },
    openGraph: {
      title,
      description,
      url: `https://sayseo.co.uk/pricing/${slug}`,
      locale: 'en_GB',
    },
  }
}

function ToolCta({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors"
    >
      {label}
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  )
}

export default async function PricingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = pricingPages[slug]

  if (!page) notFound()

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <AffiliateNav />

      {/* Page header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-8">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
            <Link href="/" className="hover:text-emerald-700 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-600">Pricing</span>
            <span>/</span>
            <span className="text-gray-600 font-medium">{page.toolName}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 uppercase tracking-[0.1em]">Pricing</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: page.badgeColor }}>{page.badge}</span>
          </div>
          <h1 className="text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
            {page.toolName} Pricing {new Date().getFullYear()} — All Plans Explained
          </h1>
          <p className="text-base text-gray-500 leading-relaxed max-w-3xl">{page.heroSummary}</p>
        </div>
      </div>

      <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,0.8fr] gap-5">
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-7">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700 mb-3">Annual vs Monthly</p>
            <p className="text-sm text-gray-700 leading-relaxed">{page.annualSavingsCallout}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-gray-400 mb-4">Current Offer</p>
            <p className="text-base font-bold text-gray-900 mb-1">{page.startingPrice}</p>
            <p className="text-xs text-emerald-700 font-medium mb-3">{page.trialInfo}</p>
            <p className="text-sm text-gray-600 leading-relaxed mb-5">{page.promotion}</p>
            <ToolCta label={`Try ${page.toolName}`} href={page.affiliateUrl} />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 pb-12">
        <h2 className="text-lg font-bold text-gray-900 mb-6 tracking-tight">Plan Breakdown</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {page.plans.map((plan) => (
            <div key={plan.name} className={`rounded-2xl border p-6 shadow-sm ${plan.recommended ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="text-base font-bold text-gray-900">{plan.name}</h3>
                {plan.recommended && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-[0.65rem] font-bold text-emerald-700">Best value</span>
                )}
              </div>
              <p className="text-2xl font-extrabold text-gray-900 tracking-tight mb-1">{plan.price}</p>
              {plan.annualPrice && <p className="text-xs text-gray-400 mb-4">{plan.annualPrice}</p>}
              <div className="space-y-2 text-sm text-gray-600 mb-5">
                <p><span className="font-semibold text-gray-800">Users:</span> {plan.users}</p>
                <p><span className="font-semibold text-gray-800">Best for:</span> {plan.bestFor}</p>
              </div>
              <ul className="space-y-2.5 mb-6">
                {plan.limits.map((limit) => (
                  <li key={limit} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {limit}
                  </li>
                ))}
              </ul>
              <ToolCta label={plan.ctaLabel} href={page.affiliateUrl} />
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 pb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-6 tracking-tight">Which plan should I choose?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {page.decisionGuide.map((item) => (
            <div key={item.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-2.5">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.recommendation}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 pb-10">
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8">
          <h2 className="text-base font-bold text-gray-900 mb-3">Best buying advice</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            Start with the smallest plan that comfortably covers your real project, tracking, and user requirements. Most teams overspend when they buy for imaginary future complexity instead of current workflow needs.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 pb-12">
        <h2 className="text-lg font-bold text-gray-900 mb-6 tracking-tight">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {page.faqs.map((faq) => (
            <div key={faq.question} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight mb-3">Compare before you commit</h2>
          <p className="text-sm text-gray-500 mb-7 max-w-2xl mx-auto">
            Pricing is only one part of the decision. Use our reviews and comparison pages to make sure the cheapest plan is also the right strategic fit.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/reviews" className="inline-flex items-center px-6 py-3 rounded-lg text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-sm">Browse reviews</Link>
            <Link href="/comparisons" className="inline-flex items-center px-6 py-3 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">Browse comparisons</Link>
          </div>
        </div>
      </section>

      <AffiliateFooter />
    </div>
  )
}
