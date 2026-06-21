import {
  SourceType,
  IntentType,
  FunnelStage,
  SourceQuery,
  getAutocompleteQueries,
  getPAAQuestions,
  getRedditPatterns,
  getWebsiteQueries,
} from './freeSources'

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
    Informational:    { searchDemand: 4, aiAnswerPotential: 5, commercialIntent: 1, contentGap: 3 },
    Commercial:       { searchDemand: 5, aiAnswerPotential: 3, commercialIntent: 5, contentGap: 3 },
    Comparison:       { searchDemand: 4, aiAnswerPotential: 5, commercialIntent: 3, contentGap: 4 },
    Local:            { searchDemand: 5, aiAnswerPotential: 3, commercialIntent: 4, contentGap: 3 },
    'Problem-solving':{ searchDemand: 3, aiAnswerPotential: 5, commercialIntent: 3, contentGap: 4 },
    'Trust-building': { searchDemand: 3, aiAnswerPotential: 4, commercialIntent: 3, contentGap: 4 },
    Transactional:    { searchDemand: 4, aiAnswerPotential: 1, commercialIntent: 5, contentGap: 2 },
  }

  const s = { ...base[intent] }

  if (sourceType === 'GEO opportunity') {
    s.aiAnswerPotential = Math.min(5, s.aiAnswerPotential + 1)
    s.contentGap = Math.min(5, s.contentGap + 1)
  }
  if (sourceType === 'Predicted AI prompt') {
    s.aiAnswerPotential = Math.min(5, s.aiAnswerPotential + 1)
  }

  return { ...s, total: s.searchDemand + s.aiAnswerPotential + s.commercialIntent + s.contentGap }
}

// ─── Section + action helpers ─────────────────────────────────────────────────

function sectionForIntent(intent: IntentType, topic: string, audience: string, country: string): string {
  const map: Record<IntentType, string> = {
    Informational:    `What is ${topic} — Complete Guide for ${audience}`,
    Commercial:       `Best ${topic} for ${audience} in ${country}`,
    Comparison:       `${topic}: Formats, Providers and Options Compared`,
    Local:            `${topic} for ${audience} in ${country}`,
    'Problem-solving':`How ${topic} Solves Common ${audience} Challenges`,
    'Trust-building': `Why ${audience} Trust This ${topic}`,
    Transactional:    `Get Started with ${topic} — Pricing and Enrolment`,
  }
  return map[intent]
}

function actionForIntent(intent: IntentType, topic: string): string {
  const map: Record<IntentType, string> = {
    Informational:    `Write an educational guide answering this question. Use H2/H3 structure and add FAQPage schema.`,
    Commercial:       `Create a pricing or comparison landing page. Include clear CTAs and a structured pricing table.`,
    Comparison:       `Build a dedicated comparison page with a table format. Add review schema if applicable.`,
    Local:            `Add geo-specific content to your ${topic} page. Include local signals and country-specific data.`,
    'Problem-solving':`Write a problem-solution article. Lead with the audience pain point and show how ${topic} solves it.`,
    'Trust-building': `Add testimonials, credentials and results data. Apply Review or AggregateRating schema markup.`,
    Transactional:    `Optimise your enrolment or sales page. Add a strong CTA, trust badges and clear next steps.`,
  }
  return map[intent]
}

// ─── Predicted AI prompts ─────────────────────────────────────────────────────

function getPredictedAIPrompts(topic: string, audience: string, country: string): SourceQuery[] {
  return [
    { query: `What is the best ${topic} for ${audience} who want fast results?`, sourceType: 'Predicted AI prompt', intent: 'Informational', funnelStage: 'Awareness' },
    { query: `How can ${audience} use ${topic} to achieve their goals faster?`, sourceType: 'Predicted AI prompt', intent: 'Problem-solving', funnelStage: 'Consideration' },
    { query: `Is ${topic} suitable for ${audience} in ${country}?`, sourceType: 'Predicted AI prompt', intent: 'Informational', funnelStage: 'Consideration' },
    { query: `What results can ${audience} realistically expect from ${topic}?`, sourceType: 'Predicted AI prompt', intent: 'Trust-building', funnelStage: 'Consideration' },
    { query: `How is ${topic} different from traditional alternatives?`, sourceType: 'Predicted AI prompt', intent: 'Comparison', funnelStage: 'Consideration' },
    { query: `Does ${topic} offer flexible scheduling for ${audience}?`, sourceType: 'Predicted AI prompt', intent: 'Informational', funnelStage: 'Consideration' },
    { query: `What support do ${audience} get when they start ${topic}?`, sourceType: 'Predicted AI prompt', intent: 'Trust-building', funnelStage: 'Decision' },
  ]
}

// ─── GEO opportunity prompts ──────────────────────────────────────────────────

