import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const raw = request.cookies.get('google_pending_connection')?.value
  if (!raw) {
    return NextResponse.json({ error: 'No pending connection found. Please reconnect via Google.' }, { status: 400 })
  }

  const payload = JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'))

  return NextResponse.json({
    ga4Properties: payload.ga4_properties as Array<{ propertyId: string; displayName: string }>,
    gscSites: payload.gsc_sites as Array<{ siteUrl: string }>,
  })
}
