'use client'
import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { TVLPoint } from '@/lib/types'
import { formatTVL } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const RANGES = [
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: '1Y',  days: 365 },
  { label: 'ALL', days: 9999 },
]

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: number
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 text-sm shadow-xl shadow-black/40">
      <p className="text-muted-foreground text-xs mb-1">
        {label ? new Date(label * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
      </p>
      <p className="text-amber-400 font-mono font-semibold">{formatTVL(payload[0].value)}</p>
    </div>
  )
}

export default function HistoricalChart({ slug, name }: { slug: string; name: string }) {
  const [allData, setAllData] = useState<TVLPoint[]>([])
  const [range, setRange] = useState('90D')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/protocol/${slug}`)
      .then((r) => r.json())
      .then((d) => { setAllData(d.tvlHistory ?? []); setLoading(false) })
  }, [slug])

  const days = RANGES.find((r) => r.label === range)?.days ?? 90
  const cutoff = days === 9999 ? 0 : Date.now() / 1000 - days * 86400
  const data = allData.filter((p) => p.date >= cutoff)

  if (loading) {
    return (
      <div className="space-y-3 p-1">
        <div className="skeleton h-3 w-32 rounded" />
        <div className="skeleton h-48 w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div>
      <Tabs value={range} onValueChange={setRange} className="mb-4">
        <TabsList className="h-7 bg-secondary/60">
          {RANGES.map((r) => (
            <TabsTrigger key={r.label} value={r.label} className="text-xs px-3 h-6 font-mono">
              {r.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${slug}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="oklch(0.718 0.108 82)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="oklch(0.718 0.108 82)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date"
            tickFormatter={(v) => new Date(v * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            tick={{ fill: 'oklch(0.490 0.040 250)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
            axisLine={false} tickLine={false} interval="preserveStartEnd"
          />
          <YAxis tickFormatter={(v) => formatTVL(v)}
            tick={{ fill: 'oklch(0.490 0.040 250)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
            axisLine={false} tickLine={false} width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="totalLiquidityUSD"
            stroke="oklch(0.718 0.108 82)" strokeWidth={1.5} fill={`url(#grad-${slug})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
