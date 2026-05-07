import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface TokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
}

interface AccountSummary {
  name: string
  displayName: string
  propertySummaries?: Array<{ property: string; displayName: string }>
}

interface GSCSiteEntry {
  siteUrl: string
  permissionLevel: string
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const redirect = (err: string) =>
    NextResponse.redirect(new URL(`/dashboard/connect?error=${err}`, request.url))

  if (error) return redirect('oauth_denied')
  if (!code || !state) return redirect('invalid_callback')

  const savedState = request.cookies.get('google_oauth_state')?.value
  if (state !== savedState) return redirect('state_mismatch')

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/google/callback`,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenRes.ok) return redirect('token_exchange_failed')
  const tokens: TokenResponse = await tokenRes.json()

  // Fetch GA4 account summaries and GSC sites in parallel
  const [ga4Res, gscRes] = await Promise.all([
    fetch('https://analyticsadmin.googleapis.com/v1beta/accountSummaries', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    }),
    fetch('https://www.googleapis.com/webmasters/v3/sites', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    }),
  ])

  let ga4Properties: Array<{ propertyId: string; displayName: string }> = []
  let gscSites: Array<{ siteUrl: string }> = []

  if (ga4Res.ok) {
    const ga4Data = await ga4Res.json()
    ga4Properties = (ga4Data.accountSummaries as AccountSummary[] ?? []).flatMap(
      (account) =>
        (account.propertySummaries ?? []).map((p) => ({
          propertyId: p.property.replace('properties/', ''),
          displayName: `${account.displayName} — ${p.displayName}`,
        }))
    )
  }

  if (gscRes.ok) {
    const gscData = await gscRes.json()
    gscSites = (gscData.siteEntry as GSCSiteEntry[] ?? []).map((s) => ({ siteUrl: s.siteUrl }))
  }

  const payload = {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token ?? null,
    expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    ga4_properties: ga4Properties,
    gsc_sites: gscSites,
  }

  const response = NextResponse.redirect(
    new URL('/dashboard/connect?step=select', request.url)
  )
  response.cookies.delete('google_oauth_state')
  response.cookies.set(
    'google_pending_connection',
    Buffer.from(JSON.stringify(payload)).toString('base64'),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1800, // 30 minutes to complete setup
      path: '/',
    }
  )
  return response
}
