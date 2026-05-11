import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { runCitationCheck } from '@/lib/citations'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as { siteId?: string; domain?: string }
  const { siteId, domain } = body

  if (!siteId || !domain) {
    return NextResponse.json({ error: 'siteId and domain are required' }, { status: 400 })
  }

  // Verify ownership
  const { data: site } = await supabase
    .from('connected_sites')
    .select('id')
    .eq('id', siteId)
    .single()

  if (!site) {
    return NextResponse.json({ error: 'Site not found' }, { status: 404 })
  }

  // Use admin client for writes (service role bypasses RLS for cross-table writes)
  const admin = createAdminClient()

  try {
    const result = await runCitationCheck(siteId, domain, admin)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[citations/check] error:', err)
    return NextResponse.json(
      { error: 'Citation check failed. Please try again.' },
      { status: 500 }
    )
  }
}