function getGEOOpportunityPrompts(topic: string, audience: string, country: string): SourceQuery[] {
  return [
    { query: `I am a ${audience} based in ${country}. Recommend the best ${topic} options with clear reasons.`, sourceType: 'GEO opportunity', intent: 'Comparison', funnelStage: 'Consideration' },
    { query: `Summarise what ${audience} in ${country} need to know before choosing ${topic}.`, sourceType: 'GEO opportunity', intent: 'Informational', funnelStage: 'Awareness' },
    { query: `Which ${topic} provider would an expert recommend for ${audience} wanting fast, proven results?`, sourceType: 'GEO opportunity', intent: 'Comparison', funnelStage: 'Decision' },
    { query: `What are the most common mistakes ${audience} make when choosing ${topic}?`, sourceType: 'GEO opportunity', intent: 'Problem-solving', funnelStage: 'Awareness' },
    { query: `Compare the top ${topic} options for ${audience} in ${country} on cost, quality and outcomes.`, sourceType: 'GEO opportunity', intent: 'Comparison', funnelStage: 'Consideration' },
    { query: `What does an ideal ${topic} programme look like for ${audience} with limited time?`, sourceType: 'GEO opportunity', intent: 'Informational', funnelStage: 'Consideration' },
    { query: `Which websites are most cited by AI when discussing ${topic} for ${audience} in ${country}?`, sourceType: 'GEO opportunity', intent: 'Trust-building', funnelStage: 'Awareness' },
  ]
}

// ─── Recommended sections ─────────────────────────────────────────────────────

function buildRecommendedSections(topic: string, audience: string, country: string): RecommendedSection[] {
  return [
    { title: `Best ${topic} for ${audience} in ${country}`, purpose: 'Primary landing page hero — targets the highest-volume comparison query', contentType: 'Landing page hero', priority: 'High', wordCount: 300 },
    { title: `Who this ${topic} is for`, purpose: 'Helps AI and users quickly qualify themselves as the right audience', contentType: 'Audience qualifier section', priority: 'High', wordCount: 150 },
    { title: `${topic} options and formats`, purpose: 'Addresses format comparison queries — individual, group, online vs in-person', contentType: 'Comparison section', priority: 'High', wordCount: 400 },
    { title: `Your step-by-step journey with ${topic}`, purpose: 'Shows the transformation process — builds trust and answers "what will I get?"', contentType: 'Process / HowTo section', priority: 'High', wordCount: 350 },
    { title: `One-to-one vs group ${topic}: what works best`, purpose: 'Comparison content for the delivery-format query cluster', contentType: 'Comparison page or section', priority: 'Medium', wordCount: 500 },
    { title: `${topic} pricing and free trial`, purpose: 'Commercial intent page — cost queries are high volume in ${country}', contentType: 'Pricing page or section', priority: 'High', wordCount: 250 },
    { title: `${topic} team and credentials`, purpose: 'Trust-building — AI search engines rank credentialed sources higher', contentType: 'About / Trust page', priority: 'Medium', wordCount: 300 },
    { title: `${audience} success stories`, purpose: 'Social proof — addresses "is this worth it?" query cluster', contentType: 'Testimonials / Case studies', priority: 'Medium', wordCount: 400 },
    { title: `Frequently asked questions about ${topic}`, purpose: 'Captures PAA and conversational AI queries in one structured section', contentType: 'FAQ section with FAQPage schema', priority: 'High', wordCount: 600 },
    { title: `Structured data and schema markup for ${topic}`, purpose: 'Technical layer — ensures AI engines can read and cite page content correctly', contentType: 'Technical / Schema implementation', priority: 'Medium', wordCount: 0 },
  ]
}

// ─── FAQ items ────────────────────────────────────────────────────────────────

function buildFAQItems(topic: string, audience: string, country: string, goal: string): FAQItem[] {
  return [
    { question: `What is the best ${topic} for ${audience}?`, answer: `The best ${topic} for ${audience} depends on your specific goals, schedule and budget. Look for providers with a strong track record of results, qualified instructors, flexible scheduling and dedicated support for ${audience} in ${country}. We recommend booking a free consultation or trial before committing.` },
    { question: `How much does ${topic} cost in ${country}?`, answer: `The cost of ${topic} in ${country} varies depending on the format (group, one-to-one, self-paced), duration and provider reputation. Entry-level programmes start from a few hundred and go up to several thousand for intensive, personalised options. Always compare what is included in the price before deciding.` },
    { question: `Can ${audience} do ${topic} online?`, answer: `Yes. Online ${topic} has become a popular and effective option for ${audience} in ${country} because it removes the need to commute and allows you to study at times that suit your schedule. Many ${audience} achieve better results online because of the flexibility and access to specialist instructors.` },
    { question: `How long does ${topic} take to see results?`, answer: `Most ${audience} begin to see measurable progress within four to eight weeks of consistent effort. The timeline depends on your starting level, the amount of time you dedicate each week, and the quality of the ${topic} you choose. A structured programme with regular feedback will accelerate your progress.` },
    { question: `Is one-to-one ${topic} better than group ${topic}?`, answer: `One-to-one ${topic} offers personalised feedback and a pace tailored to your needs, which is ideal if you have a specific deadline or want faster progress. Group ${topic} is more affordable and gives you the benefit of peer learning. Many ${audience} find a combination of both most effective.` },
    { question: `What should ${audience} look for when choosing ${topic}?`, answer: `When choosing ${topic}, ${audience} should consider: qualified and experienced instructors, a structured curriculum with clear milestones, regular progress assessments, student reviews and testimonials, flexible scheduling, and transparent pricing. A free trial or demo session lets you evaluate the quality before paying.` },
    { question: `Is ${topic} worth the investment for ${audience} in ${country}?`, answer: `For ${audience} in ${country} with a clear goal — such as ${goal} — ${topic} delivers strong return on investment. The key is choosing a programme that is structured, taught by qualified instructors, and supported by evidence of past student success. A well-chosen programme should pay for itself many times over in achieved outcomes.` },
    { question: `How do I get started with ${topic}?`, answer: `Getting started is straightforward. First, define your specific goal and timeline. Then compare two or three reputable providers and check their reviews and instructor credentials. Book a free trial or introductory session to assess fit. Once enrolled, commit to a consistent study schedule and take advantage of all feedback opportunities offered.` },
  ]
}

