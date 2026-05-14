// Pure algorithmic GSC analysis — no external dependencies

// ─── Input types ─────────────────────────────────────────────────────────────

export interface QueryRow {
  query: string
  clicks: number
  impressions: number
  ctr: number        // 0–1 decimal
  position: number
  prevClicks?: number
  prevImpressions?: number
  prevCtr?: number
  prevPosition?: number
}

export interface PageRow {
  page: string
  clicks: number
  impressions: number
  ctr: number
  position: number
  prevClicks?: number
  prevImpressions?: number
  prevCtr?: number
  prevPosition?: number
}

export interface AnalyseInput {
  queries: QueryRow[]
  pages: PageRow[]
  domain?: string
  hasComparison: boolean
}

// ─── Output types ─────────────────────────────────────────────────────────────

export interface QIMeta {
  total_queries: number
  total_pages: number
  total_clicks: number
  total_impressions: number
  avg_ctr: number
  avg_position: number
  has_pages: boolean
  has_comparison: boolean
}

export interface PositionBucket {
  label: string
  range: string
  count: number
  impressions: number
  clicks: number
  avg_ctr: number
  avg_position: number
}

export interface QuickWin {
  query: string
  position: number
  impressions: number
  clicks: number
  ctr: number
  opportunity: 'top3_push' | 'page1_push'
  potential_clicks: number
  lift_estimate: string
  pos_change?: number      // prev_position − current_position; positive = improved
  click_change?: number
  prev_position?: number
}

export interface CTROpportunity {
  query: string
  position: number
  impressions: number
  clicks: number
  actual_ctr: number
  expected_ctr: number
  gap_pct: number
  missed_clicks: number
  priority: 'high' | 'medium'
  ctr_change?: number      // current − prev; positive = CTR improved
  pos_change?: number      // positive = position improved
}

export interface ContentGap {
  query: string
  impressions: number
  clicks: number
  position: number
  ctr: number
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational'
}

export interface FeaturedSnippetOpp {
  query: string
  position: number
  impressions: number
  clicks: number
  query_type: 'question' | 'comparison' | 'list' | 'definition'
  action: string
}

export interface LongTailOpp {
  query: string
  word_count: number
  position: number
  impressions: number
  clicks: number
  ctr: number
  difficulty: 'easy' | 'medium'
}

export interface TopPerformer {
  query: string
  position: number
  impressions: number
  clicks: number
  actual_ctr: number
  expected_ctr: number
  performance_ratio: number
}

export interface TopicCluster {
  topic: string
  query_count: number
  total_impressions: number
  total_clicks: number
  avg_position: number
  avg_ctr: number
  top_queries: string[]
}

// ─── New extended types ───────────────────────────────────────────────────────

export type Intent = 'informational' | 'commercial' | 'transactional' | 'navigational'

export interface KeywordGroupQuery {
  query: string
  impressions: number
  clicks: number
  position: number
  ctr: number
  intent: Intent
}

export interface KeywordGroup {
  parent_topic: string
  intent: Intent | 'mixed'
  query_count: number
  total_impressions: number
  total_clicks: number
  avg_position: number
  avg_ctr: number
  queries: KeywordGroupQuery[]
  recommended_action: string
}

export interface ContentMapEntry {
  page: string
  page_impressions: number
  page_clicks: number
  page_ctr: number
  page_position: number
  mapped_queries: KeywordGroupQuery[]
  total_query_impressions: number
  total_query_clicks: number
}

export interface SuggestedPage {
  suggested_title: string
  suggested_slug: string
  target_queries: string[]
  total_impressions: number
  priority: 'high' | 'medium'
  intent: Intent
  reason: string
}

export interface ContentMapAnalysis {
  mapped_pages: ContentMapEntry[]
  orphan_queries: KeywordGroupQuery[]
  suggested_pages: SuggestedPage[]
  coverage_pct: number
}

export interface AiOpportunity {
  query: string
  impressions: number
  clicks: number
  position: number
  ai_type: 'ai_overview' | 'how_to' | 'comparison' | 'definition' | 'list' | 'faq'
  score: 'high' | 'medium'
  content_format: string
  schema_recommendation: string
  action: string
  mapped_page?: string
}

export interface BrandedSplit {
  brand: string | null
  branded: { queries: number; clicks: number; impressions: number; avg_ctr: number; avg_position: number }
  non_branded: { queries: number; clicks: number; impressions: number; avg_ctr: number; avg_position: number }
}

export interface PageAnalysis {
  page: string
  clicks: number
  impressions: number
  ctr: number
  position: number
  mapped_queries: string[]
  ctr_vs_avg: 'above' | 'below' | 'average'
}

export interface ComparisonMove {
  query: string
  impressions: number
  clicks: number
  position: number
  prev_position: number
  prev_impressions: number
  pos_change: number            // positive = improved (position number went down)
  click_change: number
  impression_change_pct: number
}

export interface ComparisonAnalysis {
  summary: {
    click_change: number
    click_change_pct: number
    impression_change: number
    impression_change_pct: number
    avg_position_change: number
    total_improved: number
    total_dropped: number
    // extended fields (present in v2+ analyses)
    avg_ctr_change?: number
    total_new?: number
    total_lost?: number
    queries_entered_top3?: number
    queries_left_top3?: number
    queries_entered_top10?: number
    queries_left_top10?: number
  }
  improved_positions: Array<{ query: string; from_pos: number; to_pos: number; change: number; impressions: number }>
  dropped_positions: Array<{ query: string; from_pos: number; to_pos: number; change: number; impressions: number }>
  impression_gains: Array<{ query: string; prev: number; current: number; change_pct: number }>
  impression_losses: Array<{ query: string; prev: number; current: number; change_pct: number }>
  new_queries: Array<{ query: string; impressions: number; clicks?: number; position: number }>
  lost_queries: Array<{ query: string; prev_impressions: number; prev_clicks?: number; prev_position: number }>
  top_movers?: ComparisonMove[]
  biggest_drops?: ComparisonMove[]
}

