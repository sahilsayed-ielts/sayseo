import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  let body: { domain?: string; ga4_property_id?: string; gsc_site_url?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 })
  }

  const rawDomain = body.domain?.trim() ?? ''
  if (!rawDomain) {
    return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
  }

  const domain = rawDomain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .toLowerCase()

  const ga4PropertyId = body.ga4_property_id?.trim() || null
  const gscSiteUrl = body.gsc_site_url?.trim() || null

  const { data: newSite, error } = await supabase
    .from('connected_sites')
    .insert({
      user_id: user.id,
      domain,
      ga4_property_id: ga4PropertyId,
      gsc_site_url: gscSiteUrl,
      connection_type: 'manual',
    })
    .select('id')
    .single()

  if (error || !newSite) {
    console.error('[api/sites/add] insert error:', error)
    return NextResponse.json(
      { error: error?.message ?? 'Failed to add site' },
      { status: 500 }
    )
  }

  return NextResponse.json({ siteId: newSite.id })
}
