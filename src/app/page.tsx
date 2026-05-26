import { EnrichedProtocol, Protocol } from '@/lib/types'
import { formatTVL, formatChange } from '@/lib/utils'
import { getMetadata } from '@/lib/metadata'
import { fetchCoinGeckoPrices } from '@/lib/pricing'
import ProtocolCard from '@/components/ProtocolCard'
import TVLBarChart from '@/components/TVLBarChart'
import HistoricalChart from '@/components/HistoricalChart'
import AllocationMatrix from '@/components/AllocationMatrix'
import InsightCards from '@/components/InsightCard'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
    const cg = meta.coingeckoId ? prices[meta.coingeckoId] : null
    return { ...p, ...meta, price: cg?.usd ?? meta.nav, nav: meta.nav, priceChange24h: cg?.usd_24h_change ?? null, marketCap: cg?.usd_market_cap ?? null }
  })
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: 'amber' | 'violet' | 'emerald' }) {
  const valueClass = accent === 'amber' ? 'text-amber-400' : accent === 'violet' ? 'text-violet-400' : accent === 'emerald' ? 'text-emerald-400' : 'text-foreground'
  const borderClass = accent === 'amber' ? 'border-amber-500/20' : 'border-border/60'
  return (
    <Card className={`bg-card ${borderClass}`}>
      <CardContent className="p-5">
        <p className="text-[11px] text-muted-foreground uppercase tracking-widest mb-2 font-mono">{label}</p>
        <p className={`text-2xl font-semibold font-mono ${valueClass}`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  )
}

export default async function Home() {
  const protocols = await getProtocols()
  const totalTVL = protocols.reduce((s, p) => s + p.tvl, 0)
  const biggest7d = [...protocols].sort((a, b) => (b.change7d ?? -Infinity) - (a.change7d ?? -Infinity))[0]
  const totalChains = new Set(protocols.flatMap((p) => p.chains)).size
  const institutionalCount = protocols.filter((p) => p.institutionalGrade).length

  return (
    <div className="space-y-16 pt-10">

      {/* ── Hero ── */}
      <section className="relative">
        <div className="absolute inset-0 grid-pattern opacity-30 rounded-3xl -mx-4" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-50" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            <span className="text-[11px] text-amber-400/80 font-mono tracking-widest uppercase">Live · DeFiLlama · CoinGecko</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight leading-[1.08] mb-5 max-w-3xl">
            Live Intelligence for{' '}
            <span className="gradient-text">Tokenized Real-World Assets</span>
          </h1>

          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed mb-8">
            Track tokenized treasuries, private credit, gold, and institutional on-chain products with live pricing, yield data, risk analysis, and portfolio context.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {['Treasury Bills', 'Private Credit', 'Gold', 'Real Estate', 'Stable Yield'].map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs text-muted-foreground border-border/50 font-mono">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total RWA TVL" value={formatTVL(totalTVL)} sub="across all protocols" accent="amber" />
        <StatCard label="Protocols" value={String(protocols.length)} sub="RWA category" />
        <StatCard label="Inst. Grade" value={String(institutionalCount)} sub={`of ${protocols.length} total`} accent="violet" />
        <StatCard label="Top Gainer 7D" value={biggest7d?.name.split(' ')[0] ?? '—'} sub={biggest7d ? formatChange(biggest7d.change7d) : ''} accent="emerald" />
      </section>

      {/* ── Intelligence Layer ── */}
      <section>
        <SectionHeader label="Intelligence" title="Market Insights" />
        <InsightCards />
      </section>

      {/* ── Charts ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="bg-card border-border/60">
          <CardHeader className="px-6 pt-6 pb-0">
            <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-widest mb-1">AUM Distribution</p>
            <h2 className="text-sm font-semibold text-foreground">TVL by Protocol · Top 8</h2>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-4">
            <TVLBarChart protocols={protocols} />
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60">
          <CardHeader className="px-6 pt-6 pb-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-widest mb-1">Featured Asset</p>
                <h2 className="text-sm font-semibold text-foreground">BlackRock BUIDL — TVL History</h2>
              </div>
              <Badge variant="outline" className="text-[10px] border-violet-500/25 bg-violet-500/8 text-violet-300">
                Flagship
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-4">
            <HistoricalChart slug="blackrock-buidl" name="BlackRock BUIDL" />
          </CardContent>
        </Card>
      </section>

      {/* ── Protocol Grid ── */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-widest mb-1">Portfolio View</p>
            <h2 className="text-xl font-semibold text-foreground">All RWA Protocols</h2>
          </div>
          <span className="text-xs text-muted-foreground font-mono">{protocols.length} assets</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {protocols.map((p, i) => (
            <div key={p.slug} className="animate-fade-in-up" style={{ animationDelay: `${i * 35}ms` }}>
              <ProtocolCard protocol={p} rank={i + 1} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Allocation Matrix ── */}
      <section>
        <SectionHeader label="Allocation Intelligence" title="RWA Allocation Matrix"
          sub="Compare, filter, and sort all tracked assets by category, risk, yield, and portfolio role." />
        <AllocationMatrix protocols={protocols} />
      </section>

      {/* ── LatAm CTA ── */}
      <Link href="/latam" className="block group">
        <Card className="bg-card border-border/60 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <CardContent className="p-8 flex items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-[10px] border-violet-500/25 bg-violet-500/8 text-violet-400">
                  Deep Dive
                </Badge>
                <span className="text-[11px] text-muted-foreground font-mono">LatAm Lens</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Why LatAm is Ground Zero for Digital Assets
              </h3>
              <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                Structural analysis on stablecoin adoption, capital controls, and the $200B+ remittance opportunity across Argentina, Brazil, Mexico, Venezuela, and Colombia.
              </p>
            </div>
            <span className="text-2xl text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200 shrink-0">→</span>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}

function SectionHeader({ label, title, sub }: { label: string; title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-widest mb-1">{label}</p>
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      {sub && <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{sub}</p>}
    </div>
  )
}
