import { SourceType, IntentType, FunnelStage, SourceQuery } from './freeSources'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserInputs {
  websiteUrl: string
  topic: string
  country: string
  audience: string
  businessGoal: string
}

export interface PriorityScores {
  searchDemand: number
  aiAnswerPotential: number
  commercialIntent: number
  contentGap: number
  total: number
}

export interface PromptResult {
  id: string
  prompt: string
  sourceType: SourceType
  intent: IntentType
  funnelStage: FunnelStage
  scores: PriorityScores
  recommendedSection: string
  contentAction: string
}

export interface RecommendedSection {
  title: string
  purpose: string
  contentType: string
  priority: 'High' | 'Medium' | 'Low'
  wordCount: number
}

export interface FAQItem {
  question: string
  answer: string
}

export interface SchemaRecommendation {
  schemaType: string
  reason: string
  placement: string
  priority: 'High' | 'Medium' | 'Low'
}

export interface InternalLink {
  anchorText: string
  targetPage: string
  reason: string
}

export interface ContentBriefSection {
  h2: string
  h3s: string[]
  notes: string
  wordCount: number
}

export interface ContentBrief {
  pageTitle: string
  h1: string
  metaDescription: string
  targetWordCount: number
  primaryKeyword: string
  secondaryKeywords: string[]
  contentGoal: string
  sections: ContentBriefSection[]
  schemaTypes: string[]
  cta: string
}