export interface QIAnalysis {
  meta: QIMeta
  position_buckets: PositionBucket[]
  quick_wins: QuickWin[]
  ctr_opportunities: CTROpportunity[]
  content_gaps: ContentGap[]
  featured_snippets: FeaturedSnippetOpp[]
  long_tail: LongTailOpp[]
  top_performers: TopPerformer[]
  topic_clusters: TopicCluster[]   // kept for backward compat with stored data
  branded_split: BrandedSplit
  pages?: PageAnalysis[]           // kept for backward compat
  comparison?: ComparisonAnalysis
  // New extended fields (present on analyses run after the v2 upgrade)
  keyword_groups?: KeywordGroup[]
  content_map?: ContentMapAnalysis
  ai_opportunities?: AiOpportunity[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

// Organic CTR benchmarks by exact position (from industry research averages)
const EXPECTED_CTR: Record<number, number> = {
  1: 0.284, 2: 0.154, 3: 0.103, 4: 0.073, 5: 0.055,
  6: 0.043, 7: 0.035, 8: 0.029, 9: 0.024, 10: 0.019,
}

function expectedCtr(position: number): number {
  const p = Math.round(position)
  if (EXPECTED_CTR[p]) return EXPECTED_CTR[p]
  if (position <= 20) return 0.012
  if (position <= 50) return 0.005
  return 0.002
}

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to',
  'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were',
  'be', 'been', 'do', 'does', 'did', 'have', 'has', 'had', 'not',
  'as', 'this', 'that', 'its', 'it', 'my', 'your', 'our',
])

const QUESTION_STARTERS = new Set([
  'how', 'what', 'why', 'when', 'where', 'who', 'which',
  'is', 'are', 'can', 'does', 'do', 'did', 'should', 'will', 'would',
])

// ─── Helpers ──────────────────────────────────────────────────────────────────

function percentile(sorted: number[], pct: number): number {
  if (!sorted.length) return 0
  const idx = Math.max(0, Math.ceil(sorted.length * pct) - 1)
  return sorted[Math.min(idx, sorted.length - 1)]
}

function avg(nums: number[]): number {
  if (!nums.length) return 0
  return nums.reduce((s, n) => s + n, 0) / nums.length
}

function wordCount(query: string): number {
  return query.trim().split(/\s+/).length
}

function significantWords(text: string): string[] {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w))
}

function detectQueryType(query: string): FeaturedSnippetOpp['query_type'] {
  const words = query.toLowerCase().split(/\s+/)
  if (QUESTION_STARTERS.has(words[0])) return 'question'
  if (query.includes(' vs ') || query.includes(' versus ') || query.includes(' or ')) return 'comparison'
  if (words.some(w => ['best', 'top', 'list', 'types', 'examples', 'alternatives', 'ways'].includes(w))) return 'list'
  if (words.some(w => ['meaning', 'definition', 'define', 'what is', 'explained'].includes(w))) return 'definition'
  return 'question'
}

function detectIntent(query: string): ContentGap['intent'] {
  const q = query.toLowerCase()
  if (/\b(buy|price|cost|cheap|deal|discount|shop|order|purchase)\b/.test(q)) return 'transactional'
  if (/\b(best|review|compare|vs|top|alternative|recommended)\b/.test(q)) return 'commercial'
  if (/\b(login|sign in|account|website|official|contact|address)\b/.test(q)) return 'navigational'
  return 'informational'
}

function detectBrand(domain?: string): string {
  if (!domain) return ''
  return domain.replace(/^www\./, '').split('.')[0].toLowerCase()
}

function isBranded(query: string, brand: string): boolean {
  if (!brand) return false
  return query.toLowerCase().includes(brand)
}

function slugTokens(url: string): string[] {
  let path = url
  try { path = new URL(url).pathname } catch { /* use as-is */ }
  return path.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(t => t.length > 2 && !STOPWORDS.has(t))
}

// ─── Main analyser ────────────────────────────────────────────────────────────

