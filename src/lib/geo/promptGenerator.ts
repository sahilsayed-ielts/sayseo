import type {
  FreeSourcesBundle,
  GeoMapperInput,
  PageContentBlock,
  RedditDiscussion,
  SitemapUrl,
  WikipediaEntity,
  WikidataEntity,
} from './freeSources'
import { gatherAllFreeSources } from './freeSources'

// ─── Output types ─────────────────────────────────────────────────────────────

export type PromptCategory =
  | 'discovered_query'
  | 'extracted_question'
  | 'predicted_prompt'
  | 'geo_opportunity'

export type ConfidenceLabel =
  | 'verified_free_source'
  | 'extracted_from_website'
  | 'predicted_ai_prompt'

export type Intent =
  | 'informational'
  | 'commercial'
  | 'transactional'
  | 'navigational'
  | 'comparative'
  | 'troubleshooting'

export interface GeoPrompt {
  id: string
  prompt: string
  category: PromptCategory
  source: string
  confidence: ConfidenceLabel
  intent: Intent
  priorityScore: number
  recommendedSection: string
}

export interface GeoPromptMapperResult {
  input: GeoMapperInput
  prompts: GeoPrompt[]
  summary: {
    total: number
    discovered: number
    extracted: number
    predicted: number
    geoOpportunity: number
  }
  generatedAt: string
}

// ─── Intent & scoring helpers ─────────────────────────────────────────────────

