import { google } from 'googleapis'
import { getOAuthClient } from '@/lib/google-clients'
import { createAdminClient } from '@/lib/supabase/admin'

type DbClient = ReturnType<typeof createAdminClient>

// ─── Anthropic response types ─────────────────────────────────────────────────

interface TextBlock { type: 'text'; text: string }
interface ThinkingBlock { type: 'thinking'; thinking: string }
interface ToolUseBlock { type: 'tool_use'; id: string; name: string }
interface ToolResultBlock {
  type: 'tool_result'
  content: Array<{ type: string; text?: string }> | string
}
type ContentBlock = TextBlock | ThinkingBlock | ToolUseBlock | ToolResultBlock

interface AnthropicResponse {
  content: ContentBlock[]
  stop_reason: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractAllText(content: ContentBlock[]): string {
  const parts: string[] = []
  for (const block of content) {
    if (block.type === 'text') parts.push(block.text)
    if (block.type === 'tool_result') {
      if (typeof block.content === 'string') {
        parts.push(block.content)
      } else if (Array.isArray(block.content)) {
        for (const c of block.content) {
          if (c.type === 'text' && c.text) parts.push(c.text)
        }
      }
    }
  }
  return parts.join(' ')
}

function isCited(text: string, domain: string): boolean {
  const lower = text.toLowerCase()
  const clean = domain.replace(/^www\./, '').toLowerCase()
  const base = clean.split('.')[0]
  return lower.includes(clean) || lower.includes(base)
}

// ─── Claude (existing — keep as-is) ──────────────────────────────────────────

async function checkQueryClaude(
  query: string,
  domain: string
): Promise<{ domain_mentioned: boolean; response_snippet: string }> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'interleaved-thinking-2025-05-14',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [
        {
          role: 'user',
          content: `Search for: "${query}". List the top websites and domains that appear in results for this query. Be specific about which domains are mentioned.`,
        },
      ],
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Anthropic API ${res.status}: ${text.slice(0, 200)}`)
  }

  const data: AnthropicResponse = await res.json()
  const fullText = extractAllText(data.content)
  return {
    domain_mentioned: isCited(fullText, domain),
    response_snippet: fullText.slice(0, 300),
  }
}

// ─── ChatGPT ──────────────────────────────────────────────────────────────────

async function checkQueryChatGPT(
  query: string,
  domain: string
): Promise<{ domain_mentioned: boolean; response_snippet: string }> {
  const prompt = `What are the best resources for ${query}? List any websites or domains you would recommend.`

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    }),
  })

  console.log('ChatGPT response status:', res.status)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenAI API ${res.status}: ${text.slice(0, 200)}`)
  }

  const data = await res.json() as { choices: Array<{ message: { content: string } }> }
  const fullText = data.choices[0].message.content ?? ''
  return {
    domain_mentioned: isCited(fullText, domain),
    response_snippet: fullText.slice(0, 300),
  }
}

// ─── Gemini ───────────────────────────────────────────────────────────────────