export function analyse(input: AnalyseInput): QIAnalysis {
  const { queries, pages, domain, hasComparison } = input
  if (!queries.length) {
    return emptyAnalysis(hasComparison, !!pages.length)
  }

  const brand = detectBrand(domain)

  // Pre-compute impression percentiles for thresholds
  const sortedImpressions = [...queries.map(q => q.impressions)].sort((a, b) => a - b)
  const p25 = percentile(sortedImpressions, 0.25)
  const p50 = percentile(sortedImpressions, 0.50)
  const p75 = percentile(sortedImpressions, 0.75)
  const p90 = percentile(sortedImpressions, 0.90)
  const p10 = percentile(sortedImpressions, 0.10)

  const totalClicks = queries.reduce((s, q) => s + q.clicks, 0)
  const totalImpressions = queries.reduce((s, q) => s + q.impressions, 0)
  const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0
  // Impression-weighted average position — matches how GSC calculates it
  const avgPosition = totalImpressions > 0
    ? queries.reduce((s, q) => s + q.position * q.impressions, 0) / totalImpressions
    : avg(queries.map(q => q.position))

  // ── Position buckets ────────────────────────────────────────────────────────
  // Use strict < boundaries so decimal positions (e.g. 3.6, 10.9) never fall
  // between buckets; exclude position=0 which means GSC had no data.

  const bucketDefs = [
    { label: 'Top 3',     range: '1–3',   test: (p: number) => p > 0 && p < 4  },
    { label: 'Page 1',    range: '4–10',  test: (p: number) => p >= 4 && p < 11 },
    { label: 'Page 2',    range: '11–20', test: (p: number) => p >= 11 && p < 21 },
    { label: 'Pages 3–5', range: '21–50', test: (p: number) => p >= 21 && p < 51 },
    { label: 'Deep',      range: '51+',   test: (p: number) => p >= 51 },
  ]

  const position_buckets: PositionBucket[] = bucketDefs.map(def => {
    const bucket = queries.filter(q => def.test(q.position))
    const bImpressions = bucket.reduce((s, q) => s + q.impressions, 0)
    const bClicks = bucket.reduce((s, q) => s + q.clicks, 0)
    return {
      label: def.label,
      range: def.range,
      count: bucket.length,
      impressions: bImpressions,
      clicks: bClicks,
      avg_ctr: bImpressions > 0 ? bClicks / bImpressions : 0,
      avg_position: bImpressions > 0
        ? bucket.reduce((s, q) => s + q.position * q.impressions, 0) / bImpressions
        : avg(bucket.map(q => q.position)),
    }
  })

  // ── Quick wins ──────────────────────────────────────────────────────────────

  const quick_wins: QuickWin[] = queries
    .filter(q => q.position >= 4 && q.position <= 20 && q.impressions >= p50)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 25)
    .map(q => {
      const opp = q.position <= 10 ? 'top3_push' as const : 'page1_push' as const
      const targetCtr = opp === 'top3_push' ? EXPECTED_CTR[2] : EXPECTED_CTR[5]
      const potential = Math.round(q.impressions * targetCtr)
      const lift = potential - q.clicks
      return {
        query: q.query,
        position: q.position,
        impressions: q.impressions,
        clicks: q.clicks,
        ctr: q.ctr,
        opportunity: opp,
        potential_clicks: potential,
        lift_estimate: `+${lift} clicks/mo`,
        pos_change:    q.prevPosition !== undefined ? Math.round((q.prevPosition - q.position) * 10) / 10 : undefined,
        click_change:  q.prevClicks   !== undefined ? q.clicks - q.prevClicks : undefined,
        prev_position: q.prevPosition,
      }
    })

  // ── CTR opportunities ───────────────────────────────────────────────────────

  const ctr_opportunities: CTROpportunity[] = queries
    .filter(q => {
      const exp = expectedCtr(q.position)
      return q.impressions >= p50 && q.ctr < exp * 0.65
    })
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 25)
    .map(q => {
      const exp = expectedCtr(q.position)
      const missed = Math.round(q.impressions * (exp - q.ctr))
      return {
        query: q.query,
        position: q.position,
        impressions: q.impressions,
        clicks: q.clicks,
        actual_ctr: q.ctr,
        expected_ctr: exp,
        gap_pct: Math.round(((exp - q.ctr) / exp) * 100),
        missed_clicks: missed,
        priority: q.ctr < exp * 0.35 ? 'high' as const : 'medium' as const,
        ctr_change:  q.prevCtr      !== undefined ? Math.round((q.ctr - q.prevCtr) * 10000) / 10000 : undefined,
        pos_change:  q.prevPosition !== undefined ? Math.round((q.prevPosition - q.position) * 10) / 10 : undefined,
      }
    })

  // ── Content gaps ────────────────────────────────────────────────────────────

  const content_gaps: ContentGap[] = queries
    .filter(q => q.impressions >= p90 && q.ctr < 0.005)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 20)
    .map(q => ({
      query: q.query,
      impressions: q.impressions,
      clicks: q.clicks,
      position: q.position,
      ctr: q.ctr,
      intent: detectIntent(q.query),
    }))

  // ── Featured snippet opportunities ──────────────────────────────────────────

  const snippetActions: Record<FeaturedSnippetOpp['query_type'], string> = {
    question: 'Add a concise direct-answer paragraph at the top of the page targeting this query.',
    comparison: 'Add a comparison table or summary box to capture the featured snippet.',
    list: 'Structure the answer as a numbered or bulleted list with a clear H2 heading.',
    definition: 'Add a bolded definition sentence in the first paragraph.',
  }

  const featured_snippets: FeaturedSnippetOpp[] = queries
    .filter(q => {
      if (q.position < 2 || q.position > 10) return false
      if (q.impressions < p50) return false
      const words = q.query.toLowerCase().split(/\s+/)
      const isSnippetWorthy =
        QUESTION_STARTERS.has(words[0]) ||
        q.query.includes(' vs ') ||
        words.some(w => ['best', 'top', 'list', 'types', 'examples', 'alternatives', 'ways', 'definition', 'meaning'].includes(w))
      return isSnippetWorthy
    })
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 20)
    .map(q => {
      const qt = detectQueryType(q.query)
      return {
        query: q.query,
        position: q.position,
        impressions: q.impressions,
        clicks: q.clicks,
        query_type: qt,
        action: snippetActions[qt],
      }
    })

  // ── Long-tail goldmine ──────────────────────────────────────────────────────

  const long_tail: LongTailOpp[] = queries
    .filter(q => wordCount(q.query) >= 4 && q.position > 8 && q.impressions >= p10)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 25)
    .map(q => ({
      query: q.query,
      word_count: wordCount(q.query),
      position: q.position,
      impressions: q.impressions,
      clicks: q.clicks,
      ctr: q.ctr,
      difficulty: q.position <= 20 ? 'easy' as const : 'medium' as const,
    }))

  // ── Top performers ──────────────────────────────────────────────────────────

  const top_performers: TopPerformer[] = queries
    .filter(q => {
      const exp = expectedCtr(q.position)
      return q.impressions >= p25 && q.ctr >= exp * 1.4
    })
    .sort((a, b) => {
      const ratioA = a.ctr / expectedCtr(a.position)
      const ratioB = b.ctr / expectedCtr(b.position)
      return ratioB - ratioA
    })
    .slice(0, 15)
    .map(q => {
      const exp = expectedCtr(q.position)
      return {
        query: q.query,
        position: q.position,
        impressions: q.impressions,
        clicks: q.clicks,
        actual_ctr: q.ctr,
        expected_ctr: exp,
        performance_ratio: Math.round((q.ctr / exp) * 100) / 100,
      }
    })

  // ── Topic clusters ──────────────────────────────────────────────────────────

  const topic_clusters = buildTopicClusters(queries)
  const keyword_groups = buildKeywordGroups(queries)

  // ── Branded split ───────────────────────────────────────────────────────────

  const branded_split = buildBrandedSplit(queries, brand)

  // ── Pages analysis (legacy) + new content map ───────────────────────────────

  let pagesAnalysis: PageAnalysis[] | undefined
  let content_map: ContentMapAnalysis | undefined
  if (pages.length > 0) {
    pagesAnalysis = buildPagesAnalysis(queries, pages, avgCtr)
    content_map = buildContentMap(queries, pages)
  }

  // ── AI opportunities ─────────────────────────────────────────────────────────

  const ai_opportunities = buildAiOpportunities(queries, pages, sortedImpressions)

  // ── Comparison ──────────────────────────────────────────────────────────────

  let comparison: ComparisonAnalysis | undefined
  if (hasComparison) {
    comparison = buildComparison(queries)
  }

  return {
    meta: {
      total_queries: queries.length,
      total_pages: pages.length,
      total_clicks: totalClicks,
      total_impressions: totalImpressions,
      avg_ctr: avgCtr,
      avg_position: avgPosition,
      has_pages: pages.length > 0,
      has_comparison: hasComparison,
    },
    position_buckets,
    quick_wins,
    ctr_opportunities,
    content_gaps,
    featured_snippets,
    long_tail,
    top_performers,
    topic_clusters,
    branded_split,
    pages: pagesAnalysis,
    comparison,
    keyword_groups,
    content_map,
    ai_opportunities,
  }
}

