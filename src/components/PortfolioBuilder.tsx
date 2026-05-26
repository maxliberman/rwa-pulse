'use client'
import { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { EnrichedProtocol } from '@/lib/types'
import { formatTVL, formatChange, changeColor, riskColor, categoryColor } from '@/lib/utils'

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
    <div className="bg-[#0E0E1C] border border-[#2A2A40] rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-white font-medium">{payload[0].name}</p>
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
  if (remaining > 0 && positions.length > 0) pieData.push({ name: 'Unallocated', value: remaining, color: '#1C1C2E' })

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
    <div className="space-y-8">
      {/* Summary bar */}
      {positions.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Allocated', value: `${totalAlloc.toFixed(1)}%`, sub: `${remaining.toFixed(1)}% remaining`, highlight: totalAlloc > 100 },
            { label: 'Positions', value: String(positions.length), sub: 'assets selected' },
            { label: 'Wtd. Avg. Yield', value: weightedYield > 0 ? `${weightedYield.toFixed(2)}%` : '—', sub: 'est. annual yield' },
            { label: 'Portfolio Risk', value: compositeRisk.label, sub: `score ${weightedRisk.toFixed(0)}/100`, color: compositeRisk.color },
          ].map((s) => (
            <div key={s.label} className={`bg-[#0E0E1C] border rounded-xl p-4 ${s.highlight ? 'border-red-500/40' : 'border-[#1C1C2E]'}`}>
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`text-2xl font-semibold font-mono ${s.color ?? 'text-white'}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: asset selector */}
        <div className="bg-[#0E0E1C] border border-[#1C1C2E] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#1C1C2E]">
            <h3 className="text-sm font-semibold text-white mb-3">Add Assets</h3>
            <div className="flex gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="flex-1 bg-[#0A0A14] border border-[#1C1C2E] rounded-lg px-3 py-1.5 text-sm text-slate-300 placeholder:text-slate-600 outline-none focus:border-violet-500/50"
              />
              <select
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
                className="bg-[#0A0A14] border border-[#1C1C2E] rounded-lg px-2 py-1.5 text-sm text-slate-300 outline-none"
              >
                {cats.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="divide-y divide-[#1C1C2E] max-h-[420px] overflow-y-auto">
            {available.length === 0 && (
              <p className="text-sm text-slate-600 text-center py-8">All assets added or no results</p>
            )}
            {available.map((p) => (
              <button
                key={p.slug}
                onClick={() => addProtocol(p)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#111120] transition-colors text-left group"
              >
                {p.logo
                  ? <Image src={p.logo} alt={p.name} width={28} height={28} className="rounded-full shrink-0" unoptimized />
                  : <div className="w-7 h-7 rounded-full bg-[#1C1C2E] flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">{p.name[0]}</div>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{p.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${categoryColor(p.category)}`}>{p.category}</span>
                    {p.estimatedYield && <span className="text-[10px] text-emerald-400">{p.estimatedYield}</span>}
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${riskColor(p.riskLevel)}`}>{p.riskLevel}</span>
                  </div>
                </div>
                <span className="text-slate-600 group-hover:text-violet-400 transition-colors text-lg font-light shrink-0">+</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: current positions */}
        <div className="bg-[#0E0E1C] border border-[#1C1C2E] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#1C1C2E] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Portfolio Positions</h3>
            {positions.length > 0 && (
              <button onClick={reset} className="text-xs text-slate-500 hover:text-red-400 transition-colors">Reset</button>
            )}
          </div>
          {positions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <p className="text-slate-600 text-sm mb-1">No assets added yet</p>
              <p className="text-slate-700 text-xs">Click + on any asset from the left panel</p>
            </div>
          ) : (
            <div className="divide-y divide-[#1C1C2E] max-h-[420px] overflow-y-auto">
              {positions.map((pos) => (
                <div key={pos.slug} className="flex items-center gap-3 px-4 py-3">
                  {pos.logo
                    ? <Image src={pos.logo} alt={pos.name} width={24} height={24} className="rounded-full shrink-0" unoptimized />
                    : <div className="w-6 h-6 rounded-full bg-[#1C1C2E] flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">{pos.name[0]}</div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{pos.name}</p>
                    <p className="text-xs text-slate-500">{pos.portfolioRole}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={pos.allocation}
                      onChange={(e) => setAllocation(pos.slug, Number(e.target.value))}
                      className="w-16 bg-[#0A0A14] border border-[#1C1C2E] rounded-lg px-2 py-1 text-sm text-white font-mono text-right outline-none focus:border-violet-500/50"
                    />
                    <span className="text-xs text-slate-500">%</span>
                    <button onClick={() => removePosition(pos.slug)} className="text-slate-700 hover:text-red-400 transition-colors ml-1">×</button>
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
        </div>
      </div>

      {/* Visualization */}
      {positions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie chart */}
          <div className="bg-[#0E0E1C] border border-[#1C1C2E] rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Allocation Breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} strokeWidth={0}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {pieData.filter((d) => d.name !== 'Unallocated').map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-slate-400 truncate max-w-[120px]">{d.name}</span>
                  <span className="text-xs text-slate-600 font-mono">{d.value.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio metrics */}
          <div className="bg-[#0E0E1C] border border-[#1C1C2E] rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Portfolio Analytics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-500">Allocation</span>
                  <span className={totalAlloc > 100 ? 'text-red-400 font-mono' : 'text-white font-mono'}>{totalAlloc.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-[#1C1C2E] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${totalAlloc > 100 ? 'bg-red-500' : 'bg-violet-500'}`} style={{ width: `${Math.min(totalAlloc, 100)}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-[#0A0A14] rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Wtd. Avg. Yield</p>
                  <p className="text-lg font-semibold font-mono text-emerald-400">
                    {weightedYield > 0 ? `${weightedYield.toFixed(2)}%` : '—'}
                  </p>
                </div>
                <div className="bg-[#0A0A14] rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Portfolio Risk</p>
                  <p className={`text-lg font-semibold font-mono ${compositeRisk.color}`}>{compositeRisk.label}</p>
                </div>
                <div className="bg-[#0A0A14] rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Positions</p>
                  <p className="text-lg font-semibold font-mono text-white">{positions.length}</p>
                </div>
                <div className="bg-[#0A0A14] rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Risk Score</p>
                  <p className={`text-lg font-semibold font-mono ${compositeRisk.color}`}>{weightedRisk.toFixed(0)}/100</p>
                </div>
              </div>

              {/* Category breakdown */}
              <div className="pt-2">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">By Category</p>
                <div className="space-y-2">
                  {Object.entries(
                    positions.reduce<Record<string, number>>((acc, p) => {
                      acc[p.category] = (acc[p.category] ?? 0) + p.allocation
                      return acc
                    }, {})
                  ).map(([cat, alloc]) => (
                    <div key={cat} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[cat] ?? '#64748B' }} />
                      <span className="text-xs text-slate-400 flex-1">{cat}</span>
                      <span className="text-xs font-mono text-slate-300">{alloc.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-slate-600 text-center">
        Portfolio builder is for analytical purposes only — not financial advice.{' '}
        <Link href="/methodology" className="text-violet-400 hover:text-violet-300">See methodology →</Link>
      </p>
    </div>
  )
}
