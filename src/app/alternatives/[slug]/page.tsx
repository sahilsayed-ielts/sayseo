import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { AffiliateNav } from '@/components/affiliate/AffiliateNav'
import { AffiliateFooter } from '@/components/affiliate/AffiliateFooter'

type ToolProfile = {
  name: string
  reviewSlug: string
  badge: string
  badgeColor: string
  rating: number
  price: string
  trialInfo: string
  affiliateUrl: string
  bestFor: string
}

type AlternativeOption = {
  tool: ToolProfile
  title: string
  summary: string
  switchReason: string
  caution: string
}

type ComparisonRow = {
  toolName: string
  price: string
  bestFor: string
  edge: string
  tradeoff: string
}

type QuickPick = {
  useCase: string
  winner: ToolProfile
  reason: string
}

type FAQItem = {
  question: string
  answer: string
}

type AlternativesPageData = {
  slug: string
  targetName: string
  original: ToolProfile
  heroSummary: string
  switchReasons: string[]
  buyingChecklist: string[]
  alternatives: AlternativeOption[]
  comparisonRows: ComparisonRow[]
  quickPicks: QuickPick[]
  verdict: string
  faqs: FAQItem[]
}

const toolProfiles = {
  semrush: {
    name: 'Semrush',
    reviewSlug: 'semrush',
    badge: 'Best Overall',
    badgeColor: '#00D4AA',
    rating: 4.8,
    price: 'From $139.95/mo',
    trialInfo: '7-day free trial available',
    affiliateUrl: 'https://www.semrush.com',
    bestFor: 'Agencies, in-house teams, and buyers who want one broad SEO platform.',
  },
  ahrefs: {
    name: 'Ahrefs',
    reviewSlug: 'ahrefs',
    badge: 'Best for Links',
    badgeColor: '#f59e0b',
    rating: 4.7,
    price: 'From $129/mo',
    trialInfo: '$7 for 7-day trial (Starter)',
    affiliateUrl: 'https://ahrefs.com',
    bestFor: 'Link builders and research-heavy SEOs.',
  },
  'se-ranking': {
    name: 'SE Ranking',
    reviewSlug: 'se-ranking',
    badge: 'Best Value',
    badgeColor: '#8b5cf6',
    rating: 4.5,
    price: 'From $65/mo',
    trialInfo: '14-day free trial, no card required',
    affiliateUrl: 'https://seranking.com',
    bestFor: 'Freelancers, small agencies, and budget-aware teams.',
  },
  'surfer-seo': {
    name: 'Surfer SEO',
    reviewSlug: 'surfer-seo',
    badge: 'Best for Content',
    badgeColor: '#3b82f6',
    rating: 4.4,
    price: 'From $99/mo',
    trialInfo: '7-day money-back guarantee',
    affiliateUrl: 'https://surferseo.com',
    bestFor: 'Content-led SEO teams that need page-level optimization help.',
  },
  'screaming-frog': {
    name: 'Screaming Frog',
    reviewSlug: 'screaming-frog',
    badge: 'Best Technical',
    badgeColor: '#ef4444',
    rating: 4.6,
    price: 'Free / £259/yr',
    trialInfo: 'Free version crawls up to 500 URLs',
    affiliateUrl: 'https://www.screamingfrog.co.uk/seo-spider/',
    bestFor: 'Technical SEO professionals and developers.',
  },
  'moz-pro': {
    name: 'Moz Pro',
    reviewSlug: 'moz-pro',
    badge: 'Best for DA',
    badgeColor: '#06b6d4',
    rating: 4.2,
    price: 'From $99/mo',
    trialInfo: '30-day free trial',
    affiliateUrl: 'https://moz.com/products/pro',
    bestFor: 'Beginners and teams that rely on Domain Authority.',
  },
  mangools: {
    name: 'Mangools',
    reviewSlug: 'mangools',
    badge: 'Easiest to Use',
    badgeColor: '#10b981',
    rating: 4.3,
    price: 'From $29/mo',
    trialInfo: '10-day free trial',
    affiliateUrl: 'https://mangools.com',
    bestFor: 'Bloggers and solo operators who want simple keyword research.',
  },
  spyfu: {
    name: 'SpyFu',
    reviewSlug: 'spyfu',
    badge: 'Best for Competitor Intel',
    badgeColor: '#f97316',
    rating: 4.1,
    price: 'From $39/mo',
    trialInfo: 'Free plan with limited access',
    affiliateUrl: 'https://www.spyfu.com',
    bestFor: 'PPC managers and competitor researchers.',
  },
} satisfies Record<string, ToolProfile>

