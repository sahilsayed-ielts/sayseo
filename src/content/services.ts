import type { FAQItem } from "./site";

export type Service = {
  slug: string;
  title: string;
  summary: string;
  intro: string;
  seoTitle?: string;
  seoDescription?: string;
  packageTitle?: string;
  packageSummary?: string;
  packageIncludes?: string[];
  process?: Array<{
    title: string;
    description: string;
  }>;
  deliverables: string[];
  outcomes: string[];
  idealFor: string[];
  timeline: string;
  detailPage: boolean;
  faqItems?: FAQItem[];
  advantages: Array<{
    title: string;
    description: string;
  }>;
};

export const services: Service[] = [
  {
    slug: "keyword-research",
    title: "Keyword research",
    seoTitle: "Keyword Research Services for UK and India Growth Teams",
    seoDescription:
      "Senior-led keyword research for businesses in the UK and India, built around commercial intent, funnel stage, and scalable SEO architecture.",
    packageTitle: "Keyword research package",
    packageSummary:
      "A focused research engagement for teams that need clearer demand mapping, better page targeting, and a more commercial content plan.",
    packageIncludes: [
      "Intent-led keyword segmentation",
      "Priority page and topic recommendations",
      "Cluster opportunities for future expansion",
      "Practical handoff for content, SEO, or leadership teams",
    ],
    process: [
      {
        title: "Commercial brief review",
        description:
          "We start by understanding the offer, revenue priorities, and where search should contribute more meaningfully.",
      },
      {
        title: "Demand and intent mapping",
        description:
          "Search behaviour is grouped by decision stage, service line, and opportunity so the plan reflects real buying intent.",
      },
      {
        title: "Priority handoff",
        description:
          "The work ends with a usable prioritisation model your team can apply to site structure, landing pages, and editorial planning.",
      },
    ],
    summary:
      "Search demand research mapped to commercial intent, conversion stage, and the pages most likely to earn qualified demand.",
    intro:
      "Our keyword research process goes beyond raw volume. We identify intent patterns, decision-stage signals, and the content structures needed to compete for the terms that actually matter.",
    deliverables: [
      "Segmented keyword universe by intent, service line, and opportunity",
      "Priority clusters for transactional, commercial, and educational demand",
      "Recommended page structure for hubs, service pages, and supporting content",
      "Competitive gap analysis for missing topics and weak coverage",
      "Opportunity scoring to guide short-term and long-term execution",
    ],
    outcomes: [
      "Sharper content planning",
      "Better page targeting",
      "Stronger alignment between SEO and revenue goals",
    ],
    idealFor: [
      "Businesses launching a new SEO strategy or rebuilding site architecture",
      "In-house teams who need confidence about which terms deserve priority",
      "Service brands moving from generic content output to demand-led planning",
    ],
    timeline: "1 to 2 weeks",
    detailPage: true,
    faqItems: [
      {
        question: "What makes this keyword research different from a basic export?",
        answer:
          "The work is structured around commercial intent, page-type opportunity, and business priorities rather than just search volume and difficulty scores.",
      },
      {
        question: "Can this be used by our content and SEO teams together?",
        answer:
          "Yes. The output is designed so strategists, writers, founders, and SEO leads can use the same opportunity map and page priorities.",
      },
      {
        question: "Is keyword research useful before a site relaunch?",
        answer:
          "Yes. It is often most valuable before a relaunch because it helps shape information architecture, service-page hierarchy, and content cluster planning early.",
      },
    ],
    advantages: [
      {
        title: "Reduced guesswork",
        description:
          "Your content plan becomes grounded in intent and opportunity instead of assumptions about what might rank.",
      },
      {
        title: "Stronger internal alignment",
        description:
          "Marketing, leadership, and content teams can work from the same keyword framework and priority map.",
      },
      {
        title: "Better content ROI",
        description:
          "You invest in pages and topics that are more likely to compound strategically over time.",
      },
    ],
  },
  {
    slug: "competitor-analysis",
    title: "Competitor analysis",
    seoTitle: "Competitor Analysis Services for SEO Growth Strategy",
    seoDescription:
      "SEO competitor analysis for UK and India markets, showing how competing brands win visibility and where your category can be challenged more intelligently.",
    packageTitle: "Competitor gap report",
    packageSummary:
      "A strategic competitor review for teams that need clearer positioning, faster opportunity spotting, and more realistic competitive priorities.",
    packageIncludes: [
      "Direct and search competitor review",
      "Gap analysis across page types and topic coverage",
      "Differentiation opportunities for service positioning",
      "Recommended next moves for faster traction",
    ],
    process: [
      {
        title: "Category framing",
        description:
          "We define the real competitive set, including search competitors that may not appear in your offline market map.",
      },
      {
        title: "Visibility and content assessment",
        description:
          "We review how rivals structure demand capture, authority-building, and commercial content across the category.",
      },
      {
        title: "Opportunity and positioning guidance",
        description:
          "The final output shows where to compete directly, where to differentiate, and what that means for the roadmap.",
      },
    ],
    summary:
      "A strategic view of how competing brands win visibility, shape demand, and create search advantages you can realistically challenge.",
    intro:
      "We study the competitive landscape to show where the category is saturated, where competitors are vulnerable, and where your brand can build differentiated authority.",
    deliverables: [
      "Organic search comparison across direct and indirect competitors",
      "Page-type analysis to identify structural and content advantages",
      "Gap assessment covering keywords, authority, SERP features, and local visibility",
      "Strategic opportunities for differentiation and faster traction",
      "Clear recommendations for messaging, architecture, and topic ownership",
    ],
    outcomes: [
      "Clearer competitive positioning",
      "Faster identification of realistic opportunities",
      "More informed investment decisions",
    ],
    idealFor: [
      "Founders entering a crowded category and needing sharper strategic focus",
      "Marketing leads validating where the market can still be won",
      "Businesses preparing a site relaunch or new market push",
    ],
    timeline: "1 to 2 weeks",
    detailPage: true,
    faqItems: [
      {
        question: "Does competitor analysis only look at direct competitors?",
        answer:
          "No. We look at both direct and search competitors, because the brands taking SERP visibility are not always the same ones you compete with commercially.",
      },
      {
        question: "What decisions does this help with most?",
        answer:
          "It is especially useful for category positioning, service-page planning, topic gaps, and deciding where to compete aggressively versus where to differentiate.",
      },
      {
        question: "Can this support a new market or relaunch plan?",
        answer:
          "Yes. It often helps teams entering a new market or relaunching a site understand where traction is realistic and where the category is already saturated.",
      },
    ],
    advantages: [
      {
        title: "Strategic perspective",
        description:
          "You get a realistic picture of the market instead of planning SEO in a vacuum.",
      },
      {
        title: "Smarter prioritisation",
        description:
          "Workstreams are chosen based on leverage, not just popularity or competitor imitation.",
      },
      {
        title: "Clearer differentiation",
        description:
          "The analysis helps you decide where to match, where to exceed, and where to take a different angle.",
      },
    ],
  },
  {
    slug: "technical-seo-audit",
    title: "Technical SEO audit",
    seoTitle: "Technical SEO Audit Services for Scalable Organic Growth",
    seoDescription:
      "Technical SEO audits for UK and India-focused businesses covering crawl, indexation, template quality, internal linking, and structural growth blockers.",
    packageTitle: "Technical SEO audit package",
    packageSummary:
      "A senior-led audit engagement for teams that need implementation-ready priorities before scaling, redesigning, or fixing hidden SEO leakage.",
    packageIncludes: [
      "Template and crawl review",
      "Priority issue matrix for engineering teams",
      "Annotated recommendations and risk notes",
      "Clear guidance for next sprint planning",
    ],
    process: [
      {
        title: "Technical discovery",
        description:
          "We assess the site structure, key templates, and likely technical risks that may be suppressing performance.",
      },
      {
        title: "Issue prioritisation",
        description:
          "Findings are filtered against business impact, implementation effort, and structural importance rather than reported as a long checklist.",
      },
      {
        title: "Implementation guidance",
        description:
          "The outcome is a usable audit your developers and stakeholders can work from without needing to decode SEO jargon first.",
      },
    ],
    summary:
      "A practical audit covering crawl, indexation, speed, template quality, and structural issues that quietly hold back growth.",
    intro:
      "Our technical SEO audits are built for real implementation. We identify the issues that matter, explain why they matter, and prioritise them around impact, urgency, and engineering reality.",
    deliverables: [
      "Crawl and indexation review across key templates and content types",
      "Core technical findings covering rendering, duplication, canonicals, internal linking, and site health",
      "Page-speed and user-experience observations relevant to SEO performance",
      "Priority matrix for fixes, grouped by impact and implementation effort",
      "Annotated recommendations for technical teams and stakeholders",
    ],
    outcomes: [
      "Cleaner technical foundations",
      "Improved indexation and discoverability",
      "Greater confidence in the site’s ability to scale",
    ],
    idealFor: [
      "Teams preparing a migration, redesign, or platform clean-up",
      "Businesses with inconsistent rankings despite strong content intent",
      "Sites that have grown quickly and need structural quality control",
    ],
    timeline: "1 to 3 weeks",
    detailPage: true,
    faqItems: [
      {
        question: "Will the audit be understandable for developers and non-technical stakeholders?",
        answer:
          "Yes. Findings are prioritised and explained clearly so both technical teams and commercial stakeholders can understand what matters and why.",
      },
      {
        question: "Do you audit templates as well as individual pages?",
        answer:
          "Yes. Template-level issues are often where the biggest structural SEO gains are found, especially on sites that need to scale content or location pages.",
      },
      {
        question: "When should a business commission a technical SEO audit?",
        answer:
          "It is especially useful before migrations, redesigns, platform clean-ups, major content expansion, or whenever rankings feel inconsistent despite strong demand.",
      },
    ],
    advantages: [
      {
        title: "Focused engineering effort",
        description:
          "Your developers receive a shorter, more useful list of issues that actually affect performance and scale.",
      },
      {
        title: "Reduced SEO leakage",
        description:
          "The audit helps stop the hidden technical problems that dilute authority or block important pages from performing.",
      },
      {
        title: "Stronger platform readiness",
        description:
          "You build a site foundation that can support more content, more locations, and more strategic growth later.",
      },
    ],
  },
  {
    slug: "on-page-seo",
    title: "On-page SEO",
    summary:
      "Refinement of service pages and commercial templates so relevance, trust, and conversion intent reinforce one another.",
    intro:
      "On-page SEO focuses on how pages communicate relevance, trust, clarity, and action. The goal is to improve how both search engines and prospective customers interpret the page.",
    deliverables: [
      "Page-level recommendations for headings, copy structure, metadata, and internal linking",
      "Template guidance for service pages, city pages, and commercial landing pages",
      "Content refinement suggestions for intent matching and conversion support",
    ],
    outcomes: [
      "Stronger page relevance",
      "Clearer user journeys",
      "Improved supporting signals for ranking and conversion",
    ],
    idealFor: [
      "Teams refreshing underperforming pages",
      "Businesses scaling service or location landing pages",
    ],
    timeline: "1 to 2 weeks",
    detailPage: false,
    advantages: [
      {
        title: "Better page clarity",
        description: "Pages communicate value, relevance, and next steps more effectively.",
      },
      {
        title: "More consistent optimisation",
        description: "Templates become easier to scale without drifting in quality.",
      },
      {
        title: "Higher trust",
        description: "Users receive clearer signals about expertise, service fit, and outcomes.",
      },
    ],
  },
  {
    slug: "local-seo",
    title: "Local SEO",
    summary:
      "Local growth planning for businesses that need stronger visibility across maps, service areas, and geo-modified search demand.",
    intro:
      "Local SEO connects on-site structure, Google Business Profile signals, reviews, and regional relevance so nearby demand becomes more visible and easier to convert.",
    deliverables: [
      "Local landing page strategy and internal linking guidance",
      "Google Business Profile optimisation priorities",
      "Review and reputation workflow recommendations",
    ],
    outcomes: [
      "Stronger local map visibility",
      "Better regional page structure",
      "Clearer alignment between SEO and local demand",
    ],
    idealFor: [
      "Service businesses covering multiple cities or locations",
      "Brands expanding geographic reach",
    ],
    timeline: "2 to 4 weeks",
    detailPage: false,
    advantages: [
      {
        title: "Improved local discovery",
        description: "Potential customers can find the right location and offering more easily.",
      },
      {
        title: "Regional relevance",
        description: "Your site better reflects how people search across different cities or service areas.",
      },
      {
        title: "Stronger trust cues",
        description: "Reviews, profiles, and local pages work together instead of competing for attention.",
      },
    ],
  },
  {
    slug: "content-strategy",
    title: "Content strategy",
    summary:
      "Editorial strategy shaped by search demand, buyer questions, conversion goals, and the authority signals your market expects.",
    intro:
      "We design content systems that support both discovery and decision-making, with topics structured to strengthen service visibility and category authority.",
    deliverables: [
      "Content roadmap by topic cluster and business objective",
      "Editorial themes tied to search intent and funnel stage",
      "Internal-linking and authority-building recommendations",
    ],
    outcomes: [
      "More strategic publishing",
      "Better topic ownership",
      "Greater long-term search visibility",
    ],
    idealFor: [
      "Brands building a durable organic content engine",
      "Teams needing structure beyond isolated blog ideas",
    ],
    timeline: "2 to 3 weeks",
    detailPage: false,
    advantages: [
      {
        title: "Clearer publishing priorities",
        description: "Teams know what to publish, why it matters, and how it supports service growth.",
      },
      {
        title: "Stronger authority signals",
        description: "Content clusters help search engines understand depth and topical relevance.",
      },
      {
        title: "Improved internal linking",
        description: "Pages support one another more intentionally across the site architecture.",
      },
    ],
  },
  {
    slug: "seo-consulting",
    title: "SEO consulting",
    summary:
      "Ongoing strategic support for founders, marketing leads, and internal teams that need senior SEO judgement on tap.",
    intro:
      "Consulting is designed for businesses that need high-quality SEO thinking across planning, prioritisation, stakeholder communication, and performance review.",
    deliverables: [
      "Regular strategy reviews and roadmap refinement",
      "Support for internal planning, reporting, and team alignment",
      "Access to senior SEO input across initiatives and decisions",
    ],
    outcomes: [
      "Faster strategic decisions",
      "Better cross-functional alignment",
      "Stronger long-term SEO confidence",
    ],
    idealFor: [
      "Founder-led teams without a dedicated senior SEO hire",
      "In-house marketing teams needing specialist support",
    ],
    timeline: "Monthly retainer",
    detailPage: false,
    advantages: [
      {
        title: "Senior support without overhead",
        description: "You get specialist guidance without building a full internal SEO function first.",
      },
      {
        title: "Better prioritisation rhythm",
        description: "The roadmap stays responsive to product changes, content needs, and technical realities.",
      },
      {
        title: "Clearer leadership communication",
        description: "SEO decisions are easier to explain and defend with experienced strategic framing.",
      },
    ],
  },
];

export const detailServices = services.filter((service) => service.detailPage);

export function getServiceBySlug(slug: string) {
  return services.find((service) => service.slug === slug);
}
