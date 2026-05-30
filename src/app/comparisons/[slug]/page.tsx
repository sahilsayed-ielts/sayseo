import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { AffiliateNav } from '@/components/affiliate/AffiliateNav'
import { AffiliateFooter } from '@/components/affiliate/AffiliateFooter'

type ToolProfile = {
  name: string
  badge: string
  badgeColor: string
  price: string
  trialInfo: string
  affiliateUrl: string
  reviewSlug: string
  bestFor: string
}

type ComparisonEdge = 'toolA' | 'toolB' | 'tie'

type ComparisonRow = {
  category: string
  toolA: string
  toolB: string
  edge: ComparisonEdge
}

type PickSection = {
  intro: string
  bullets: string[]
  ctaLabel: string
}

type FAQItem = {
  question: string
  answer: string
}

type ComparisonData = {
  slug: string
  tag: string
  intro: string
  toolA: ToolProfile
  toolB: ToolProfile
  quickVerdict: {
    winner: ComparisonEdge
    summary: string
    reasons: string[]
  }
  featureRows: ComparisonRow[]
  pricingRows: ComparisonRow[]
  pickToolA: PickSection
  pickToolB: PickSection
  overallVerdict: {
    title: string
    body: string
    supporting: string
  }
  faqs: FAQItem[]
}

const toolProfiles = {
  semrush: {
    name: 'Semrush',
    badge: 'Best Overall',
    badgeColor: '#00D4AA',
    price: 'From $139.95/mo',
    trialInfo: '7-day free trial available',
    affiliateUrl: 'https://www.semrush.com',
    reviewSlug: 'semrush',
    bestFor: 'Agencies and teams that want one suite for research, audits, content, and reporting.',
  },
  ahrefs: {
    name: 'Ahrefs',
    badge: 'Best for Links',
    badgeColor: '#f59e0b',
    price: 'From $129/mo',
    trialInfo: '$7 trial on Starter tier',
    affiliateUrl: 'https://ahrefs.com',
    reviewSlug: 'ahrefs',
    bestFor: 'SEOs who live in backlink analysis, content research, and competitive keyword work.',
  },
  'se-ranking': {
    name: 'SE Ranking',
    badge: 'Best Value',
    badgeColor: '#8b5cf6',
    price: 'From $65/mo',
    trialInfo: '14-day free trial, no card required',
    affiliateUrl: 'https://seranking.com',
    reviewSlug: 'se-ranking',
    bestFor: 'Freelancers, lean agencies, and SMBs that need breadth without enterprise pricing.',
  },
  'surfer-seo': {
    name: 'Surfer SEO',
    badge: 'Best for Content',
    badgeColor: '#3b82f6',
    price: 'From $99/mo',
    trialInfo: '7-day money-back guarantee',
    affiliateUrl: 'https://surferseo.com',
    reviewSlug: 'surfer-seo',
    bestFor: 'Content teams that want page-level optimization guidance while writing.',
  },
  'screaming-frog': {
    name: 'Screaming Frog',
    badge: 'Best Technical',
    badgeColor: '#ef4444',
    price: 'Free / £259/yr',
    trialInfo: 'Free version crawls up to 500 URLs',
    affiliateUrl: 'https://www.screamingfrog.co.uk/seo-spider/',
    reviewSlug: 'screaming-frog',
    bestFor: 'Technical SEOs and developers who need maximum crawl depth and flexibility.',
  },
  'moz-pro': {
    name: 'Moz Pro',
    badge: 'Best for DA',
    badgeColor: '#06b6d4',
    price: 'From $99/mo',
    trialInfo: '30-day free trial',
    affiliateUrl: 'https://moz.com/products/pro',
    reviewSlug: 'moz-pro',
    bestFor: 'Beginners and teams that still rely on Domain Authority in their workflow.',
  },
  mangools: {
    name: 'Mangools',
    badge: 'Easiest to Use',
    badgeColor: '#10b981',
    price: 'From $29/mo',
    trialInfo: '10-day free trial',
    affiliateUrl: 'https://mangools.com',
    reviewSlug: 'mangools',
    bestFor: 'Bloggers and solo operators who want simple keyword research without overwhelm.',
  },
} satisfies Record<string, ToolProfile>

