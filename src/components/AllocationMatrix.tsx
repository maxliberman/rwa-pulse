'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { EnrichedProtocol } from '@/lib/types'
import { formatTVL, formatChange, changeColor, riskColor, categoryColor, formatPrice, cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type SortKey = 'tvl' | 'change7d' | 'name'
type SortDir = 'asc' | 'desc'

const CATEGORIES = ['All', 'Treasury', 'Gold', 'Private Debt', 'Stable Yield', 'Credit', 'Real Estate']
const RISKS = ['All', 'Low', 'Medium', 'High']

export default function AllocationMatrix({ protocols }: { protocols: EnrichedProtocol[] }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [risk, setRisk] = useState('All')
  const [institutional, setInstitutional] = useState(false)
  const [yielding, setYielding] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('tvl')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const filtered = useMemo(() => {
    let list = [...protocols]
    if (search) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    if (category !== 'All') list = list.filter((p) => p.category === category)
    if (risk !== 'All') list = list.filter((p) => p.riskLevel === risk)
    if (institutional) list = list.filter((p) => p.institutionalGrade)
    if (yielding) list = list.filter((p) => !!p.estimatedYield)
    list.sort((a, b) => {
      const av = sortKey === 'name' ? a.name : (sortKey === 'tvl' ? a.tvl : (a.change7d ?? -Infinity))
      const bv = sortKey === 'name' ? b.name : (sortKey === 'tvl' ? b.tvl : (b.change7d ?? -Infinity))
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av)
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number)
    })
    return list
  }, [protocols, search, category, risk, institutional, yielding, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span className="text-border ml-1">↕</span>
    return <span className="text-violet-400 ml-1">{sortDir === 'desc' ? '↓' : '↑'}</span>
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2.5 mb-5">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search asset..."
          className="w-44 h-8 text-sm font-mono bg-card border-border/60 focus-visible:ring-violet-500/30 focus-visible:border-violet-500/50"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-card border border-border/60 rounded-md px-3 h-8 text-sm text-foreground outline-none focus:border-violet-500/50 font-mono cursor-pointer"
        >
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={risk}
          onChange={(e) => setRisk(e.target.value)}
          className="bg-card border border-border/60 rounded-md px-3 h-8 text-sm text-foreground outline-none focus:border-violet-500/50 font-mono cursor-pointer"
        >
          {RISKS.map((r) => <option key={r} value={r}>{r} Risk</option>)}
        </select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInstitutional((v) => !v)}
          className={cn(
            'h-8 text-xs font-mono border-border/60',
            institutional ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/15' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Inst. Grade
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setYielding((v) => !v)}
          className={cn(
            'h-8 text-xs font-mono border-border/60',
            yielding ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Yielding Only
        </Button>
        <span className="text-xs text-muted-foreground/50 font-mono self-center ml-auto">{filtered.length} assets</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-secondary/30">
              <th className="text-left text-[10px] text-muted-foreground uppercase tracking-widest px-4 py-3 font-medium font-mono">
                <button onClick={() => toggleSort('name')} className="hover:text-foreground transition-colors">
                  Asset <SortIcon k="name" />
                </button>
              </th>
              <th className="text-left text-[10px] text-muted-foreground uppercase tracking-widest px-3 py-3 font-medium font-mono">Category</th>
              <th className="text-right text-[10px] text-muted-foreground uppercase tracking-widest px-3 py-3 font-medium font-mono">Price / NAV</th>
              <th className="text-right text-[10px] text-muted-foreground uppercase tracking-widest px-3 py-3 font-medium font-mono">
                <button onClick={() => toggleSort('tvl')} className="hover:text-foreground transition-colors">
                  TVL <SortIcon k="tvl" />
                </button>
              </th>
              <th className="text-right text-[10px] text-muted-foreground uppercase tracking-widest px-3 py-3 font-medium font-mono">Yield</th>
              <th className="text-right text-[10px] text-muted-foreground uppercase tracking-widest px-3 py-3 font-medium font-mono">
                <button onClick={() => toggleSort('change7d')} className="hover:text-foreground transition-colors">
                  7D <SortIcon k="change7d" />
                </button>
              </th>
              <th className="text-center text-[10px] text-muted-foreground uppercase tracking-widest px-3 py-3 font-medium font-mono">Risk</th>
              <th className="text-left text-[10px] text-muted-foreground uppercase tracking-widest px-3 py-3 font-medium font-mono">Role</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {filtered.map((p) => (
              <tr key={p.slug} className="bg-card hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    {p.logo ? (
                      <Image src={p.logo} alt={p.name} width={24} height={24} className="rounded-full" unoptimized />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] text-muted-foreground font-bold">{p.name[0]}</div>
                    )}
                    <div>
                      <p className="text-foreground font-medium text-sm leading-tight">{p.name}</p>
                      {p.institutionalGrade && <span className="text-[9px] text-amber-400/60 font-mono">● Inst.</span>}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <Badge variant="outline" className={cn('text-[10px] font-medium px-1.5 h-4 border', categoryColor(p.category))}>
                    {p.category}
                  </Badge>
                </td>
                <td className="px-3 py-3 text-right font-mono text-sm text-foreground">
                  {p.price != null ? formatPrice(p.price) : (p.nav ? `$${p.nav.toFixed(2)}` : '—')}
                </td>
                <td className="px-3 py-3 text-right font-mono text-sm text-foreground">{formatTVL(p.tvl)}</td>
                <td className="px-3 py-3 text-right">
                  {p.estimatedYield
                    ? <span className="text-emerald-400 font-mono text-sm">{p.estimatedYield}</span>
                    : <span className="text-muted-foreground/30 text-sm">—</span>
                  }
                </td>
                <td className={cn('px-3 py-3 text-right font-mono text-sm', changeColor(p.change7d))}>
                  {formatChange(p.change7d)}
                </td>
                <td className="px-3 py-3 text-center">
                  <Badge variant="outline" className={cn('text-[10px] font-medium px-1.5 h-4 border', riskColor(p.riskLevel))}>
                    {p.riskLevel}
                  </Badge>
                </td>
                <td className="px-3 py-3 text-xs text-violet-300">{p.portfolioRole}</td>
                <td className="px-3 py-3">
                  <Link
                    href={`/protocol/${p.slug}`}
                    className="text-xs text-muted-foreground/50 hover:text-foreground transition-colors whitespace-nowrap"
                  >
                    Analyze →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">No assets match your filters</div>
        )}
      </div>
    </div>
  )
}
