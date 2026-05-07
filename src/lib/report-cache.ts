import type { SupabaseClient } from '@supabase/supabase-js'

const CACHE_TTL_HOURS = 6

export async function getCachedReport(
  supabase: SupabaseClient,
  siteId: string,
  reportType: string,
  dateRange: string
): Promise<Record<string, unknown> | null> {
  const { data } = await supabase
    .from('report_cache')
    .select('data')
    .eq('site_id', siteId)
    .eq('report_type', reportType)
    .eq('date_range', dateRange)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return data ? (data.data as Record<string, unknown>) : null
}

export async function setCachedReport(
  supabase: SupabaseClient,
  siteId: string,
  reportType: string,
  dateRange: string,
  payload: Record<string, unknown>
): Promise<void> {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + CACHE_TTL_HOURS * 60 * 60 * 1000)

  // Remove stale entries for this slot before inserting
  await supabase
    .from('report_cache')
    .delete()
    .eq('site_id', siteId)
    .eq('report_type', reportType)
    .eq('date_range', dateRange)

  await supabase.from('report_cache').insert({
    site_id: siteId,
    report_type: reportType,
    date_range: dateRange,
    data: payload,
    created_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
  })
}
