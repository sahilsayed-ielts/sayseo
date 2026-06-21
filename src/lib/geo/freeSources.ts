// ─── Types ────────────────────────────────────────────────────────────────────

export type SourceType =
  | 'Verified free source'
  | 'Extracted from website'

export type IntentType =
  | 'Informational'
  | 'Commercial'
  | 'Comparison'
  | 'Local'
  | 'Problem-solving'
  | 'Trust-building'
  | 'Transactional'

export type FunnelStage = 'Awareness' | 'Consideration' | 'Decision'

export interface SourceQuery {
  query: string
  sourceType: SourceType
  intent: IntentType
  funnelStage: FunnelStage
}

// ─── Intent + funnel classifiers ──────────────────────────────────────────────

export function classifyIntent(text: string): IntentType {
  const t = text.toLowerCase()
  if (/\b(buy|enroll|enrol|sign up|register|book|purchase|get started|try now|join|apply now)\b/.test(t)) return 'Transactional'
  if (/\b(cost|price|fee|fees|cheap|afford|expensive|how much|worth|value for money|pricing)\b/.test(t)) return 'Commercial'
  if (/\b(\bvs\b|versus|compare|compared|better than|difference between|which is|which one|top \d|alternatives)\b/.test(t)) return 'Comparison'
  if (/\b(review|honest|legit|legitimate|scam|trustworthy|reliable|recommend|rating|experience|is it good|real results)\b/.test(t)) return 'Trust-building'
  if (/\b(problem|issue|struggle|can'?t|cannot|not working|help|fix|solve|failing|failed|worried|stuck|frustrated)\b/.test(t)) return 'Problem-solving'
  if (/\b(near me|in [a-z]+|local|location|city|town)\b/.test(t)) return 'Local'
  return 'Informational'
}

export function classifyFunnel(intent: IntentType): FunnelStage {
  if (intent === 'Transactional' || intent === 'Local') return 'Decision'
  if (intent === 'Commercial' || intent === 'Comparison' || intent === 'Trust-building') return 'Consideration'
  return 'Awareness'
}

// ─── Transform: autocomplete suggestions → SourceQuery[] ─────────────────────

export function autocompleteToQueries(suggestions: string[]): SourceQuery[] {
  return suggestions.slice(0, 10).map((s) => {
    const intent = classifyIntent(s)
    return {
      query: s,
      sourceType: 'Verified free source',
      intent,
      funnelStage: classifyFunnel(intent),
    }
  })
}

// ─── Transform: Reddit posts → SourceQuery[] ─────────────────────────────────

export function redditToQueries(
  posts: Array<{ title: string; score: number }>,
): SourceQuery[] {
  // Reddit already filtered by topic relevance — trust its ranking, don't re-filter
  return posts
    .filter((p) => p.title.length > 20)
    .slice(0, 10)
    .map((p) => {
      const intent = classifyIntent(p.title)
      return {
        query: p.title,
        sourceType: 'Verified free source',
        intent,
        funnelStage: classifyFunnel(intent),
      }
    })
}

// ─── Transform: Wikipedia topics → SourceQuery[] ─────────────────────────────

export function wikipediaToQueries(
  topics: string[],
  mainTopic: string,
  audience: string,
  country: string,
): SourceQuery[] {
  const filtered = topics
    .filter((t) => t.toLowerCase() !== mainTopic.toLowerCase())
    .slice(0, 5)

  return filtered
    .flatMap((t) => [
      {
        query: `What is ${t} and how does it relate to ${mainTopic}?`,
        sourceType: 'Verified free source' as SourceType,
        intent: 'Informational' as IntentType,
        funnelStage: 'Awareness' as FunnelStage,
      },
      {
        query: `How does ${t} compare to ${mainTopic} for ${audience} in ${country}?`,
        sourceType: 'Verified free source' as SourceType,
        intent: 'Comparison' as IntentType,
        funnelStage: 'Consideration' as FunnelStage,
      },
    ])
    .slice(0, 8)
}

// ─── Transform: website headings → SourceQuery[] ─────────────────────────────

export function sitemapToQueries(headings: string[]): SourceQuery[] {
  return headings
    .filter((h) => h.length > 10 && h.length < 120)
    .slice(0, 8)
    .map((h) => {
      const intent = classifyIntent(h)
      return {
        query: h,
        sourceType: 'Extracted from website',
        intent,
        funnelStage: classifyFunnel(intent),
      }
    })
}

// ─── Deduplication ────────────────────────────────────────────────────────────

export function dedupeQueries(queries: SourceQuery[]): SourceQuery[] {
  const seen = new Set<string>()
  return queries.filter((q) => {
    const key = q.query
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// ─── Fallback (used when all live sources return nothing) ─────────────────────

export function getFallbackQueries(
  topic: string,
  country: string,
  audience: string,
): SourceQuery[] {
  return [
    { query: `best ${topic} for ${audience}`, sourceType: 'Verified free source', intent: 'Commercial', funnelStage: 'Decision' },
    { query: `how much does ${topic} cost in ${country}`, sourceType: 'Verified free source', intent: 'Commercial', funnelStage: 'Consideration' },
    { query: `is ${topic} worth it for ${audience}`, sourceType: 'Verified free source', intent: 'Trust-building', funnelStage: 'Consideration' },
    { query: `online ${topic} for ${audience} in ${country}`, sourceType: 'Verified free source', intent: 'Local', funnelStage: 'Decision' },
    { query: `how to choose the right ${topic}`, sourceType: 'Verified free source', intent: 'Informational', funnelStage: 'Awareness' },
    { query: `${topic} reviews from ${audience}`, sourceType: 'Verified free source', intent: 'Trust-building', funnelStage: 'Consideration' },
    { query: `free ${topic} resources for ${audience}`, sourceType: 'Verified free source', intent: 'Informational', funnelStage: 'Awareness' },
    { query: `${topic} vs alternatives for ${audience}`, sourceType: 'Verified free source', intent: 'Comparison', funnelStage: 'Consideration' },
  ]
}