// ─── Sub-builders ─────────────────────────────────────────────────────────────

function buildTopicClusters(queries: QueryRow[], maxClusters = 15): TopicCluster[] {
  const wordFreq = new Map<string, number>()
  const queryWords = queries.map(q => {
    const words = significantWords(q.query)
    for (const w of words) wordFreq.set(w, (wordFreq.get(w) ?? 0) + 1)
    return { q, words }
  })

  const seeds = Array.from(wordFreq.entries())
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxClusters * 2)
    .map(([w]) => w)

  const clusters = new Map<string, { qs: QueryRow[] }>()
  const assigned = new Set<string>()

  for (const seed of seeds) {
    for (const { q, words } of queryWords) {
      if (assigned.has(q.query)) continue
      if (words.includes(seed)) {
        const c = clusters.get(seed) ?? { qs: [] }
        c.qs.push(q)
        clusters.set(seed, c)
        assigned.add(q.query)
      }
    }
  }

  return Array.from(clusters.entries())
    .filter(([, c]) => c.qs.length >= 2)
    .sort((a, b) => {
      const ia = a[1].qs.reduce((s, q) => s + q.impressions, 0)
      const ib = b[1].qs.reduce((s, q) => s + q.impressions, 0)
      return ib - ia
    })
    .slice(0, maxClusters)
    .map(([seed, c]) => {
      const totalImp = c.qs.reduce((s, q) => s + q.impressions, 0)
      const totalClicks = c.qs.reduce((s, q) => s + q.clicks, 0)
      return {
        topic: seed,
        query_count: c.qs.length,
        total_impressions: totalImp,
        total_clicks: totalClicks,
        avg_position: avg(c.qs.map(q => q.position)),
        avg_ctr: totalImp > 0 ? totalClicks / totalImp : 0,
        top_queries: c.qs
          .sort((a, b) => b.impressions - a.impressions)
          .slice(0, 5)
          .map(q => q.query),
      }
    })
}

function buildBrandedSplit(queries: QueryRow[], brand: string): BrandedSplit {
  const branded = queries.filter(q => isBranded(q.query, brand))
  const nonBranded = queries.filter(q => !isBranded(q.query, brand))

  const summarise = (qs: QueryRow[]) => {
    const clicks = qs.reduce((s, q) => s + q.clicks, 0)
    const imps = qs.reduce((s, q) => s + q.impressions, 0)
    return {
      queries: qs.length,
      clicks,
      impressions: imps,
      avg_ctr: imps > 0 ? clicks / imps : 0,
      avg_position: qs.length > 0 ? avg(qs.map(q => q.position)) : 0,
    }
  }

  return {
    brand: brand || null,
    branded: summarise(branded),
    non_branded: summarise(nonBranded),
  }
}

function buildPagesAnalysis(queries: QueryRow[], pages: PageRow[], avgCtr: number): PageAnalysis[] {
  return pages
    .sort((a, b) => b.impressions - a.impressions)
    .map(p => {
      const pageSlugTokens = new Set(slugTokens(p.page))
      const mapped = queries
        .filter(q => {
          const qWords = significantWords(q.query)
          if (!qWords.length) return false
          const overlap = qWords.filter(w => pageSlugTokens.has(w)).length
          return overlap / qWords.length >= 0.35
        })
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, 10)
        .map(q => q.query)

      const ctrVsAvg: PageAnalysis['ctr_vs_avg'] =
        p.ctr > avgCtr * 1.2 ? 'above' :
        p.ctr < avgCtr * 0.8 ? 'below' : 'average'

      return {
        page: p.page,
        clicks: p.clicks,
        impressions: p.impressions,
        ctr: p.ctr,
        position: p.position,
        mapped_queries: mapped,
        ctr_vs_avg: ctrVsAvg,
      }
    })
}

