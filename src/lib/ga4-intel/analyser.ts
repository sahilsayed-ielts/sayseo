// Pure algorithmic GA4 analysis — no external dependencies

// ─── Input types ──────────────────────────────────────────────────────────────

export interface GA4PageRow {
  page: string
  sessions: number
  engaged_sessions: number
  avg_engagement_time: number   // seconds
  bounce_rate: number           // 0-1
  views?: number
  users?: number
  conversions?: number
  prev_sessions?: number
  prev_engaged_sessions?: number
  prev_avg_engagement_time?: number
  prev_bounce_rate?: number
  prev_conversions?: number
}

export interface GA4ChannelRow {
  channel: string
  sessions: number
  engaged_sessions?: number
  prev_sessions?: number
}

export interface AnalyseInput {
  pages: GA4PageRow[]
  channels: GA4ChannelRow[]
  hasComparison: boolean
}

// ─── Output types ─────────────────────────────────────────────────────────────

export interface GA4Meta {
  total_sessions: number
  total_pages: number
  total_views: number
  total_users: number
  avg_engagement_rate: number
  avg_engagement_time: number
  organic_session_pct: number
  has_comparison: boolean
  has_channels: boolean
  has_conversions: boolean
}

export interface GA4QuickWin {
  page: string
  sessions: number
  engagement_rate: number
  avg_engagement_time: number
  opportunity: 'improve_engagement' | 'hidden_gem' | 'drive_traffic'
  action: string
  priority: 'high' | 'medium'
}

export interface GA4EngagementIssue {
  page: string
  sessions: number
  engagement_rate: number
  avg_engagement_time: number
  severity: 'critical' | 'warning'
  issue: string
  action: string
}

export interface GA4TrafficLeader {
  page: string
  sessions: number
  engaged_sessions: number
  engagement_rate: number
  avg_engagement_time: number
  views: number
  session_share: number
  conversions?: number
}

export interface GA4HiddenGem {
  page: string
  sessions: number
  engagement_rate: number
  avg_engagement_time: number
  gem_score: number
  action: string
}

export interface GA4ChannelStat {
  channel: string
  sessions: number
  share: number
  engaged_sessions?: number
  engagement_rate?: number
  session_change?: number
  session_change_pct?: number
}

export interface GA4ComparisonMove {
  page: string
  sessions: number
  prev_sessions: number
  session_change: number
  session_change_pct: number
  engagement_rate: number
  prev_engagement_rate: number
  engagement_change: number
}

export interface GA4ComparisonAnalysis {
  summary: {
    session_change: number
    session_change_pct: number
    engagement_rate_change: number
    avg_time_change: number
    total_rising: number
    total_declining: number
    total_new: number
    total_lost: number
  }
  rising: GA4ComparisonMove[]
  declining: GA4ComparisonMove[]
  new_pages: Array<{ page: string; sessions: number; engagement_rate: number }>
  lost_pages: Array<{ page: string; prev_sessions: number; prev_engagement_rate: number }>
}

