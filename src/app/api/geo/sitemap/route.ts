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

function extractHeadings(html: string): string[] {
  const matches = html.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi) ?? []
  return matches
    .map((m) =>
      m
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ')
        .replace(/&#\d+;/g, '')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter((h) => h.length > 5 && h.length < 120)
    .slice(0, 20)
}

const FETCH_OPTS = {
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SaySEO/1.0)' },
}

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get('url') ?? ''
  const base = normaliseOrigin(rawUrl)

  if (!base) return NextResponse.json({ urls: [], headings: [], domain: '', source: 'error' })

  const domain = new URL(base).hostname.replace('www.', '')
  let urls: string[] = []
  let headings: string[] = []

  // Try common sitemap paths
  for (const path of ['/sitemap.xml', '/sitemap_index.xml', '/sitemap/sitemap.xml']) {
    try {
      const res = await fetch(`${base}${path}`, {
        ...FETCH_OPTS,
        signal: AbortSignal.timeout(8000),
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

  // Extract headings from homepage
  try {
    const res = await fetch(base, {
      ...FETCH_OPTS,
      signal: AbortSignal.timeout(8000),
    })
    if (res.ok) {
      const html = await res.text()
      headings = extractHeadings(html)
    }
  } catch {}

  return NextResponse.json({
    urls,
    headings,
    domain,
    source: headings.length > 0 || urls.length > 0 ? 'website' : 'error',
  })
}
