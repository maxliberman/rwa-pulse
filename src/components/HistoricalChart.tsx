'use client'
import { useEffect, useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { TVLPoint } from '@/lib/types'
import { formatTVL } from '@/lib/utils'

interface Props {
  slug: string
  name: string
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: number }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0E0E1C] border border-[#2A2A40] rounded-lg px-3 py-2 text-sm">
      <p className="text-slate-400 text-xs mb-1">
        {label ? new Date(label * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
      </p>
      <p className="text-amber-400 font-mono font-medium">{formatTVL(payload[0].value)}</p>
    </div>
  )
}

export default function HistoricalChart({ slug, name }: Props) {
  const [data, setData] = useState<TVLPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/protocol/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d.tvlHistory ?? [])
        setLoading(false)
      })
  }, [slug])

  if (loading) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-500 text-sm animate-pulse">
        Loading {name} data…
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
        <defs>
          <linearGradient id="tvlGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tickFormatter={(v) =>
            new Date(v * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          }
          tick={{ fill: '#64748B', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval={14}
        />
        <YAxis
          tickFormatter={(v) => formatTVL(v)}
          tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'monospace' }}
          axisLine={false}
          tickLine={false}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="totalLiquidityUSD"
          stroke="#7C3AED"
          strokeWidth={2}
          fill="url(#tvlGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