export interface GA4Analysis {
  meta: GA4Meta
  quick_wins: GA4QuickWin[]
  engagement_issues: GA4EngagementIssue[]
  traffic_leaders: GA4TrafficLeader[]
  hidden_gems: GA4HiddenGem[]
  channel_breakdown: GA4ChannelStat[]
  comparison?: GA4ComparisonAnalysis
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function percentile(sorted: number[], pct: number): number {
  if (!sorted.length) return 0
  const idx = Math.max(0, Math.ceil(sorted.length * pct) - 1)
  return sorted[Math.min(idx, sorted.length - 1)]
}

function engRate(row: GA4PageRow): number {
  if (row.sessions <= 0) return 0
  return Math.min(1, row.engaged_sessions / row.sessions)
}

// ─── Main analyser ────────────────────────────────────────────────────────────

export function analyse(input: AnalyseInput): GA4Analysis {
  const { pages, channels, hasComparison } = input

  const totalSessions = pages.reduce((s, p) => s + p.sessions, 0)
  const totalViews = pages.reduce((s, p) => s + (p.views ?? 0), 0)
  const totalUsers = pages.reduce((s, p) => s + (p.users ?? 0), 0)
  const totalEngaged = pages.reduce((s, p) => s + p.engaged_sessions, 0)

  const avgEngRate = totalSessions > 0 ? totalEngaged / totalSessions : 0
  const avgEngTime = totalSessions > 0
    ? pages.reduce((s, p) => s + p.avg_engagement_time * p.sessions, 0) / totalSessions
    : 0

  const hasConversions = pages.some(p => (p.conversions ?? 0) > 0)

  // Organic session %
  const totalChannelSessions = channels.reduce((s, c) => s + c.sessions, 0)
  const organicChannel = channels.find(c => c.channel.toLowerCase().includes('organic'))
  const organicSessionPct = totalChannelSessions > 0 && organicChannel
    ? organicChannel.sessions / totalChannelSessions
    : 0

  // Session percentiles
  const sortedSessions = [...pages.map(p => p.sessions)].sort((a, b) => a - b)
  const p10 = percentile(sortedSessions, 0.10)
  const p25 = percentile(sortedSessions, 0.25)
  const p50 = percentile(sortedSessions, 0.50)
  const p75 = percentile(sortedSessions, 0.75)

  const meta: GA4Meta = {
    total_sessions: totalSessions,
    total_pages: pages.length,
    total_views: totalViews,
    total_users: totalUsers,
    avg_engagement_rate: avgEngRate,
    avg_engagement_time: avgEngTime,
    organic_session_pct: organicSessionPct,
    has_comparison: hasComparison,
    has_channels: channels.length > 0,
    has_conversions: hasConversions,
  }

  const quick_wins = buildQuickWins(pages, avgEngRate, avgEngTime, p25, p50, p75)
  const engagement_issues = buildEngagementIssues(pages, avgEngRate, avgEngTime, p25)
  const traffic_leaders = buildTrafficLeaders(pages, totalSessions)
  const hidden_gems = buildHiddenGems(pages, avgEngRate, avgEngTime, p50)
  const channel_breakdown = buildChannelBreakdown(channels, totalChannelSessions)
  const comparison = hasComparison ? buildComparison(pages) : undefined

  return { meta, quick_wins, engagement_issues, traffic_leaders, hidden_gems, channel_breakdown, comparison }
}

// ─── Sub-builders ─────────────────────────────────────────────────────────────

function buildQuickWins(
  pages: GA4PageRow[],
  avgEngRate: number,
  avgEngTime: number,
  p25: number,
  p50: number,
  p75: number,
): GA4QuickWin[] {
  const wins: GA4QuickWin[] = []

  for (const p of pages) {
    const er = engRate(p)

    // Candidate A: high-traffic, low engagement
    if (p.sessions >= p50 && er < avgEngRate * 0.75) {
      wins.push({
        page: p.page,
        sessions: p.sessions,
        engagement_rate: er,
        avg_engagement_time: p.avg_engagement_time,
        opportunity: 'improve_engagement',
        action: 'High-traffic page with below-average engagement signals. Improve content depth, readability, and ensure page matches search intent.',
        priority: (p.sessions > p75 || er < 0.3) ? 'high' : 'medium',
      })
      continue
    }

    // Candidate B: moderate traffic, high engagement
    if (p.sessions < p50 && p.sessions >= p25 && er > 0.65) {
      wins.push({
        page: p.page,
        sessions: p.sessions,
        engagement_rate: er,
        avg_engagement_time: p.avg_engagement_time,
        opportunity: 'hidden_gem',
        action: 'High-quality page getting limited traffic. Build backlinks, strengthen internal linking from top pages, and optimise the title/meta description.',
        priority: p.sessions > p75 ? 'high' : 'medium',
      })
      continue
    }

    // Candidate C: very low traffic, exceptional engagement
    if (p.sessions < p25 && er > 0.70 && p.avg_engagement_time > 90) {
      wins.push({
        page: p.page,
        sessions: p.sessions,
        engagement_rate: er,
        avg_engagement_time: p.avg_engagement_time,
        opportunity: 'drive_traffic',
        action: 'Exceptional engagement but very low visibility. Submit to sitemaps, add to navigation, and target with link building.',
        priority: 'medium',
      })
    }
  }

  return wins
    .sort((a, b) => {
      const aHigh = a.opportunity === 'improve_engagement' && a.sessions > p75
      const bHigh = b.opportunity === 'improve_engagement' && b.sessions > p75
      if (aHigh && !bHigh) return -1
      if (!aHigh && bHigh) return 1
      return b.sessions - a.sessions
    })
    .slice(0, 25)
}

function buildEngagementIssues(
  pages: GA4PageRow[],
  avgEngRate: number,
  avgEngTime: number,
  p25: number,
): GA4EngagementIssue[] {
  void avgEngTime
  return pages
    .filter(p => p.sessions >= p25 && (engRate(p) < 0.35 || p.avg_engagement_time < 25))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 25)
    .map(p => {
      const er = engRate(p)
      const severity: GA4EngagementIssue['severity'] =
        (er < 0.25 || p.avg_engagement_time < 15) ? 'critical' : 'warning'
      const issue = er < 0.35
        ? `Only ${(er * 100).toFixed(0)}% of sessions engaged — well below the ${(avgEngRate * 100).toFixed(0)}% site average`
        : `Avg engagement time of ${Math.round(p.avg_engagement_time)}s is very low`
      return {
        page: p.page,
        sessions: p.sessions,
        engagement_rate: er,
        avg_engagement_time: p.avg_engagement_time,
        severity,
        issue,
        action: 'Review page content relevance, improve readability, check page load speed, and align content with search intent.',
      }
    })
}