const alternativesPages: Record<string, AlternativesPageData> = {
  semrush: {
    slug: 'semrush',
    targetName: 'Semrush',
    original: toolProfiles.semrush,
    heroSummary:
      'Semrush is one of the strongest all-in-one SEO platforms on the market, but it is not the right fit for every budget or workflow. If you want lower cost, cleaner research UX, or a more specialized setup, these are the best Semrush alternatives to consider in 2026.',
    switchReasons: [
      'You need a lower monthly cost than Semrush can justify.',
      'You mainly care about backlinks or keyword research rather than a full marketing suite.',
      'Your workflow is simpler than Semrush and you are paying for features you do not use.',
    ],
    buyingChecklist: [
      'Decide whether you want another all-in-one suite or a more focused specialist tool.',
      'Check whether you need PPC data, agency reporting, content tooling, or technical auditing in the same subscription.',
      'Prioritize data depth, ease of use, or price before comparing headline feature counts.',
    ],
    alternatives: [
      {
        tool: toolProfiles['se-ranking'],
        title: 'Best Semrush alternative for value-conscious teams',
        summary:
          'SE Ranking is the most practical Semrush alternative for freelancers, small agencies, and in-house teams that want a complete SEO platform without premium-tool pricing. You still get rank tracking, site audits, backlink monitoring, competitor research, and reporting, but in a lighter and much more affordable package. It does not match Semrush for dataset breadth or PPC intelligence, yet it gets closer than most budget alternatives.',
        switchReason:
          'Switch to SE Ranking if Semrush feels too expensive for the workflows you actually use each week.',
        caution:
          'You will give up some competitive traffic depth, content tooling, and broader marketing intelligence.',
      },
      {
        tool: toolProfiles.ahrefs,
        title: 'Best Semrush alternative for backlink and content research',
        summary:
          'Ahrefs is the strongest alternative if you are leaving Semrush because you care more about research purity than platform breadth. Its backlink database, keyword difficulty logic, and content discovery workflows remain elite. Many experienced SEOs prefer it when links, content gaps, and competitive keyword intelligence drive the whole strategy.',
        switchReason:
          'Switch to Ahrefs if you want better link intelligence and a cleaner research-first experience.',
        caution:
          'Ahrefs is not dramatically cheaper, and it does not replace Semrush for PPC research or broader reporting needs.',
      },
      {
        tool: toolProfiles['moz-pro'],
        title: 'Best Semrush alternative for beginners',
        summary:
          'Moz Pro is the easier alternative for teams that find Semrush overwhelming. It offers a gentler interface, useful core SEO workflows, and the familiar Domain Authority metric that many stakeholders still understand immediately. It is not the most powerful substitute, but it is much easier to adopt if your team values clarity over raw feature depth.',
        switchReason:
          'Switch to Moz Pro if usability, onboarding, and a long free trial matter more than all-in-one power.',
        caution:
          'Moz Pro will feel like a step down in database depth if you rely heavily on competitor or backlink research.',
      },
      {
        tool: toolProfiles.mangools,
        title: 'Best Semrush alternative for solo operators',
        summary:
          'Mangools is a very different kind of Semrush alternative. It wins by being simple, affordable, and pleasant to use rather than by matching enterprise breadth. For bloggers, niche site builders, and affiliate marketers who mostly need keyword research, SERP analysis, and rank tracking, that trade-off is often exactly the point.',
        switchReason:
          'Switch to Mangools if you want a lightweight keyword-focused stack instead of an enterprise-style dashboard.',
        caution:
          'Mangools does not give you the site audit depth or all-in-one coverage that Semrush buyers are used to.',
      },
      {
        tool: toolProfiles.spyfu,
        title: 'Best Semrush alternative for competitor and PPC intel',
        summary:
          'SpyFu is worth considering if your favorite part of Semrush is competitive intelligence rather than the full SEO stack. It is especially useful for keyword overlap, ad history, and PPC monitoring at a much lower price point. For US-focused teams that care about competitor research first, it can be a smart downsized replacement.',
        switchReason:
          'Switch to SpyFu if you mainly used Semrush for competitor keywords and paid search research.',
        caution:
          'SpyFu is not a true all-in-one replacement for Semrush across technical SEO, content, and reporting.',
      },
    ],
    comparisonRows: [
      { toolName: 'Semrush', price: 'From $139.95/mo', bestFor: 'Broad all-in-one workflows', edge: 'Best overall feature breadth', tradeoff: 'Premium price and steeper learning curve' },
      { toolName: 'SE Ranking', price: 'From $65/mo', bestFor: 'Freelancers and SMBs', edge: 'Best value replacement', tradeoff: 'Smaller datasets than Semrush' },
      { toolName: 'Ahrefs', price: 'From $129/mo', bestFor: 'Links and research', edge: 'Best backlink and content research', tradeoff: 'Less broad than Semrush' },
      { toolName: 'Moz Pro', price: 'From $99/mo', bestFor: 'Beginners', edge: 'Best onboarding and DA familiarity', tradeoff: 'Lighter data depth' },
      { toolName: 'Mangools', price: 'From $29/mo', bestFor: 'Solo users', edge: 'Best lightweight budget option', tradeoff: 'Not a full-suite replacement' },
      { toolName: 'SpyFu', price: 'From $39/mo', bestFor: 'Competitor intel', edge: 'Best low-cost PPC competitor research', tradeoff: 'Narrower SEO coverage' },
    ],
    quickPicks: [
      { useCase: 'Best Semrush alternative for budget', winner: toolProfiles['se-ranking'], reason: 'It covers the widest set of core SEO workflows at the biggest discount versus Semrush.' },
      { useCase: 'Best Semrush alternative for backlinks', winner: toolProfiles.ahrefs, reason: 'Its backlink database and research workflows are the strongest direct upgrade path for link-focused SEOs.' },
      { useCase: 'Best Semrush alternative for beginners', winner: toolProfiles['moz-pro'], reason: 'It is easier to learn and less intimidating for smaller teams.' },
      { useCase: 'Best Semrush alternative for solo creators', winner: toolProfiles.mangools, reason: 'It strips away the enterprise sprawl and keeps the keyword workflow simple.' },
    ],
    verdict:
      'SE Ranking is the best Semrush alternative for most buyers because it balances breadth and affordability better than anything else in this reviewed set. Ahrefs is the stronger pick if your switch is driven by links and research rather than price.',
    faqs: [
      {
        question: 'What is the best Semrush alternative overall?',
        answer:
          'SE Ranking is the best overall Semrush alternative for most buyers because it preserves the all-in-one model while cutting the monthly cost sharply.',
      },
      {
        question: 'Which Semrush alternative is best for backlinks?',
        answer:
          'Ahrefs is the strongest Semrush alternative for backlink analysis and research-heavy SEO workflows.',
      },
      {
        question: 'Is there a cheaper alternative to Semrush?',
        answer:
          'Yes. SE Ranking, Mangools, and SpyFu are all meaningfully cheaper than Semrush, with SE Ranking being the closest all-round replacement.',
      },
      {
        question: 'Should beginners switch from Semrush to Moz Pro?',
        answer:
          'That can make sense if Semrush feels overwhelming and your team would benefit from a simpler interface and a longer trial period.',
      },
      {
        question: 'Can Ahrefs fully replace Semrush?',
        answer:
          'It can replace Semrush for many research-led SEO teams, but it will not cover Semrush PPC, broader market intelligence, and some reporting workflows in the same way.',
      },
    ],
  },
  ahrefs: {
    slug: 'ahrefs',
    targetName: 'Ahrefs',
    original: toolProfiles.ahrefs,
    heroSummary:
      'Ahrefs is a favorite among serious SEOs, but it is not always the best fit if you need broader platform coverage, a friendlier price point, or easier onboarding. These are the best Ahrefs alternatives for different buyer types in 2026.',
    switchReasons: [
      'You need a broader all-in-one SEO platform than Ahrefs provides.',
      'You want to cut recurring cost without losing every core workflow.',
      'Your team needs easier onboarding or more familiar reporting metrics.',
    ],
    buyingChecklist: [
      'Decide whether your replacement should beat Ahrefs on price, breadth, or ease of use.',
      'If backlinks are still your priority, make sure the alternative does not trade away too much research depth.',
      'Check whether you also need audits, reporting, or PPC data that Ahrefs does not emphasize.',
    ],
    alternatives: [
      {
        tool: toolProfiles.semrush,
        title: 'Best Ahrefs alternative for broader platform coverage',
        summary:
          'Semrush is the best Ahrefs alternative when your team needs a wider operating system around core SEO research. It adds stronger PPC research, traffic intelligence, content tooling, and agency-friendly reporting while still remaining very capable for backlinks and keywords. If Ahrefs feels too specialized, Semrush is usually the clearest next step.',
        switchReason:
          'Switch to Semrush if you want more workflows in one platform, especially around reporting and competitor intelligence.',
        caution:
          'Semrush can feel busier than Ahrefs, and some users still prefer Ahrefs specifically for link-first research.',
      },
      {
        tool: toolProfiles['se-ranking'],
        title: 'Best Ahrefs alternative for value',
        summary:
          'SE Ranking is the strongest lower-cost alternative for buyers who like the all-in-one model but cannot justify Ahrefs pricing. It handles rank tracking, audits, keyword research, and backlink monitoring well enough for many growing teams. You lose some research sharpness, but you gain much better price-to-feature efficiency.',
        switchReason:
          'Switch to SE Ranking if Ahrefs is stretching your budget more than its depth is helping your results.',
        caution:
          'It is not the best choice if backlink precision is the non-negotiable buying factor.',
      },
      {
        tool: toolProfiles['moz-pro'],
        title: 'Best Ahrefs alternative for easier adoption',
        summary:
          'Moz Pro is a sensible Ahrefs alternative when your team wants a more approachable platform. It keeps keyword research, link analysis, and site auditing accessible while benefiting from Domain Authority being familiar to many clients and stakeholders. It is the better fit when clarity matters more than maximum power.',
        switchReason:
          'Switch to Moz Pro if Ahrefs feels too advanced for your current workflow maturity.',
        caution:
          'Moz Pro is a downgrade in backlink depth and content research sophistication.',
      },
      {
        tool: toolProfiles.mangools,
        title: 'Best Ahrefs alternative for lightweight keyword workflows',
        summary:
          'Mangools is the best Ahrefs alternative for users who mostly need straightforward keyword research and ranking visibility. KWFinder and SERPChecker make it much easier to move quickly without the weight of a larger platform. For bloggers and affiliate marketers, that simpler daily experience can matter more than enterprise-grade depth.',
        switchReason:
          'Switch to Mangools if Ahrefs feels overbuilt for the way you actually do keyword work.',
        caution:
          'Mangools is not a realistic replacement for advanced backlink analysis or agency research workflows.',
      },
      {
        tool: toolProfiles.spyfu,
        title: 'Best Ahrefs alternative for competitor keyword spying',
        summary:
          'SpyFu is worth a look if your favorite part of Ahrefs is competitor keyword visibility and you also care about PPC overlap. It is cheaper, more focused, and especially useful for teams that want historical ad and keyword intelligence without paying for a full premium SEO suite.',
        switchReason:
          'Switch to SpyFu if you want lower-cost competitor keyword and ad intelligence.',
        caution:
          'It does not match Ahrefs as a comprehensive link and content research platform.',
      },
    ],
    comparisonRows: [
      { toolName: 'Ahrefs', price: 'From $129/mo', bestFor: 'Link and content research', edge: 'Best backlink specialist', tradeoff: 'Less broad than all-in-one suites' },
      { toolName: 'Semrush', price: 'From $139.95/mo', bestFor: 'Broader SEO teams', edge: 'Best all-in-one replacement', tradeoff: 'Slightly busier interface' },
      { toolName: 'SE Ranking', price: 'From $65/mo', bestFor: 'Budget-aware teams', edge: 'Best lower-cost suite', tradeoff: 'Less research depth' },
      { toolName: 'Moz Pro', price: 'From $99/mo', bestFor: 'Beginners', edge: 'Best onboarding and DA familiarity', tradeoff: 'Smaller index' },
      { toolName: 'Mangools', price: 'From $29/mo', bestFor: 'Bloggers', edge: 'Best simple keyword workflow', tradeoff: 'Limited technical and backlink depth' },
      { toolName: 'SpyFu', price: 'From $39/mo', bestFor: 'Competitor and PPC intel', edge: 'Best low-cost competitive spying', tradeoff: 'Not a full research platform' },
    ],
    quickPicks: [
      { useCase: 'Best Ahrefs alternative for all-round SEO', winner: toolProfiles.semrush, reason: 'It gives you the broadest platform upgrade around core research workflows.' },
      { useCase: 'Best Ahrefs alternative for budget', winner: toolProfiles['se-ranking'], reason: 'It cuts cost the most without abandoning the all-in-one model.' },
      { useCase: 'Best Ahrefs alternative for beginners', winner: toolProfiles['moz-pro'], reason: 'It is easier to learn and friendlier for less technical teams.' },
      { useCase: 'Best Ahrefs alternative for simple keyword work', winner: toolProfiles.mangools, reason: 'It keeps the workflow light and focused for solo users.' },
    ],
    verdict:
      'Semrush is the best Ahrefs alternative if your switch is about broader platform coverage. SE Ranking is the better alternative if the real problem is price rather than capability.',
    faqs: [
      {
        question: 'What is the best Ahrefs alternative?',
        answer:
          'Semrush is the best Ahrefs alternative for most teams that want broader SEO coverage, while SE Ranking is the strongest lower-cost alternative.',
      },
      {
        question: 'Which Ahrefs alternative is cheapest?',
        answer:
          'Mangools is the cheapest reviewed alternative here, but SE Ranking is usually the better value if you still need an all-in-one platform.',
      },
      {
        question: 'Is Semrush better than Ahrefs as an alternative?',
        answer:
          'It is better when you want broader SEO, PPC, and reporting workflows. Ahrefs still wins specifically for backlink-first research.',
      },
      {
        question: 'Can Moz Pro replace Ahrefs?',
        answer:
          'It can for simpler teams and beginner-friendly use cases, but it is not a like-for-like replacement for advanced link and content research.',
      },
      {
        question: 'Should I switch from Ahrefs to SE Ranking?',
        answer:
          'That makes sense when cost is the main driver and you can accept lighter backlink and keyword datasets in exchange for much better price efficiency.',
      },
    ],
  },
  moz: {
    slug: 'moz',
    targetName: 'Moz',
    original: toolProfiles['moz-pro'],
    heroSummary:
      'Moz Pro still has brand recognition and a familiar metric in Domain Authority, but it is no longer the automatic choice for many SEO teams. If you want deeper data, lower pricing, or a stronger specialist workflow, these are the best Moz alternatives in 2026.',
    switchReasons: [
      'You need better backlink or competitor research than Moz Pro offers.',
      'You want more value from your subscription spend.',
      'Your team has outgrown DA-led reporting as the main reason for using Moz.',
    ],
    buyingChecklist: [
      'Decide whether your replacement should prioritize research depth, value, or simplicity.',
      'If DA is important to your current workflow, plan how you will replace that reporting narrative.',
      'Check whether you need a broader all-in-one suite or just a better keyword and backlink engine.',
    ],
    alternatives: [
      {
        tool: toolProfiles.semrush,
        title: 'Best Moz alternative for agencies and broader SEO teams',
        summary:
          'Semrush is the strongest Moz alternative if your team needs to graduate into a more complete SEO operating system. It offers stronger competitor analysis, richer site auditing, better content tooling, and far broader market intelligence. For agencies and in-house teams that need one subscription to cover more use cases, Semrush is a clear upgrade path.',
        switchReason:
          'Switch to Semrush if Moz Pro feels too limited for the scale and breadth of your workflow.',
        caution:
          'You will pay more, and the platform is more complex than Moz Pro.',
      },
      {
        tool: toolProfiles.ahrefs,
        title: 'Best Moz alternative for data depth',
        summary:
          'Ahrefs is the best Moz alternative when your main goal is better data quality, especially for links and content research. It is the tool to pick if you want stronger keyword opportunities, better link intelligence, and a more research-centric experience. Teams moving from Moz to Ahrefs usually do it because they want sharper answers, not a friendlier interface.',
        switchReason:
          'Switch to Ahrefs if your biggest complaint about Moz is data depth rather than usability.',
        caution:
          'Ahrefs does not preserve the same DA-based workflow and is not the easiest platform for beginners.',
      },
      {
        tool: toolProfiles['se-ranking'],
        title: 'Best Moz alternative for value',
        summary:
          'SE Ranking is often the smartest Moz alternative for teams that want a better price-to-feature ratio. It gives you rank tracking, audits, keyword research, and backlinks in a modern interface while keeping costs below most premium tools. For many small agencies and freelancers, it is the most rational upgrade from Moz.',
        switchReason:
          'Switch to SE Ranking if you want a more modern platform without paying Semrush or Ahrefs prices.',
        caution:
          'Its data depth is improved for the price, but still not as rich as the top premium platforms.',
      },
      {
        tool: toolProfiles.mangools,
        title: 'Best Moz alternative for simplicity on a tighter budget',
        summary:
          'Mangools works well as a Moz alternative for solo users who mainly need keyword research and ranking visibility, not a dense SEO suite. It is much easier on the budget and keeps the workflow pleasant. If Moz feels dated or overpriced for what you actually use, Mangools can be a cleaner fit.',
        switchReason:
          'Switch to Mangools if you want a simple, affordable alternative to Moz Pro for everyday keyword work.',
        caution:
          'You will lose the broader site auditing and DA-centered reporting model.',
      },
      {
        tool: toolProfiles.spyfu,
        title: 'Best Moz alternative for competitive intelligence',
        summary:
          'SpyFu is a strong alternative when your use case leans more toward competitor research and PPC overlap than traditional Moz-style metrics. It is cheaper and more focused, and it helps uncover what competitors rank for or advertise on without requiring a premium full-suite commitment.',
        switchReason:
          'Switch to SpyFu if you care more about competitive keyword spying than about Moz-specific metrics.',
        caution:
          'SpyFu is narrower in scope and is not a balanced replacement for all Moz workflows.',
      },
    ],
    comparisonRows: [
      { toolName: 'Moz Pro', price: 'From $99/mo', bestFor: 'DA-driven workflows', edge: 'Best DA familiarity', tradeoff: 'Lighter data depth than newer leaders' },
      { toolName: 'Semrush', price: 'From $139.95/mo', bestFor: 'Agencies and teams', edge: 'Best all-round upgrade', tradeoff: 'Higher cost and complexity' },
      { toolName: 'Ahrefs', price: 'From $129/mo', bestFor: 'Research-heavy SEOs', edge: 'Best data quality upgrade', tradeoff: 'Less beginner-friendly' },
      { toolName: 'SE Ranking', price: 'From $65/mo', bestFor: 'Value seekers', edge: 'Best price-to-feature jump', tradeoff: 'Not as deep as the top premium tools' },
      { toolName: 'Mangools', price: 'From $29/mo', bestFor: 'Solo users', edge: 'Best low-cost simplicity', tradeoff: 'Not a full-suite replacement' },
      { toolName: 'SpyFu', price: 'From $39/mo', bestFor: 'Competitor intel', edge: 'Best competitive keyword focus', tradeoff: 'Narrower overall SEO coverage' },
    ],
    quickPicks: [
      { useCase: 'Best Moz alternative for all-round capability', winner: toolProfiles.semrush, reason: 'It offers the clearest full-platform upgrade over Moz Pro.' },
      { useCase: 'Best Moz alternative for data quality', winner: toolProfiles.ahrefs, reason: 'It is the strongest option if your main complaint is research depth.' },
      { useCase: 'Best Moz alternative for value', winner: toolProfiles['se-ranking'], reason: 'It gives smaller teams a better price-to-feature ratio than Moz Pro.' },
      { useCase: 'Best Moz alternative for low-cost solo use', winner: toolProfiles.mangools, reason: 'It keeps the workflow simple and inexpensive.' },
    ],
    verdict:
      'SE Ranking is the best Moz alternative for most small teams because it modernizes the workflow without forcing premium pricing. Semrush is the better choice if you want a bigger strategic upgrade and can spend more.',
    faqs: [
      {
        question: 'What is the best Moz alternative overall?',
        answer:
          'SE Ranking is the best Moz alternative for most buyers because it offers a better price-to-feature mix while staying easy to adopt.',
      },
      {
        question: 'Which Moz alternative has the best data?',
        answer:
          'Ahrefs has the best data depth in this group, especially for backlinks, keyword research, and content opportunity work.',
      },
      {
        question: 'Is Semrush a good Moz alternative?',
        answer:
          'Yes. Semrush is one of the strongest Moz alternatives if you want a broader, more capable all-in-one platform.',
      },
      {
        question: 'What is a cheaper alternative to Moz Pro?',
        answer:
          'SE Ranking, Mangools, and SpyFu are all cheaper alternatives, with SE Ranking being the closest overall platform replacement.',
      },
      {
        question: 'Should beginners stay with Moz Pro or switch?',
        answer:
          'Beginners can still do well with Moz Pro, but a switch makes sense if you want better value, fresher workflows, or stronger data coverage.',
      },
    ],
  },
  'screaming-frog': {
    slug: 'screaming-frog',
    targetName: 'Screaming Frog',
    original: toolProfiles['screaming-frog'],
    heroSummary:
      'Screaming Frog is the default crawler for technical SEO specialists, but not everyone wants a desktop-first tool with a steep learning curve. If you want easier cloud monitoring, a broader platform, or a gentler onboarding path, these are the best Screaming Frog alternatives in 2026.',
    switchReasons: [
      'You want cloud-based site health monitoring instead of a desktop workflow.',
      'Your team needs easier collaboration than a specialist crawler naturally provides.',
      'You want technical SEO features bundled with broader keyword or competitor research.',
    ],
    buyingChecklist: [
      'Be honest about whether you are replacing technical depth or replacing workflow friction.',
      'Check whether your team needs custom extraction and advanced crawl control or just clear issue reporting.',
      'If multiple stakeholders need visibility, prioritize cloud-based reporting and recurring monitoring.',
    ],
    alternatives: [
      {
        tool: toolProfiles.semrush,
        title: 'Best Screaming Frog alternative for cloud-based auditing',
        summary:
          'Semrush is the most practical Screaming Frog alternative for teams that want technical SEO coverage without the specialist desktop workflow. Its Site Audit is easier to share, easier to schedule, and easier for non-technical stakeholders to understand. If you want accessible monitoring more than raw crawl power, it is the best fit.',
        switchReason:
          'Switch to Semrush if you want cloud audits, recurring monitoring, and stakeholder-friendly reporting.',
        caution:
          'You will lose some crawl flexibility, advanced extraction, and technical depth compared with Screaming Frog.',
      },
      {
        tool: toolProfiles['se-ranking'],
        title: 'Best Screaming Frog alternative for smaller teams',
        summary:
          'SE Ranking offers a simpler alternative for teams that need technical auditing as part of a broader SEO platform. It combines audits with rank tracking, competitor research, and backlinks at a much lower price than broader premium suites. For smaller agencies or freelancers, that convenience often matters more than maximum crawl sophistication.',
        switchReason:
          'Switch to SE Ranking if you want a lighter all-in-one platform with an accessible audit module.',
        caution:
          'It is not a replacement for advanced technical investigations or bespoke crawl setups.',
      },
      {
        tool: toolProfiles.ahrefs,
        title: 'Best Screaming Frog alternative for research-led teams',
        summary:
          'Ahrefs is relevant if your team mainly wants a solid site audit inside a research-heavy SEO platform. Its audit experience is cleaner than many general suites, and it pairs naturally with stronger backlink and content workflows. It is the better fit when technical SEO is important but not the only job the tool has to do.',
        switchReason:
          'Switch to Ahrefs if you need a capable audit plus first-rate backlink and keyword research in one subscription.',
        caution:
          'It is not a technical crawler replacement in the same way Screaming Frog specialists would define the term.',
      },
      {
        tool: toolProfiles['moz-pro'],
        title: 'Best Screaming Frog alternative for beginner-friendly audits',
        summary:
          'Moz Pro is a reasonable alternative when you want site auditing to be easier to understand and easier to explain internally. It is much less intimidating than Screaming Frog and works better for teams that are still learning technical SEO basics. It will not match crawl depth, but it can be easier to operationalize.',
        switchReason:
          'Switch to Moz Pro if your biggest issue with Screaming Frog is complexity rather than capability.',
        caution:
          'You should not expect Moz Pro to replace advanced crawl diagnostics or migrations work.',
      },
      {
        tool: toolProfiles.spyfu,
        title: 'Best Screaming Frog alternative if technical SEO is not the real priority',
        summary:
          'SpyFu is not a direct technical replacement, but it is useful when teams realize their spend should move away from technical crawling and toward competitor or PPC intelligence instead. If Screaming Frog is underused and the business value is coming from competitive research, SpyFu can be a smarter reallocation of budget.',
        switchReason:
          'Switch to SpyFu if you are stepping away from technical SEO tooling rather than trying to replicate it.',
        caution:
          'This is a strategic pivot, not a feature-matched crawler replacement.',
      },
    ],
    comparisonRows: [
      { toolName: 'Screaming Frog', price: 'Free / £259/yr', bestFor: 'Technical specialists', edge: 'Best crawl depth and flexibility', tradeoff: 'Desktop-first and harder for broader teams' },
      { toolName: 'Semrush', price: 'From $139.95/mo', bestFor: 'Cloud-based teams', edge: 'Best accessible audit replacement', tradeoff: 'Less technical depth' },
      { toolName: 'SE Ranking', price: 'From $65/mo', bestFor: 'Lean teams', edge: 'Best low-cost all-in-one audit option', tradeoff: 'Not a specialist crawler' },
      { toolName: 'Ahrefs', price: 'From $129/mo', bestFor: 'Research-led teams', edge: 'Best mix of audit plus backlink research', tradeoff: 'Not a pure technical replacement' },
      { toolName: 'Moz Pro', price: 'From $99/mo', bestFor: 'Beginners', edge: 'Best onboarding for basic technical SEO', tradeoff: 'Lower crawl ceiling' },
      { toolName: 'SpyFu', price: 'From $39/mo', bestFor: 'Competitive intel', edge: 'Best budget shift if technical SEO is no longer the focus', tradeoff: 'Not a crawler at all' },
    ],
    quickPicks: [
      { useCase: 'Best Screaming Frog alternative for cloud teams', winner: toolProfiles.semrush, reason: 'It gives you the cleanest shift from desktop crawling to shared audit monitoring.' },
      { useCase: 'Best Screaming Frog alternative for budget-conscious teams', winner: toolProfiles['se-ranking'], reason: 'It combines accessible auditing with broader SEO tools at a lower price.' },
      { useCase: 'Best Screaming Frog alternative for research plus audits', winner: toolProfiles.ahrefs, reason: 'It pairs a capable audit layer with elite research workflows.' },
      { useCase: 'Best Screaming Frog alternative for beginners', winner: toolProfiles['moz-pro'], reason: 'It is easier to understand and less technical from day one.' },
    ],
    verdict:
      'Semrush is the best Screaming Frog alternative for most non-specialist teams because it replaces workflow friction with cloud accessibility. If you still need true technical depth, though, most alternatives are really complements rather than full replacements.',
    faqs: [
      {
        question: 'What is the best Screaming Frog alternative?',
        answer:
          'Semrush is the best Screaming Frog alternative for teams that want cloud-based auditing and easier collaboration rather than a specialist crawler.',
      },
      {
        question: 'Can Semrush replace Screaming Frog?',
        answer:
          'It can replace it for many team workflows, but it does not replace Screaming Frog for advanced crawl control, custom extraction, and deep technical diagnostics.',
      },
      {
        question: 'What is a cheaper alternative to Screaming Frog?',
        answer:
          'Screaming Frog is already excellent value, but SE Ranking can be a better budget choice if you want an all-in-one platform with audits included.',
      },
      {
        question: 'Which Screaming Frog alternative is easiest for beginners?',
        answer:
          'Moz Pro is the easiest beginner-friendly alternative in this reviewed set because its audit workflows are simpler to understand.',
      },
      {
        question: 'Should technical SEOs switch away from Screaming Frog?',
        answer:
          'Usually not completely. Many technical SEOs keep Screaming Frog even when they add broader platforms because the crawl depth is still hard to replace.',
      },
    ],
  },
  'surfer-seo': {
    slug: 'surfer-seo',
    targetName: 'Surfer SEO',
    original: toolProfiles['surfer-seo'],
    heroSummary:
      'Surfer SEO is a strong content optimization platform, but it can feel narrow or expensive if your team wants broader SEO functionality around the content workflow. If you are evaluating a switch, these are the best Surfer SEO alternatives in 2026 from the tools currently reviewed on SaySEO.',
    switchReasons: [
      'You want content optimization as part of a broader SEO platform rather than a specialist tool.',
      'Your team does not publish enough content to justify a dedicated Surfer subscription.',
      'You need keyword research, technical SEO, or competitor analysis around the same workflow.',
    ],
    buyingChecklist: [
      'Decide whether you want to replace Surfer with another specialist or move toward an all-in-one suite.',
      'If content is still the core job, do not overvalue broad SEO features you will rarely use.',
      'Check whether writers, strategists, or SEO managers are the primary users of the replacement.',
    ],
    alternatives: [
      {
        tool: toolProfiles.semrush,
        title: 'Best Surfer SEO alternative for broader platform coverage',
        summary:
          'Semrush is the best Surfer SEO alternative when you want content optimization inside a much larger SEO platform. Its SEO Writing Assistant is not as specialized as Surfer, but the overall package is stronger once you factor in keyword research, audits, competitor analysis, and reporting. For teams consolidating tools, that broader value often outweighs the narrower content gap.',
        switchReason:
          'Switch to Semrush if you want to consolidate content, research, and site health inside one platform.',
        caution:
          'Semrush is less focused than Surfer when your writers want a dedicated optimization environment.',
      },
      {
        tool: toolProfiles['se-ranking'],
        title: 'Best Surfer SEO alternative for smaller teams',
        summary:
          'SE Ranking is a sensible alternative if your team wants lighter content support within a better-value all-in-one platform. It will not replace Surfer feature for feature, but it does help smaller teams move away from stacking multiple subscriptions for audits, rankings, and planning. The appeal here is consolidation and cost control rather than content-specialist depth.',
        switchReason:
          'Switch to SE Ranking if Surfer feels too specialized for the scale of your content operation.',
        caution:
          'Content optimization depth is notably weaker than a true dedicated tool like Surfer.',
      },
      {
        tool: toolProfiles.ahrefs,
        title: 'Best Surfer SEO alternative for content research',
        summary:
          'Ahrefs is relevant when the real need is not drafting help but better content strategy. Its content gap, topic discovery, and backlink-informed research workflows can improve what you choose to publish even if it does less during the writing phase itself. For strategy-led teams, that can be a more valuable replacement than another optimization editor.',
        switchReason:
          'Switch to Ahrefs if you want stronger content ideation and keyword opportunity discovery around your editorial plan.',
        caution:
          'Ahrefs does not replace Surfer as a real-time writing assistant.',
      },
      {
        tool: toolProfiles['moz-pro'],
        title: 'Best Surfer SEO alternative for simple on-page guidance',
        summary:
          'Moz Pro is worth considering for teams that want easier, more general on-page optimization support instead of a dense specialist content editor. It is less demanding, less niche, and can suit smaller organizations that do not need a full-time content optimization workflow. The trade-off is that it is also much less specialized.',
        switchReason:
          'Switch to Moz Pro if you want a simpler SEO suite with some on-page help rather than a dedicated content platform.',
        caution:
          'You will lose the real-time scoring and specialist optimization workflow that makes Surfer distinct.',
      },
      {
        tool: toolProfiles.mangools,
        title: 'Best Surfer SEO alternative for lightweight keyword-first content planning',
        summary:
          'Mangools is a good Surfer SEO alternative when your content process starts with keyword discovery and simple SERP review rather than optimization scoring. It helps bloggers and solo creators find viable topics quickly, and the lower price point is attractive if content production is steady but not at agency scale. This is a simpler planning-focused swap rather than a direct feature mirror.',
        switchReason:
          'Switch to Mangools if you want inexpensive keyword-led content planning instead of a dedicated optimization editor.',
        caution:
          'Mangools does not act like Surfer during drafting or refreshing content.',
      },
    ],
    comparisonRows: [
      { toolName: 'Surfer SEO', price: 'From $99/mo', bestFor: 'Content optimization teams', edge: 'Best specialist content editor', tradeoff: 'Narrower than all-in-one SEO suites' },
      { toolName: 'Semrush', price: 'From $139.95/mo', bestFor: 'Broader SEO teams', edge: 'Best all-in-one alternative', tradeoff: 'Less specialized for writers' },
      { toolName: 'SE Ranking', price: 'From $65/mo', bestFor: 'Smaller teams', edge: 'Best value consolidation play', tradeoff: 'Lighter content optimization depth' },
      { toolName: 'Ahrefs', price: 'From $129/mo', bestFor: 'Content research', edge: 'Best strategic content research', tradeoff: 'No real-time writing workflow' },
      { toolName: 'Moz Pro', price: 'From $99/mo', bestFor: 'Simple on-page SEO', edge: 'Best low-friction generalist option', tradeoff: 'Not a specialist content tool' },
      { toolName: 'Mangools', price: 'From $29/mo', bestFor: 'Keyword planning', edge: 'Best lightweight content planning option', tradeoff: 'No drafting optimization workflow' },
    ],
    quickPicks: [
      { useCase: 'Best Surfer SEO alternative for all-round SEO', winner: toolProfiles.semrush, reason: 'It wraps content support inside a much broader platform.' },
      { useCase: 'Best Surfer SEO alternative for budget', winner: toolProfiles['se-ranking'], reason: 'It is the best value path if you want one subscription to cover more than content.' },
      { useCase: 'Best Surfer SEO alternative for content strategy', winner: toolProfiles.ahrefs, reason: 'It improves topic selection and opportunity discovery better than most generalist tools.' },
      { useCase: 'Best Surfer SEO alternative for bloggers', winner: toolProfiles.mangools, reason: 'It keeps keyword-led content planning simple and affordable.' },
    ],
    verdict:
      'Semrush is the best Surfer SEO alternative for teams that want to consolidate tools. If your real need is better content planning rather than writing assistance, Ahrefs or Mangools may actually be the smarter switch depending on budget and workflow.',
    faqs: [
      {
        question: 'What is the best Surfer SEO alternative?',
        answer:
          'Semrush is the best Surfer SEO alternative for most teams that want broader SEO functionality around content, while Ahrefs is stronger for content strategy and research.',
      },
      {
        question: 'Is there a cheaper alternative to Surfer SEO?',
        answer:
          'Yes. SE Ranking and Mangools are both cheaper alternatives, though they do not replace Surfer as dedicated content optimization tools.',
      },
      {
        question: 'Can Semrush replace Surfer SEO?',
        answer:
          'It can replace Surfer for teams that value platform consolidation more than specialist content editing depth, but it is not a like-for-like writer workflow replacement.',
      },
      {
        question: 'Which Surfer SEO alternative is best for bloggers?',
        answer:
          'Mangools is the best fit for many bloggers because it keeps keyword planning simple and affordable.',
      },
      {
        question: 'Should content teams switch from Surfer to Ahrefs?',
        answer:
          'That makes sense when the bigger problem is content research and planning. It makes less sense if your team depends heavily on real-time optimization during drafting.',
      },
    ],
  },
}

