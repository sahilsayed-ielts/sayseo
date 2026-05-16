export const siteConfig = {
  name: "SaySEO",
  domainLabel: "sayseo.co.uk",
  url: "https://sayseo.co.uk",
  email: "hello@sayseo.com",
  phone: "+44 (0)20 4525 1408",
  phoneHref: "+442045251408",
  baseLocation: "London, United Kingdom",
  serviceRegions: ["United Kingdom", "India"],
  description:
    "Independent SEO tool reviews, comparisons, and buying guides for SEO professionals and digital marketers. Find the right tool for every job.",
};

export const navigation = [
  { label: "Home", href: "/" },
  { label: "Reviews", href: "/reviews" },
  { label: "Comparisons", href: "/comparisons" },
  { label: "Best Lists", href: "/best-seo-tools" },
  { label: "Blog", href: "/blog" },
  { label: "Free SEO Tools", href: "/app" },
];

export type FAQItem = {
  question: string;
  answer: string;
};

export const platformPillars = [
  {
    eyebrow: "Learn SEO",
    title: "Structured SEO education for real sites and real constraints.",
    description:
      "Use guides, learning paths, and practical examples to understand how SEO works before you buy anything.",
    href: "/learn-seo",
  },
  {
    eyebrow: "Tools",
    title: "Use practical calculators, estimators, and planning tools.",
    description:
      "Move faster with lightweight utilities for keyword mapping, metadata scoping, task estimation, and content planning.",
    href: "/tools",
  },
  {
    eyebrow: "SEO Tasks",
    title: "Request clearly scoped SEO work without a vague retainer process.",
    description:
      "Estimate the cost of defined SEO tasks and buy the work your site actually needs.",
    href: "/seo-tasks",
  },
  {
    eyebrow: "Marketplace",
    title: "See where the platform is heading next.",
    description:
      "sayseo is growing toward a marketplace for specialist SEO support, task delivery, and vetted execution help.",
    href: "/marketplace",
  },
];

