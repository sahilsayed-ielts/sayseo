// Free GEO data sources — v1 uses client-side mock logic.
// Each fetcher is modular so API routes can swap mock → live later.

// ─── Shared types ─────────────────────────────────────────────────────────────

export type FreeSourceId =
  | 'google_autocomplete'
  | 'google_paa'
  | 'google_related_searches'
  | 'reddit'
  | 'wikipedia'
  | 'wikidata'
  | 'google_trends'
  | 'sitemap'
  | 'page_content'

export type FetchMode = 'mock' | 'live'

export interface GeoMapperInput {
  websiteUrl: string
  seedTopic: string
  brandName?: string
}

export interface SourceResult<T> {
  source: FreeSourceId
  label: string
  data: T
  fetchedAt: string
  mode: FetchMode
}

export interface RedditDiscussion {
  title: string
  searchUrl: string
  subreddit: string
  pattern: string
}

export interface WikipediaEntity {
  title: string
  summary: string
  url: string
}

export interface WikidataEntity {
  label: string
  description: string
  url: string
}

export interface SitemapUrl {
  loc: string
  title: string
  lastmod?: string
}

export interface PageContentBlock {
  type: 'heading' | 'paragraph' | 'question'
  text: string
  level?: number
}

export interface PageContent {
  url: string
  title: string
  metaDescription: string
  blocks: PageContentBlock[]
}