export function generateStaticParams() {
  return Object.keys(alternativesPages).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const page = alternativesPages[slug]

  if (!page) return {}

  const title = `Best ${page.targetName} Alternatives in ${new Date().getFullYear()} | SaySEO`
  const description = `Looking for the best ${page.targetName} alternatives? Compare pricing, strengths, trade-offs, and the best replacement for your SEO workflow.`

  return {
    title,
    description,
    alternates: { canonical: `https://sayseo.co.uk/alternatives/${slug}` },
    openGraph: {
      title,
      description,
      url: `https://sayseo.co.uk/alternatives/${slug}`,
      locale: 'en_GB',
    },
  }
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill={star <= Math.floor(rating) ? '#f59e0b' : 'none'}
          stroke="#f59e0b"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="text-xs font-bold text-gray-600 ml-1">{rating}/5</span>
    </div>
  )
}

function ToolCta({ tool }: { tool: ToolProfile }) {
  return (
    <a
      href={tool.affiliateUrl}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors"
    >
      Try {tool.name}
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  )
}

export default async function AlternativesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = alternativesPages[slug]

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
            <span className="text-gray-600">Alternatives</span>
            <span>/</span>
            <span className="text-gray-600 font-medium">{page.targetName}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 uppercase tracking-[0.1em]">Alternatives</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: page.original.badgeColor }}>
              Leaving {page.original.name}?
            </span>
          </div>
          <h1 className="text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
            Best {page.targetName} Alternatives in {new Date().getFullYear()}
          </h1>
          <p className="text-base text-gray-500 leading-relaxed max-w-3xl">{page.heroSummary}</p>
        </div>
      </div>

      <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-4">When it makes sense to switch</h2>
            <ul className="space-y-2.5">
              {page.switchReasons.map((reason) => (
                <li key={reason} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-4">What to look for in a replacement</h2>
            <ul className="space-y-2.5">
              {page.buyingChecklist.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 pb-12">
        <h2 className="text-lg font-bold text-gray-900 mb-6 tracking-tight">The best {page.targetName} alternatives</h2>
        <div className="space-y-5">
          {page.alternatives.map((option, index) => (
            <article key={option.tool.reviewSlug} className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-extrabold text-gray-500">{index + 1}</span>
                    <h3 className="text-base font-bold text-gray-900">{option.tool.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold text-white" style={{ backgroundColor: option.tool.badgeColor }}>{option.tool.badge}</span>
                  </div>
                  <p className="text-sm text-emerald-700 font-semibold mb-2">{option.title}</p>
                  <Stars rating={option.tool.rating} />
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-bold text-gray-900">{option.tool.price}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{option.tool.trialInfo}</p>
                </div>
              </div>
              <div className="space-y-2.5 text-sm text-gray-600 leading-relaxed mb-6">
                <p>{option.summary}</p>
                <p><span className="text-gray-800 font-semibold">Why switch:</span> {option.switchReason}</p>
                <p><span className="text-gray-800 font-semibold">Trade-off:</span> {option.caution}</p>
                <p><span className="text-gray-800 font-semibold">Best for:</span> {option.tool.bestFor}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <ToolCta tool={option.tool} />
                <Link href={`/reviews/${option.tool.reviewSlug}`} className="inline-flex items-center justify-center px-5 py-3 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                  Read {option.tool.name} review
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 pb-12">
        <h2 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">Compare alternatives against {page.original.name}</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-3xl leading-relaxed">This table focuses on where each option clearly improves on the original tool and what compromise comes with that choice.</p>
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full min-w-[760px] text-sm bg-white">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3.5 text-gray-500 font-semibold">Tool</th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-semibold">Starting price</th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-semibold">Best for</th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-semibold">Biggest edge</th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-semibold">Trade-off</th>
              </tr>
            </thead>
            <tbody>
              {page.comparisonRows.map((row, index) => (
                <tr key={row.toolName} className={`border-b border-gray-100 last:border-0 ${index % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'}`}>
                  <td className="px-5 py-4 font-semibold text-gray-900">{row.toolName}</td>
                  <td className="px-5 py-4 text-gray-600">{row.price}</td>
                  <td className="px-5 py-4 text-gray-600">{row.bestFor}</td>
                  <td className="px-5 py-4 text-emerald-700 font-medium">{row.edge}</td>
                  <td className="px-5 py-4 text-gray-600">{row.tradeoff}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 pb-12">
        <h2 className="text-lg font-bold text-gray-900 mb-6 tracking-tight">Best {page.targetName} alternative for specific use cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {page.quickPicks.map((pick) => (
            <div key={pick.useCase} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700 mb-3">{pick.useCase}</p>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold text-white" style={{ backgroundColor: pick.winner.badgeColor }}>{pick.winner.badge}</span>
                <span className="text-base font-bold text-gray-900">{pick.winner.name}</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{pick.reason}</p>
              <div className="flex gap-3">
                <ToolCta tool={pick.winner} />
                <Link href={`/reviews/${pick.winner.reviewSlug}`} className="inline-flex items-center justify-center px-5 py-3 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                  Review
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 pb-10">
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700 mb-3">Our Takeaway</p>
          <p className="text-sm text-gray-700 leading-relaxed">{page.verdict}</p>
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
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight mb-3">Still comparing tools?</h2>
          <p className="text-sm text-gray-500 mb-7 max-w-2xl mx-auto">
            Use our review library and head-to-head comparisons to validate the best-fit SEO tool before you commit to another subscription.
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