function buildComparison(queries: QueryRow[]): ComparisonAnalysis {
  const withPrev = queries.filter(q => q.prevImpressions !== undefined && q.prevPosition !== undefined)
  const onlyPrev = queries.filter(q =>
    (q.prevImpressions ?? 0) > 0 && q.impressions === 0 && q.clicks === 0
  )
  const onlyCurrent = queries.filter(q =>
    q.impressions > 50 && (q.prevImpressions === undefined || q.prevImpressions === 0)
  )

  const improved = withPrev
    .filter(q => (q.prevPosition ?? q.position) - q.position >= 3)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 25)
    .map(q => ({
      query: q.query,
      from_pos: q.prevPosition ?? q.position,
      to_pos: q.position,
      change: Math.round(((q.prevPosition ?? q.position) - q.position) * 10) / 10,
      impressions: q.impressions,
    }))

  const dropped = withPrev
    .filter(q => q.position - (q.prevPosition ?? q.position) >= 3)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 25)
    .map(q => ({
      query: q.query,
      from_pos: q.prevPosition ?? q.position,
      to_pos: q.position,
      change: Math.round((q.position - (q.prevPosition ?? q.position)) * 10) / 10,
      impressions: q.impressions,
    }))

  const impGains = withPrev
    .filter(q => {
      const prev = q.prevImpressions ?? 0
      return prev > 0 && (q.impressions - prev) / prev >= 0.5
    })
    .sort((a, b) => {
      const dA = (a.impressions - (a.prevImpressions ?? 0)) / (a.prevImpressions ?? 1)
      const dB = (b.impressions - (b.prevImpressions ?? 0)) / (b.prevImpressions ?? 1)
      return dB - dA
    })
    .slice(0, 15)
    .map(q => ({
      query: q.query,
      prev: q.prevImpressions ?? 0,
      current: q.impressions,
      change_pct: Math.round(((q.impressions - (q.prevImpressions ?? 0)) / (q.prevImpressions ?? 1)) * 100),
    }))

  const impLosses = withPrev
    .filter(q => {
      const prev = q.prevImpressions ?? 0
      return prev > 0 && (prev - q.impressions) / prev >= 0.3
    })
    .sort((a, b) => {
      const dA = ((a.prevImpressions ?? 0) - a.impressions) / (a.prevImpressions ?? 1)
      const dB = ((b.prevImpressions ?? 0) - b.impressions) / (b.prevImpressions ?? 1)
      return dB - dA
    })
    .slice(0, 15)
    .map(q => ({
      query: q.query,
      prev: q.prevImpressions ?? 0,
      current: q.impressions,
      change_pct: Math.round(((q.impressions - (q.prevImpressions ?? 0)) / (q.prevImpressions ?? 1)) * 100),
    }))

  const totalPrevClicks = withPrev.reduce((s, q) => s + (q.prevClicks ?? 0), 0)
  const totalCurrClicks = withPrev.reduce((s, q) => s + q.clicks, 0)
  const totalPrevImps   = withPrev.reduce((s, q) => s + (q.prevImpressions ?? 0), 0)
  const totalCurrImps   = withPrev.reduce((s, q) => s + q.impressions, 0)
  const avgPrevPos = avg(withPrev.filter(q => q.prevPosition).map(q => q.prevPosition!))
  const avgCurrPos = avg(withPrev.map(q => q.position))

  // Impression-weighted CTR change
  const avgPrevCtr = totalPrevImps > 0
    ? withPrev.reduce((s, q) => s + (q.prevCtr ?? 0) * (q.prevImpressions ?? 0), 0) / totalPrevImps : 0
  const avgCurrCtr = totalCurrImps > 0
    ? withPrev.reduce((s, q) => s + q.ctr * q.impressions, 0) / totalCurrImps : 0

  // SERP position movement counts
  const queriesEnteredTop3  = withPrev.filter(q => q.position < 4  && (q.prevPosition ?? 99) >= 4).length
  const queriesLeftTop3     = withPrev.filter(q => q.position >= 4  && (q.prevPosition ?? 99) < 4).length
  const queriesEnteredTop10 = withPrev.filter(q => q.position < 11  && (q.prevPosition ?? 99) >= 11).length
  const queriesLeftTop10    = withPrev.filter(q => q.position >= 11 && (q.prevPosition ?? 99) < 11).length

  // Top movers: position improved, ranked by (improvement × log(impressions))
  const top_movers: ComparisonMove[] = withPrev
    .filter(q => q.prevPosition !== undefined && q.prevPosition > q.position)
    .sort((a, b) => {
      const sA = (a.prevPosition! - a.position) * Math.log(a.impressions + 1)
      const sB = (b.prevPosition! - b.position) * Math.log(b.impressions + 1)
      return sB - sA
    })
    .slice(0, 30)
    .map(q => ({
      query: q.query,
      impressions: q.impressions,
      clicks: q.clicks,
      position: q.position,
      prev_position: q.prevPosition!,
      prev_impressions: q.prevImpressions ?? 0,
      pos_change: Math.round((q.prevPosition! - q.position) * 10) / 10,
      click_change: q.clicks - (q.prevClicks ?? 0),
      impression_change_pct: q.prevImpressions
        ? Math.round(((q.impressions - q.prevImpressions) / q.prevImpressions) * 100) : 0,
    }))

  // Biggest drops: position declined, ranked by (drop × log(impressions))
  const biggest_drops: ComparisonMove[] = withPrev
    .filter(q => q.prevPosition !== undefined && q.position > q.prevPosition)
    .sort((a, b) => {
      const sA = (a.position - a.prevPosition!) * Math.log(a.impressions + 1)
      const sB = (b.position - b.prevPosition!) * Math.log(b.impressions + 1)
      return sB - sA
    })
    .slice(0, 30)
    .map(q => ({
      query: q.query,
      impressions: q.impressions,
      clicks: q.clicks,
      position: q.position,
      prev_position: q.prevPosition!,
      prev_impressions: q.prevImpressions ?? 0,
      pos_change: Math.round((q.prevPosition! - q.position) * 10) / 10,  // negative
      click_change: q.clicks - (q.prevClicks ?? 0),
      impression_change_pct: q.prevImpressions
        ? Math.round(((q.impressions - q.prevImpressions) / q.prevImpressions) * 100) : 0,
    }))

  return {
    summary: {
      click_change: totalCurrClicks - totalPrevClicks,
      click_change_pct: totalPrevClicks > 0
        ? Math.round(((totalCurrClicks - totalPrevClicks) / totalPrevClicks) * 100) : 0,
      impression_change: totalCurrImps - totalPrevImps,
      impression_change_pct: totalPrevImps > 0
        ? Math.round(((totalCurrImps - totalPrevImps) / totalPrevImps) * 100) : 0,
      avg_position_change: Math.round((avgPrevPos - avgCurrPos) * 10) / 10,
      total_improved: improved.length,
      total_dropped: dropped.length,
      avg_ctr_change: Math.round((avgCurrCtr - avgPrevCtr) * 10000) / 10000,
      total_new: onlyCurrent.length,
      total_lost: onlyPrev.length,
      queries_entered_top3:  queriesEnteredTop3,
      queries_left_top3:     queriesLeftTop3,
      queries_entered_top10: queriesEnteredTop10,
      queries_left_top10:    queriesLeftTop10,
    },
    improved_positions: improved,
    dropped_positions: dropped,
    impression_gains: impGains,
    impression_losses: impLosses,
    new_queries: onlyCurrent
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 30)
      .map(q => ({ query: q.query, impressions: q.impressions, clicks: q.clicks, position: q.position })),
    lost_queries: onlyPrev
      .sort((a, b) => (b.prevImpressions ?? 0) - (a.prevImpressions ?? 0))
      .slice(0, 30)
      .map(q => ({ query: q.query, prev_impressions: q.prevImpressions ?? 0, prev_clicks: q.prevClicks ?? 0, prev_position: q.prevPosition ?? 0 })),
    top_movers,
    biggest_drops,
  }
}