function buildTrafficLeaders(pages: GA4PageRow[], totalSessions: number): GA4TrafficLeader[] {
  return pages
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 20)
    .map(p => ({
      page: p.page,
      sessions: p.sessions,
      engaged_sessions: p.engaged_sessions,
      engagement_rate: engRate(p),
      avg_engagement_time: p.avg_engagement_time,
      views: p.views ?? 0,
      session_share: totalSessions > 0 ? (p.sessions / totalSessions) * 100 : 0,
      conversions: p.conversions,
    }))
}

function buildHiddenGems(
  pages: GA4PageRow[],
  avgEngRate: number,
  avgEngTime: number,
  p50: number,
): GA4HiddenGem[] {
  void avgEngRate
  void avgEngTime
  return pages
    .filter(p => p.sessions < p50 && (engRate(p) > 0.65 || p.avg_engagement_time > 90))
    .map(p => ({
      page: p.page,
      sessions: p.sessions,
      engagement_rate: engRate(p),
      avg_engagement_time: p.avg_engagement_time,
      gem_score: engRate(p) * p.avg_engagement_time / Math.log(p.sessions + 2),
      action: 'This page resonates well with visitors. Strengthen it with targeted link building, feature it prominently in internal navigation, and check if the title/meta targets the right keywords.',
    }))
    .sort((a, b) => b.gem_score - a.gem_score)
    .slice(0, 20)
}

function buildChannelBreakdown(channels: GA4ChannelRow[], totalChannelSessions: number): GA4ChannelStat[] {
  return channels
    .sort((a, b) => b.sessions - a.sessions)
    .map(c => {
      const share = totalChannelSessions > 0 ? (c.sessions / totalChannelSessions) * 100 : 0
      const engagementRate = c.engaged_sessions !== undefined && c.sessions > 0
        ? c.engaged_sessions / c.sessions : undefined
      const sessionChange = c.prev_sessions !== undefined ? c.sessions - c.prev_sessions : undefined
      const sessionChangePct = c.prev_sessions !== undefined && c.prev_sessions > 0
        ? Math.round(((c.sessions - c.prev_sessions) / c.prev_sessions) * 100) : undefined
      return {
        channel: c.channel,
        sessions: c.sessions,
        share,
        engaged_sessions: c.engaged_sessions,
        engagement_rate: engagementRate,
        session_change: sessionChange,
        session_change_pct: sessionChangePct,
      }
    })
}

