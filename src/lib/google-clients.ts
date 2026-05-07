import { google } from 'googleapis'
import { createAdminClient } from '@/lib/supabase/admin'

type Provider = 'ga4' | 'gsc'

interface StoredToken {
  access_token: string
  refresh_token: string | null
  expires_at: string | null
}

/**
 * Returns an authenticated googleapis OAuth2 client for the given site.
 * Automatically persists refreshed tokens back to the oauth_tokens table.
 *
 * Throws 'reconnect_required' if no token exists or the refresh_token is invalid.
 */
export async function getOAuthClient(siteId: string, providers: Provider[]) {
  const admin = createAdminClient()

  // Load from the first available provider — all providers share the same OAuth grant
  const { data: token, error } = await admin
    .from('oauth_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('site_id', siteId)
    .in('provider', providers)
    .limit(1)
    .single<StoredToken>()

  if (error || !token) {
    throw new Error('reconnect_required')
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )

  oauth2Client.setCredentials({
    access_token: token.access_token,
    refresh_token: token.refresh_token ?? undefined,
    expiry_date: token.expires_at ? new Date(token.expires_at).getTime() : undefined,
  })

  // When googleapis auto-refreshes the token, persist the new credentials
  oauth2Client.on('tokens', async (newTokens) => {
    const updates: Record<string, string> = {}
    if (newTokens.access_token) updates.access_token = newTokens.access_token
    if (newTokens.expiry_date) {
      updates.expires_at = new Date(newTokens.expiry_date).toISOString()
    }
    if (Object.keys(updates).length === 0) return
    await admin
      .from('oauth_tokens')
      .update(updates)
      .eq('site_id', siteId)
      .in('provider', providers)
  })

  return oauth2Client
}

/** True if the Google error represents an invalid / revoked grant. */
export function isInvalidGrant(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  const msg = err.message ?? ''
  const data = (err as { response?: { data?: { error?: string } } }).response?.data
  return msg.includes('invalid_grant') || data?.error === 'invalid_grant'
}
