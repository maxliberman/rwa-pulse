'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { EnrichedProtocol } from '@/lib/types'
import { formatTVL, formatChange, changeColor, riskColor, categoryColor, formatPrice } from '@/lib/utils'

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
    if (sortKey !== k) return <span className="text-slate-700 ml-1">↕</span>
    return <span className="text-violet-400 ml-1">{sortDir === 'desc' ? '↓' : '↑'}</span>
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search asset..."
          className="bg-[#0E0E1C] border border-[#1C1C2E] rounded-lg px-3 py-1.5 text-sm text-slate-300 placeholder:text-slate-600 outline-none focus:border-violet-500/50 w-44"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-[#0E0E1C] border border-[#1C1C2E] rounded-lg px-3 py-1.5 text-sm text-slate-300 outline-none focus:border-violet-500/50"
        >
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={risk}
          onChange={(e) => setRisk(e.target.value)}
          className="bg-[#0E0E1C] border border-[#1C1C2E] rounded-lg px-3 py-1.5 text-sm text-slate-300 outline-none focus:border-violet-500/50"
        >
          {RISKS.map((r) => <option key={r} value={r}>{r} Risk</option>)}
        </select>
        <button
          onClick={() => setInstitutional((v) => !v)}
          className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${institutional ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'border-[#1C1C2E] text-slate-500 hover:text-slate-300'}`}
        >
          Inst. Grade
        </button>
        <button
          onClick={() => setYielding((v) => !v)}
          className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${yielding ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'border-[#1C1C2E] text-slate-500 hover:text-slate-300'}`}
        >
          Yielding Only
        </button>
        <span className="text-xs text-slate-600 self-center ml-auto">{filtered.length} assets</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#1C1C2E]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1C1C2E] bg-[#0A0A14]">
              <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-4 py-3 font-medium">
                <button onClick={() => toggleSort('name')} className="hover:text-slate-300 transition-colors">
                  Asset <SortIcon k="name" />
                </button>
              </th>
              <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-3 py-3 font-medium">Category</th>
              <th className="text-right text-xs text-slate-500 uppercase tracking-wider px-3 py-3 font-medium">Price / NAV</th>
              <th className="text-right text-xs text-slate-500 uppercase tracking-wider px-3 py-3 font-medium">
                <button onClick={() => toggleSort('tvl')} className="hover:text-slate-300 transition-colors">
                  TVL <SortIcon k="tvl" />
                </button>
              </th>
              <th className="text-right text-xs text-slate-500 uppercase tracking-wider px-3 py-3 font-medium">Yield</th>
              <th className="text-right text-xs text-slate-500 uppercase tracking-wider px-3 py-3 font-medium">
                <button onClick={() => toggleSort('change7d')} className="hover:text-slate-300 transition-colors">
                  7D <SortIcon k="change7d" />
                </button>
              </th>
              <th className="text-center text-xs text-slate-500 uppercase tracking-wider px-3 py-3 font-medium">Risk</th>
              <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-3 py-3 font-medium">Role</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C1C2E]">
            {filtered.map((p) => (
              <tr key={p.slug} className="bg-[#0E0E1C] hover:bg-[#111120] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    {p.logo ? (
                      <Image src={p.logo} alt={p.name} width={24} height={24} className="rounded-full" unoptimized />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-[#1C1C2E] flex items-center justify-center text-[10px] text-slate-400 font-bold">{p.name[0]}</div>
                    )}
                    <div>
                      <p className="text-white font-medium text-sm leading-tight">{p.name}</p>
                      {p.institutionalGrade && <span className="text-[9px] text-amber-400/60">● Inst.</span>}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${categoryColor(p.category)}`}>
                    {p.category}
                  </span>
                </td>
                <td className="px-3 py-3 text-right font-mono text-sm text-white">
                  {p.price != null ? formatPrice(p.price) : (p.nav ? `$${p.nav.toFixed(2)}` : '—')}
                </td>
                <td className="px-3 py-3 text-right font-mono text-sm text-white">{formatTVL(p.tvl)}</td>
                <td className="px-3 py-3 text-right">
                  {p.estimatedYield
                    ? <span className="text-emerald-400 font-mono text-sm">{p.estimatedYield}</span>
                    : <span className="text-slate-600 text-sm">—</span>
                  }
                </td>
                <td className={`px-3 py-3 text-right font-mono text-sm ${changeColor(p.change7d)}`}>
                  {formatChange(p.change7d)}
                </td>
                <td className="px-3 py-3 text-center">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${riskColor(p.riskLevel)}`}>
                    {p.riskLevel}
                  </span>
                </td>
                <td className="px-3 py-3 text-xs text-violet-300">{p.portfolioRole}</td>
                <td className="px-3 py-3">
                  <Link
                    href={`/protocol/${p.slug}`}
                    className="text-xs text-slate-400 hover:text-white transition-colors whitespace-nowrap"
                  >
                    Analyze →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-sm">No assets match your filters</div>
        )}
      </div>
    </div>
  )
}