const comparisons: Record<string, ComparisonData> = {
  'semrush-vs-ahrefs': {
    slug: 'semrush-vs-ahrefs',
    tag: 'All-in-One',
    intro:
      'Semrush and Ahrefs are the two default choices for serious SEO teams. Both are premium platforms, but they win in different places: Semrush is broader, while Ahrefs is sharper for backlinks and research purity.',
    toolA: toolProfiles.semrush,
    toolB: toolProfiles.ahrefs,
    quickVerdict: {
      winner: 'toolA',
      summary:
        'Semrush is the better all-round buy for most teams because it covers more workflows in one login, especially PPC intelligence, reporting, and competitive traffic analysis.',
      reasons: [
        'Choose Semrush if you want one platform for SEO, content, competitor monitoring, and paid search research.',
        'Choose Ahrefs if backlink quality, content ideation, and a cleaner research-focused workflow matter more than breadth.',
        'Ahrefs still wins a clear subcategory: link intelligence remains its strongest edge.',
      ],
    },
    featureRows: [
      { category: 'Keyword research breadth', toolA: 'Huge database plus intent, trends, and PPC overlap', toolB: 'Excellent keyword data with strong traffic potential metrics', edge: 'toolA' },
      { category: 'Backlink analysis', toolA: 'Very strong backlink toolkit with toxicity and outreach context', toolB: 'Best-in-class link index and link gap workflows', edge: 'toolB' },
      { category: 'Competitor traffic intel', toolA: 'Traffic Analytics and market trend views', toolB: 'Strong organic research, lighter market-intel layer', edge: 'toolA' },
      { category: 'Technical SEO audits', toolA: 'Robust cloud audit with collaboration features', toolB: 'Solid site audit with cleaner issue prioritization', edge: 'tie' },
      { category: 'Content workflows', toolA: 'SEO Writing Assistant and content toolkit', toolB: 'Content Explorer is superb for topic validation', edge: 'tie' },
      { category: 'PPC and ad research', toolA: 'Full paid search research and ad copy monitoring', toolB: 'Very limited PPC depth', edge: 'toolA' },
      { category: 'Agency reporting', toolA: 'Stronger project management and client-facing reporting', toolB: 'Great research dashboards, lighter reporting layer', edge: 'toolA' },
    ],
    pricingRows: [
      { category: 'Entry plan', toolA: '$139.95/mo for Pro', toolB: '$129/mo for Lite', edge: 'toolB' },
      { category: 'Mid-tier plan', toolA: '$249.95/mo for Guru', toolB: '$249/mo for Standard', edge: 'tie' },
      { category: 'High-tier plan', toolA: '$499.95/mo for Business', toolB: '$449/mo for Advanced', edge: 'toolB' },
      { category: 'Trial / low-risk entry', toolA: '7-day free trial on select flows', toolB: '$7 starter-style trial', edge: 'toolA' },
      { category: 'Included marketing scope', toolA: 'SEO, content, local, competitor, and PPC', toolB: 'SEO research with heavier focus on links and content', edge: 'toolA' },
      { category: 'Best value if you only need core SEO research', toolA: 'You may overpay for unused modules', toolB: 'Better value for pure SEO research specialists', edge: 'toolB' },
    ],
    pickToolA: {
      intro:
        'Pick Semrush if your team wants a central operating system for SEO rather than a specialist research tool.',
      bullets: [
        'You need PPC, keyword research, site audits, rank tracking, and reporting in one place.',
        'You run agency or in-house workflows with multiple stakeholders and shared dashboards.',
        'You want the stronger default option if only one premium SEO subscription makes the budget.',
      ],
      ctaLabel: 'Try Semrush',
    },
    pickToolB: {
      intro:
        'Pick Ahrefs if research depth matters more than feature breadth and your workflow leans heavily on links and content.',
      bullets: [
        'Your SEO strategy is driven by backlink acquisition and content gap analysis.',
        'You prefer a cleaner interface centered on research rather than a broader marketing stack.',
        'You already have separate tools for reporting, PPC, or technical crawling.',
      ],
      ctaLabel: 'Try Ahrefs',
    },
    overallVerdict: {
      title: 'Semrush wins overall, but Ahrefs still wins the backlink conversation.',
      body:
        'If we had to recommend one tool to the widest range of SEO buyers, it would be Semrush. It simply covers more day-to-day jobs without forcing you into extra subscriptions.',
      supporting:
        'Ahrefs is still the better pick for link-first SEOs and content researchers who care more about data cleanliness than stack breadth. This is a real category split, not a landslide.',
    },
    faqs: [
      {
        question: 'Is Semrush or Ahrefs better for backlinks?',
        answer:
          'Ahrefs is still the stronger backlink specialist. Its link index, link gap workflows, and link-oriented research UX give it the edge if backlink analysis is the main buying reason.',
      },
      {
        question: 'Which tool is better for agencies: Semrush or Ahrefs?',
        answer:
          'Semrush is usually better for agencies because it bundles reporting, project organization, competitor traffic analysis, and PPC research alongside core SEO data.',
      },
      {
        question: 'Is Ahrefs cheaper than Semrush?',
        answer:
          'At the entry level, Ahrefs is slightly cheaper on paper, but the more important question is whether you also need tools for PPC, reporting, or broader marketing intelligence. If you do, Semrush can be the better value.',
      },
      {
        question: 'Which is easier for beginners to learn?',
        answer:
          'Ahrefs often feels cleaner and easier to navigate at first. Semrush has more surface area, so it can take longer to master, but that complexity comes from offering more workflows.',
      },
      {
        question: 'Should I buy both Semrush and Ahrefs?',
        answer:
          'Most teams do not need both. Buy Semrush if you want the broader suite, or buy Ahrefs if you mainly need world-class research and backlink intelligence. Add the second tool only if the first leaves a real gap in your workflow.',
      },
    ],
  },
  'se-ranking-vs-semrush': {
    slug: 'se-ranking-vs-semrush',
    tag: 'Value',
    intro:
      'SE Ranking and Semrush both aim to be all-in-one SEO platforms, but they target very different budgets. One is the premium benchmark; the other is the value leader that covers more than most low-cost tools should.',
    toolA: toolProfiles['se-ranking'],
    toolB: toolProfiles.semrush,
    quickVerdict: {
      winner: 'toolB',
      summary:
        'Semrush wins on raw depth, database size, and advanced workflows. SE Ranking wins the value argument and is often the smarter spend for freelancers or smaller agencies.',
      reasons: [
        'Buy Semrush if you need best-in-class breadth and you can justify the higher recurring cost.',
        'Buy SE Ranking if your priority is getting a complete SEO stack at a much lower monthly price.',
        'The closer your business is to freelance or SMB use, the stronger the case for SE Ranking becomes.',
      ],
    },
    featureRows: [
      { category: 'Keyword database depth', toolA: 'Good coverage for daily SEO work', toolB: 'Broader datasets with more advanced segmentation', edge: 'toolB' },
      { category: 'Rank tracking', toolA: 'Flexible and excellent for the price', toolB: 'Powerful with richer enterprise context', edge: 'tie' },
      { category: 'Site audits', toolA: 'Actionable and beginner-friendly', toolB: 'Deeper issue sets and stronger project presentation', edge: 'toolB' },
      { category: 'Competitor analysis', toolA: 'Strong organic and paid snapshots', toolB: 'Deeper competitive traffic and market insights', edge: 'toolB' },
      { category: 'Reporting for agencies', toolA: 'White-label features are great value', toolB: 'More mature dashboards and stakeholder workflows', edge: 'tie' },
      { category: 'Ease of use', toolA: 'Cleaner learning curve for smaller teams', toolB: 'More power, more complexity', edge: 'toolA' },
      { category: 'Overall value', toolA: 'Outstanding price-to-feature ratio', toolB: 'Premium tool with premium pricing', edge: 'toolA' },
    ],
    pricingRows: [
      { category: 'Entry plan', toolA: '$65/mo Essential', toolB: '$139.95/mo Pro', edge: 'toolA' },
      { category: 'Mid-tier plan', toolA: '$119/mo Pro', toolB: '$249.95/mo Guru', edge: 'toolA' },
      { category: 'Top tier', toolA: '$259/mo Business', toolB: '$499.95/mo Business', edge: 'toolA' },
      { category: 'Trial', toolA: '14-day free trial, no card', toolB: '7-day free trial', edge: 'toolA' },
      { category: 'Projects and limits vs spend', toolA: 'Very strong for lean teams', toolB: 'More expensive but broader toolkit', edge: 'toolA' },
      { category: 'Best value at scale', toolA: 'Smaller agencies and consultants', toolB: 'Larger teams consolidating multiple workflows', edge: 'tie' },
    ],
    pickToolA: {
      intro:
        'Pick SE Ranking if you want serious SEO capability without jumping straight into premium-tool pricing.',
      bullets: [
        'You are a freelancer, boutique agency, or SMB watching software spend closely.',
        'You need rank tracking, audits, keyword research, and reporting in one approachable interface.',
        'You would rather accept slightly lighter datasets than pay double for incremental depth.',
      ],
      ctaLabel: 'Try SE Ranking',
    },
    pickToolB: {
      intro:
        'Pick Semrush if your team will actually use the broader marketing intelligence it bundles around core SEO.',
      bullets: [
        'You need stronger competitive traffic analysis, PPC research, and content tooling.',
        'You run multi-person workflows where reporting and project depth matter every week.',
        'You want the safest all-round premium choice and budget is not the primary blocker.',
      ],
      ctaLabel: 'Try Semrush',
    },
    overallVerdict: {
      title: 'Semrush is the better platform; SE Ranking is the better bargain.',
      body:
        'The honest answer depends on what kind of business is buying. Semrush is more powerful and more complete, but SE Ranking gets surprisingly close on the workflows most smaller teams actually use.',
      supporting:
        'If every subscription line matters, SE Ranking is one of the easiest premium downgrades to justify without feeling under-tooled. If you want fewer compromises, Semrush still wins.',
    },
    faqs: [
      {
        question: 'Is SE Ranking a good alternative to Semrush?',
        answer:
          'Yes. SE Ranking is one of the strongest lower-cost alternatives to Semrush, especially for rank tracking, audits, and everyday research. It gives up some data depth and advanced competitive intelligence.',
      },
      {
        question: 'Which tool offers better value: SE Ranking or Semrush?',
        answer:
          'SE Ranking offers better price-to-feature value for most smaller teams. Semrush offers better capability depth if you can afford to use the extra modules.',
      },
      {
        question: 'Is Semrush still worth the extra cost over SE Ranking?',
        answer:
          'It is worth it when your team genuinely needs its broader competitive data, PPC research, and higher-end reporting. If not, SE Ranking may be the more rational buy.',
      },
      {
        question: 'Which is better for beginners?',
        answer:
          'SE Ranking is easier for beginners because the interface is simpler and the price of making the wrong choice is lower. Semrush has more to learn but also more headroom.',
      },
      {
        question: 'Which is better for agencies?',
        answer:
          'Smaller agencies often get more value from SE Ranking. Larger agencies that need deeper datasets and broader client reporting usually benefit more from Semrush.',
      },
    ],
  },
  'ahrefs-vs-moz': {
    slug: 'ahrefs-vs-moz',
    tag: 'Link Analysis',
    intro:
      'Ahrefs and Moz Pro are both established SEO brands, but they serve different buyers. Ahrefs is the stronger research engine; Moz remains attractive for beginners and teams that still use Domain Authority heavily.',
    toolA: toolProfiles.ahrefs,
    toolB: toolProfiles['moz-pro'],
    quickVerdict: {
      winner: 'toolA',
      summary:
        'Ahrefs is the better SEO product overall because its link database, keyword research, and competitive analysis are stronger. Moz Pro keeps a niche advantage in simplicity and DA familiarity.',
      reasons: [
        'Ahrefs is the better choice for advanced SEO work and serious competitive research.',
        'Moz Pro is easier to adopt if your team wants the gentlest learning curve and a long free trial.',
        'If Domain Authority is central to your reporting culture, Moz still has a practical reason to exist.',
      ],
    },
    featureRows: [
      { category: 'Backlink database', toolA: 'Industry-leading breadth and freshness', toolB: 'Useful, but smaller and less comprehensive', edge: 'toolA' },
      { category: 'Keyword research', toolA: 'Excellent traffic potential and content gap data', toolB: 'Good for foundational research', edge: 'toolA' },
      { category: 'Authority metrics', toolA: 'Strong internal metrics, less universally referenced', toolB: 'Domain Authority remains widely recognized', edge: 'toolB' },
      { category: 'Ease of use', toolA: 'Clean, but built for more advanced workflows', toolB: 'One of the easiest premium SEO suites to learn', edge: 'toolB' },
      { category: 'Content research', toolA: 'Content Explorer is a standout feature', toolB: 'More limited content ideation depth', edge: 'toolA' },
      { category: 'Technical audits', toolA: 'Solid site audit for ongoing work', toolB: 'Helpful for basic and intermediate audits', edge: 'tie' },
      { category: 'Overall product ceiling', toolA: 'Higher ceiling for expert users', toolB: 'Best for straightforward team workflows', edge: 'toolA' },
    ],
    pricingRows: [
      { category: 'Entry plan', toolA: '$129/mo Lite', toolB: '$99/mo Starter', edge: 'toolB' },
      { category: 'Mid-tier plan', toolA: '$249/mo Standard', toolB: '$179/mo Standard', edge: 'toolB' },
      { category: 'Upper mid-tier', toolA: '$449/mo Advanced', toolB: '$299/mo Medium', edge: 'toolB' },
      { category: 'Trial length', toolA: 'Low-cost limited trial style', toolB: '30-day free trial', edge: 'toolB' },
      { category: 'Research value for the spend', toolA: 'Higher cost, much stronger research output', toolB: 'Lower cost, lighter datasets', edge: 'toolA' },
      { category: 'Best buy for advanced SEO', toolA: 'Yes', toolB: 'Only if DA and simplicity matter more', edge: 'toolA' },
    ],
    pickToolA: {
      intro:
        'Pick Ahrefs if you want the stronger SEO engine and expect to live inside competitive research, links, and content opportunity work.',
      bullets: [
        'You care more about research accuracy and link depth than about brand familiarity.',
        'Your team is comfortable with a premium tool that rewards deeper usage.',
        'You want a product that scales better with advanced SEO workflows.',
      ],
      ctaLabel: 'Try Ahrefs',
    },
    pickToolB: {
      intro:
        'Pick Moz Pro if your team wants something friendlier, cheaper to start with, and aligned to DA-based reporting expectations.',
      bullets: [
        'You are newer to SEO software and want a gentler interface.',
        'You rely on Domain Authority when reporting to clients or stakeholders.',
        'You value the 30-day free trial as a lower-risk way to test a premium tool.',
      ],
      ctaLabel: 'Try Moz Pro',
    },
    overallVerdict: {
      title: 'Ahrefs wins for capability; Moz wins for familiarity and onboarding.',
      body:
        'If we strip away brand nostalgia and judge the tools by what they can do today, Ahrefs is the stronger product. It gives you more confidence in the data and more upside as your SEO program matures.',
      supporting:
        'Moz is still easier to recommend to beginners or DA-centric teams, but it is harder to justify if you already know you need serious backlink and competitor analysis.',
    },
    faqs: [
      {
        question: 'Is Ahrefs better than Moz for backlinks?',
        answer:
          'Yes. Ahrefs has the stronger backlink database and the better link research workflow, which is why it is usually the preferred choice for link building and competitive analysis.',
      },
      {
        question: 'Why do some teams still choose Moz Pro over Ahrefs?',
        answer:
          'Moz Pro is easier for beginners, cheaper to start with, and still benefits from Domain Authority being a familiar metric in the SEO industry.',
      },
      {
        question: 'Which tool is better for keyword research: Ahrefs or Moz?',
        answer:
          'Ahrefs is better for keyword research because it combines strong difficulty logic, traffic potential data, and better content gap analysis.',
      },
      {
        question: 'Is Moz Pro enough for a small business SEO team?',
        answer:
          'For many small businesses, yes. Moz Pro can cover foundational keyword tracking, link checks, and audits. The main limitation appears when you need deeper competitor intelligence.',
      },
      {
        question: 'Should beginners choose Moz Pro or Ahrefs?',
        answer:
          'Beginners often find Moz Pro easier to learn. Choose Ahrefs instead if you are confident you will grow into heavier research workflows and want to avoid upgrading again later.',
      },
    ],
  },
  'surfer-vs-semrush': {
    slug: 'surfer-vs-semrush',
    tag: 'Content',
    intro:
      'Surfer SEO and Semrush are not direct twins. Surfer is a specialist content optimization tool, while Semrush is a broad SEO suite with content features layered into a much bigger platform.',
    toolA: toolProfiles['surfer-seo'],
    toolB: toolProfiles.semrush,
    quickVerdict: {
      winner: 'tie',
      summary:
        'Surfer wins if your problem is content optimization specifically. Semrush wins if you need content tools as part of a broader SEO operating system.',
      reasons: [
        'Surfer is sharper for writers and content teams working article by article.',
        'Semrush is the safer buy if you also need keyword research, technical audits, and competitive monitoring.',
        'A lot of serious teams pair Semrush for strategy with Surfer for execution.',
      ],
    },
    featureRows: [
      { category: 'Content editor workflow', toolA: 'Best-in-class real-time optimization environment', toolB: 'Useful assistant inside a broader suite', edge: 'toolA' },
      { category: 'Keyword research', toolA: 'Basic planning and clustering support', toolB: 'Far deeper keyword and competitor datasets', edge: 'toolB' },
      { category: 'Backlinks and off-page SEO', toolA: 'Not a focus', toolB: 'Strong backlink and authority research', edge: 'toolB' },
      { category: 'Technical SEO', toolA: 'Not designed for crawl audits', toolB: 'Mature site audit platform', edge: 'toolB' },
      { category: 'Writer adoption', toolA: 'Very easy for content teams to use daily', toolB: 'Better for SEO managers than pure writers', edge: 'toolA' },
      { category: 'Workflow breadth', toolA: 'Specialist tool', toolB: 'Full-stack SEO and marketing platform', edge: 'toolB' },
      { category: 'Best specialist depth', toolA: 'Purpose-built for optimizing pages', toolB: 'Good but not as focused', edge: 'toolA' },
    ],
    pricingRows: [
      { category: 'Entry plan', toolA: '$99/mo Essential', toolB: '$139.95/mo Pro', edge: 'toolA' },
      { category: 'Mid-tier plan', toolA: '$219/mo Scale', toolB: '$249.95/mo Guru', edge: 'toolA' },
      { category: 'Upper tier', toolA: 'Enterprise pricing', toolB: '$499.95/mo Business', edge: 'tie' },
      { category: 'Trial / guarantee', toolA: '7-day money-back guarantee', toolB: '7-day free trial', edge: 'toolB' },
      { category: 'Value for content-only teams', toolA: 'Better fit if writing is the core job', toolB: 'Can feel oversized', edge: 'toolA' },
      { category: 'Value for multi-discipline SEO teams', toolA: 'Needs companion tools', toolB: 'More self-contained', edge: 'toolB' },
    ],
    pickToolA: {
      intro:
        'Pick Surfer SEO if your content team needs precise optimization guidance while drafting, editing, and refreshing pages.',
      bullets: [
        'Writers and editors need a dedicated content score and entity guidance inside the workflow.',
        'Your SEO strategy is content-led and you already have separate tools for research or site health.',
        'You want a specialist product rather than another all-in-one dashboard.',
      ],
      ctaLabel: 'Try Surfer SEO',
    },
    pickToolB: {
      intro:
        'Pick Semrush if content is only one part of a wider SEO program and you want strategy, research, and audits in the same platform.',
      bullets: [
        'You need one subscription to cover research, competitor intel, site audits, and content support.',
        'SEO managers and agencies need more than a writer-facing optimization tool.',
        'You would rather accept lighter content editing depth than buy multiple overlapping products.',
      ],
      ctaLabel: 'Try Semrush',
    },
    overallVerdict: {
      title: 'This comparison is about specialization versus consolidation.',
      body:
        'Surfer is better at the narrow job of optimizing content drafts. Semrush is better at being the central platform around that job. Neither tool truly replaces the other if you need both specialties.',
      supporting:
        'If you only want one product, Semrush is the more flexible default purchase. If rankings live or die on high-volume content output, Surfer may deliver the clearer day-to-day ROI.',
    },
    faqs: [
      {
        question: 'Is Surfer SEO better than Semrush for content optimization?',
        answer:
          'Yes. Surfer is more focused and more useful for real-time on-page optimization while writing. Semrush offers content tooling, but it is not as specialized.',
      },
      {
        question: 'Can Surfer SEO replace Semrush?',
        answer:
          'Usually no. Surfer does not replace Semrush for keyword research depth, backlink data, technical audits, or broader competitor analysis.',
      },
      {
        question: 'Which tool is better for writers?',
        answer:
          'Surfer is better for writers because the interface and scoring system are built around drafting and improving individual pages.',
      },
      {
        question: 'Which tool is better for agencies?',
        answer:
          'Most agencies get more total value from Semrush because it supports more client workflows. Agencies with heavy editorial operations may still add Surfer on top.',
      },
      {
        question: 'Should I use Semrush and Surfer together?',
        answer:
          'That combination makes sense when Semrush handles strategy and research while Surfer handles content execution. It is most justified for teams publishing a lot of SEO content each month.',
      },
    ],
  },
  'screaming-frog-vs-semrush': {
    slug: 'screaming-frog-vs-semrush',
    tag: 'Technical SEO',
    intro:
      'Screaming Frog and Semrush both help you find technical SEO issues, but they do it in completely different ways. Screaming Frog is a power-user crawler. Semrush is a cloud audit platform designed for accessibility and recurring monitoring.',
    toolA: toolProfiles['screaming-frog'],
    toolB: toolProfiles.semrush,
    quickVerdict: {
      winner: 'toolA',
      summary:
        'Screaming Frog wins for technical depth and value. Semrush wins for convenience, collaboration, and easier ongoing monitoring for non-technical teams.',
      reasons: [
        'Choose Screaming Frog if you need deep crawl control, custom extraction, and technical flexibility.',
        'Choose Semrush if you want cloud-based auditing that anyone on the team can access.',
        'These tools serve different levels of technical maturity more than they serve different budgets.',
      ],
    },
    featureRows: [
      { category: 'Crawl depth and flexibility', toolA: 'Desktop crawler with advanced controls and extraction', toolB: 'Strong cloud audit, less granular control', edge: 'toolA' },
      { category: 'Ease of use', toolA: 'Steeper learning curve', toolB: 'Far easier for mixed-skill teams', edge: 'toolB' },
      { category: 'JavaScript rendering', toolA: 'Powerful rendering and custom crawl setups', toolB: 'More limited compared with specialist crawling', edge: 'toolA' },
      { category: 'Ongoing monitoring', toolA: 'Manual or scheduled from your environment', toolB: 'Simple recurring cloud projects and alerts', edge: 'toolB' },
      { category: 'GA4/GSC overlays', toolA: 'Strong integrations during audits', toolB: 'Useful issue dashboards and progress views', edge: 'tie' },
      { category: 'Team collaboration', toolA: 'Less collaborative by nature', toolB: 'Better for shared dashboards and stakeholder visibility', edge: 'toolB' },
      { category: 'Technical ceiling', toolA: 'Higher ceiling for specialists', toolB: 'Better for broad team adoption', edge: 'toolA' },
    ],
    pricingRows: [
      { category: 'Free access', toolA: 'Free up to 500 URLs', toolB: 'No free audit tier outside platform trial', edge: 'toolA' },
      { category: 'Paid entry', toolA: '£259/year license', toolB: '$139.95/mo Pro', edge: 'toolA' },
      { category: 'Cost for dedicated technical auditing', toolA: 'Exceptional value', toolB: 'Best if bundled with broader Semrush usage', edge: 'toolA' },
      { category: 'Value for non-technical teams', toolA: 'Harder to operationalize', toolB: 'More usable across departments', edge: 'toolB' },
      { category: 'Infrastructure overhead', toolA: 'Runs on your machine or setup', toolB: 'Cloud-hosted and easier to maintain', edge: 'toolB' },
      { category: 'Best long-term ROI for specialists', toolA: 'Very high', toolB: 'Good if used for more than audits', edge: 'toolA' },
    ],
    pickToolA: {
      intro:
        'Pick Screaming Frog if technical SEO is hands-on work for you, not just a dashboard you check once a week.',
      bullets: [
        'You need custom extraction, deep crawl configuration, and serious audit flexibility.',
        'You are comfortable interpreting raw crawl data and turning it into technical fixes.',
        'You want the best pure technical SEO value in the market.',
      ],
      ctaLabel: 'Try Screaming Frog',
    },
    pickToolB: {
      intro:
        'Pick Semrush if your team needs technical SEO coverage but prefers a more accessible, cloud-based workflow.',
      bullets: [
        'Multiple stakeholders need visibility into site health without learning a specialist crawler.',
        'You want auditing bundled with keyword research, reporting, and competitive analysis.',
        'You care more about operational simplicity than maximum crawl control.',
      ],
      ctaLabel: 'Try Semrush',
    },
    overallVerdict: {
      title: 'Screaming Frog is the technical specialist; Semrush is the easier team product.',
      body:
        'For pure auditing depth, Screaming Frog is the winner and it is not especially close. That is why technical SEOs keep it installed even when they already pay for broader platforms.',
      supporting:
        'Semrush still earns its place when the goal is repeatable health monitoring across a broader team, especially if you already want its keyword, competitor, and reporting layers too.',
    },
    faqs: [
      {
        question: 'Is Screaming Frog better than Semrush for technical SEO?',
        answer:
          'For deep technical audits, yes. Screaming Frog gives you more crawl control, richer extraction options, and better specialist depth than Semrush Site Audit.',
      },
      {
        question: 'Can Semrush replace Screaming Frog?',
        answer:
          'It can replace it for lighter or broader team workflows, but most technical SEOs would not consider it a full replacement for advanced crawl work.',
      },
      {
        question: 'Why do people still use Screaming Frog if they already have Semrush?',
        answer:
          'Because the tools solve different layers of the same problem. Semrush is convenient for monitoring; Screaming Frog is better for investigation and technical diagnosis.',
      },
      {
        question: 'Which tool is better for beginners?',
        answer:
          'Semrush is better for beginners because the interface is easier to understand and the audit output is packaged more clearly for non-specialists.',
      },
      {
        question: 'Is Screaming Frog good value?',
        answer:
          'Yes. Its annual license is one of the best-value purchases in SEO software, especially for anyone doing regular audits or site migrations.',
      },
    ],
  },
  'mangools-vs-se-ranking': {
    slug: 'mangools-vs-se-ranking',
    tag: 'Budget',
    intro:
      'Mangools and SE Ranking both target budget-conscious SEO buyers, but they are built around different philosophies. Mangools optimizes for simplicity and pleasant UX; SE Ranking aims to be a fuller all-in-one platform.',
    toolA: toolProfiles.mangools,
    toolB: toolProfiles['se-ranking'],
    quickVerdict: {
      winner: 'toolB',
      summary:
        'SE Ranking wins if you want more complete SEO capability. Mangools wins if ease of use is the non-negotiable requirement and you mainly care about keyword research and tracking.',
      reasons: [
        'SE Ranking is the better buy for agencies or freelancers who need audits and broader workflow coverage.',
        'Mangools is a better fit for bloggers, niche site owners, and solo operators who dislike bloated software.',
        'This is one of the clearest breadth-versus-simplicity trade-offs in SEO tools.',
      ],
    },
    featureRows: [
      { category: 'Keyword research', toolA: 'KWFinder is excellent and very beginner-friendly', toolB: 'Strong keyword tooling inside a broader platform', edge: 'toolA' },
      { category: 'Rank tracking', toolA: 'Good and easy to read', toolB: 'More flexible and more scalable', edge: 'toolB' },
      { category: 'Technical audits', toolA: 'No true full-site audit suite', toolB: 'Built-in website audit platform', edge: 'toolB' },
      { category: 'Backlink research', toolA: 'Useful but lighter LinkMiner workflow', toolB: 'Broader backlink monitoring and analysis', edge: 'toolB' },
      { category: 'Ease of use', toolA: 'Best-in-class UX for beginners', toolB: 'Clean, but more feature-dense', edge: 'toolA' },
      { category: 'Agency readiness', toolA: 'Limited for multi-service workflows', toolB: 'Better reports and workflow coverage', edge: 'toolB' },
      { category: 'All-round capability', toolA: 'Great focused suite', toolB: 'More complete SEO platform', edge: 'toolB' },
    ],
    pricingRows: [
      { category: 'Entry plan', toolA: '$29/mo Entry', toolB: '$65/mo Essential', edge: 'toolA' },
      { category: 'Mid-tier plan', toolA: '$49/mo Basic', toolB: '$119/mo Pro', edge: 'toolA' },
      { category: 'Upper tier', toolA: '$69/mo Premium', toolB: '$259/mo Business', edge: 'toolA' },
      { category: 'Free / trial access', toolA: '10-day free trial', toolB: '14-day free trial', edge: 'toolB' },
      { category: 'Value for simple keyword workflows', toolA: 'Outstanding', toolB: 'Often more than needed', edge: 'toolA' },
      { category: 'Value for fuller SEO operations', toolA: 'Needs extra tools around it', toolB: 'Stronger standalone value', edge: 'toolB' },
    ],
    pickToolA: {
      intro:
        'Pick Mangools if you want the easiest, least intimidating SEO suite for keyword discovery and basic rank tracking.',
      bullets: [
        'You are a blogger, affiliate marketer, or solo operator who mainly does keyword research.',
        'You value interface quality and speed over having every possible SEO module.',
        'You want to spend as little as possible while still getting a polished product.',
      ],
      ctaLabel: 'Try Mangools',
    },
    pickToolB: {
      intro:
        'Pick SE Ranking if you need more than keyword research and want a broader platform that can support client or team workflows.',
      bullets: [
        'You need audits, stronger backlink monitoring, and more scalable reporting.',
        'You are willing to pay more for a tool that can cover more of the SEO stack.',
        'You expect your SEO workflow to grow beyond simple keyword and ranking tasks.',
      ],
      ctaLabel: 'Try SE Ranking',
    },
    overallVerdict: {
      title: 'SE Ranking is the stronger SEO platform; Mangools is the friendlier lightweight buy.',
      body:
        'If you look strictly at features, SE Ranking wins. It does more and stretches further into professional SEO workflows than Mangools does.',
      supporting:
        'Mangools still deserves a real win on usability. For many solo users, the tool that gets used consistently is better than the platform with the longer checklist.',
    },
    faqs: [
      {
        question: 'Is Mangools better than SE Ranking for keyword research?',
        answer:
          'For pure ease of use in keyword research, many people prefer Mangools. For a broader SEO workflow that includes keyword research, SE Ranking is the more complete option.',
      },
      {
        question: 'Which tool is better for beginners: Mangools or SE Ranking?',
        answer:
          'Mangools is usually easier for absolute beginners because the interface is simpler and the feature scope is narrower.',
      },
      {
        question: 'Is SE Ranking worth paying more than Mangools?',
        answer:
          'Yes, if you need site audits, stronger backlink workflows, more flexible rank tracking, or agency-style reporting. If not, Mangools may be enough.',
      },
      {
        question: 'Which tool is better for agencies?',
        answer:
          'SE Ranking is better for agencies because it covers more SEO workflows and supports broader reporting and project management needs.',
      },
      {
        question: 'Can Mangools replace SE Ranking?',
        answer:
          'Only for lighter workflows. Mangools can replace SE Ranking for simpler keyword and SERP research use cases, but not for teams that need a fuller all-in-one platform.',
      },
    ],
  },
}

