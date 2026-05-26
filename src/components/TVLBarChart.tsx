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
    <div className="bg-[#0E0E1C] border border-[#2A2A40] rounded-lg px-3 py-2 text-sm">
      <p className="text-white font-medium">{p.payload.name}</p>
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
          tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'monospace' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: '#94A3B8', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={140}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1C1C2E' }} />
        <Bar dataKey="tvl" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i] ?? COLORS[COLORS.length - 1]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
