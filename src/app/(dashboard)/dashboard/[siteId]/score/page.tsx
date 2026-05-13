import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import RecalculateButton from '@/components/dashboard/RecalculateButton'
import ExportReportButton from '@/components/ExportReportButton'

// ─── Score colour helpers ─────────────────────────────────────────────────────

function scoreColour(score: number) {
  if (score <= 40) return { text: 'text-red-400', ring: 'ring-red-400/40', hex: '#f87171' }
  if (score <= 70) return { text: 'text-amber-400', ring: 'ring-amber-400/40', hex: '#fbbf24' }
  return { text: 'text-[#00D4AA]', ring: 'ring-[#00D4AA]/40', hex: '#00D4AA' }
}

function scoreLabel(score: number) {
  if (score <= 40) return 'Needs Work'
  if (score <= 70) return 'Developing'
  return 'Strong'
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ value, max, colour }: { value: number; max: number; colour: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: colour }} />
    </div>
  )
}

// ─── Sub-score card ───────────────────────────────────────────────────────────

function ModuleCard({
  label,
  sublabel,
  score,
  maxScore,
  colour,
}: {
  label: string
  sublabel: string
  score: number | null
  maxScore: number
  colour: string
}) {
  const value = score ?? 0
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-bold uppercase tracking-widest text-white/40">{label}</p>
        <span className="text-xs text-white/30">max {maxScore}</span>
      </div>
      <p className="text-sm text-white/50 mb-3">{sublabel}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-extrabold tracking-tighter" style={{ color: colour }}>{value}</span>
        <span className="text-sm text-white/30">/ {maxScore}</span>
      </div>
      <ProgressBar value={value} max={maxScore} colour={colour} />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ScorePage({
  params,
}: {
  params: Promise<{ siteId: string }>
}) {
  const { siteId } = await params
  const supabase = await createClient()

  const { data: site } = await supabase
    .from('connected_sites')
    .select('id, domain')
    .eq('id', siteId)
    .single()
  if (!site) notFound()

  const admin = createAdminClient()

  const IMPACT_ORDER = { High: 0, Medium: 1, Low: 2 } as const

  const [
    { data: latestScore },
    { data: fixData },
    { data: compSitesData },
  ] = await Promise.all([
    admin
      .from('visibility_scores')
      .select('score, module1_score, module2_score, module3_score, score_change, calculated_at')
      .eq('site_id', siteId)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from('fix_list')
      .select('id, fix_text, impact, category')
      .eq('site_id', siteId),
    admin
      .from('competitor_sites')
      .select('id, competitor_domain')
      .eq('site_id', siteId),
  ])

  const fixList = (fixData ?? [])
    .sort((a, b) =>
      (IMPACT_ORDER[a.impact as keyof typeof IMPACT_ORDER] ?? 3) -
      (IMPACT_ORDER[b.impact as keyof typeof IMPACT_ORDER] ?? 3)
    )
    .slice(0, 10)
    .map((f) => ({
      id: f.id as string,
      fix_text: f.fix_text as string,
      impact: f.impact as 'High' | 'Medium' | 'Low',
      category: f.category as string | null,
    }))

  const compSites = compSitesData ?? []
  const competitors = await Promise.all(
    compSites.map(async (cs) => {
      const { data: scoreRow } = await admin
        .from('competitor_scores')
        .select('ai_score, citation_rate, aio_rate')
        .eq('competitor_site_id', cs.id)
        .order('checked_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      return {
        competitor_domain: cs.competitor_domain as string,
        ai_score: (scoreRow?.ai_score as number | null) ?? null,
        citation_rate: (scoreRow?.citation_rate as number | null) ?? null,
        aio_rate: (scoreRow?.aio_rate as number | null) ?? null,
      }
    })
  )

  const score = latestScore?.score ?? null
  const colours = score !== null ? scoreColour(score) : { text: 'text-white/30', ring: 'ring-white/20', hex: '#888' }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Back link */}
      <Link
        href={`/dashboard/${siteId}`}
        className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors mb-8"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to dashboard
      </Link>

      {/* Page header */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#00D4AA] mb-1">AI Visibility Score</p>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">{site.domain}</h1>
      </div>

      {/* Score badge */}
      <div className="flex flex-col items-center mb-10">
        <div
          className={`flex flex-col items-center justify-center w-48 h-48 rounded-full ring-4 ${colours.ring} bg-white/5`}
        >
          {score !== null ? (
            <>
              <span className={`text-6xl font-extrabold tracking-tighter ${colours.text}`}>{score}</span>
              <span className="text-xs font-bold uppercase tracking-widest text-white/30 mt-1">out of 100</span>
            </>
          ) : (
            <>
              <span className="text-5xl font-extrabold tracking-tighter text-white/20">—</span>
              <span className="text-xs font-bold uppercase tracking-widest text-white/20 mt-1">not calculated</span>
            </>
          )}
        </div>

        {/* Score label */}
        {score !== null && (
          <p className={`mt-3 text-sm font-bold ${colours.text}`}>{scoreLabel(score)}</p>
        )}

        {/* Score change */}
        {latestScore && latestScore.score_change !== 0 && (
          <div className={`mt-2 inline-flex items-center gap-1 text-sm font-semibold ${latestScore.score_change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {latestScore.score_change > 0 ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {Math.abs(latestScore.score_change)} points since last check
          </div>
        )}

        {/* Last calculated */}
        {latestScore?.calculated_at && (
          <p className="mt-1 text-xs text-white/25">
            Last calculated{' '}
            {new Date(latestScore.calculated_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>

      {/* Sub-score cards */}
      {score !== null ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <ModuleCard
            label="Module 1"
            sublabel="AI Traffic Analytics"
            score={latestScore?.module1_score ?? null}
            maxScore={33}
            colour={colours.hex}
          />
          <ModuleCard
            label="Module 2"
            sublabel="Citation Monitor"
            score={latestScore?.module2_score ?? null}
            maxScore={33}
            colour={colours.hex}
          />
          <ModuleCard
            label="Module 3"
            sublabel="AI Overview Tracker"
            score={latestScore?.module3_score ?? null}
            maxScore={34}
            colour={colours.hex}
          />
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center mb-8">
          <p className="text-sm text-white/40 mb-1">No score calculated yet.</p>
          <p className="text-xs text-white/25">Click Recalculate to generate your first AI Visibility Score from your live module data.</p>
        </div>
      )}

      {/* How it&apos;s calculated */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-8 text-sm text-white/40 leading-relaxed">
        <p className="font-semibold text-white/60 mb-2 text-xs uppercase tracking-widest">How the score is calculated</p>
        <ul className="space-y-1">
          <li><span className="text-white/60">Module 1 (max 33)</span> — AI traffic share (20 pts) + positive trend indicator (13 pts)</li>
          <li><span className="text-white/60">Module 2 (max 33)</span> — Citation rate from Claude web search checks</li>
          <li><span className="text-white/60">Module 3 (max 34)</span> — AI Overview appearance rate from SerpAPI</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <RecalculateButton siteId={siteId} />
        <ExportReportButton
          domain={site.domain}
          score={score}
          module1Score={latestScore?.module1_score ?? null}
          module2Score={latestScore?.module2_score ?? null}
          module3Score={latestScore?.module3_score ?? null}
          calculatedAt={latestScore?.calculated_at ?? null}
          fixList={fixList}
          competitors={competitors}
        />
      </div>
    </div>
  )
}