function emptyAnalysis(hasComparison: boolean, hasPages: boolean): QIAnalysis {
  return {
    meta: { total_queries: 0, total_pages: 0, total_clicks: 0, total_impressions: 0, avg_ctr: 0, avg_position: 0, has_pages: hasPages, has_comparison: hasComparison },
    position_buckets: [],
    quick_wins: [],
    ctr_opportunities: [],
    content_gaps: [],
    featured_snippets: [],
    long_tail: [],
    top_performers: [],
    topic_clusters: [],
    branded_split: { brand: null, branded: { queries: 0, clicks: 0, impressions: 0, avg_ctr: 0, avg_position: 0 }, non_branded: { queries: 0, clicks: 0, impressions: 0, avg_ctr: 0, avg_position: 0 } },
    keyword_groups: [],
    ai_opportunities: [],
  }
}

// ─── New sub-builders ─────────────────────────────────────────────────────────

function getMostCommon<T>(arr: T[]): T | null {
  if (!arr.length) return null
  const freq = new Map<T, number>()
  for (const item of arr) freq.set(item, (freq.get(item) ?? 0) + 1)
  return Array.from(freq.entries()).sort((a, b) => b[1] - a[1])[0][0]
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, c => c.toUpperCase())
}

function groupRecommendation(intent: Intent | 'mixed', topic: string, avgPos: number): string {
  if (intent === 'informational') {
    return avgPos > 20
      ? `Create a comprehensive guide targeting "${topic}" to capture informational traffic.`
      : `Expand existing "${topic}" content with FAQs, examples and related questions to reinforce rankings.`
  }
  if (intent === 'commercial') {
    return avgPos > 20
      ? `Build a comparison or review page targeting "${topic}" queries.`
      : `Improve title tags and meta descriptions to win more commercial clicks for "${topic}".`
  }
  if (intent === 'transactional') {
    return `Ensure service/pricing pages for "${topic}" are clearly indexed and easy to navigate.`
  }
  if (intent === 'navigational') {
    return `Strengthen brand signals and sitelinks for "${topic}" related navigational queries.`
  }
  return `Consolidate "${topic}" content into a well-structured pillar page covering all intents.`
}