export function generateStaticParams() {
  return Object.keys(comparisons).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const comparison = comparisons[slug]

  if (!comparison) return {}

  const title = `${comparison.toolA.name} vs ${comparison.toolB.name} ${new Date().getFullYear()} — Which SEO Tool Wins? | SaySEO`
  const description = `Compare ${comparison.toolA.name} vs ${comparison.toolB.name}: features, pricing, ideal use cases, and our honest verdict for SEO buyers.`

  return {
    title,
    description,
    keywords: [
      `${comparison.toolA.name} vs ${comparison.toolB.name}`,
      `${comparison.toolA.name} review`,
      `${comparison.toolB.name} review`,
      `${comparison.tag} SEO tool comparison`,
    ],
    alternates: { canonical: `https://sayseo.co.uk/comparisons/${slug}` },
    openGraph: {
      title,
      description,
      url: `https://sayseo.co.uk/comparisons/${slug}`,
      locale: 'en_GB',
    },
  }
}

function edgeLabel(row: ComparisonRow, comparison: ComparisonData) {
  if (row.edge === 'toolA') return comparison.toolA.name
  if (row.edge === 'toolB') return comparison.toolB.name
  return 'Tie'
}

function edgeClasses(edge: ComparisonEdge) {
  if (edge === 'toolA') return 'text-emerald-700 bg-emerald-50 border-emerald-200'
  if (edge === 'toolB') return 'text-amber-700 bg-amber-50 border-amber-200'
  return 'text-gray-500 bg-gray-100 border-gray-200'
}

