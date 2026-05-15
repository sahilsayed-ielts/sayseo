'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { GA4ChannelStat } from '@/lib/ga4-intel/analyser'

const TOOLTIP = {
  contentStyle: { backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.5rem', color: '#fff', fontSize: '0.8rem' },
  labelStyle: { color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
}

export default function ChannelBarChart({ data, comparing }: { data: GA4ChannelStat[]; comparing: boolean }) {
  const chartData = data.map(c => ({
    name: c.channel.replace('Organic ', 'Org. ').replace('Paid ', 'Paid '),
    sessions: c.sessions,
    prev: c.session_change !== undefined ? c.sessions - c.session_change : undefined,
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip {...TOOLTIP} />
        <Bar dataKey="sessions" fill="#00D4AA" radius={[3, 3, 0, 0]} maxBarSize={40} />
        {comparing && <Bar dataKey="prev" fill="rgba(0,212,170,0.25)" radius={[3, 3, 0, 0]} maxBarSize={40} />}
      </BarChart>
    </ResponsiveContainer>
  )
}