function buildKeywordGroups(queries: QueryRow[], max = 20): KeywordGroup[] {
  // Extract significant words and bigrams per query
  const queryMeta = queries.map(q => {
    const words = significantWords(q.query)
    const bigrams: string[] = []
    for (let i = 0; i < words.length - 1; i++) bigrams.push(`${words[i]} ${words[i + 1]}`)
    return { q, words, bigrams }
  })

  // Score phrases (bigrams preferred, then unigrams) by impression weight
  const phraseScore = new Map<string, number>()
  for (const { q, words, bigrams } of queryMeta) {
    for (const phrase of [...bigrams, ...words]) {
      phraseScore.set(phrase, (phraseScore.get(phrase) ?? 0) + q.impressions)
    }
  }

  // Top phrases that appear in ≥2 queries
  const phraseCounts = new Map<string, number>()
  for (const { words, bigrams } of queryMeta) {
    for (const phrase of [...new Set([...bigrams, ...words])]) {
      phraseCounts.set(phrase, (phraseCounts.get(phrase) ?? 0) + 1)
    }
  }

  const topPhrases = Array.from(phraseScore.entries())
    .filter(([p]) => (phraseCounts.get(p) ?? 0) >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([p]) => p)
    .slice(0, max * 3)

  // Assign each query to its highest-scoring phrase (greedy)
  const groups = new Map<string, QueryRow[]>()
  const assigned = new Set<string>()

  for (const phrase of topPhrases) {
    for (const { q, words, bigrams } of queryMeta) {
      if (assigned.has(q.query)) continue
      const inQuery = bigrams.includes(phrase) || words.includes(phrase)
      if (!inQuery) continue
      const g = groups.get(phrase) ?? []
      g.push(q)
      groups.set(phrase, g)
      assigned.add(q.query)
    }
  }

  return Array.from(groups.entries())
    .filter(([, qs]) => qs.length >= 2)
    .sort((a, b) => {
      const ia = a[1].reduce((s, q) => s + q.impressions, 0)
      const ib = b[1].reduce((s, q) => s + q.impressions, 0)
      return ib - ia
    })
    .slice(0, max)
    .map(([phrase, qs]) => {
      const totalImp = qs.reduce((s, q) => s + q.impressions, 0)
      const totalClicks = qs.reduce((s, q) => s + q.clicks, 0)
      const queryItems: KeywordGroupQuery[] = qs
        .sort((a, b) => b.impressions - a.impressions)
        .map(q => ({ query: q.query, impressions: q.impressions, clicks: q.clicks, position: q.position, ctr: q.ctr, intent: detectIntent(q.query) }))

      const intents = queryItems.map(q => q.intent)
      const intentCounts = { informational: 0, commercial: 0, transactional: 0, navigational: 0 }
      for (const i of intents) intentCounts[i]++
      const maxCount = Math.max(...Object.values(intentCounts))
      const dominantIntents = (Object.entries(intentCounts) as [Intent, number][]).filter(([, c]) => c === maxCount)
      const dominant: Intent | 'mixed' = dominantIntents.length > 1 ? 'mixed' : dominantIntents[0][0]

      const avgPos = totalImp > 0
        ? qs.reduce((s, q) => s + q.position * q.impressions, 0) / totalImp
        : avg(qs.map(q => q.position))

      return {
        parent_topic: phrase,
        intent: dominant,
        query_count: qs.length,
        total_impressions: totalImp,
        total_clicks: totalClicks,
        avg_position: avgPos,
        avg_ctr: totalImp > 0 ? totalClicks / totalImp : 0,
        queries: queryItems,
        recommended_action: groupRecommendation(dominant, phrase, avgPos),
      }
    })
}

function matchQueryToPage(q: QueryRow, pages: PageRow[]): PageRow | null {
  const qWords = significantWords(q.query)
  if (!qWords.length) return null
  let best: { page: PageRow; score: number } | null = null
  for (const p of pages) {
    const tokens = new Set(slugTokens(p.page))
    const overlap = qWords.filter(w => tokens.has(w)).length
    const score = overlap / qWords.length
    if (score >= 0.28 && (!best || score > best.score)) {
      best = { page: p, score }
    }
  }
  return best?.page ?? null
}

function buildContentMap(queries: QueryRow[], pages: PageRow[]): ContentMapAnalysis {
  const pageQueryBuckets = new Map<string, QueryRow[]>()
  const orphanQueries: QueryRow[] = []

  for (const q of queries) {
    const matched = matchQueryToPage(q, pages)
    if (matched) {
      const list = pageQueryBuckets.get(matched.page) ?? []
      list.push(q)
      pageQueryBuckets.set(matched.page, list)
    } else {
      orphanQueries.push(q)
    }
  }

  const mapped_pages: ContentMapEntry[] = pages
    .filter(p => pageQueryBuckets.has(p.page))
    .map(p => {
      const qs = pageQueryBuckets.get(p.page)!
      const qItems: KeywordGroupQuery[] = qs
        .sort((a, b) => b.impressions - a.impressions)
        .map(q => ({ query: q.query, impressions: q.impressions, clicks: q.clicks, position: q.position, ctr: q.ctr, intent: detectIntent(q.query) }))
      return {
        page: p.page,
        page_impressions: p.impressions,
        page_clicks: p.clicks,
        page_ctr: p.ctr,
        page_position: p.position,
        mapped_queries: qItems,
        total_query_impressions: qs.reduce((s, q) => s + q.impressions, 0),
        total_query_clicks: qs.reduce((s, q) => s + q.clicks, 0),
      }
    })
    .sort((a, b) => b.total_query_impressions - a.total_query_impressions)

  const sortedOrphans = orphanQueries
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 60)
    .map(q => ({ query: q.query, impressions: q.impressions, clicks: q.clicks, position: q.position, ctr: q.ctr, intent: detectIntent(q.query) }))

  const totalImpressions = queries.reduce((s, q) => s + q.impressions, 0)
  const mappedImpressions = queries
    .filter(q => matchQueryToPage(q, pages))
    .reduce((s, q) => s + q.impressions, 0)

  return {
    mapped_pages,
    orphan_queries: sortedOrphans,
    suggested_pages: buildPageRecommendations(orphanQueries),
    coverage_pct: totalImpressions > 0 ? (mappedImpressions / totalImpressions) * 100 : 0,
  }
}

