import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function extractDomain(url: string): string {
  if (url.startsWith('sc-domain:')) return url.replace('sc-domain:', '')
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as {
    domain?: string
    ga4PropertyId?: string | null
    gscSiteUrl?: string | null
    source: 'oauth' | 'manual'
  }

  const { ga4PropertyId, gscSiteUrl, source } = body

  if (!ga4PropertyId && !gscSiteUrl) {
    return NextResponse.json(
      { error: 'Provide at least one of ga4PropertyId or gscSiteUrl.' },
      { status: 400 }
    )
  }

  const domain = gscSiteUrl
    ? extractDomain(gscSiteUrl)
    : `ga4-${ga4PropertyId}`

  const { data: site, error: siteError } = await supabase
    .from('connected_sites')
    .insert({
      user_id: user.id,
      domain,
      ga4_property_id: ga4PropertyId ?? null,
      gsc_site_url: gscSiteUrl ?? null,
    })
    .select('id')
    .single()

  if (siteError || !site) {
    return NextResponse.json(
      { error: siteError?.message ?? 'Failed to create site.' },
      { status: 500 }
    )
  }

  // For OAuth connections, persist the tokens
  if (source === 'oauth') {
    const raw = request.cookies.get('google_pending_connection')?.value
    if (raw) {
      const payload = JSON.parse(Buffer.from(raw, 'base64').toString('utf-8')) as {
        access_token: string
        refresh_token: string | null
        expires_at: string
      }

      const tokenRows = []
      if (ga4PropertyId) {
        tokenRows.push({ site_id: site.id, provider: 'ga4', ...payload })
      }
      if (gscSiteUrl) {
        tokenRows.push({ site_id: site.id, provider: 'gsc', ...payload })
      }

      if (tokenRows.length > 0) {
        await supabase.from('oauth_tokens').insert(tokenRows)
      }
    }
  }

  const response = NextResponse.json({ siteId: site.id })
  response.cookies.delete('google_pending_connection')
  return response
}