async function checkQueryGemini(
  query: string,
  domain: string
): Promise<{ domain_mentioned: boolean; response_snippet: string }> {
  const prompt = `What are the best resources for ${query}? List any websites or domains you would recommend.`

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  )

  console.log('Gemini response status:', res.status)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Gemini API ${res.status}: ${text.slice(0, 200)}`)
  }

  const data = await res.json() as {
    candidates: Array<{ content: { parts: Array<{ text: string }> } }>
  }
  const fullText = data.candidates[0].content.parts[0].text ?? ''
  return {
    domain_mentioned: isCited(fullText, domain),
    response_snippet: fullText.slice(0, 300),
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Platform = 'claude' | 'chatgpt' | 'gemini'

export interface PlatformResult {
  platform: Platform
  checked: number
  mentioned: number
  available: boolean
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function runCitationCheck(
  siteId: string,
  domain: string,
  supabase: DbClient,
  platformFilter?: Platform
): Promise<{ checked: number; queriesAttempted: number; mentioned: number; platforms: PlatformResult[] }> {
  const { data: site } = await supabase
    .from('connected_sites')
    .select('gsc_site_url')
    .eq('id', siteId)
    .single()

  let queries: string[] = []

  if (site?.gsc_site_url) {
    try {
      const auth = await getOAuthClient(siteId, ['gsc', 'ga4'])
      const searchconsole = google.searchconsole({ version: 'v1', auth })
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
      const fmt = (d: Date) => d.toISOString().split('T')[0]

      const gscRes = await searchconsole.searchanalytics.query({
        siteUrl: site.gsc_site_url,
        requestBody: {
          startDate: fmt(startDate),
          endDate: fmt(endDate),
          dimensions: ['query'],
          rowLimit: 10,
          type: 'web',
        },
      })

      queries = (gscRes.data.rows ?? [])
        .map((row) => row.keys?.[0] ?? '')
        .filter(Boolean)
    } catch (err) {
      console.error('[citations] GSC fetch error:', err)
    }
  }

  if (queries.length === 0) {
    queries = [domain]
  }

  const checkers: Record<Platform, (q: string, d: string) => Promise<{ domain_mentioned: boolean; response_snippet: string }>> = {
    claude: checkQueryClaude,
    chatgpt: checkQueryChatGPT,
    gemini: checkQueryGemini,
  }

  console.log('OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY)
  console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY)

  const keyMissing: Record<Platform, boolean> = {
    claude: !process.env.ANTHROPIC_API_KEY,
    chatgpt: !process.env.OPENAI_API_KEY,
    gemini: !process.env.GEMINI_API_KEY,
  }

  const stats: Record<Platform, { checked: number; mentioned: number; available: boolean }> = {
    claude: { checked: 0, mentioned: 0, available: false },
    chatgpt: { checked: 0, mentioned: 0, available: false },
    gemini: { checked: 0, mentioned: 0, available: false },
  }

  const platforms: Platform[] = platformFilter ? [platformFilter] : ['claude', 'chatgpt', 'gemini']

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i]

    const settled = await Promise.allSettled(
      platforms.map(async (platform) => {
        if (keyMissing[platform]) {
          console.error(`[citations] ${platform} API key missing — skipping query "${query}"`)
          return { platform, domain_mentioned: false, response_snippet: 'Check unavailable', error: true }
        }
        try {
          const result = await checkers[platform](query, domain)
          return { platform, ...result, error: false }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          console.error(`[citations] ${platform} API call failed for "${query}": ${msg}`)
          return { platform, domain_mentioned: false, response_snippet: 'Check unavailable', error: true }
        }
      })
    )

    await Promise.all(
      settled.map(async (s) => {
        if (s.status === 'rejected') return
        const { platform, domain_mentioned, response_snippet, error } = s.value

        const { error: upsertErr } = await supabase.from('citation_checks').upsert(
          {
            site_id: siteId,
            query,
            platform,
            response_snippet,
            domain_mentioned,
            checked_at: new Date().toISOString(),
          },
          { onConflict: 'site_id,query,platform', ignoreDuplicates: false }
        )

        if (upsertErr) {
          console.error(`[citations] citation_checks upsert failed for ${platform}/"${query}": ${upsertErr.message} (code=${upsertErr.code})`)
        }

        if (!error) {
          stats[platform].checked++
          if (domain_mentioned) stats[platform].mentioned++
          stats[platform].available = true
        }
      })
    )

    if (i < queries.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  // Update citation_summary for all platforms that successfully ran
  await Promise.all(
    platforms.map(async (platform) => {
      const { checked, mentioned } = stats[platform]
      if (checked === 0) {
        console.warn(`[citations] skipping citation_summary update for ${platform} — 0 successful checks`)
        return
      }

      const { error: summaryErr } = await supabase.from('citation_summary').upsert(
        {
          site_id: siteId,
          platform,
          mention_count: mentioned,
          total_checks: checked,
          last_checked: new Date().toISOString(),
        },
        { onConflict: 'site_id,platform' }
      )

      if (summaryErr) {
        console.error(`[citations] citation_summary upsert failed for ${platform}: ${summaryErr.message} (code=${summaryErr.code})`)
      }
    })
  )

  const totalMentioned = platforms.reduce((acc, p) => acc + stats[p].mentioned, 0)
  const totalChecked = platforms.reduce((acc, p) => acc + stats[p].checked, 0)

  return {
    checked: totalChecked,
    queriesAttempted: queries.length,
    mentioned: totalMentioned,
    platforms: platforms.map((p) => ({ platform: p, ...stats[p] })),
  }
}
