'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { AiSource } from './types'
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
  cursor: { fill: 'rgba(255,255,255,0.04)' },
}

interface ChartRow {
  name: string
  sessions: number
  share: number
  color: string
}

export default function AiSourceChart({ sources }: { sources: AiSource[] }) {
  const total = sources.reduce((s, r) => s + r.sessions, 0)

  const data: ChartRow[] = sources.map((s, i) => ({
    name: s.name,
    sessions: s.sessions,
    share: total > 0 ? Math.round((s.sessions / total) * 1000) / 10 : 0,
    color: sourceColor(s.name, i),
  }))

  return (
    <div
      style={{
        backgroundColor: '#111',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '0.75rem',
        padding: '1.5rem',
      }}
    >
      <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', margin: '0 0 1.25rem', letterSpacing: '-0.01em' }}>
        AI Source Breakdown
      </h2>

      {data.length === 0 ? (
        <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.35)' }}>No AI traffic detected yet.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(data.length * 44, 160)}>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis
              type="number"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => v.toLocaleString()}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              {...TOOLTIP_STYLE}
              formatter={(value, _name, props) => [
                `${Number(value).toLocaleString()} sessions (${(props.payload as ChartRow | undefined)?.share ?? 0}%)`,
                'Sessions',
              ]}
            />
            <Bar dataKey="sessions" radius={[0, 4, 4, 0]} maxBarSize={28}>
              {data.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
