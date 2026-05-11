import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { runCitationCheck } from '@/lib/citations'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  const { data: sites, error } = await admin
    .from('connected_sites')
    .select('id, domain')

  if (error || !sites) {
    console.error('[cron/citations] failed to fetch sites:', error)
    return NextResponse.json({ error: 'Failed to fetch sites' }, { status: 500 })
  }

  const results: Array<{ siteId: string; domain: string; checked: number; mentioned: number; error?: string }> = []

  for (const site of sites) {
    try {
      const result = await runCitationCheck(site.id, site.domain, admin)
      results.push({ siteId: site.id, domain: site.domain, checked: result.checked, mentioned: result.mentioned })
      const platformSummary = result.platforms.map((p) => `${p.platform}:${p.mentioned}/${p.checked}`).join(' ')
      console.log(`[cron/citations] ${site.domain}: ${result.mentioned}/${result.checked} mentions (${platformSummary})`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[cron/citations] failed for ${site.domain}:`, message)
      results.push({ siteId: site.id, domain: site.domain, checked: 0, mentioned: 0, error: message })
    }
  }

  return NextResponse.json({ processed: results.length, results })
}
