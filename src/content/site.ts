export const siteConfig = {
  name: "sayseo.com",
  url: "https://sayseo.com",
  email: "hello@sayseo.com",
  phone: "+44 (0)20 4525 1408",
  phoneHref: "+442045251408",
  description:
    "sayseo.com is a premium SEO consultancy for the UK and India markets, helping businesses turn search visibility into qualified pipeline through research, technical audits, local SEO, content strategy, and consulting.",
};

export const navigation = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "UK SEO", href: "/uk-seo-services" },
  { label: "India SEO", href: "/india-seo-services" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export const siteHighlights = [
  "Senior-led audits that marketing and development teams can act on",
  "Research focused on qualified demand, not traffic inflation",
  "UK and India market context shaped across London and Bengaluru",
];

export const trustStripItems = [
  {
    title: "Senior-led",
    description: "Strategy stays close to experienced consultants from first brief through prioritisation.",
  },
  {
    title: "Response standard",
    description: "New enquiries are usually reviewed and answered within one business day.",
  },
  {
    title: "UK and India",
    description: "Built around regional nuance, local relevance, and different buyer journeys across both markets.",
  },
  {
    title: "Implementation-ready",
    description: "Recommendations are structured so founders, marketers, and developers can actually use them.",
  },
];

export const whyChooseUs = [
  {
    title: "Calm strategic judgement",
    description:
      "We help teams separate meaningful SEO decisions from noise so planning gets sharper and stakeholder alignment becomes easier.",
  },
  {
    title: "Depth without theatre",
    description:
      "Technical analysis, competitor intelligence, and content planning are grounded in operating reality, not bloated decks or abstract best-practice theatre.",
  },
  {
    title: "Built for growth stages",
    description:
      "The architecture and strategy model are designed to scale into clusters, case studies, location pages, and stronger category positioning over time.",
  },
];

export const trustSignalsExtended = [
  {
    title: "Anonymised growth examples",
    description:
      "Case studies are framed around commercial movement, operating context, and decisions made rather than inflated claims.",
  },
  {
    title: "Senior access from day one",
    description:
      "Enquiries, scoping conversations, and delivery direction stay close to senior consultants rather than being passed into a sales layer.",
  },
  {
    title: "Clear response and scope",
    description:
      "Every page is designed to show what the work includes, who it suits, and how the first conversation is handled.",
  },
];

export const inquiryReasons = [
  "You need a senior view on what is actually worth fixing first.",
  "You want clearer service scope before committing budget or team time.",
  "You need search strategy that fits UK, India, or cross-market growth plans.",
];

export const contactExpectations = [
  {
    title: "We review fit first",
    description:
      "If the brief looks like a strong match, we reply with the best next step rather than forcing a generic sales call.",
  },
  {
    title: "The first conversation is practical",
    description:
      "We use the call to understand the business model, current constraints, and what a sensible SEO scope should actually look like.",
  },
  {
    title: "You leave with clearer direction",
    description:
      "Even before a project starts, the goal is to give your team more clarity about priorities, risks, and likely opportunities.",
  },
];

export const processSteps = [
  {
    title: "Discovery and diagnosis",
    description:
      "We review the business model, current visibility, priority competitors, and internal constraints that shape what can be implemented well.",
  },
  {
    title: "Prioritised roadmap",
    description:
      "You receive a focused plan sequencing quick wins, foundational fixes, and longer-term opportunities around impact and effort.",
  },
  {
    title: "Execution guidance",
    description:
      "Whether your team is in-house or distributed, strategy is translated into clear briefs, technical actions, and editorial priorities.",
  },
  {
    title: "Review and refinement",
    description:
      "We interpret performance movement, refine priorities, and keep the roadmap tied to the signals that matter commercially.",
  },
];

export type FAQItem = {
  question: string;
  answer: string;
};

export const faqItems: FAQItem[] = [
  {
    question: "Do you only work with businesses in the UK and India?",
    answer:
      "Those are the two core markets we focus on, but the consultancy can also support international businesses that need more nuanced regional search planning.",
  },
  {
    question: "Can you work with our internal marketing or development team?",
    answer:
      "Yes. The work is designed to slot into internal teams smoothly, with clear documentation, prioritised recommendations, and practical implementation guidance.",
  },
  {
    question: "Do you offer one-off projects as well as retainers?",
    answer:
      "Yes. Technical audits, competitor analysis, and keyword research can all be delivered as standalone projects, while ongoing consulting is available on retainer.",
  },
  {
    question: "What types of businesses benefit most from sayseo.com?",
    answer:
      "Service brands, B2B companies, local businesses, and growth-stage teams benefit most when they need stronger SEO direction without wasting time on generic agency process.",
  },
  {
    question: "Is content strategy part of the offer or a separate service?",
    answer:
      "Content strategy can be scoped on its own, but it usually performs best when informed by keyword research, competitive positioning, and technical SEO context.",
  },
];

export const regionalPages = {
  uk: {
    title: "SEO services shaped for competitive UK categories and trust-sensitive buying journeys.",
    description:
      "For many UK businesses, ranking is only part of the job. Search visibility also has to support brand trust, local pack presence, and a buying journey that often includes multiple stakeholders.",
    highlights: [
      "Local SEO for multi-location service brands",
      "Research built around high-intent UK search behaviour",
      "Consulting support for in-house teams and founders",
    ],
    focus: [
      {
        title: "Local trust signals",
        description:
          "Google Business Profile, review quality, regional landing pages, and service-area coverage need to work together for local discovery.",
      },
      {
        title: "Commercial keyword alignment",
        description:
          "The strategy emphasises terms tied to service demand, qualified enquiries, and category authority rather than broad vanity reach.",
      },
      {
        title: "Implementation clarity",
        description:
          "Recommendations are prioritised so they fit teams with limited development cycles and competing marketing initiatives.",
      },
    ],
    engagements: [
      "Technical audits for service businesses and B2B sites",
      "Local SEO programmes for multi-location growth",
      "Consulting retainers for in-house marketing teams",
    ],
  },
  india: {
    title: "SEO services designed for India’s scale, complexity, and fast-moving category demand.",
    description:
      "India-focused SEO often needs a different balance of commercial positioning, local nuance, and scalable content architecture. We shape the plan around how people actually search across regions and categories.",
    highlights: [
      "Category growth planning for fast-scaling brands",
      "Support for multilingual and regionally nuanced intent",
      "Clear prioritisation for lean internal teams",
    ],
    focus: [
      {
        title: "Search behaviour by region",
        description:
          "We account for differences in language, regional relevance, and how category maturity changes the search journey.",
      },
      {
        title: "Efficient content architecture",
        description:
          "The goal is to build a site structure that can scale into city pages, service clusters, and educational content without becoming unwieldy.",
      },
      {
        title: "Competitive positioning",
        description:
          "The strategy aligns SEO with pricing, proposition clarity, and category differentiation so the right traffic converts more consistently.",
      },
    ],
    engagements: [
      "Keyword research and competitor analysis for India-first categories",
      "SEO consulting for startups and growth-stage operators",
      "Content and local SEO planning for pan-India visibility",
    ],
  },
};