// ─── Schema recommendations ───────────────────────────────────────────────────

function buildSchemaRecommendations(topic: string, audience: string): SchemaRecommendation[] {
  return [
    { schemaType: 'FAQPage', reason: `Marks up your FAQ section so Google and AI engines can extract Q&A pairs directly — the highest-impact schema for ${topic} pages`, placement: 'FAQ section of your main ${topic} page', priority: 'High' },
    { schemaType: 'Course', reason: `Signals to search engines that your ${topic} is a structured educational programme — increases eligibility for rich results`, placement: 'Main ${topic} landing page', priority: 'High' },
    { schemaType: 'Organization', reason: 'Establishes entity identity — AI search engines use this to understand who you are and assess citation worthiness', placement: 'Homepage or About page', priority: 'High' },
    { schemaType: 'AggregateRating / Review', reason: `Adds star ratings to your ${topic} pages in search results — increases click-through rate and trust signals for ${audience}`, placement: 'Testimonials or pricing section', priority: 'Medium' },
    { schemaType: 'BreadcrumbList', reason: 'Helps search engines understand your site hierarchy and displays breadcrumbs in SERPs — improves navigation signals', placement: 'All main pages', priority: 'Medium' },
    { schemaType: 'WebSite + SearchAction', reason: 'Enables sitelinks search box in Google and signals your site as a definitive resource — important for brand searches', placement: 'Homepage only', priority: 'Low' },
  ]
}

// ─── Internal links ───────────────────────────────────────────────────────────

function buildInternalLinks(topic: string, audience: string, country: string, goal: string): InternalLink[] {
  return [
    { anchorText: `free ${topic} resources`, targetPage: `/resources`, reason: 'Supports ${audience} at the awareness stage and passes authority to deeper content' },
    { anchorText: `${topic} pricing and packages`, targetPage: `/pricing`, reason: 'Links commercial-intent users directly to the conversion page' },
    { anchorText: `${topic} success stories`, targetPage: `/testimonials`, reason: 'Builds trust for users in the consideration phase' },
    { anchorText: `${topic} FAQ`, targetPage: `#faq`, reason: 'Anchors deep links to the FAQ section — supports PAA query capture' },
    { anchorText: `book a free ${topic} trial`, targetPage: `/contact`, reason: 'Primary conversion CTA — highest priority internal link on all pages' },
    { anchorText: `about our ${topic} instructors`, targetPage: `/about`, reason: 'Trust signal — AI engines value credentialed author pages for E-E-A-T' },
  ]
}

// ─── Content brief ────────────────────────────────────────────────────────────

function buildContentBrief(topic: string, audience: string, country: string, goal: string): ContentBrief {
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

// ─── Main generator ───────────────────────────────────────────────────────────

export function generateGeoResults(inputs: UserInputs): GeoResults {
  const { websiteUrl, topic, country, audience, businessGoal } = inputs

  // Collect all raw queries from all sources
  const rawQueries: SourceQuery[] = [
    ...getAutocompleteQueries(topic, country, audience),
    ...getPAAQuestions(topic, audience, country),
    ...getRedditPatterns(topic, audience),
    ...getWebsiteQueries(websiteUrl, topic, audience),
    ...getPredictedAIPrompts(topic, audience, country),
    ...getGEOOpportunityPrompts(topic, audience, country),
  ]

  // Enrich into full PromptResult objects
  const prompts: PromptResult[] = rawQueries.map((q, i) => ({
    id: `p${i + 1}`,
    prompt: q.query,
    sourceType: q.sourceType,
    intent: q.intent,
    funnelStage: q.funnelStage,
    scores: getScores(q.intent, q.sourceType),
    recommendedSection: sectionForIntent(q.intent, topic, audience, country),
    contentAction: actionForIntent(q.intent, topic),
  }))

  return {
    prompts,
    recommendedSections: buildRecommendedSections(topic, audience, country),
    faqItems: buildFAQItems(topic, audience, country, businessGoal),
    schemaRecommendations: buildSchemaRecommendations(topic, audience),
    internalLinks: buildInternalLinks(topic, audience, country, businessGoal),
    contentBrief: buildContentBrief(topic, audience, country, businessGoal),
  }
}
