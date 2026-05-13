import { createClient } from '@/lib/supabase/server'

export interface Site {
  id: string
  domain: string
  ga4_property_id: string | null
  gsc_site_url: string | null
  created_at: string
  last_synced: string | null
}

export async function getUserSites(userId: string): Promise<Site[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('connected_sites')
      .select('id, domain, ga4_property_id, gsc_site_url, created_at, last_synced')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[getUserSites] error:', error)
      return []
    }

    return (data ?? []) as Site[]
  } catch (err) {
    console.error('[getUserSites] unexpected error:', err)
    return []
  }
}
