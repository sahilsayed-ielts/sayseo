import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  if (!q) return NextResponse.json({ topics: [], descriptions: [], source: 'error' })

  try {
    // OpenSearch API — free, no key, CORS-friendly
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=10&format=json&origin=*`,
      { signal: AbortSignal.timeout(6000) },
    )

    if (!res.ok) return NextResponse.json({ topics: [], descriptions: [], source: 'error' })

    const data = await res.json()
    // Returns ["query", ["title1", ...], ["desc1", ...], ["url1", ...]]
    const topics: string[] = Array.isArray(data[1]) ? (data[1] as string[]).filter(Boolean) : []
    const descriptions: string[] = Array.isArray(data[2]) ? (data[2] as string[]).filter(Boolean) : []

    return NextResponse.json({ topics, descriptions, source: 'wikipedia' })
  } catch {
    return NextResponse.json({ topics: [], descriptions: [], source: 'error' })
  }
}
