'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { TrendResponse } from './types'
import { sourceColor } from './types'

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '0.5rem',
    color: '#fff',
    fontSize: '0.8rem',
  },
  labelStyle: { color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00Z')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
}

export default function TrendChart({ trend }: { trend: TrendResponse }) {
  const { series, sources } = trend
  const [hidden, setHidden] = useState<Set<string>>(new Set())

  if (!sources.length) {
    return (
      <div
        style={{
          backgroundColor: '#111',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          height: 280,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.35)' }}>No trend data available.</p>
      </div>
    )
  }

  // Build a unified date list from all series
  const allDates = [
    ...new Set(Object.values(series).flatMap((pts) => pts.map((p) => p.date))),
  ].sort()

  // Transform to Recharts format: [{ date, ChatGPT: 42, Perplexity: 15, ... }]
  const data = allDates.map((date) => {
    const point: Record<string, string | number> = { date: formatDate(date) }
    for (const source of sources) {
      const found = series[source]?.find((p) => p.date === date)
      point[source] = found?.sessions ?? 0
    }
    return point
  })

  const toggleSource = (name: string) => {
    setHidden((prev) => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  return (
    <div
      style={{
        backgroundColor: '#111',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '0.75rem',
        padding: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>
          Daily AI Traffic Trend
        </h2>
        {/* Source toggles */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {sources.map((src, i) => {
            const isHidden = hidden.has(src)
            const color = sourceColor(src, i)
            return (
              <button
                key={src}
                onClick={() => toggleSource(src)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  border: `1px solid ${isHidden ? 'rgba(255,255,255,0.12)' : color}`,
                  backgroundColor: isHidden ? 'transparent' : `${color}20`,
                  color: isHidden ? 'rgba(255,255,255,0.35)' : color,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: isHidden ? 'rgba(255,255,255,0.2)' : color }} />
                {src}
              </button>
            )
          })}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip {...TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ display: 'none' }} />
          {sources.map((src, i) => (
            <Line
              key={src}
              type="monotone"
              dataKey={src}
              stroke={sourceColor(src, i)}
              strokeWidth={hidden.has(src) ? 0 : 2}
              dot={false}
              activeDot={hidden.has(src) ? false : { r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
