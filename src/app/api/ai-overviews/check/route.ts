import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAIOForQuery } from '@/lib/serpapi'

const MAX_QUERIES = 20
const RATE_LIMIT_HOURS = 23

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json() as {
    siteId?: string
    domain?: string
    queries?: string[]
  }
  const { siteId, domain, queries } = body

  if (!siteId || !domain || !Array.isArray(queries) || queries.length === 0) {
    return NextResponse.json(
      { error: 'siteId, domain and queries are required.' },
      { status: 400 }
    )
  }

  // Verify site ownership
  const { data: site } = await supabase
    .from('connected_sites')
    .select('id')
    .eq('id', siteId)
    .single()

  if (!site) {
    return NextResponse.json({ error: 'Site not found.' }, { status: 404 })
  }

  const admin = createAdminClient()

  // Rate limit: once per 23 hours
  const { data: existing } = await admin
    .from('aio_summary')
    .select('last_checked')
    .eq('site_id', siteId)
    .maybeSingle()

  if (existing?.last_checked) {
    const hoursSince =
      (Date.now() - new Date(existing.last_checked).getTime()) / (1000 * 60 * 60)
    if (hoursSince < RATE_LIMIT_HOURS) {
      return NextResponse.json(
        {
          error:
            'Check already run today. SerpAPI free tier allows 100 searches/month — checks are limited to once per day.',
        },
        { status: 429 }
      )
    }
  }

  const limited = queries.slice(0, MAX_QUERIES)
  let aio_triggers = 0
  let domain_citations = 0

  for (const query of limited) {
    let result: Awaited<ReturnType<typeof checkAIOForQuery>> | null = null

    try {
      result = await checkAIOForQuery(query, domain)
      if (result.aio_triggered) aio_triggers++
      if (result.domain_cited) domain_citations++
    } catch (err) {
      console.error(`[aio/check] SerpAPI error for "${query}":`, err)
    }

    await admin.from('aio_checks').insert({
      site_id: siteId,
      query,
      aio_triggered: result?.aio_triggered ?? false,
      domain_cited: result?.domain_cited ?? false,
      citation_position: result?.citation_position ?? null,
      citation_url: result?.citation_url ?? null,
    })
  }

  // Upsert summary
  const now = new Date().toISOString()
  const { data: prev } = await admin
    .from('aio_summary')
    .select('queries_checked, aio_triggers, domain_citations')
    .eq('site_id', siteId)
    .maybeSingle()

  await admin.from('aio_summary').upsert(
    {
      site_id: siteId,
      queries_checked: (prev?.queries_checked ?? 0) + limited.length,
      aio_triggers: (prev?.aio_triggers ?? 0) + aio_triggers,
      domain_citations: (prev?.domain_citations ?? 0) + domain_citations,
      last_checked: now,
      updated_at: now,
    },
    { onConflict: 'site_id' }
  )

  return NextResponse.json({
    checked: limited.length,
    aio_triggers,
    domain_citations,
  })
}
