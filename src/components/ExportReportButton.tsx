'use client'

import { useState } from 'react'

interface FixItem {
  id: string
  fix_text: string
  impact: 'High' | 'Medium' | 'Low'
  category: string | null
}

interface CompetitorRow {
  competitor_domain: string
  ai_score: number | null
  citation_rate: number | null
  aio_rate: number | null
}

interface Props {
  domain: string
  score: number | null
  module1Score: number | null
  module2Score: number | null
  module3Score: number | null
  calculatedAt: string | null
  fixList: FixItem[]
  competitors: CompetitorRow[]
}

function scoreRGB(score: number | null): [number, number, number] {
  if (score === null) return [136, 136, 136]
  if (score <= 40) return [239, 68, 68]
  if (score <= 70) return [251, 191, 36]
  return [0, 212, 170]
}

function scoreLabel(score: number | null): string {
  if (score === null) return 'Not Calculated'
  if (score <= 40) return 'Needs Work'
  if (score <= 70) return 'Developing'
  return 'Strong'
}

function impactRGB(impact: string): [number, number, number] {
  if (impact === 'High') return [239, 68, 68]
  if (impact === 'Medium') return [251, 191, 36]
  return [34, 197, 94]
}

export default function ExportReportButton({
  domain,
  score,
  module1Score,
  module2Score,
  module3Score,
  calculatedAt,
  fixList,
  competitors,
}: Props) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ format: 'a4', orientation: 'portrait', unit: 'mm' })

      const W = 210
      const H = 297
      const cx = W / 2

      const scoreC = scoreRGB(score)

      function bg() { doc.setFillColor(10, 10, 10) }
      function tealFill() { doc.setFillColor(0, 212, 170) }
      function tealText() { doc.setTextColor(0, 212, 170) }
      function dimText() { doc.setTextColor(136, 136, 136) }
      function whiteText() { doc.setTextColor(255, 255, 255) }
      function darkText() { doc.setTextColor(10, 10, 10) }

      function pageBase() {
        bg(); doc.rect(0, 0, W, H, 'F')
        tealFill(); doc.rect(0, 0, 4, H, 'F')
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        tealText(); doc.text('SaySEO', 20, 22)
      }

      function pageFooter() {
        doc.setDrawColor(0, 212, 170)
        doc.setLineWidth(0.3)
        doc.line(20, H - 22, W - 20, H - 22)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        dimText(); doc.text(domain, cx, H - 16, { align: 'center' })
      }

      // ── Page 1: Cover ────────────────────────────────────────────────────────
      pageBase()

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      dimText(); doc.text('AI VISIBILITY REPORT', 20, 32)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(20)
      whiteText(); doc.text(domain, cx, 68, { align: 'center' })

      // Score ring
      const ringCX = cx
      const ringCY = 148
      doc.setFillColor(scoreC[0], scoreC[1], scoreC[2])
      doc.circle(ringCX, ringCY, 38, 'F')
      bg(); doc.circle(ringCX, ringCY, 29, 'F')

      const scoreStr = score !== null ? String(score) : '—'
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(34)
      doc.setTextColor(scoreC[0], scoreC[1], scoreC[2])
      doc.text(scoreStr, ringCX, ringCY + 7, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      dimText(); doc.text('out of 100', ringCX, ringCY + 17, { align: 'center' })

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      doc.setTextColor(scoreC[0], scoreC[1], scoreC[2])
      doc.text(scoreLabel(score), ringCX, ringCY + 52, { align: 'center' })

      // Module row
      const modY = ringCY + 72
      doc.setFillColor(28, 28, 28)
      doc.roundedRect(20, modY, W - 40, 38, 3, 3, 'F')

      const mods = [
        { label: 'AI Traffic', value: module1Score ?? 0, max: 33 },
        { label: 'Citations', value: module2Score ?? 0, max: 33 },
        { label: 'AI Overviews', value: module3Score ?? 0, max: 34 },
      ]
      const colW = (W - 40) / 3
      mods.forEach((m, i) => {
        const mx = 20 + colW * i + colW / 2
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(16)
        doc.setTextColor(scoreC[0], scoreC[1], scoreC[2])
        doc.text(String(m.value), mx, modY + 17, { align: 'center' })
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        dimText(); doc.text(`${m.label} / ${m.max}`, mx, modY + 27, { align: 'center' })
      })

      if (calculatedAt) {
        const dateStr = new Date(calculatedAt).toLocaleDateString('en-GB', {
          day: 'numeric', month: 'long', year: 'numeric',
        })
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        dimText(); doc.text(`Generated ${dateStr}`, cx, H - 16, { align: 'center' })
        doc.setDrawColor(0, 212, 170)
        doc.setLineWidth(0.3)
        doc.line(20, H - 22, W - 20, H - 22)
      }

      // ── Page 2: Fix List ─────────────────────────────────────────────────────
      if (fixList.length > 0) {
        doc.addPage()
        pageBase()

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(18)
        whiteText(); doc.text('Action Items', 20, 45)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        dimText(); doc.text('Fixes ordered by priority impact', 20, 54)

        let fy = 68
        fixList.forEach((fix, idx) => {
          if (fy > H - 36) return

          const ic = impactRGB(fix.impact)

          // Impact badge
          doc.setFillColor(ic[0], ic[1], ic[2])
          doc.roundedRect(20, fy - 3.5, 18, 6.5, 1.5, 1.5, 'F')
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(6)
          darkText(); doc.text(fix.impact.toUpperCase(), 29, fy + 0.5, { align: 'center' })

          // Category badge
          if (fix.category) {
            doc.setFillColor(30, 30, 30)
            doc.roundedRect(42, fy - 3.5, 24, 6.5, 1.5, 1.5, 'F')
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(6)
            dimText(); doc.text(fix.category.toUpperCase(), 54, fy + 0.5, { align: 'center' })
          }

          // Fix text
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(9)
          doc.setTextColor(215, 215, 215)
          const lines = doc.splitTextToSize(fix.fix_text, W - 40) as string[]
          doc.text(lines[0], 20, fy + 11)

          if (lines.length > 1) {
            doc.setFontSize(8)
            dimText()
            const rest = lines.slice(1, 3).join(' ')
            doc.text(rest, 20, fy + 18)
            fy += 32
          } else {
            fy += 22
          }

          if (idx < fixList.length - 1 && fy <= H - 36) {
            doc.setDrawColor(38, 38, 38)
            doc.setLineWidth(0.2)
            doc.line(20, fy - 4, W - 20, fy - 4)
          }
        })

        pageFooter()
      }

      // ── Page 3: Competitors ──────────────────────────────────────────────────
      if (competitors.length > 0) {
        doc.addPage()
        pageBase()

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(18)
        whiteText(); doc.text('Competitor Comparison', 20, 45)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        dimText(); doc.text('AI visibility scores for tracked competitors', 20, 54)

        // Table header
        const tY = 66
        doc.setFillColor(22, 22, 22)
        doc.rect(20, tY, W - 40, 9, 'F')

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7)
        dimText()
        doc.text('DOMAIN', 24, tY + 6)
        doc.text('AI SCORE', 120, tY + 6, { align: 'center' })
        doc.text('CITATIONS', 153, tY + 6, { align: 'center' })
        doc.text('AIO RATE', 183, tY + 6, { align: 'center' })

        // Your site row
        let rY = tY + 9
        if (score !== null) {
          doc.setFillColor(12, 36, 30)
          doc.rect(20, rY, W - 40, 10, 'F')
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(8)
          tealText(); doc.text(`${domain} (you)`, 24, rY + 6.5)
          doc.text(String(score), 120, rY + 6.5, { align: 'center' })
          dimText(); doc.text('—', 153, rY + 6.5, { align: 'center' })
          doc.text('—', 183, rY + 6.5, { align: 'center' })
          rY += 10
        }

        competitors.forEach((comp, i) => {
          doc.setFillColor(i % 2 === 0 ? 22 : 18, i % 2 === 0 ? 22 : 18, i % 2 === 0 ? 22 : 18)
          doc.rect(20, rY, W - 40, 10, 'F')
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8)
          doc.setTextColor(200, 200, 200)
          doc.text(comp.competitor_domain, 24, rY + 6.5)
          const cc = scoreRGB(comp.ai_score)
          doc.setTextColor(cc[0], cc[1], cc[2])
          doc.text(comp.ai_score !== null ? String(comp.ai_score) : '—', 120, rY + 6.5, { align: 'center' })
          dimText()
          doc.text(comp.citation_rate !== null ? `${Math.round(comp.citation_rate)}%` : '—', 153, rY + 6.5, { align: 'center' })
          doc.text(comp.aio_rate !== null ? `${Math.round(comp.aio_rate)}%` : '—', 183, rY + 6.5, { align: 'center' })
          rY += 10
        })

        pageFooter()
      }

      // ── Page 4: Next Steps ───────────────────────────────────────────────────
      doc.addPage()
      pageBase()

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      whiteText(); doc.text('Recommended Next Steps', 20, 45)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      dimText(); doc.text('Actions to improve your AI visibility score', 20, 54)

      const steps = [
        {
          title: 'Add FAQPage Schema',
          desc: 'Mark up your most-visited pages with FAQ schema to increase AI Overview trigger likelihood significantly.',
        },
        {
          title: 'Create Comparison Pages',
          desc: 'Build dedicated X vs Y comparison pages for your top competitors — these pages consistently earn AI citations.',
        },
        {
          title: 'Optimise for Question Queries',
          desc: 'Identify "what is", "how to", and "best for" queries in your GSC data and create dedicated pages for each.',
        },
        {
          title: 'Run Weekly Citation Checks',
          desc: 'Monitor whether ChatGPT, Perplexity, and Google AI Overviews are citing your domain on a regular cadence.',
        },
        {
          title: 'Track AI Overview Appearances',
          desc: 'Use the AI Overviews tab to see which target queries trigger AIO results and whether your site appears.',
        },
      ]

      let sY = 70
      steps.forEach((step, i) => {
        tealFill(); doc.circle(28, sY + 4, 5, 'F')
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8)
        darkText(); doc.text(String(i + 1), 28, sY + 6.5, { align: 'center' })

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        whiteText(); doc.text(step.title, 38, sY + 5)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        dimText()
        const descLines = doc.splitTextToSize(step.desc, W - 60) as string[]
        descLines.forEach((line, li) => {
          doc.text(line, 38, sY + 13 + li * 5)
        })

        sY += 38
      })

      doc.setDrawColor(0, 212, 170)
      doc.setLineWidth(0.3)
      doc.line(20, H - 22, W - 20, H - 22)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      dimText(); doc.text(`Generated by SaySEO · ${domain}`, cx, H - 16, { align: 'center' })

      // Save
      doc.save(`sayseo-report-${domain.replace(/\./g, '-')}.pdf`)
    } catch (err) {
      console.error('[ExportReportButton] PDF generation failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-white/70 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Generating PDF…
        </>
      ) : (
        <>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Export PDF Report
        </>
      )}
    </button>
  )
}
