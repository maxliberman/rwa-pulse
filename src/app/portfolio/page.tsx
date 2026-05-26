import { EnrichedProtocol, Protocol } from '@/lib/types'
import { getMetadata } from '@/lib/metadata'
import { fetchCoinGeckoPrices } from '@/lib/pricing'
import PortfolioBuilder from '@/components/PortfolioBuilder'

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

export default async function PortfolioPage() {
  const protocols = await getProtocols()

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="pt-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-xs text-violet-400 font-mono tracking-widest uppercase">Analytical Tool</span>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-white mb-2">
          RWA Portfolio Builder
        </h1>
        <p className="text-slate-400 text-base max-w-2xl leading-relaxed">
          Simulate a tokenized real-world asset allocation. Add assets, set weights, and see your portfolio&apos;s weighted yield, composite risk score, and category breakdown — in real time.
        </p>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { step: '01', title: 'Add assets', desc: 'Browse and add RWA protocols from the left panel' },
          { step: '02', title: 'Set allocations', desc: 'Assign a % weight to each position' },
          { step: '03', title: 'Analyze', desc: 'See weighted yield, risk score, and category breakdown' },
        ].map((s) => (
          <div key={s.step} className="bg-[#0E0E1C] border border-[#1C1C2E] rounded-xl p-4 flex gap-3">
            <span className="text-xs font-mono text-violet-500 shrink-0 mt-0.5">{s.step}</span>
            <div>
              <p className="text-sm font-medium text-white mb-0.5">{s.title}</p>
              <p className="text-xs text-slate-500">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <PortfolioBuilder protocols={protocols} />
    </div>
  )
}
