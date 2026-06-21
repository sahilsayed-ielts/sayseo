import { NextRequest, NextResponse } from 'next/server'

interface RedditPost {
  title: string
  score: number
  url: string
}

interface RedditChild {
  data: {
    title: string
    score: number
    permalink: string
    is_self: boolean
    selftext: string
  }
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  if (!q) return NextResponse.json({ posts: [], source: 'error' })

  try {
    const res = await fetch(
      `https://www.reddit.com/search.json?q=${encodeURIComponent(q)}&sort=top&limit=30&type=link`,
      {
        headers: {
          'User-Agent': 'SaySEO GEO Tool/1.0 (https://sayseo.co.uk)',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(8000),
      },
    )

    if (!res.ok) return NextResponse.json({ posts: [], source: 'error' })

    const data = await res.json()
    const posts: RedditPost[] = (data?.data?.children ?? [])
      .map((c: RedditChild) => ({
        title: c.data.title,
        score: c.data.score,
        url: `https://reddit.com${c.data.permalink}`,
      }))
      .filter((p: RedditPost) => p.title?.length > 15)

    return NextResponse.json({ posts, source: 'reddit' })
  } catch {
    return NextResponse.json({ posts: [], source: 'error' })
  }
}