function ComparisonTable({
  title,
  caption,
  comparison,
  rows,
}: {
  title: string
  caption: string
  comparison: ComparisonData
  rows: ComparisonRow[]
}) {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
      <h2 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">{title}</h2>
      <p className="text-sm text-gray-500 mb-6 max-w-3xl leading-relaxed">{caption}</p>
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full min-w-[760px] text-sm bg-white">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3.5 text-gray-500 font-semibold">Category</th>
              <th className="text-left px-5 py-3.5 text-gray-500 font-semibold">{comparison.toolA.name}</th>
              <th className="text-left px-5 py-3.5 text-gray-500 font-semibold">{comparison.toolB.name}</th>
              <th className="text-left px-5 py-3.5 text-gray-500 font-semibold">Edge</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.category}
                className={`border-b border-gray-100 last:border-0 ${index % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'}`}
              >
                <td className="px-5 py-4 font-semibold text-gray-900">{row.category}</td>
                <td className="px-5 py-4 text-gray-600 leading-relaxed">{row.toolA}</td>
                <td className="px-5 py-4 text-gray-600 leading-relaxed">{row.toolB}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-semibold ${edgeClasses(row.edge)}`}>
                    {edgeLabel(row, comparison)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function ToolCta({
  tool,
  label,
  variant = 'primary',
}: {
  tool: ToolProfile
  label: string
  variant?: 'primary' | 'secondary'
}) {
  const classes =
    variant === 'primary'
      ? 'text-white bg-emerald-700 hover:bg-emerald-800'
      : 'text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'

  return (
    <a
      href={tool.affiliateUrl}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-bold transition-colors ${classes}`}
    >
      {label}
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  )
}

