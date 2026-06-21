import type { GeoPrompt } from './promptGenerator'
import { CATEGORY_LABELS, CONFIDENCE_LABELS, INTENT_LABELS } from './promptGenerator'

// ─── CSV helpers ──────────────────────────────────────────────────────────────

function escapeCsvField(value: string | number): string {
  const str = String(value)
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

const CSV_HEADERS = [
  'Prompt',
  'Category',
  'Source',
  'Confidence',
  'Intent',
  'Priority Score',
  'Recommended Page Section',
] as const

/** Convert GEO prompts to a CSV string. */
export function promptsToCsv(prompts: GeoPrompt[]): string {
  const rows = prompts.map((p) => [
    p.prompt,
    CATEGORY_LABELS[p.category],
    p.source,
    CONFIDENCE_LABELS[p.confidence],
    INTENT_LABELS[p.intent],
    p.priorityScore,
    p.recommendedSection,
  ])

  const lines = [
    CSV_HEADERS.join(','),
    ...rows.map((row) => row.map(escapeCsvField).join(',')),
  ]

  return lines.join('\n')
}

/** Trigger a browser download of prompts as a CSV file. */
export function downloadPromptsCsv(prompts: GeoPrompt[], filename = 'geo-prompt-map.csv'): void {
  const csv = promptsToCsv(prompts)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

/** Build a filename from website URL and topic. */
export function buildCsvFilename(websiteUrl: string, seedTopic: string): string {
  const slug = `${seedTopic}-${websiteUrl}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
  return `geo-prompt-map-${slug || 'export'}.csv`
}