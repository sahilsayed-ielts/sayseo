import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { runCitationCheck } from '@/lib/citations'

const VALID_PLATFORMS = ['claude', 'chatgpt', 'gemini'] as const
type Platform = (typeof VALID_PLATFORMS)[number]

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as { siteId?: string; domain?: string; platform?: string }
  const { siteId, domain, platform } = body

  if (!siteId || !domain) {
    return NextResponse.json({ error: 'siteId and domain are required' }, { status: 400 })
  }

  if (platform && !VALID_PLATFORMS.includes(platform as Platform)) {
    return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })
  }

  const { data: site } = await supabase
    .from('connected_sites')
    .select('id')
    .eq('id', siteId)
    .single()

  if (!site) {
    return NextResponse.json({ error: 'Site not found' }, { status: 404 })
  }

  const admin = createAdminClient()

  try {
    const result = await runCitationCheck(
      siteId,
      domain,
      admin,
      platform as Platform | undefined
    )
    return NextResponse.json(result)
  } catch (err) {
    console.error('[citations/check] error:', err)
    return NextResponse.json(
      { error: 'Citation check failed. Please try again.' },
      { status: 500 }
    )
  }
}
