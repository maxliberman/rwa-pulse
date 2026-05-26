'use client'
import { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { EnrichedProtocol } from '@/lib/types'
import { formatTVL, changeColor, riskColor, categoryColor, cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

interface Position {
  slug: string
  name: string
  logo?: string
  category: string
  portfolioRole: string
  riskLevel: 'Low' | 'Medium' | 'High'
  estimatedYield?: string
  allocation: number
  tvl: number
}

const CATEGORY_COLORS: Record<string, string> = {
  Treasury: '#7C3AED',
  Gold: '#F59E0B',
  'Private Debt': '#EF4444',
  'Stable Yield': '#38BDF8',
  Credit: '#F97316',
  'Real Estate': '#14B8A6',
  RWA: '#64748B',
}

const RISK_SCORE: Record<string, number> = { Low: 20, Medium: 50, High: 80 }

function yieldToNum(y?: string): number {
  if (!y) return 0
  const m = y.match(/[\d.]+/)
  return m ? parseFloat(m[0]) : 0
}

function PieTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 text-sm shadow-xl shadow-black/40">
      <p className="text-foreground font-medium">{payload[0].name}</p>
      <p className="text-amber-400 font-mono">{payload[0].value.toFixed(1)}%</p>
    </div>
  )
}

export default function PortfolioBuilder({ protocols }: { protocols: EnrichedProtocol[] }) {
  const [positions, setPositions] = useState<Position[]>([])
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')

  const totalAlloc = positions.reduce((s, p) => s + p.allocation, 0)
  const remaining = Math.max(0, 100 - totalAlloc)

  const weightedYield = positions.reduce((s, p) => s + (yieldToNum(p.estimatedYield) * p.allocation) / 100, 0)
  const weightedRisk = positions.reduce((s, p) => s + (RISK_SCORE[p.riskLevel] * p.allocation) / 100, 0)

  const compositeRisk = weightedRisk <= 30 ? { label: 'Low', color: 'text-emerald-400' }
    : weightedRisk <= 55 ? { label: 'Medium', color: 'text-amber-400' }
    : { label: 'High', color: 'text-red-400' }

  const pieData = positions
    .filter((p) => p.allocation > 0)
    .map((p) => ({ name: p.name, value: p.allocation, color: CATEGORY_COLORS[p.category] ?? '#64748B' }))
  if (remaining > 0 && positions.length > 0) pieData.push({ name: 'Unallocated', value: remaining, color: 'oklch(0.155 0.030 275)' })

  const addProtocol = useCallback((p: EnrichedProtocol) => {
    if (positions.find((pos) => pos.slug === p.slug)) return
    const defaultAlloc = Math.min(remaining, 10)
    setPositions((prev) => [...prev, {
      slug: p.slug, name: p.name, logo: p.logo, category: p.category,
      portfolioRole: p.portfolioRole, riskLevel: p.riskLevel,
      estimatedYield: p.estimatedYield, allocation: defaultAlloc, tvl: p.tvl,
    }])
  }, [positions, remaining])

  const removePosition = useCallback((slug: string) => {
    setPositions((prev) => prev.filter((p) => p.slug !== slug))
  }, [])

  const setAllocation = useCallback((slug: string, value: number) => {
    setPositions((prev) => prev.map((p) => p.slug === slug ? { ...p, allocation: Math.max(0, Math.min(100, value)) } : p))
  }, [])

  const reset = () => setPositions([])

  const cats = ['All', ...Array.from(new Set(protocols.map((p) => p.category)))]
  const available = protocols.filter((p) => {
    if (positions.find((pos) => pos.slug === p.slug)) return false
    if (catFilter !== 'All' && p.category !== catFilter) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      {positions.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Allocated', value: `${totalAlloc.toFixed(1)}%`, sub: `${remaining.toFixed(1)}% remaining`, highlight: totalAlloc > 100 },
            { label: 'Positions', value: String(positions.length), sub: 'assets selected' },
            { label: 'Wtd. Avg. Yield', value: weightedYield > 0 ? `${weightedYield.toFixed(2)}%` : '—', sub: 'est. annual yield', accent: 'emerald' },
            { label: 'Portfolio Risk', value: compositeRisk.label, sub: `score ${weightedRisk.toFixed(0)}/100`, riskColor: compositeRisk.color },
          ].map((s) => (
            <Card key={s.label} className={cn('bg-card', s.highlight ? 'border-red-500/40' : 'border-border/60')}>
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono mb-1">{s.label}</p>
                <p className={cn('text-2xl font-semibold font-mono', s.riskColor ?? (s.accent === 'emerald' ? 'text-emerald-400' : 'text-foreground'))}>
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: asset selector */}
        <Card className="bg-card border-border/60 overflow-hidden">
          <CardHeader className="px-4 pt-4 pb-3 border-b border-border/40">
            <h3 className="text-sm font-semibold text-foreground mb-3">Add Assets</h3>
            <div className="flex gap-2">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="flex-1 h-8 text-sm bg-secondary/40 border-border/60 focus-visible:ring-violet-500/30"
              />
              <select
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
                className="bg-secondary/40 border border-border/60 rounded-md px-2 h-8 text-sm text-foreground outline-none cursor-pointer"
              >
                {cats.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </CardHeader>
          <div className="divide-y divide-border/40 max-h-[420px] overflow-y-auto">
            {available.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">All assets added or no results</p>
            )}
            {available.map((p) => (
              <button
                key={p.slug}
                onClick={() => addProtocol(p)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/40 transition-colors text-left group"
              >
                {p.logo
                  ? <Image src={p.logo} alt={p.name} width={28} height={28} className="rounded-full shrink-0" unoptimized />
                  : <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">{p.name[0]}</div>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-medium truncate">{p.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge variant="outline" className={cn('text-[9px] px-1 h-3.5 border', categoryColor(p.category))}>{p.category}</Badge>
                    {p.estimatedYield && <span className="text-[9px] text-emerald-400 font-mono">{p.estimatedYield}</span>}
                    <Badge variant="outline" className={cn('text-[9px] px-1 h-3.5 border', riskColor(p.riskLevel))}>{p.riskLevel}</Badge>
                  </div>
                </div>
                <span className="text-muted-foreground/30 group-hover:text-violet-400 transition-colors text-lg font-light shrink-0">+</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Right: current positions */}
        <Card className="bg-card border-border/60 overflow-hidden">
          <CardHeader className="px-4 pt-4 pb-3 border-b border-border/40 flex-row items-center justify-between space-y-0">
            <h3 className="text-sm font-semibold text-foreground">Portfolio Positions</h3>
            {positions.length > 0 && (
              <Button variant="ghost" size="sm" onClick={reset} className="h-7 text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/10">
                Reset
              </Button>
            )}
          </CardHeader>
          {positions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <p className="text-muted-foreground text-sm mb-1">No assets added yet</p>
              <p className="text-muted-foreground/40 text-xs">Click + on any asset from the left panel</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40 max-h-[420px] overflow-y-auto">
              {positions.map((pos) => (
                <div key={pos.slug} className="flex items-center gap-3 px-4 py-3">
                  {pos.logo
                    ? <Image src={pos.logo} alt={pos.name} width={24} height={24} className="rounded-full shrink-0" unoptimized />
                    : <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">{pos.name[0]}</div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground font-medium truncate">{pos.name}</p>
                    <p className="text-xs text-muted-foreground">{pos.portfolioRole}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={pos.allocation}
                      onChange={(e) => setAllocation(pos.slug, Number(e.target.value))}
                      className="w-14 bg-secondary/40 border border-border/60 rounded-md px-2 py-1 text-sm text-foreground font-mono text-right outline-none focus:border-violet-500/50"
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                    <button onClick={() => removePosition(pos.slug)} className="text-muted-foreground/30 hover:text-red-400 transition-colors ml-1 text-lg leading-none">×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {totalAlloc > 100 && (
            <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20">
              <p className="text-xs text-red-400">Total exceeds 100% — adjust allocations</p>
            </div>
          )}
        </Card>
      </div>

      {/* Visualization */}
      {positions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Pie chart */}
          <Card className="bg-card border-border/60">
            <CardHeader className="px-6 pt-6 pb-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono mb-1">Allocation</p>
              <h3 className="text-sm font-semibold text-foreground">Breakdown</h3>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} strokeWidth={0}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {pieData.filter((d) => d.name !== 'Unallocated').map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-xs text-muted-foreground truncate max-w-[120px]">{d.name}</span>
                    <span className="text-xs text-muted-foreground/40 font-mono">{d.value.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Portfolio analytics */}
          <Card className="bg-card border-border/60">
            <CardHeader className="px-6 pt-6 pb-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono mb-1">Analytics</p>
              <h3 className="text-sm font-semibold text-foreground">Portfolio Metrics</h3>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-4 space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground font-mono">Allocation</span>
                  <span className={cn('font-mono', totalAlloc > 100 ? 'text-red-400' : 'text-foreground')}>{totalAlloc.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-border/40 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${totalAlloc > 100 ? 'bg-red-500' : 'bg-violet-500'}`} style={{ width: `${Math.min(totalAlloc, 100)}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/40 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-1">Wtd. Yield</p>
                  <p className="text-lg font-semibold font-mono text-emerald-400">
                    {weightedYield > 0 ? `${weightedYield.toFixed(2)}%` : '—'}
                  </p>
                </div>
                <div className="bg-secondary/40 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-1">Portfolio Risk</p>
                  <p className={cn('text-lg font-semibold font-mono', compositeRisk.color)}>{compositeRisk.label}</p>
                </div>
                <div className="bg-secondary/40 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-1">Positions</p>
                  <p className="text-lg font-semibold font-mono text-foreground">{positions.length}</p>
                </div>
                <div className="bg-secondary/40 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-1">Risk Score</p>
                  <p className={cn('text-lg font-semibold font-mono', compositeRisk.color)}>{weightedRisk.toFixed(0)}/100</p>
                </div>
              </div>

              <Separator className="opacity-30" />

              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono mb-3">By Category</p>
                <div className="space-y-2">
                  {Object.entries(
                    positions.reduce<Record<string, number>>((acc, p) => {
                      acc[p.category] = (acc[p.category] ?? 0) + p.allocation
                      return acc
                    }, {})
                  ).map(([cat, alloc]) => (
                    <div key={cat} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[cat] ?? '#64748B' }} />
                      <span className="text-xs text-muted-foreground flex-1">{cat}</span>
                      <span className="text-xs font-mono text-foreground">{alloc.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <p className="text-xs text-muted-foreground/40 text-center">
        Portfolio builder is for analytical purposes only — not financial advice.{' '}
        <Link href="/methodology" className="text-violet-400 hover:text-violet-300 underline underline-offset-2">See methodology →</Link>
      </p>
    </div>
  )
}
