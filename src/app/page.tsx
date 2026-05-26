import { EnrichedProtocol, Protocol } from '@/lib/types'
import { formatTVL, formatChange, changeColor } from '@/lib/utils'
import { getMetadata } from '@/lib/metadata'
import { fetchCoinGeckoPrices } from '@/lib/pricing'
import ProtocolCard from '@/components/ProtocolCard'
import TVLBarChart from '@/components/TVLBarChart'
import HistoricalChart from '@/components/HistoricalChart'
import AllocationMatrix from '@/components/AllocationMatrix'
import InsightCards from '@/components/InsightCard'
import Link from 'next/link'

async function getProtocols(): Promise<EnrichedProtocol[]> {
  const res = await fetch('https://api.llama.fi/protocols', { next: { revalidate: 3600 } })
  const data = await res.json()
  const raw: Protocol[] = data
    .filter((p: Record<string, unknown>) => p.category === 'RWA')
    .map((p: Record<string, unknown>) => ({
      name: p.name, slug: p.slug, tvl: p.tvl ?? 0,
      change1d: p.change_1d ?? null, change7d: p.change_7d ?? null,
      chains: Array.isArray(p.chains) ? p.chains : [], logo: p.logo ?? null,
    }))
    .sort((a: Protocol, b: Protocol) => b.tvl - a.tvl)

  const cgIds = raw.map((p) => getMetadata(p.slug).coingeckoId).filter(Boolean) as string[]
  const prices = await fetchCoinGeckoPrices(cgIds)

  return raw.map((p) => {
    const meta = getMetadata(p.slug)
    const cgData = meta.coingeckoId ? prices[meta.coingeckoId] : null
    return { ...p, ...meta, price: cgData?.usd ?? meta.nav, nav: meta.nav, priceChange24h: cgData?.usd_24h_change ?? null, marketCap: cgData?.usd_market_cap ?? null }
  })
}

function StatCard({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={`bg-[#0E0E1C] border rounded-xl p-5 ${highlight ? 'border-amber-500/30' : 'border-[#1C1C2E]'}`}>
      <p className="text-xs text-slate-500 uppercase tracking-widest mb-1.5">{label}</p>
      <p className={`text-2xl font-semibold font-mono ${highlight ? 'text-amber-400' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}

export default async function Home() {
  const protocols = await getProtocols()
  const totalTVL = protocols.reduce((s, p) => s + p.tvl, 0)
  const biggest7d = [...protocols].sort((a, b) => (b.change7d ?? -Infinity) - (a.change7d ?? -Infinity))[0]
  const totalChains = new Set(protocols.flatMap((p) => p.chains)).size
  const institutionalCount = protocols.filter((p) => p.institutionalGrade).length

  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="pt-10 pb-2">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs text-amber-400 font-mono tracking-widest uppercase">Live · DeFiLlama · CoinGecko</span>
        </div>
        <h1 className="text-5xl font-semibold tracking-tight text-white mb-3 leading-tight">
          Live Intelligence for<br />
          <span className="text-violet-400">Tokenized Real-World Assets</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
          Track tokenized treasuries, private credit, gold, and institutional on-chain products with live pricing, yield data, risk analysis, and portfolio context.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total RWA TVL" value={formatTVL(totalTVL)} sub="across all protocols" highlight />
        <StatCard label="Protocols Tracked" value={String(protocols.length)} sub="RWA category, DeFiLlama" />
        <StatCard label="Inst. Grade Assets" value={String(institutionalCount)} sub={`of ${protocols.length} total`} />
        <StatCard label="Top Gainer (7d)" value={biggest7d?.name.split(' ')[0] ?? '—'} sub={biggest7d ? formatChange(biggest7d.change7d) : ''} />
      </div>

      {/* Insight cards */}
      <div>
        <p className="text-xs text-slate-600 uppercase tracking-widest font-mono mb-3">Intelligence Layer</p>
        <InsightCards />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0E0E1C] border border-[#1C1C2E] rounded-xl p-6">
          <p className="text-xs text-slate-600 uppercase tracking-widest font-mono mb-1">AUM Distribution</p>
          <h2 className="text-sm font-semibold text-slate-200 mb-5">TVL by Protocol · Top 8</h2>
          <TVLBarChart protocols={protocols} />
        </div>
        <div className="bg-[#0E0E1C] border border-[#1C1C2E] rounded-xl p-6">
          <p className="text-xs text-slate-600 uppercase tracking-widest font-mono mb-1">Featured Asset</p>
          <h2 className="text-sm font-semibold text-slate-200 mb-1">BlackRock BUIDL — TVL History</h2>
          <p className="text-xs text-slate-500 mb-4">The flagship institutional on-chain T-Bill fund</p>
          <HistoricalChart slug="blackrock-buidl" name="BlackRock BUIDL" />
        </div>
      </div>

      {/* Portfolio cards grid */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-widest font-mono mb-1">Portfolio View</p>
            <h2 className="text-lg font-semibold text-white">All RWA Protocols</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">{protocols.length} assets tracked</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {protocols.map((p, i) => (
            <div key={p.slug} className="animate-fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
              <ProtocolCard protocol={p} rank={i + 1} />
            </div>
          ))}
        </div>
      </div>

      {/* Allocation matrix */}
      <div>
        <div className="mb-5">
          <p className="text-xs text-slate-600 uppercase tracking-widest font-mono mb-1">Allocation Intelligence</p>
          <h2 className="text-lg font-semibold text-white">RWA Allocation Matrix</h2>
          <p className="text-sm text-slate-500 mt-1">Compare, filter, and sort all tracked assets by category, risk, yield, and portfolio role.</p>
        </div>
        <AllocationMatrix protocols={protocols} />
      </div>

      {/* LatAm CTA */}
      <Link
        href="/latam"
        className="flex items-center justify-between bg-[#0E0E1C] border border-violet-500/20 rounded-xl p-6 hover:border-violet-500/40 transition-all group card-glow"
      >
        <div>
          <p className="text-xs text-violet-400 font-mono uppercase tracking-widest mb-1">Deep Dive · LatAm Lens</p>
          <h3 className="text-lg font-semibold text-white mb-1">Why LatAm is Ground Zero for Digital Assets</h3>
          <p className="text-sm text-slate-400">
            Structural analysis on stablecoin adoption, capital controls, and the $200B+ remittance opportunity across Argentina, Brazil, Mexico, Venezuela, and Colombia.
          </p>
        </div>
        <span className="text-2xl text-slate-500 group-hover:translate-x-1 group-hover:text-white transition-all ml-6">→</span>
      </Link>
    </div>
  )
}
