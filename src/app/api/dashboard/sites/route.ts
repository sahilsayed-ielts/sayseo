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

  let oauthPayload: {
    access_token: string
    refresh_token: string | null
    expires_at: string
  } | null = null

  if (source === 'oauth') {
    const raw = request.cookies.get('google_pending_connection')?.value
    if (raw) {
      oauthPayload = JSON.parse(Buffer.from(raw, 'base64').toString('utf-8')) as {
        access_token: string
        refresh_token: string | null
        expires_at: string
      }
    }
    if (!oauthPayload) {
      return NextResponse.json({ error: 'OAuth connection expired. Please reconnect Google.' }, { status: 400 })
    }
  }

  if (!ga4PropertyId && !gscSiteUrl) {
    return NextResponse.json(
      { error: 'Provide at least one of ga4PropertyId or gscSiteUrl.' },
      { status: 400 }
    )
  }

  const domain = gscSiteUrl
    ? extractDomain(gscSiteUrl)
    : `ga4-${ga4PropertyId}`

  // Find existing record: try domain → ga4_property_id → gsc_site_url in order
  let existing: { id: string } | null = null

  const { data: byDomain } = await supabase
    .from('connected_sites')
    .select('id')
    .eq('user_id', user.id)
    .eq('domain', domain)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  existing = byDomain

  if (!existing && ga4PropertyId) {
    const { data: byGa4 } = await supabase
      .from('connected_sites')
      .select('id')
      .eq('user_id', user.id)
      .eq('ga4_property_id', ga4PropertyId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    existing = byGa4
  }

  if (!existing && gscSiteUrl) {
    const { data: byGsc } = await supabase
      .from('connected_sites')
      .select('id')
      .eq('user_id', user.id)
      .eq('gsc_site_url', gscSiteUrl)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    existing = byGsc
  }

  let siteId: string

  if (existing) {
    const updatePayload: Record<string, unknown> = {
      domain,
      ga4_property_id: ga4PropertyId ?? null,
      gsc_site_url: gscSiteUrl ?? null,
    }
    if (source === 'oauth') {
      updatePayload.connection_type = 'oauth'
      if (oauthPayload) {
        updatePayload.access_token = oauthPayload.access_token
        updatePayload.token_expiry = oauthPayload.expires_at
        if (oauthPayload.refresh_token) {
          updatePayload.refresh_token = oauthPayload.refresh_token
        }
      }
    }

    const { error: updateError } = await supabase
      .from('connected_sites')
      .update(updatePayload)
      .eq('id', existing.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    siteId = existing.id
  } else {
    const { data: site, error: siteError } = await supabase
      .from('connected_sites')
      .insert({
        user_id: user.id,
        domain,
        ga4_property_id: ga4PropertyId ?? null,
        gsc_site_url: gscSiteUrl ?? null,
        ...(source === 'oauth'
          ? {
              connection_type: 'oauth',
              access_token: oauthPayload?.access_token ?? null,
              refresh_token: oauthPayload?.refresh_token ?? null,
              token_expiry: oauthPayload?.expires_at ?? null,
            }
          : {}),
      })
      .select('id')
      .single()

    if (siteError || !site) {
      return NextResponse.json(
        { error: siteError?.message ?? 'Failed to create site.' },
        { status: 500 }
      )
    }

    siteId = site.id
  }

  // For OAuth connections, upsert tokens (handles reconnection)
  if (source === 'oauth' && oauthPayload) {
    const tokenRows = []
    if (ga4PropertyId) {
      tokenRows.push({ site_id: siteId, provider: 'ga4', ...oauthPayload })
    }
    if (gscSiteUrl) {
      tokenRows.push({ site_id: siteId, provider: 'gsc', ...oauthPayload })
    }

    if (tokenRows.length > 0) {
      const providers = tokenRows.map((row) => row.provider)

      const { error: deleteTokenError } = await supabase
        .from('oauth_tokens')
        .delete()
        .eq('site_id', siteId)
        .in('provider', providers)

      if (deleteTokenError) {
        return NextResponse.json({ error: deleteTokenError.message }, { status: 500 })
      }

      const { error: insertTokenError } = await supabase
        .from('oauth_tokens')
        .insert(tokenRows)

      if (insertTokenError) {
        return NextResponse.json({ error: insertTokenError.message }, { status: 500 })
      }
    }
  }

  const response = NextResponse.json({ siteId })
  response.cookies.delete('google_pending_connection')
  return response
}
