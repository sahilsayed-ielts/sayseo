// ─── API response types ──────────────────────────────────────────────────────

export interface AiSource {
  name: string
  domain: string
  sessions: number
  trend: number | null
}

export interface TopPage {
  url: string
  source: string
  sessions: number
}

export interface TopQuery {
  query: string
  clicks: number
  impressions: number
}

export interface AiTrafficReport {
  aiSources: AiSource[]
  topPages: TopPage[]
  topQueries: TopQuery[]
  totalAiSessions: number
  totalSessions: number
  aiPercentage: number
  dateRange: string
  fromCache: boolean
}

export interface PageSource {
  domain: string
  name: string
  sessions: number
}

export interface PageEntry {
  url: string
  totalAiSessions: number
  sources: PageSource[]
}

export interface PagesReport {
  pages: PageEntry[]
  dateRange: string
  fromCache: boolean
}

export interface TrendPoint {
  date: string
  [source: string]: string | number
}

export interface TrendResponse {
  series: Record<string, Array<{ date: string; sessions: number }>>
  sources: string[]
  dateRange: string
  fromCache: boolean
}

export interface Recommendation {
  title: string
  description: string
  impact: 'High' | 'Medium' | 'Low'
}

// ─── UI types ─────────────────────────────────────────────────────────────────

export interface Site {
  id: string
  domain: string
  last_synced: string | null
  ga4_property_id: string | null
  gsc_site_url: string | null
}

// ─── Colours ──────────────────────────────────────────────────────────────────

export const SOURCE_COLORS: Record<string, string> = {
  ChatGPT: '#00D4AA',
  Perplexity: '#8B5CF6',
  Gemini: '#3B82F6',
  'Microsoft Copilot': '#0EA5E9',
  Claude: '#F59E0B',
  'You.com': '#10B981',
  Phind: '#EC4899',
  Bard: '#EF4444',
}

export const FALLBACK_COLORS = [
  '#00D4AA', '#8B5CF6', '#3B82F6', '#0EA5E9', '#F59E0B', '#10B981', '#EC4899', '#EF4444',
]

export function sourceColor(name: string, index = 0): string {
  return SOURCE_COLORS[name] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]
}
