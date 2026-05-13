import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getOAuthClient, isInvalidGrant } from '@/lib/google-clients'

const VALID_PERMISSIONS = new Set(['siteOwner', 'siteFullUser', 'siteRestrictedUser'])

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  // Step 1: get all connected_sites belonging to this user
  const { data: userSites } = await supabase
    .from('connected_sites')
    .select('id, access_token')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (!userSites || userSites.length === 0) {
    return NextResponse.json(
      { error: 'No connected Google account found. Connect a site with Google OAuth first.' },
      { status: 422 }
    )
  }

  const siteIds = userSites.map((s) => s.id as string)

  // Step 2: find the most recent oauth_tokens row for any of the user's sites
  let siteId: string | null = null
  const admin = createAdminClient()

  const { data: oauthRow } = await admin
    .from('oauth_tokens')
    .select('site_id')
    .in('site_id', siteIds)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (oauthRow?.site_id) {
    siteId = oauthRow.site_id as string
  }

  // Step 3: fall back to the first connected_sites row with a stored access_token
  if (!siteId) {
    const fallback = userSites.find((s) => s.access_token != null)
    if (fallback) siteId = fallback.id as string
  }

  if (!siteId) {
    return NextResponse.json(
      { error: 'No connected Google account found. Connect a site with Google OAuth first.' },
      { status: 422 }
    )
  }

  try {
    const oauth2Client = await getOAuthClient(siteId, ['ga4', 'gsc'])
    const webmasters = google.webmasters({ version: 'v3', auth: oauth2Client })
    const res = await webmasters.sites.list()

    const sites = (res.data.siteEntry ?? [])
      .filter((s) => VALID_PERMISSIONS.has(s.permissionLevel ?? ''))
      .map((s) => ({
        siteUrl: s.siteUrl ?? '',
        permissionLevel: s.permissionLevel ?? '',
      }))

    return NextResponse.json({ sites })
  } catch (err) {
    console.error('[gsc-sites] error:', err)
    if (err instanceof Error && err.message === 'reconnect_required') {
      return NextResponse.json({ error: 'Google account requires reconnection.' }, { status: 422 })
    }
    if (isInvalidGrant(err)) {
      return NextResponse.json({ error: 'Google account requires reconnection.' }, { status: 422 })
    }
    return NextResponse.json({ error: 'Failed to fetch GSC sites.' }, { status: 500 })
  }
}
