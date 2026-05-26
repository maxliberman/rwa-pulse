import { Protocol } from '@/lib/types'
import { formatTVL, formatChange } from '@/lib/utils'
import ProtocolCard from '@/components/ProtocolCard'
import TVLBarChart from '@/components/TVLBarChart'
import HistoricalChart from '@/components/HistoricalChart'
import Link from 'next/link'

async function getProtocols(): Promise<Protocol[]> {
  const res = await fetch('https://api.llama.fi/protocols', { next: { revalidate: 3600 } })
  const data = await res.json()
  return data
    .filter((p: Record<string, unknown>) => p.category === 'RWA')
    .map((p: Record<string, unknown>) => ({
      name: p.name,
      slug: p.slug,
      tvl: p.tvl ?? 0,
      change1d: p.change_1d ?? null,
      change7d: p.change_7d ?? null,
      chains: Array.isArray(p.chains) ? p.chains : [],
      logo: p.logo ?? null,
    }))
    .sort((a: Protocol, b: Protocol) => b.tvl - a.tvl)
}

function StatCard({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={`bg-[#0E0E1C] border rounded-xl p-5 ${highlight ? 'border-amber-500/30' : 'border-[#1C1C2E]'}`}>
      <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${highlight ? 'text-amber-400' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}

export default async function Home() {
  const protocols = await getProtocols()
  const totalTVL = protocols.reduce((s, p) => s + p.tvl, 0)
  const biggest7d = [...protocols].sort((a, b) => (b.change7d ?? -Infinity) - (a.change7d ?? -Infinity))[0]
  const totalChains = new Set(protocols.flatMap((p) => p.chains)).size

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="pt-8 pb-2">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs text-amber-400 font-mono tracking-widest uppercase">Live Data · DeFiLlama</span>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-white mb-2">
          Real World Asset Intelligence
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Tracking the tokenization of global financial markets — treasury bills, bonds, commodities, and institutional capital moving on-chain.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total RWA TVL" value={formatTVL(totalTVL)} sub="across all protocols" highlight />
        <StatCard label="Protocols Tracked" value={String(protocols.length)} sub="RWA category" />
        <StatCard label="Chains" value={String(totalChains)} sub="active deployments" />
        <StatCard
          label="Top Gainer (7d)"
          value={biggest7d?.name ?? '—'}
          sub={biggest7d ? formatChange(biggest7d.change7d) : ''}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0E0E1C] border border-[#1C1C2E] rounded-xl p-6">
          <h2 className="text-sm font-medium text-slate-300 mb-1">TVL by Protocol</h2>
          <p className="text-xs text-slate-500 mb-5">Current AUM · top 8</p>
          <TVLBarChart protocols={protocols} />
        </div>
        <div className="bg-[#0E0E1C] border border-[#1C1C2E] rounded-xl p-6">
          <h2 className="text-sm font-medium text-slate-300 mb-1">BlackRock BUIDL — 90d TVL</h2>
          <p className="text-xs text-slate-500 mb-5">The flagship institutional RWA product</p>
          <HistoricalChart slug="blackrock-buidl" name="BlackRock BUIDL" />
        </div>
      </div>

      {/* Protocol grid */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-medium text-white">All RWA Protocols</h2>
          <span className="text-xs text-slate-500">{protocols.length} tracked</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {protocols.map((p, i) => (
            <ProtocolCard key={p.slug} protocol={p} rank={i + 1} />
          ))}
        </div>
      </div>

      {/* LatAm CTA */}
      <Link
        href="/latam"
        className="flex items-center justify-between bg-[#0E0E1C] border border-violet-500/20 rounded-xl p-6 hover:border-violet-500/40 transition-colors group"
      >
        <div>
          <p className="text-xs text-violet-400 font-mono uppercase tracking-widest mb-1">Deep Dive</p>
          <h3 className="text-lg font-medium text-white">LatAm Lens →</h3>
          <p className="text-sm text-slate-400 mt-1">
            Why Latin America is the most important real-world test case for stablecoins and tokenization — and what the on-chain data shows.
          </p>
        </div>
        <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
      </Link>
    </div>
  )
}
