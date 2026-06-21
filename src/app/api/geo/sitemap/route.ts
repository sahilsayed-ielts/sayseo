import { NextRequest, NextResponse } from 'next/server'

function normaliseOrigin(raw: string): string {
  try {
    return new URL(raw).origin
  } catch {
    try {
      return new URL(`https://${raw.replace(/^https?:\/\//, '')}`).origin
    } catch {
      return ''
    }
  }
}

function parseSitemapUrls(xml: string): string[] {
  const matches = xml.match(/<loc>\s*(https?:\/\/[^\s<]+)\s*<\/loc>/g) ?? []
  return matches
    .map((m) => m.replace(/<\/?loc>/g, '').trim())
    .filter(Boolean)
    .slice(0, 50)
}

function cleanText(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractMetaContent(html: string, ...patterns: RegExp[]): string {
  for (const pattern of patterns) {
    const m = html.match(pattern)
    if (m?.[1]) return cleanText(m[1])
  }
  return ''
}

// Extract all useful text signals from the page HTML.
// Works even for JS-rendered sites because <title>, <meta> and <og:*> are
// always in the server-sent HTML before any JavaScript runs.
function extractPageSignals(html: string): string[] {
  const signals: string[] = []

  // <title>
  const title = extractMetaContent(html, /<title[^>]*>([\s\S]*?)<\/title>/i)
  if (title.length > 5) signals.push(title)

  // meta description (both attribute orders)
  const desc = extractMetaContent(
    html,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']{10,})["']/i,
    /<meta[^>]+content=["']([^"']{10,})["'][^>]+name=["']description["']/i,
  )
  if (desc && desc !== title) signals.push(desc)

  // og:title
  const ogTitle = extractMetaContent(
    html,
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
  )
  if (ogTitle && ogTitle !== title) signals.push(ogTitle)

  // og:description
  const ogDesc = extractMetaContent(
    html,
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']{10,})["']/i,
    /<meta[^>]+content=["']([^"']{10,})["'][^>]+property=["']og:description["']/i,
  )
  if (ogDesc && ogDesc !== desc) signals.push(ogDesc)

  // twitter:title
  const twTitle = extractMetaContent(
    html,
    /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:title["']/i,
  )
  if (twTitle && twTitle !== title && twTitle !== ogTitle) signals.push(twTitle)

  // H1–H3 headings (works for server-rendered sites)
  const headingMatches = html.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi) ?? []
  headingMatches.forEach((m) => {
    const h = cleanText(m)
    if (h.length > 5 && h.length < 120) signals.push(h)
  })

  // meta keywords — extract each keyword phrase
  const kwRaw = extractMetaContent(
    html,
    /<meta[^>]+name=["']keywords["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']keywords["']/i,
  )
  if (kwRaw) {
    kwRaw.split(',').forEach((kw) => {
      const k = kw.trim()
      if (k.length > 3 && k.length < 60) signals.push(k)
    })
  }

  return [...new Set(signals)].filter((s) => s.length > 5 && s.length < 300).slice(0, 25)
}

const FETCH_OPTS = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; SaySEO/1.0; +https://sayseo.co.uk)',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-GB,en;q=0.9',
  },
}

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get('url') ?? ''
  const base = normaliseOrigin(rawUrl)

  if (!base) return NextResponse.json({ urls: [], headings: [], domain: '', source: 'error' })

  const domain = new URL(base).hostname.replace('www.', '')
  let urls: string[] = []
  let headings: string[] = []

  // Try common sitemap paths
  for (const path of ['/sitemap.xml', '/sitemap_index.xml', '/sitemap/sitemap.xml', '/page-sitemap.xml']) {
    try {
      const res = await fetch(`${base}${path}`, {
        ...FETCH_OPTS,
        signal: AbortSignal.timeout(7000),
      })
      if (res.ok) {
        const text = await res.text()
        if (text.includes('<loc>')) {
          urls = parseSitemapUrls(text)
          break
        }
      }
    } catch {}
  }

  // Extract all signals from homepage HTML
  try {
    const res = await fetch(base, {
      ...FETCH_OPTS,
      signal: AbortSignal.timeout(8000),
    })
    if (res.ok) {
      const html = await res.text()
      headings = extractPageSignals(html)
    }
  } catch {}

  return NextResponse.json({
    urls,
    headings,
    domain,
    source: headings.length > 0 || urls.length > 0 ? 'website' : 'error',
  })
}
