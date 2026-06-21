// ─── Types ────────────────────────────────────────────────────────────────────

export type SourceType =
  | 'Verified free source'
  | 'Extracted from website'
  | 'Predicted AI prompt'
  | 'GEO opportunity'

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

// ─── Google Autocomplete style ────────────────────────────────────────────────
// Future: proxy to https://suggestqueries.google.com/complete/search?client=firefox&q=...

export function getAutocompleteQueries(
  topic: string,
  country: string,
  audience: string,
): SourceQuery[] {
  return [
    { query: `best ${topic} for ${audience}`, sourceType: 'Verified free source', intent: 'Commercial', funnelStage: 'Decision' },
    { query: `${topic} ${country}`, sourceType: 'Verified free source', intent: 'Local', funnelStage: 'Consideration' },
    { query: `${topic} cost in ${country}`, sourceType: 'Verified free source', intent: 'Commercial', funnelStage: 'Consideration' },
    { query: `${topic} for beginners`, sourceType: 'Verified free source', intent: 'Informational', funnelStage: 'Awareness' },
    { query: `online ${topic}`, sourceType: 'Verified free source', intent: 'Informational', funnelStage: 'Awareness' },
    { query: `${topic} reviews`, sourceType: 'Verified free source', intent: 'Trust-building', funnelStage: 'Consideration' },
    { query: `affordable ${topic} ${country}`, sourceType: 'Verified free source', intent: 'Commercial', funnelStage: 'Decision' },
    { query: `${topic} free trial`, sourceType: 'Verified free source', intent: 'Transactional', funnelStage: 'Decision' },
  ]
}

// ─── People Also Ask style ────────────────────────────────────────────────────
// Future: use DataForSEO free tier or SerpAPI PAYG

export function getPAAQuestions(
  topic: string,
  audience: string,
  country: string,
): SourceQuery[] {
  return [
    { query: `What is the best ${topic} for ${audience}?`, sourceType: 'Verified free source', intent: 'Informational', funnelStage: 'Awareness' },
    { query: `How does ${topic} work?`, sourceType: 'Verified free source', intent: 'Informational', funnelStage: 'Awareness' },
    { query: `How much does ${topic} cost in ${country}?`, sourceType: 'Verified free source', intent: 'Commercial', funnelStage: 'Consideration' },
    { query: `Is ${topic} worth it for ${audience}?`, sourceType: 'Verified free source', intent: 'Trust-building', funnelStage: 'Consideration' },
    { query: `What should ${audience} look for in ${topic}?`, sourceType: 'Verified free source', intent: 'Informational', funnelStage: 'Awareness' },
    { query: `Can ${audience} do ${topic} online?`, sourceType: 'Verified free source', intent: 'Informational', funnelStage: 'Consideration' },
    { query: `Which ${topic} is best in ${country}?`, sourceType: 'Verified free source', intent: 'Comparison', funnelStage: 'Decision' },
  ]
}

// ─── Reddit search pattern extraction ────────────────────────────────────────
// Future: https://www.reddit.com/search.json?q={topic}&sort=top

export function getRedditPatterns(
  topic: string,
  audience: string,
): SourceQuery[] {
  return [
    { query: `Is ${topic} actually worth it? (${audience} perspective)`, sourceType: 'Verified free source', intent: 'Trust-building', funnelStage: 'Consideration' },
    { query: `${topic} recommendations for ${audience} — what worked for you?`, sourceType: 'Verified free source', intent: 'Trust-building', funnelStage: 'Consideration' },
    { query: `Honest ${topic} pros and cons — no fluff`, sourceType: 'Verified free source', intent: 'Trust-building', funnelStage: 'Consideration' },
  ]
}

// ─── Website extraction ───────────────────────────────────────────────────────
// Future: fetch /sitemap.xml, extract URLs, fetch page <h1>/<h2> tags

export function getWebsiteQueries(
  websiteUrl: string,
  topic: string,
  audience: string,
): SourceQuery[] {
  const domain = (() => {
    try { return new URL(websiteUrl).hostname.replace('www.', '') }
    catch { return websiteUrl.replace(/^https?:\/\//, '').replace('www.', '').split('/')[0] }
  })()

  return [
    { query: `${topic} at ${domain}`, sourceType: 'Extracted from website', intent: 'Commercial', funnelStage: 'Decision' },
    { query: `${audience} resources on ${domain}`, sourceType: 'Extracted from website', intent: 'Informational', funnelStage: 'Awareness' },
    { query: `${topic} guide from ${domain}`, sourceType: 'Extracted from website', intent: 'Informational', funnelStage: 'Awareness' },
  ]
}
