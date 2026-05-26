'use client'
import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { TVLPoint } from '@/lib/types'
import { formatTVL } from '@/lib/utils'

const RANGES = [
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: '1Y', days: 365 },
  { label: 'ALL', days: 9999 },
]

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: number }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0E0E1C] border border-[#2A2A40] rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-slate-400 text-xs mb-1">
        {label ? new Date(label * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
      </p>
      <p className="text-amber-400 font-mono font-semibold">{formatTVL(payload[0].value)}</p>
    </div>
  )
}

export default function HistoricalChart({ slug, name }: { slug: string; name: string }) {
  const [allData, setAllData] = useState<TVLPoint[]>([])
  const [range, setRange] = useState(90)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/protocol/${slug}`)
      .then((r) => r.json())
      .then((d) => { setAllData(d.tvlHistory ?? []); setLoading(false) })
  }, [slug])

  const cutoff = range === 9999 ? 0 : Date.now() / 1000 - range * 86400
  const data = allData.filter((p) => p.date >= cutoff)

  if (loading) {
    return (
      <div className="h-52 flex flex-col gap-3 p-2">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton flex-1" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-1 mb-4">
        {RANGES.map((r) => (
          <button
            key={r.label}
            onClick={() => setRange(r.days)}
            className={`text-xs px-2.5 py-1 rounded font-mono transition-colors ${
              range === r.days
                ? 'bg-violet-600 text-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
          <defs>
            <linearGradient id={`grad-${slug}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={(v) => new Date(v * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            tick={{ fill: '#475569', fontSize: 10 }}
            axisLine={false} tickLine={false} interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={(v) => formatTVL(v)}
            tick={{ fill: '#475569', fontSize: 10, fontFamily: 'monospace' }}
            axisLine={false} tickLine={false} width={62}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="totalLiquidityUSD" stroke="#7C3AED" strokeWidth={2} fill={`url(#grad-${slug})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