function buildPageRecommendations(orphans: QueryRow[], max = 15): SuggestedPage[] {
  if (!orphans.length) return []

  const queryMeta = orphans.map(q => ({ q, words: significantWords(q.query) }))

  const wordScore = new Map<string, number>()
  for (const { q, words } of queryMeta) {
    for (const w of words) wordScore.set(w, (wordScore.get(w) ?? 0) + q.impressions)
  }

  const topWords = Array.from(wordScore.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w)
    .slice(0, max * 2)

  const groups = new Map<string, QueryRow[]>()
  const assigned = new Set<string>()

  for (const word of topWords) {
    for (const { q, words } of queryMeta) {
      if (assigned.has(q.query)) continue
      if (words.includes(word)) {
        const g = groups.get(word) ?? []
        g.push(q)
        groups.set(word, g)
        assigned.add(q.query)
      }
    }
  }

  return Array.from(groups.entries())
    .sort((a, b) => {
      const ia = a[1].reduce((s, q) => s + q.impressions, 0)
      const ib = b[1].reduce((s, q) => s + q.impressions, 0)
      return ib - ia
    })
    .slice(0, max)
    .map(([keyword, qs]) => {
      const totalImp = qs.reduce((s, q) => s + q.impressions, 0)
      const intents = qs.map(q => detectIntent(q.query))
      const dominantIntent: Intent = getMostCommon(intents) ?? 'informational'
      const slug = keyword.replace(/\s+/g, '-').toLowerCase()
      const titlePrefix = dominantIntent === 'informational' ? 'Complete Guide to' : dominantIntent === 'commercial' ? 'Best' : ''
      return {
        suggested_title: titleCase(`${titlePrefix} ${keyword}`.trim()),
        suggested_slug: `/${slug}/`,
        target_queries: qs.slice(0, 10).map(q => q.query),
        total_impressions: totalImp,
        priority: totalImp >= 30 ? 'high' as const : 'medium' as const,
        intent: dominantIntent,
        reason: `${qs.length} quer${qs.length === 1 ? 'y' : 'ies'} targeting "${keyword}" (${totalImp.toLocaleString()} impressions) have no dedicated page.`,
      }
    })
}

function buildAiOpportunities(queries: QueryRow[], pages: PageRow[], sortedImpressions: number[]): AiOpportunity[] {
  const p25 = percentile(sortedImpressions, 0.25)
  const opps: AiOpportunity[] = []

  for (const q of queries) {
    if (q.impressions < p25 || q.position > 40) continue

    const words = q.query.toLowerCase().split(/\s+/)
    const first = words[0]
    const lc = q.query.toLowerCase()

    const mappedPage = pages.length > 0 ? matchQueryToPage(q, pages)?.page : undefined
    const highScore = q.impressions >= percentile(sortedImpressions, 0.5) && q.position <= 20

    // How-to / step content
    if (first === 'how') {
      opps.push({ query: q.query, impressions: q.impressions, clicks: q.clicks, position: q.position, ai_type: 'how_to', score: highScore ? 'high' : 'medium', content_format: 'Numbered step-by-step guide', schema_recommendation: 'HowTo schema', action: 'Break content into clearly numbered steps with an H2 per step. Add HowTo schema. AI tools frequently cite step-format content verbatim.', mapped_page: mappedPage })
      continue
    }

    // Other question forms → AI Overview / FAQ
    if (QUESTION_STARTERS.has(first)) {
      opps.push({ query: q.query, impressions: q.impressions, clicks: q.clicks, position: q.position, ai_type: 'ai_overview', score: highScore ? 'high' : 'medium', content_format: 'Direct-answer paragraph (40–60 words) + FAQ section', schema_recommendation: 'FAQPage schema', action: 'Add a concise bolded answer in the first paragraph. Create a FAQ section with 5+ related questions. Add FAQPage schema to the page.', mapped_page: mappedPage })
      continue
    }

    // Comparison
    if (lc.includes(' vs ') || lc.includes(' versus ') || words.includes('compare') || words.includes('difference')) {
      opps.push({ query: q.query, impressions: q.impressions, clicks: q.clicks, position: q.position, ai_type: 'comparison', score: highScore ? 'high' : 'medium', content_format: 'Side-by-side comparison table with clear verdict', schema_recommendation: 'Table markup + FAQPage for follow-up questions', action: 'Create a structured comparison table. Add a "Bottom Line" verdict section. AI tools pull structured comparison data into summaries.', mapped_page: mappedPage })
      continue
    }

    // Definition / meaning
    if (words.some(w => ['meaning', 'definition', 'define', 'explained', 'means', 'example', 'examples'].includes(w))) {
      opps.push({ query: q.query, impressions: q.impressions, clicks: q.clicks, position: q.position, ai_type: 'definition', score: highScore ? 'high' : 'medium', content_format: 'One-sentence definition → 2–3 sentence expansion', schema_recommendation: 'FAQPage or DefinedTerm schema', action: 'Add a bolded definition at the very top of the page. AI models prioritise definitional content and cite it directly.', mapped_page: mappedPage })
      continue
    }

    // List / best / top
    if (words.some(w => ['best', 'top', 'list', 'types', 'alternatives', 'tools', 'ways', 'tips'].includes(w))) {
      opps.push({ query: q.query, impressions: q.impressions, clicks: q.clicks, position: q.position, ai_type: 'list', score: highScore ? 'high' : 'medium', content_format: 'Numbered or bulleted list with H3 per item', schema_recommendation: 'ItemList schema', action: 'Structure as a numbered list with a summary sentence for each item. Add ItemList schema. AI summarisers frequently extract list-format content.', mapped_page: mappedPage })
    }
  }

  return opps
    .sort((a, b) => {
      if (a.score !== b.score) return a.score === 'high' ? -1 : 1
      return b.impressions - a.impressions
    })
    .slice(0, 35)
}