function buildComparison(pages: GA4PageRow[]): GA4ComparisonAnalysis {
  const withPrev = pages.filter(p => p.prev_sessions !== undefined)

  const totalCurr = withPrev.reduce((s, p) => s + p.sessions, 0)
  const totalPrev = withPrev.reduce((s, p) => s + (p.prev_sessions ?? 0), 0)

  // Weighted engagement rate change
  const prevEngTotal = withPrev.reduce((s, p) => {
    const prevEng = p.prev_engaged_sessions !== undefined && (p.prev_sessions ?? 0) > 0
      ? p.prev_engaged_sessions / (p.prev_sessions ?? 1) : engRate(p)
    return s + prevEng * (p.prev_sessions ?? 0)
  }, 0)
  const currEngTotal = withPrev.reduce((s, p) => s + engRate(p) * p.sessions, 0)
  const prevAvgEngRate = totalPrev > 0 ? prevEngTotal / totalPrev : 0
  const currAvgEngRate = totalCurr > 0 ? currEngTotal / totalCurr : 0

  const prevAvgTime = totalPrev > 0
    ? withPrev.reduce((s, p) => s + (p.prev_avg_engagement_time ?? p.avg_engagement_time) * (p.prev_sessions ?? 0), 0) / totalPrev
    : 0
  const currAvgTime = totalCurr > 0
    ? withPrev.reduce((s, p) => s + p.avg_engagement_time * p.sessions, 0) / totalCurr
    : 0

  const rising: GA4ComparisonMove[] = withPrev
    .filter(p => {
      const prev = p.prev_sessions ?? 0
      return prev >= 10 && (p.sessions - prev) / prev >= 0.15
    })
    .sort((a, b) => {
      const pctA = ((a.sessions - (a.prev_sessions ?? 0)) / (a.prev_sessions ?? 1))
      const pctB = ((b.sessions - (b.prev_sessions ?? 0)) / (b.prev_sessions ?? 1))
      return pctB - pctA
    })
    .slice(0, 30)
    .map(p => {
      const prev = p.prev_sessions ?? 0
      const prevEr = p.prev_engaged_sessions !== undefined && prev > 0 ? p.prev_engaged_sessions / prev : engRate(p)
      const currEr = engRate(p)
      return {
        page: p.page,
        sessions: p.sessions,
        prev_sessions: prev,
        session_change: p.sessions - prev,
        session_change_pct: Math.round(((p.sessions - prev) / prev) * 100),
        engagement_rate: currEr,
        prev_engagement_rate: prevEr,
        engagement_change: Math.round((currEr - prevEr) * 1000) / 1000,
      }
    })

  const declining: GA4ComparisonMove[] = withPrev
    .filter(p => {
      const prev = p.prev_sessions ?? 0
      return prev >= 10 && (prev - p.sessions) / prev >= 0.15
    })
    .sort((a, b) => {
      const pctA = ((a.prev_sessions ?? 0) - a.sessions) / (a.prev_sessions ?? 1)
      const pctB = ((b.prev_sessions ?? 0) - b.sessions) / (b.prev_sessions ?? 1)
      return pctB - pctA
    })
    .slice(0, 30)
    .map(p => {
      const prev = p.prev_sessions ?? 0
      const prevEr = p.prev_engaged_sessions !== undefined && prev > 0 ? p.prev_engaged_sessions / prev : engRate(p)
      const currEr = engRate(p)
      return {
        page: p.page,
        sessions: p.sessions,
        prev_sessions: prev,
        session_change: p.sessions - prev,
        session_change_pct: Math.round(((p.sessions - prev) / prev) * 100),
        engagement_rate: currEr,
        prev_engagement_rate: prevEr,
        engagement_change: Math.round((currEr - prevEr) * 1000) / 1000,
      }
    })

  const new_pages = pages
    .filter(p => p.sessions > 10 && (p.prev_sessions === undefined || p.prev_sessions === 0))
    .map(p => ({ page: p.page, sessions: p.sessions, engagement_rate: engRate(p) }))

  const lost_pages = pages
    .filter(p => (p.prev_sessions ?? 0) > 20 && (p.sessions === 0 || p.sessions === undefined))
    .map(p => ({
      page: p.page,
      prev_sessions: p.prev_sessions ?? 0,
      prev_engagement_rate: p.prev_engaged_sessions !== undefined && (p.prev_sessions ?? 0) > 0
        ? p.prev_engaged_sessions / (p.prev_sessions ?? 1) : 0,
    }))

  return {
    summary: {
      session_change: totalCurr - totalPrev,
      session_change_pct: totalPrev > 0 ? Math.round(((totalCurr - totalPrev) / totalPrev) * 100) : 0,
      engagement_rate_change: Math.round((currAvgEngRate - prevAvgEngRate) * 1000) / 1000,
      avg_time_change: Math.round(currAvgTime - prevAvgTime),
      total_rising: rising.length,
      total_declining: declining.length,
      total_new: new_pages.length,
      total_lost: lost_pages.length,
    },
    rising,
    declining,
    new_pages,
    lost_pages,
  }
}
