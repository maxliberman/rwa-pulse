'use client'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Protocol } from '@/lib/types'
import { formatTVL } from '@/lib/utils'

const COLORS = ['#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95', '#3B0764', '#2E1065', '#1E0A4C', '#150838']

interface Props {
  protocols: Protocol[]
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: Protocol }> }) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 text-sm shadow-xl shadow-black/40">
      <p className="text-foreground font-medium">{p.payload.name}</p>
      <p className="text-amber-400 font-mono">{formatTVL(p.value)}</p>
    </div>
  )
}

export default function TVLBarChart({ protocols }: Props) {
  const data = protocols.slice(0, 8)

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
        <XAxis
          type="number"
          tickFormatter={(v) => formatTVL(v)}
          tick={{ fill: 'oklch(0.490 0.040 250)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: 'oklch(0.708 0 0)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={140}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'oklch(0.155 0.030 275)' }} />
        <Bar dataKey="tvl" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i] ?? COLORS[COLORS.length - 1]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