function detectIntent(text: string): Intent {
  const q = text.toLowerCase()
  if (/\b(buy|price|cost|cheap|deal|discount|shop|order|purchase|pricing)\b/.test(q)) return 'transactional'
  if (/\b(vs|versus|compare|comparison|alternative|alternatives|better than|difference between)\b/.test(q)) return 'comparative'
  if (/\b(best|review|top|recommended|worth it)\b/.test(q)) return 'commercial'
  if (/\b(login|sign in|account|official|contact|website)\b/.test(q)) return 'navigational'
  if (/\b(fix|error|not working|issue|problem|troubleshoot|debug|why isn't)\b/.test(q)) return 'troubleshooting'
  return 'informational'
}

function isQuestion(text: string): boolean {
  const t = text.trim()
  return t.endsWith('?') || /^(what|how|why|when|where|who|which|is|are|can|do|does|should)\b/i.test(t)
}

function recommendSection(prompt: string, category: PromptCategory, intent: Intent): string {
  if (category === 'geo_opportunity') {
    if (intent === 'comparative') return 'Comparison table + verdict summary'
    if (intent === 'transactional') return 'Pricing / CTA block'
    if (intent === 'troubleshooting') return 'Troubleshooting FAQ'
    return 'AI-citable definition block (40–60 words)'
  }
  if (isQuestion(prompt)) return 'FAQ accordion'
  if (intent === 'comparative') return 'Comparison section'
  if (intent === 'commercial') return 'Product overview + social proof'
  if (intent === 'transactional') return 'Pricing table'
  if (intent === 'troubleshooting') return 'Support / troubleshooting guide'
  if (/guide|tutorial|how to|getting started/i.test(prompt)) return 'Step-by-step how-to'
  if (/case study|example|results/i.test(prompt)) return 'Case studies'
  return 'Hero introduction or topical H2'
}

function basePriority(
  category: PromptCategory,
  confidence: ConfidenceLabel,
  intent: Intent,
  isQ: boolean,
): number {
  let score = 50
  if (category === 'discovered_query') score += 25
  if (category === 'extracted_question') score += 20
  if (category === 'geo_opportunity') score += 22
  if (category === 'predicted_prompt') score += 5
  if (confidence === 'verified_free_source') score += 15
  if (confidence === 'extracted_from_website') score += 12
  if (confidence === 'predicted_ai_prompt') score -= 10
  if (isQ) score += 8
  if (intent === 'comparative' || intent === 'commercial') score += 6
  if (intent === 'informational') score += 4
  return Math.min(100, Math.max(1, score))
}

let idCounter = 0
function nextId(prefix: string): string {
  idCounter += 1
  return `${prefix}-${idCounter}`
}

function buildPrompt(
  prompt: string,
  category: PromptCategory,
  source: string,
  confidence: ConfidenceLabel,
): GeoPrompt {
  const intent = detectIntent(prompt)
  const isQ = isQuestion(prompt)
  return {
    id: nextId(category.slice(0, 3)),
    prompt: prompt.trim(),
    category,
    source,
    confidence,
    intent,
    priorityScore: basePriority(category, confidence, intent, isQ),
    recommendedSection: recommendSection(prompt, category, intent),
  }
}

function dedupePrompts(prompts: GeoPrompt[]): GeoPrompt[] {
  const seen = new Map<string, GeoPrompt>()
  for (const p of prompts) {
    const key = p.prompt.toLowerCase().replace(/\s+/g, ' ')
    const existing = seen.get(key)
    if (!existing || p.priorityScore > existing.priorityScore) {
      seen.set(key, p)
    }
  }
  return Array.from(seen.values()).sort((a, b) => b.priorityScore - a.priorityScore)
}

// ─── Category builders ────────────────────────────────────────────────────────

function buildDiscoveredQueries(bundle: FreeSourcesBundle): GeoPrompt[] {
  const prompts: GeoPrompt[] = []

  for (const q of bundle.autocomplete.data) {
    prompts.push(buildPrompt(q, 'discovered_query', 'Google Autocomplete', 'verified_free_source'))
  }
  for (const q of bundle.relatedSearches.data) {
    prompts.push(buildPrompt(q, 'discovered_query', 'Google Related Searches', 'verified_free_source'))
  }
  for (const q of bundle.trends.data) {
    prompts.push(buildPrompt(q, 'discovered_query', 'Google Trends', 'verified_free_source'))
  }
  for (const d of bundle.reddit.data) {
    prompts.push(buildPrompt(d.pattern, 'discovered_query', `Reddit (r/${d.subreddit})`, 'verified_free_source'))
  }
  for (const e of bundle.wikipedia.data) {
    prompts.push(buildPrompt(`What is ${e.title}?`, 'discovered_query', 'Wikipedia', 'verified_free_source'))
    prompts.push(buildPrompt(`${e.title} explained`, 'discovered_query', 'Wikipedia', 'verified_free_source'))
  }
  for (const e of bundle.wikidata.data) {
    prompts.push(buildPrompt(`Explain ${e.label} in context of ${bundle.input.seedTopic}`, 'discovered_query', 'Wikidata', 'verified_free_source'))
  }

  return prompts
}

function buildExtractedQuestions(bundle: FreeSourcesBundle): GeoPrompt[] {
  const prompts: GeoPrompt[] = []

  for (const q of bundle.paa.data) {
    prompts.push(buildPrompt(q, 'extracted_question', 'Google People Also Ask', 'verified_free_source'))
  }

  const { blocks } = bundle.pageContent.data
  for (const block of blocks) {
    if (block.type === 'question') {
      prompts.push(buildPrompt(block.text, 'extracted_question', 'Page Content', 'extracted_from_website'))
    }
    if (block.type === 'heading' && block.level === 2 && block.text.includes('?')) {
      prompts.push(buildPrompt(block.text, 'extracted_question', 'Page Content', 'extracted_from_website'))
    }
  }

  for (const url of bundle.sitemap.data) {
    const q = sitemapToQuestion(url)
    if (q) {
      prompts.push(buildPrompt(q, 'extracted_question', 'Website Sitemap', 'extracted_from_website'))
    }
  }

  return prompts
}

function sitemapToQuestion(url: SitemapUrl): string | null {
  const path = url.loc.split('/').filter(Boolean).pop() ?? ''
  if (!path || path === url.loc) return null
  const label = url.title || path.replace(/-/g, ' ')
  if (/faq/i.test(label)) return `What questions are answered on the ${label} page?`
  if (/pricing/i.test(label)) return `How much does ${label.toLowerCase()} cost?`
  if (/case-stud/i.test(label)) return `What results are shown in ${label}?`
  return `What content is on the ${label} page?`
}

/** AlsoAsked-style question generation — labelled as predicted, not verified. */
function buildPredictedPrompts(input: GeoMapperInput, bundle: FreeSourcesBundle): GeoPrompt[] {
  const topic = input.seedTopic.trim()
  const brand = input.brandName?.trim() || extractBrandFromUrl(input.websiteUrl)
  const entities = [
    ...bundle.wikipedia.data.map((e: WikipediaEntity) => e.title),
    ...bundle.wikidata.data.map((e: WikidataEntity) => e.label),
  ].slice(0, 4)

  const templates = [
    `I'm researching ${topic} for my company — what should I know before choosing a solution?`,
    `Compare the top ${topic} approaches and recommend one for a mid-size agency.`,
    `Explain ${topic} like I'm presenting to a client who only understands traditional SEO.`,
    `What are the most common mistakes teams make when implementing ${topic}?`,
    `Create a 90-day ${topic} roadmap for a B2B SaaS website.`,
    `Which metrics prove ${topic} is working?`,
    `How would you audit a site for ${topic} readiness?`,
    `Summarise the pros and cons of ${topic} for an executive brief.`,
    `What content formats get cited most often for ${topic} queries?`,
    `How does ${brand} compare to competitors for ${topic}?`,
    `Write a concise answer about ${topic} that an AI assistant could cite.`,
    ...entities.map((e) => `How does ${e} relate to ${topic}?`),
    ...entities.map((e) => `Should I mention ${e} when optimising for ${topic}?`),
  ]

  return templates.map((t) =>
    buildPrompt(t, 'predicted_prompt', 'AI Predicted (AlsoAsked-style)', 'predicted_ai_prompt'),
  )
}

function buildGeoOpportunityPrompts(input: GeoMapperInput, bundle: FreeSourcesBundle): GeoPrompt[] {
  const topic = input.seedTopic.trim()
  const brand = input.brandName?.trim() || extractBrandFromUrl(input.websiteUrl)
  const pageBlocks = bundle.pageContent.data.blocks

  const opportunities = [
    `What is the best tool for ${topic} in 2026?`,
    `Who are the leading providers of ${topic}?`,
    `How do I improve AI visibility for ${topic}?`,
    `What is ${brand}'s approach to ${topic}?`,
    `Is ${brand} a good choice for ${topic}?`,
    `${brand} vs competitors for ${topic}`,
    `How to get cited in ChatGPT answers about ${topic}`,
    `How to rank in Perplexity for ${topic} queries`,
    `Structured data recommendations for ${topic} pages`,
    `Entity optimisation checklist for ${topic}`,
    `What questions should a ${topic} landing page answer?`,
    `GEO content template for ${topic}`,
  ]

  const blockDerived = pageBlocks
    .filter((b: PageContentBlock) => b.type === 'heading' || b.type === 'question')
    .map((b: PageContentBlock) => `Optimise this for AI citations: "${b.text}"`)

  return [...opportunities, ...blockDerived].map((t) =>
    buildPrompt(t, 'geo_opportunity', 'GEO Opportunity Engine', 'predicted_ai_prompt'),
  )
}

function extractBrandFromUrl(url: string): string {
  try {
    const host = new URL(url.startsWith('http') ? url : `https://${url}`).hostname
    const name = host.replace(/^www\./, '').split('.')[0]
    return name.charAt(0).toUpperCase() + name.slice(1)
  } catch {
    return 'Your brand'
  }
}

// ─── Main generator ───────────────────────────────────────────────────────────

export async function generateGeoPrompts(input: GeoMapperInput): Promise<GeoPromptMapperResult> {
  idCounter = 0
  const bundle = await gatherAllFreeSources(input)

  const discovered = buildDiscoveredQueries(bundle)
  const extracted = buildExtractedQuestions(bundle)
  const predicted = buildPredictedPrompts(input, bundle)
  const geoOpportunity = buildGeoOpportunityPrompts(input, bundle)

  const prompts = dedupePrompts([...discovered, ...extracted, ...predicted, ...geoOpportunity])

  return {
    input,
    prompts,
    summary: {
      total: prompts.length,
      discovered: prompts.filter((p) => p.category === 'discovered_query').length,
      extracted: prompts.filter((p) => p.category === 'extracted_question').length,
      predicted: prompts.filter((p) => p.category === 'predicted_prompt').length,
      geoOpportunity: prompts.filter((p) => p.category === 'geo_opportunity').length,
    },
    generatedAt: new Date().toISOString(),
  }
}

export const CATEGORY_LABELS: Record<PromptCategory, string> = {
  discovered_query: 'Discovered Queries',
  extracted_question: 'Extracted Questions',
  predicted_prompt: 'Predicted AI Prompts',
  geo_opportunity: 'GEO Opportunity Prompts',
}

export const CONFIDENCE_LABELS: Record<ConfidenceLabel, string> = {
  verified_free_source: 'Verified free source',
  extracted_from_website: 'Extracted from website',
  predicted_ai_prompt: 'Predicted AI prompt',
}

export const INTENT_LABELS: Record<Intent, string> = {
  informational: 'Informational',
  commercial: 'Commercial',
  transactional: 'Transactional',
  navigational: 'Navigational',
  comparative: 'Comparative',
  troubleshooting: 'Troubleshooting',
}