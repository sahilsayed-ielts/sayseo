export interface AIOResult {
  query: string
  aio_triggered: boolean
  domain_cited: boolean
  citation_position: number | null
  citation_url: string | null
}

interface SerpApiReference {
  link?: string
  source?: { link?: string }
}

interface SerpApiAIO {
  references?: SerpApiReference[]
  sources?: SerpApiReference[]
}

interface SerpApiResponse {
  ai_overview?: SerpApiAIO
}

function stripDomain(url: string): string {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
}

export async function checkAIOForQuery(query: string, domain: string): Promise<AIOResult> {
  const params = new URLSearchParams({
    engine: 'google',
    q: query,
    api_key: process.env.SERPAPI_KEY!,
    num: '10',
  })

  const res = await fetch(`https://serpapi.com/search.json?${params}`)
  if (!res.ok) throw new Error(`SerpAPI error: ${res.status}`)

  const data: SerpApiResponse = await res.json()
  const aio = data.ai_overview

  if (!aio) {
    return { query, aio_triggered: false, domain_cited: false, citation_position: null, citation_url: null }
  }

  const references: SerpApiReference[] = aio.references ?? aio.sources ?? []
  const cleanDomain = stripDomain(domain)

  let domain_cited = false
  let citation_position: number | null = null
  let citation_url: string | null = null

  for (let i = 0; i < references.length; i++) {
    const ref = references[i]
    const url = ref.link ?? ref.source?.link ?? ''
    if (stripDomain(url).startsWith(cleanDomain)) {
      domain_cited = true
      citation_position = i + 1
      citation_url = url
      break
    }
  }

  return { query, aio_triggered: true, domain_cited, citation_position, citation_url }
}
