import { PromptResult } from './promptGenerator'

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function promptsToCSV(prompts: PromptResult[]): string {
  const headers = [
    '#',
    'Prompt / Query',
    'Source Type',
    'Intent',
    'Funnel Stage',
    'Search Demand (1–5)',
    'AI Answer Potential (1–5)',
    'Commercial Intent (1–5)',
    'Content Gap (1–5)',
    'Total Score',
    'Recommended Section',
    'Content Action',
  ]

  const rows = prompts.map((p, i) => [
    String(i + 1),
    p.prompt,
    p.sourceType,
    p.intent,
    p.funnelStage,
    String(p.scores.searchDemand),
    String(p.scores.aiAnswerPotential),
    String(p.scores.commercialIntent),
    String(p.scores.contentGap),
    String(p.scores.total),
    p.recommendedSection,
    p.contentAction,
  ])

  return [headers, ...rows].map((row) => row.map(escapeCSV).join(',')).join('\n')
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
