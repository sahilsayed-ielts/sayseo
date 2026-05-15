'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { PositionBucket } from '@/lib/query-intelligence/analyser'

const TOOLTIP = {
  contentStyle: { backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.5rem', color: '#fff', fontSize: '0.8rem' },
  labelStyle: { color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
}

const BUCKET_COLORS = ['#00D4AA', '#00D4AA', '#F59E0B', '#F59E0B', '#EF4444']

export default function PositionChart({ data }: { data: PositionBucket[] }) {
  const chartData = data.map(b => ({ name: b.label, queries: b.count, clicks: b.clicks }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip {...TOOLTIP} />
        <Bar dataKey="queries" radius={[3, 3, 0, 0]} maxBarSize={48}>
          {chartData.map((_, i) => <Cell key={i} fill={BUCKET_COLORS[i] ?? '#818CF8'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