export const footerGroups = [
  {
    title: "Platform",
    links: [
      { label: "Home", href: "/" },
      { label: "Learn SEO", href: "/learn-seo" },
      { label: "Tools", href: "/tools" },
      { label: "SEO Tasks", href: "/seo-tasks" },
      { label: "Marketplace", href: "/marketplace" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Popular Paths",
    links: [
      { label: "Task quote estimator", href: "/seo-tasks#quote-estimator" },
      { label: "Metadata scope calculator", href: "/tools#metadata-scope-calculator" },
      { label: "Keyword mapping guide", href: "/learn-seo#keyword-research" },
      { label: "Technical checklist builder", href: "/tools#technical-seo-checklist-builder" },
      { label: "Marketplace beta", href: "/marketplace#beta" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "Advanced Services", href: "/services" },
      { label: "UK SEO", href: "/uk-seo-services" },
      { label: "India SEO", href: "/india-seo-services" },
    ],
  },
];

export const homepageFaqs: FAQItem[] = [
  {
    question: "Is sayseo an SEO agency?",
    answer:
      "No. sayseo is positioned as a content, tools, and SEO task platform. It helps users learn SEO, use practical utilities, and request clearly scoped work without defaulting to an agency retainer model.",
  },
  {
    question: "Can I use sayseo if I only need one piece of SEO work?",
    answer:
      "Yes. The platform is designed for defined SEO tasks such as keyword mapping, content briefs, metadata optimisation, internal linking plans, and technical reviews.",
  },
  {
    question: "Are the tools free or paid?",
    answer:
      "Some tools are designed as free planning and estimation utilities, while others support commercial task scoping and future marketplace workflows.",
  },
  {
    question: "Who is sayseo built for?",
    answer:
      "The platform is built for website owners, small businesses, publishers, ecommerce teams, in-house marketers, and agencies needing specialist SEO support.",
  },
];

export const contactExpectations = [
  {
    title: "Support-first replies",
    description:
      "The contact flow is designed for general questions, tool feedback, task requests, marketplace interest, and partnerships rather than a hard sales process.",
  },
  {
    title: "Fast routing",
    description:
      "Most new messages receive a direct reply within one business day with the right next step, whether that is a resource, a task quote, or a product conversation.",
  },
  {
    title: "Clear next action",
    description:
      "The aim is to guide you toward a useful page, a practical task scope, or the right support route without unnecessary back-and-forth.",
  },
];

export const supportReasons = [
  "You want help choosing between a guide, a tool, or a paid SEO task.",
  "You have feedback on a tool, calculator, or learning page.",
  "You need white-label or specialist SEO support for a site or client project.",
];

export const newsletterBlock = {
  eyebrow: "Stay updated",
  title: "Get new SEO guides, tools, and task updates without the noise.",
  description:
    "Follow sayseo as the platform grows through practical SEO resources, product updates, and scoped delivery options for modern websites.",
  primaryLabel: "Follow platform updates",
  primaryHref: "/contact",
  secondaryLabel: "Browse the blog",
  secondaryHref: "/blog",
};

export const regionalPages = {
  uk: {
    title:
      "UK SEO support for businesses that need stronger visibility, clearer page strategy, and more useful execution paths.",
    description:
      "For UK businesses, SEO has to support trust, commercial relevance, local visibility, and the practical constraints of real teams. sayseo approaches that through education, tools, task buying, and deeper support routes.",
    highlights: [
      "UK-focused SEO resources and support",
      "Tools, tasks, and specialist help in one platform",
      "Useful for businesses, website owners, and agencies",
    ],
    focus: [
      {
        title: "Trust-sensitive search journeys",
        description:
          "Service pages, category pages, local landing pages, and supporting guides all need to communicate trust while still capturing high-intent search demand.",
      },
      {
        title: "Practical delivery support",
        description:
          "Metadata, internal linking, briefs, technical fixes, and local improvements need to be easier to scope and easier to buy.",
      },
      {
        title: "Flexible support formats",
        description:
          "Users can start with resources and tools, move into task estimates, and only use deeper support routes when the problem genuinely calls for them.",
      },
    ],
    engagements: [
      "Technical SEO reviews for UK business sites and content estates",
      "Productised SEO tasks for specific page, metadata, linking, and content improvements",
      "Specialist support for in-house teams and agency workflows",
    ],
  },
  india: {
    title:
      "India SEO services for teams that need scalable organic growth, clearer priorities, and practical execution support.",
    description:
      "For Indian businesses, publishers, ecommerce brands, startups, and agencies, SEO often has to support fast category expansion, local and national visibility, and coordination across multiple stakeholders. sayseo approaches that through learning resources, tools, scoped tasks, and deeper specialist support.",
    highlights: [
      "India-focused SEO resources and support",
      "Built for businesses, publishers, ecommerce teams, and agencies",
      "Flexible paths from learning and tools to scoped delivery support",
    ],
    focus: [
      {
        title: "Large-category and regional search planning",
        description:
          "Indian search growth often spans broad categories, service geographies, city-level intent, and multiple stages of commercial demand. Page strategy has to stay structured as the site expands.",
      },
      {
        title: "Execution support across busy teams",
        description:
          "SEO momentum depends on making keyword research, metadata, briefs, technical fixes, and internal linking easier to scope and easier to hand off across marketing, product, and content teams.",
      },
      {
        title: "Flexible specialist support",
        description:
          "Some teams only need better planning tools and educational resources, while others need clearly defined SEO tasks or white-label specialist help that fits an existing workflow.",
      },
    ],
    engagements: [
      "Keyword research, page mapping, and information architecture support for growing Indian sites",
      "Technical SEO reviews for content-heavy, ecommerce, and lead generation websites",
      "Scoped delivery support for in-house teams, startups, and agency partners",
    ],
  },
};