export interface FreeSourcesBundle {
  input: GeoMapperInput
  autocomplete: SourceResult<string[]>
  paa: SourceResult<string[]>
  relatedSearches: SourceResult<string[]>
  reddit: SourceResult<RedditDiscussion[]>
  wikipedia: SourceResult<WikipediaEntity[]>
  wikidata: SourceResult<WikidataEntity[]>
  trends: SourceResult<string[]>
  sitemap: SourceResult<SitemapUrl[]>
  pageContent: SourceResult<PageContent>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hashString(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function pick<T>(arr: T[], seed: string, count: number): T[] {
  const h = hashString(seed)
  const out: T[] = []
  for (let i = 0; i < Math.min(count, arr.length); i++) {
    out.push(arr[(h + i * 7) % arr.length])
  }
  return [...new Set(out)]
}

function normaliseTopic(topic: string): string {
  return topic.trim().toLowerCase().replace(/\s+/g, ' ')
}

function extractDomain(url: string): string {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`)
    return u.hostname.replace(/^www\./, '')
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
  }
}

function extractBrand(input: GeoMapperInput): string {
  if (input.brandName?.trim()) return input.brandName.trim()
  const domain = extractDomain(input.websiteUrl)
  const name = domain.split('.')[0]
  return name.charAt(0).toUpperCase() + name.slice(1)
}

function mockDelay(ms = 120): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function sourceResult<T>(source: FreeSourceId, label: string, data: T): SourceResult<T> {
  return {
    source,
    label,
    data,
    fetchedAt: new Date().toISOString(),
    mode: 'mock',
  }
}

// ─── Individual fetchers (mock v1) ────────────────────────────────────────────

/** Google Autocomplete via public suggestions endpoint — mock patterns for v1. */
export async function fetchGoogleAutocomplete(query: string): Promise<SourceResult<string[]>> {
  await mockDelay()
  const topic = normaliseTopic(query)
  const prefixes = [
    `${topic}`,
    `what is ${topic}`,
    `how does ${topic} work`,
    `best ${topic}`,
    `${topic} for beginners`,
    `${topic} vs`,
    `${topic} pricing`,
    `${topic} alternatives`,
    `is ${topic} worth it`,
    `${topic} examples`,
    `${topic} guide`,
    `${topic} tools`,
  ]
  const suffixes = [' 2026', ' uk', ' free', ' review', ' tutorial']
  const suggestions = [
    ...prefixes,
    ...pick(suffixes, topic, 3).map((s) => `${topic}${s}`),
    ...pick(suffixes, topic + '2', 2).map((s) => `how to use ${topic}${s}`),
  ]
  return sourceResult('google_autocomplete', 'Google Autocomplete', [...new Set(suggestions)].slice(0, 12))
}

/** People Also Ask style questions — mock for v1; live via SERP scrape later. */
export async function fetchGooglePAA(query: string): Promise<SourceResult<string[]>> {
  await mockDelay()
  const topic = normaliseTopic(query)
  const questions = [
    `What is ${topic}?`,
    `How does ${topic} work?`,
    `Why is ${topic} important?`,
    `What are the benefits of ${topic}?`,
    `What are the disadvantages of ${topic}?`,
    `How much does ${topic} cost?`,
    `Who should use ${topic}?`,
    `When should you use ${topic}?`,
    `How to get started with ${topic}?`,
    `What is the difference between ${topic} and traditional SEO?`,
    `Is ${topic} worth the investment?`,
    `What tools do you need for ${topic}?`,
  ]
  return sourceResult('google_paa', 'Google People Also Ask', pick(questions, topic, 8))
}

/** Google related search style expansions. */
export async function fetchRelatedSearches(query: string): Promise<SourceResult<string[]>> {
  await mockDelay()
  const topic = normaliseTopic(query)
  const related = [
    `${topic} strategy`,
    `${topic} checklist`,
    `${topic} best practices`,
    `${topic} case study`,
    `${topic} metrics`,
    `${topic} roi`,
    `${topic} audit`,
    `${topic} framework`,
    `${topic} optimisation`,
    `${topic} for agencies`,
    `${topic} for ecommerce`,
    `${topic} for saas`,
  ]
  return sourceResult('google_related_searches', 'Google Related Searches', pick(related, topic, 10))
}

/** Reddit search URLs and discussion patterns. */
export async function fetchRedditDiscussions(query: string): Promise<SourceResult<RedditDiscussion[]>> {
  await mockDelay()
  const topic = normaliseTopic(query)
  const encoded = encodeURIComponent(topic)
  const subs = ['SEO', 'bigseo', 'marketing', 'artificial', 'Entrepreneur']
  const patterns = [
    `Has anyone tried ${topic}?`,
    `What's your experience with ${topic}?`,
    `Is ${topic} actually effective?`,
    `${topic} — worth it or hype?`,
    `How do you implement ${topic}?`,
    `Best resources for learning ${topic}`,
    `${topic} results after 3 months`,
    `Agency perspective on ${topic}`,
  ]
  const discussions: RedditDiscussion[] = pick(patterns, topic, 6).map((title, i) => ({
    title,
    searchUrl: `https://www.reddit.com/search/?q=${encoded}&type=link`,
    subreddit: subs[i % subs.length],
    pattern: title,
  }))
  return sourceResult('reddit', 'Reddit Discussions', discussions)
}

/** Wikipedia entity extraction — mock entity cards for v1. */
export async function fetchWikipediaEntities(topic: string): Promise<SourceResult<WikipediaEntity[]>> {
  await mockDelay()
  const t = normaliseTopic(topic)
  const slug = t.replace(/\s+/g, '_')
  const entities: WikipediaEntity[] = [
    {
      title: t.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      summary: `Overview of ${t} including history, applications, and related concepts.`,
      url: `https://en.wikipedia.org/wiki/${slug}`,
    },
    {
      title: 'Search engine optimisation',
      summary: `Traditional SEO practices that overlap with ${t} visibility strategies.`,
      url: 'https://en.wikipedia.org/wiki/Search_engine_optimization',
    },
    {
      title: 'Generative artificial intelligence',
      summary: `AI systems that generate answers citing web sources — core context for ${t}.`,
      url: 'https://en.wikipedia.org/wiki/Generative_artificial_intelligence',
    },
    {
      title: 'Knowledge graph',
      summary: `Structured entity relationships relevant to ${t} content mapping.`,
      url: 'https://en.wikipedia.org/wiki/Knowledge_graph',
    },
  ]
  return sourceResult('wikipedia', 'Wikipedia', pick(entities, t, 3))
}

/** Wikidata entity extraction — mock related entities. */
export async function fetchWikidataEntities(topic: string): Promise<SourceResult<WikidataEntity[]>> {
  await mockDelay()
  const t = normaliseTopic(topic)
  const entities: WikidataEntity[] = [
    { label: t, description: `Primary topic entity for ${t}`, url: `https://www.wikidata.org/wiki/Special:Search?search=${encodeURIComponent(t)}` },
    { label: 'digital marketing', description: `Broader field containing ${t}`, url: 'https://www.wikidata.org/wiki/Q132352' },
    { label: 'content marketing', description: `Content strategy layer for ${t}`, url: 'https://www.wikidata.org/wiki/Q784672' },
    { label: 'natural language processing', description: `NLP techniques used in AI answer engines`, url: 'https://www.wikidata.org/wiki/Q30642' },
    { label: 'web analytics', description: `Measurement stack for tracking ${t} impact`, url: 'https://www.wikidata.org/wiki/Q123751' },
  ]
  return sourceResult('wikidata', 'Wikidata', pick(entities, t, 4))
}

/** Google Trends related topics — mock rising/related for v1. */
export async function fetchGoogleTrendsRelated(topic: string): Promise<SourceResult<string[]>> {
  await mockDelay()
  const t = normaliseTopic(topic)
  const rising = [
    `${t} ai`,
    `${t} chatgpt`,
    `${t} perplexity`,
    `${t} 2026 trends`,
    `generative engine optimisation`,
    `ai search visibility`,
    `llm citations`,
    `answer engine optimisation`,
    `${t} tools`,
    `${t} strategy`,
  ]
  return sourceResult('google_trends', 'Google Trends', pick(rising, t, 7))
}

/** Website sitemap parsing — mock URL inventory from domain for v1. */
export async function parseWebsiteSitemap(url: string): Promise<SourceResult<SitemapUrl[]>> {
  await mockDelay()
  const domain = extractDomain(url)
  const base = `https://${domain}`
  const slugs = [
    { path: '/', title: 'Home' },
    { path: '/about', title: 'About Us' },
    { path: '/pricing', title: 'Pricing' },
    { path: '/features', title: 'Features' },
    { path: '/blog', title: 'Blog' },
    { path: '/faq', title: 'FAQ' },
    { path: '/contact', title: 'Contact' },
    { path: '/case-studies', title: 'Case Studies' },
    { path: '/integrations', title: 'Integrations' },
    { path: '/docs', title: 'Documentation' },
  ]
  const urls: SitemapUrl[] = slugs.map((s) => ({
    loc: `${base}${s.path}`,
    title: s.title,
    lastmod: '2026-05-01',
  }))
  return sourceResult('sitemap', 'Website Sitemap', urls)
}

/** Page content extraction from entered website — mock blocks for v1. */
export async function extractPageContent(input: GeoMapperInput): Promise<SourceResult<PageContent>> {
  await mockDelay()
  const topic = normaliseTopic(input.seedTopic)
  const brand = extractBrand(input)
  const url = input.websiteUrl.startsWith('http') ? input.websiteUrl : `https://${input.websiteUrl}`
  const blocks: PageContentBlock[] = [
    { type: 'heading', text: `${brand}: ${topic} solutions`, level: 1 },
    { type: 'paragraph', text: `${brand} helps teams improve visibility in AI-powered search engines through structured content and entity optimisation.` },
    { type: 'heading', text: `What is ${topic}?`, level: 2 },
    { type: 'paragraph', text: `${topic} focuses on ensuring your brand appears in AI-generated answers across ChatGPT, Perplexity, Gemini, and other answer engines.` },
    { type: 'question', text: `How does ${brand} support ${topic}?` },
    { type: 'heading', text: 'Key features', level: 2 },
    { type: 'paragraph', text: 'Citation tracking, prompt mapping, content gap analysis, and structured data recommendations.' },
    { type: 'question', text: `What results can I expect from ${topic}?` },
    { type: 'heading', text: 'Frequently asked questions', level: 2 },
    { type: 'question', text: `Is ${topic} different from traditional SEO?` },
    { type: 'question', text: `How long does it take to see ${topic} results?` },
    { type: 'question', text: `Which AI platforms does ${brand} track?` },
  ]
  return sourceResult('page_content', 'Page Content', {
    url,
    title: `${brand} | ${topic}`,
    metaDescription: `Learn how ${brand} improves ${topic} visibility with actionable insights and free tools.`,
    blocks,
  })
}

// ─── Aggregate fetch ──────────────────────────────────────────────────────────

export async function gatherAllFreeSources(input: GeoMapperInput): Promise<FreeSourcesBundle> {
  const topic = input.seedTopic.trim()
  const [
    autocomplete,
    paa,
    relatedSearches,
    reddit,
    wikipedia,
    wikidata,
    trends,
    sitemap,
    pageContent,
  ] = await Promise.all([
    fetchGoogleAutocomplete(topic),
    fetchGooglePAA(topic),
    fetchRelatedSearches(topic),
    fetchRedditDiscussions(topic),
    fetchWikipediaEntities(topic),
    fetchWikidataEntities(topic),
    fetchGoogleTrendsRelated(topic),
    parseWebsiteSitemap(input.websiteUrl),
    extractPageContent(input),
  ])

  return {
    input,
    autocomplete,
    paa,
    relatedSearches,
    reddit,
    wikipedia,
    wikidata,
    trends,
    sitemap,
    pageContent,
  }
}