export interface GeoResults {
  prompts: PromptResult[]
  recommendedSections: RecommendedSection[]
  faqItems: FAQItem[]
  schemaRecommendations: SchemaRecommendation[]
  internalLinks: InternalLink[]
  contentBrief: ContentBrief
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

function getScores(intent: IntentType, sourceType: SourceType): PriorityScores {
  const base: Record<IntentType, Omit<PriorityScores, 'total'>> = {
    Informational:     { searchDemand: 4, aiAnswerPotential: 5, commercialIntent: 1, contentGap: 3 },
    Commercial:        { searchDemand: 5, aiAnswerPotential: 3, commercialIntent: 5, contentGap: 3 },
    Comparison:        { searchDemand: 4, aiAnswerPotential: 5, commercialIntent: 3, contentGap: 4 },
    Local:             { searchDemand: 5, aiAnswerPotential: 3, commercialIntent: 4, contentGap: 3 },
    'Problem-solving': { searchDemand: 3, aiAnswerPotential: 5, commercialIntent: 3, contentGap: 4 },
    'Trust-building':  { searchDemand: 3, aiAnswerPotential: 4, commercialIntent: 3, contentGap: 4 },
    Transactional:     { searchDemand: 4, aiAnswerPotential: 1, commercialIntent: 5, contentGap: 2 },
  }

  const s = { ...base[intent] }

  // Website-extracted content gets boosted content gap score
  // (it shows what already exists — helping identify what's missing around it)
  if (sourceType === 'Extracted from website') {
    s.contentGap = Math.max(1, s.contentGap - 1)
  }

  return { ...s, total: s.searchDemand + s.aiAnswerPotential + s.commercialIntent + s.contentGap }
}

// ─── Section + action helpers ─────────────────────────────────────────────────

function sectionForIntent(
  intent: IntentType,
  topic: string,
  audience: string,
  country: string,
): string {
  const map: Record<IntentType, string> = {
    Informational:     `What is ${topic} — Complete Guide for ${audience}`,
    Commercial:        `Best ${topic} for ${audience} in ${country}`,
    Comparison:        `${topic}: Formats, Providers and Options Compared`,
    Local:             `${topic} for ${audience} in ${country}`,
    'Problem-solving': `How ${topic} Solves Common ${audience} Challenges`,
    'Trust-building':  `Why ${audience} Trust This ${topic}`,
    Transactional:     `Get Started with ${topic} — Pricing and Enrolment`,
  }
  return map[intent]
}

function actionForIntent(intent: IntentType, topic: string): string {
  const map: Record<IntentType, string> = {
    Informational:     `Write an educational guide answering this question. Use H2/H3 structure and add FAQPage schema.`,
    Commercial:        `Create a pricing or comparison landing page. Include clear CTAs and a structured pricing table.`,
    Comparison:        `Build a dedicated comparison page with a table format. Add review schema if applicable.`,
    Local:             `Add geo-specific content to your ${topic} page. Include local signals and country-specific data.`,
    'Problem-solving': `Write a problem-solution article. Lead with the audience pain point and show how ${topic} solves it.`,
    'Trust-building':  `Add testimonials, credentials and results data. Apply Review or AggregateRating schema markup.`,
    Transactional:     `Optimise your enrolment or sales page. Add a strong CTA, trust badges and clear next steps.`,
  }
  return map[intent]
}

// ─── Enrich raw queries → PromptResult[] ─────────────────────────────────────

export function enrichQueries(
  queries: SourceQuery[],
  inputs: UserInputs,
): PromptResult[] {
  return queries.map((q, i) => ({
    id: `p${i + 1}`,
    prompt: q.query,
    sourceType: q.sourceType,
    intent: q.intent,
    funnelStage: q.funnelStage,
    scores: getScores(q.intent, q.sourceType),
    recommendedSection: sectionForIntent(q.intent, inputs.topic, inputs.audience, inputs.country),
    contentAction: actionForIntent(q.intent, inputs.topic),
  }))
}

// ─── Static outputs (don't need live data) ────────────────────────────────────

function buildRecommendedSections(
  topic: string,
  audience: string,
  country: string,
): RecommendedSection[] {
  return [
    { title: `Best ${topic} for ${audience} in ${country}`, purpose: 'Primary landing page hero — targets the highest-volume comparison query', contentType: 'Landing page hero', priority: 'High', wordCount: 300 },
    { title: `Who this ${topic} is for`, purpose: 'Helps AI engines and users quickly qualify themselves as the right audience', contentType: 'Audience qualifier section', priority: 'High', wordCount: 150 },
    { title: `${topic} options and formats`, purpose: 'Addresses format comparison queries — individual, group, online vs in-person', contentType: 'Comparison section', priority: 'High', wordCount: 400 },
    { title: `Your step-by-step journey with ${topic}`, purpose: 'Shows the transformation process — builds trust and answers "what will I get?"', contentType: 'Process / HowTo section', priority: 'High', wordCount: 350 },
    { title: `One-to-one vs group ${topic}: what works best`, purpose: 'Comparison content for the delivery-format query cluster', contentType: 'Comparison page or section', priority: 'Medium', wordCount: 500 },
    { title: `${topic} pricing in ${country}`, purpose: 'Commercial intent page — cost queries are high volume', contentType: 'Pricing page or section', priority: 'High', wordCount: 250 },
    { title: `${topic} team and credentials`, purpose: 'Trust-building — AI search engines rank credentialed sources higher', contentType: 'About / Trust page', priority: 'Medium', wordCount: 300 },
    { title: `${audience} success stories`, purpose: 'Social proof — addresses "is this worth it?" query cluster', contentType: 'Testimonials / Case studies', priority: 'Medium', wordCount: 400 },
    { title: `Frequently asked questions about ${topic}`, purpose: 'Captures PAA and conversational AI queries in one structured section', contentType: 'FAQ section with FAQPage schema', priority: 'High', wordCount: 600 },
    { title: `Structured data and schema markup for ${topic}`, purpose: 'Technical layer — ensures AI engines can read and cite page content correctly', contentType: 'Technical / Schema implementation', priority: 'Medium', wordCount: 0 },
  ]
}

function buildFAQItems(
  topic: string,
  audience: string,
  country: string,
  goal: string,
): FAQItem[] {
  return [
    { question: `What is the best ${topic} for ${audience}?`, answer: `The best ${topic} for ${audience} depends on your specific goals, schedule and budget. Look for providers with a strong track record of results, qualified instructors, flexible scheduling and dedicated support for ${audience} in ${country}. We recommend booking a free consultation or trial before committing.` },
    { question: `How much does ${topic} cost in ${country}?`, answer: `The cost of ${topic} in ${country} varies depending on the format (group, one-to-one, self-paced), duration and provider reputation. Always compare what is included before deciding. Many providers offer free trials or taster sessions.` },
    { question: `Can ${audience} do ${topic} online?`, answer: `Yes. Online ${topic} has become a popular and effective option for ${audience} in ${country} — removing the need to commute and allowing study at flexible times. Many ${audience} achieve strong results online because of access to specialist instructors regardless of location.` },
    { question: `How long does ${topic} take to show results?`, answer: `Most ${audience} see measurable progress within four to eight weeks of consistent effort. The timeline depends on your starting point, weekly time commitment, and the quality of ${topic} chosen. A structured programme with regular feedback will accelerate progress.` },
    { question: `Is one-to-one ${topic} better than group ${topic}?`, answer: `One-to-one ${topic} offers personalised feedback at a pace tailored to you — ideal if you have a specific deadline or want faster progress. Group ${topic} is more affordable and offers peer learning. Many ${audience} find a combination most effective.` },
    { question: `What should ${audience} look for when choosing ${topic}?`, answer: `Key factors: qualified and experienced instructors, a structured curriculum with clear milestones, regular progress assessments, student reviews, flexible scheduling, and transparent pricing. A free trial or demo session helps evaluate quality before paying.` },
    { question: `Is ${topic} worth the investment for ${audience} in ${country}?`, answer: `For ${audience} in ${country} with a clear goal — such as ${goal} — ${topic} delivers strong return on investment. The key is choosing a programme that is structured, taught by qualified instructors, and supported by evidence of past student success.` },
    { question: `How do I get started with ${topic}?`, answer: `Define your goal and timeline first. Compare two or three reputable providers and check their reviews and instructor credentials. Book a free trial or introductory session to assess fit. Once enrolled, commit to a consistent schedule and take advantage of all feedback opportunities.` },
  ]
}

function buildSchemaRecommendations(
  topic: string,
  audience: string,
): SchemaRecommendation[] {
  return [
    { schemaType: 'FAQPage', reason: `Marks up your FAQ section so search and AI engines extract Q&A pairs directly — highest-impact schema for ${topic} pages`, placement: `FAQ section of your main ${topic} page`, priority: 'High' },
    { schemaType: 'Course', reason: `Signals to search engines that your ${topic} is a structured educational programme — increases rich result eligibility`, placement: `Main ${topic} landing page`, priority: 'High' },
    { schemaType: 'Organization', reason: 'Establishes entity identity — AI search engines use this to understand who you are and assess citation worthiness', placement: 'Homepage or About page', priority: 'High' },
    { schemaType: 'AggregateRating', reason: `Adds star ratings to ${topic} pages in SERPs — increases CTR and trust signals for ${audience}`, placement: 'Testimonials or pricing section', priority: 'Medium' },
    { schemaType: 'BreadcrumbList', reason: 'Helps search engines understand your site hierarchy and displays breadcrumbs in SERPs', placement: 'All main pages', priority: 'Medium' },
    { schemaType: 'WebSite + SearchAction', reason: 'Enables sitelinks search box in Google — signals your site as a definitive resource for brand searches', placement: 'Homepage only', priority: 'Low' },
  ]
}

function buildInternalLinks(
  topic: string,
  audience: string,
  country: string,
  goal: string,
): InternalLink[] {
  return [
    { anchorText: `free ${topic} resources`, targetPage: `/resources`, reason: `Supports ${audience} at the awareness stage and passes authority to deeper content` },
    { anchorText: `${topic} pricing and packages`, targetPage: `/pricing`, reason: 'Links commercial-intent users directly to the conversion page' },
    { anchorText: `${topic} success stories`, targetPage: `/testimonials`, reason: 'Builds trust for users in the consideration phase' },
    { anchorText: `${topic} FAQ`, targetPage: `#faq`, reason: 'Anchors deep links to the FAQ section — supports conversational AI query capture' },
    { anchorText: `book a free ${topic} trial`, targetPage: `/contact`, reason: 'Primary conversion CTA — highest priority internal link on all pages' },
    { anchorText: `about our ${topic} instructors`, targetPage: `/about`, reason: 'Trust signal — AI engines value credentialed author pages for E-E-A-T' },
  ]
}

function buildContentBrief(
  topic: string,
  audience: string,
  country: string,
  goal: string,
): ContentBrief {
  return {
    pageTitle: `Best ${topic} for ${audience} in ${country} — Expert-Led Programme`,
    h1: `Best ${topic} for ${audience} in ${country}`,
    metaDescription: `Find the best ${topic} for ${audience} in ${country}. Compare options, prices and formats. Start with a free trial today.`,
    targetWordCount: 2500,
    primaryKeyword: `best ${topic} for ${audience}`,
    secondaryKeywords: [
      `${topic} ${country}`,
      `${topic} for ${audience}`,
      `online ${topic}`,
      `affordable ${topic} ${country}`,
      `${topic} cost ${country}`,
    ],
    contentGoal: goal,
    sections: [
      { h2: `What is ${topic}?`, h3s: [`Why ${audience} choose ${topic}`, `How ${topic} works`], notes: 'Clear, jargon-free introduction. Answer the primary informational query. 300–400 words.', wordCount: 350 },
      { h2: `Best ${topic} options for ${audience} in ${country}`, h3s: [`Individual ${topic}`, `Group ${topic}`, `Self-paced ${topic}`], notes: 'Comparison section covering format options. Use a comparison table. 400–500 words.', wordCount: 450 },
      { h2: `How ${topic} helps ${audience} achieve their goals`, h3s: [`Step-by-step journey`, `What to expect in the first 4 weeks`, `Measuring your progress`], notes: 'Process/transformation section. Build confidence and address objections. 400 words.', wordCount: 400 },
      { h2: `${topic} pricing in ${country}`, h3s: [`What is included`, `Group vs one-to-one pricing`, `Free trial option`], notes: 'Commercial intent section. Include pricing table. Clear CTA at the end. 250 words.', wordCount: 250 },
      { h2: `Why ${audience} trust this ${topic}`, h3s: [`Instructor credentials`, `Student results`, `Success stories`], notes: 'Trust-building section. Include 2–3 testimonials with outcomes. 300 words.', wordCount: 300 },
      { h2: `Frequently asked questions about ${topic}`, h3s: [], notes: 'Add FAQPage schema markup to this section. Answers should be 50–100 words each. 600 words total.', wordCount: 600 },
    ],
    schemaTypes: ['FAQPage', 'Course', 'Organization', 'AggregateRating'],
    cta: `Book your free ${topic} trial — limited places available for ${audience} in ${country}`,
  }
}

// ─── Main assembler ───────────────────────────────────────────────────────────

export function assembleResults(
  liveQueries: SourceQuery[],
  inputs: UserInputs,
): GeoResults {
  return {
    prompts: enrichQueries(liveQueries, inputs),
    recommendedSections: buildRecommendedSections(inputs.topic, inputs.audience, inputs.country),
    faqItems: buildFAQItems(inputs.topic, inputs.audience, inputs.country, inputs.businessGoal),
    schemaRecommendations: buildSchemaRecommendations(inputs.topic, inputs.audience),
    internalLinks: buildInternalLinks(inputs.topic, inputs.audience, inputs.country, inputs.businessGoal),
    contentBrief: buildContentBrief(inputs.topic, inputs.audience, inputs.country, inputs.businessGoal),
  }
}
