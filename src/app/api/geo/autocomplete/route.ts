import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  if (!q) return NextResponse.json({ suggestions: [], source: 'error' })

  // Try DuckDuckGo first — no IP blocking, reliable
  try {
    const res = await fetch(
      `https://duckduckgo.com/ac/?q=${encodeURIComponent(q)}&type=list`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SaySEO/1.0)' },
        signal: AbortSignal.timeout(6000),
      },
    )
    if (res.ok) {
      const data = await res.json()
      // DDG returns [{phrase: "..."}, ...]
      const suggestions: string[] = Array.isArray(data)
        ? data.map((item: { phrase?: string }) => item.phrase ?? '').filter(Boolean)
        : []
      if (suggestions.length > 0) {
        return NextResponse.json({ suggestions, source: 'duckduckgo' })
      }
    }
  } catch {}

  // Fallback: Google Autocomplete (client=firefox avoids API key requirement)
  try {
    const res = await fetch(
      `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(q)}&hl=en`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SaySEO/1.0)' },
        signal: AbortSignal.timeout(6000),
      },
    )
    if (res.ok) {
      const data = await res.json()
      // Google returns ["query", ["s1", "s2", ...]]
      const suggestions: string[] =
        Array.isArray(data) && Array.isArray(data[1])
          ? (data[1] as string[]).filter(Boolean)
          : []
      return NextResponse.json({ suggestions, source: 'google' })
    }
  } catch {}

  return NextResponse.json({ suggestions: [], source: 'error' })
}