export default async function ComparisonDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const comparison = comparisons[slug]

  if (!comparison) notFound()

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: comparison.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  const quickWinner =
    comparison.quickVerdict.winner === 'toolA'
      ? comparison.toolA
      : comparison.quickVerdict.winner === 'toolB'
        ? comparison.toolB
        : null

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <AffiliateNav />

      {/* ── Page header band ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-8">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
            <Link href="/" className="hover:text-emerald-700 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/comparisons" className="hover:text-emerald-700 transition-colors">Comparisons</Link>
            <span>/</span>
            <span className="text-gray-600 font-medium">{comparison.toolA.name} vs {comparison.toolB.name}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 uppercase tracking-[0.1em]">
              {comparison.tag}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: comparison.toolA.badgeColor }}>
              {comparison.toolA.badge}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: comparison.toolB.badgeColor }}>
              {comparison.toolB.badge}
            </span>
          </div>

          <h1 className="text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold text-gray-900 tracking-tight leading-tight mb-3">
            {comparison.toolA.name} vs {comparison.toolB.name}
          </h1>
          <p className="text-base text-gray-500 leading-relaxed max-w-3xl">{comparison.intro}</p>
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr,0.7fr] gap-5">
          {/* Quick verdict */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-7">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">Quick Verdict</p>
              <span className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-semibold ${edgeClasses(comparison.quickVerdict.winner)}`}>
                {quickWinner ? `${quickWinner.name} wins overall` : 'It depends on your workflow'}
              </span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mb-5">{comparison.quickVerdict.summary}</p>
            <ul className="space-y-2.5">
              {comparison.quickVerdict.reasons.map((reason) => (
                <li key={reason} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* At a glance */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-gray-400 mb-4">At a Glance</p>
            <div className="space-y-4">
              {[comparison.toolA, comparison.toolB].map((tool) => (
                <div key={tool.name} className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-bold text-gray-900">{tool.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{tool.bestFor}</p>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[0.6rem] font-bold text-white" style={{ backgroundColor: tool.badgeColor }}>
                      {tool.badge}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{tool.price}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{tool.trialInfo}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ComparisonTable
        title="Side-by-side feature comparison"
        caption="This table focuses on where each tool actually feels stronger in day-to-day use, not just which one has the longer marketing checklist."
        comparison={comparison}
        rows={comparison.featureRows}
      />

      <ComparisonTable
        title="Side-by-side pricing comparison"
        caption="Headline price matters, but fit matters more. A cheaper plan is only better value if it covers the workflows you genuinely need."
        comparison={comparison}
        rows={comparison.pricingRows}
      />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <h2 className="text-lg font-bold text-gray-900 mb-6 tracking-tight">Who should pick each tool?</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[
            { tool: comparison.toolA, copy: comparison.pickToolA },
            { tool: comparison.toolB, copy: comparison.pickToolB },
          ].map(({ tool, copy }) => (
            <div key={tool.name} className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: tool.badgeColor }}>
                  {tool.badge}
                </span>
                <h3 className="text-base font-bold text-gray-900">Who should pick {tool.name}</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-5">{copy.intro}</p>
              <ul className="space-y-2.5 mb-6">
                {copy.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {bullet}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <ToolCta tool={tool} label={copy.ctaLabel} />
                <Link
                  href={`/reviews/${tool.reviewSlug}`}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Read {tool.name} review
                </Link>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Affiliate links may earn us a commission at no extra cost to you. Our verdict stays independent.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700 mb-3">Overall Winner</p>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight mb-3">{comparison.overallVerdict.title}</h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">{comparison.overallVerdict.body}</p>
          <p className="text-sm text-gray-600 leading-relaxed">{comparison.overallVerdict.supporting}</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <h2 className="text-lg font-bold text-gray-900 mb-6 tracking-tight">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {comparison.faqs.map((faq) => (
            <div key={faq.question} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight mb-3">
            Still comparing options?
          </h2>
          <p className="text-sm text-gray-500 mb-7 max-w-2xl mx-auto">
            Browse the rest of our SEO software comparisons and individual reviews before you commit to another recurring subscription.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/comparisons" className="inline-flex items-center px-6 py-3 rounded-lg text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-sm">
              Browse comparisons
            </Link>
            <Link href="/reviews" className="inline-flex items-center px-6 py-3 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
              Browse reviews
            </Link>
          </div>
        </div>
      </section>

      <AffiliateFooter />
    </div>
  )
}
