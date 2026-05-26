import { EnrichedProtocol, Protocol } from '@/lib/types'
import { formatTVL, formatChange, changeColor } from '@/lib/utils'
import { getMetadata } from '@/lib/metadata'
import { fetchCoinGeckoPrices } from '@/lib/pricing'
import TVLBarChart from '@/components/TVLBarChart'
import HistoricalChart from '@/components/HistoricalChart'
import AllocationMatrix from '@/components/AllocationMatrix'
import InsightCards from '@/components/InsightCard'
import { CompareSelection } from '@/components/CompareSelection'
import { Reveal } from '@/components/Reveal'
import { CountUp } from '@/components/CountUp'
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

export default async function Home() {
  const protocols = await getProtocols()
  const totalTVL = protocols.reduce((s, p) => s + p.tvl, 0)
  const biggest7d = [...protocols].sort((a, b) => (b.change7d ?? -Infinity) - (a.change7d ?? -Infinity))[0]
  const totalChains = new Set(protocols.flatMap((p) => p.chains)).size
  const institutionalCount = protocols.filter((p) => p.institutionalGrade).length
  const treasuryTVL = protocols.filter((p) => p.category === 'Treasury').reduce((s, p) => s + p.tvl, 0)
  const treasuryShare = Math.round((treasuryTVL / totalTVL) * 100)
  const tvlBillions = totalTVL / 1e9

  return (
    <div>

      {/* ═══════════════════════════════════════════════════════════
          CINEMATIC HERO
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">

        {/* Background: grid + orbs */}
        <div className="absolute inset-0 grid-pattern" />
        <div className="hero-orb-gold" style={{ top: '-15%', left: '-8%', width: '55%', height: '70%' }} />
        <div className="hero-orb-steel" style={{ bottom: '-20%', right: '-5%', width: '45%', height: '65%' }} />
        <div className="hero-orb-gold" style={{ top: '50%', right: '25%', width: '25%', height: '35%', animationDelay: '6s' }} />

        {/* Content */}
        <div className="relative z-10 max-w-5xl pt-20 pb-8">

          {/* Live badge */}
          <div className="flex items-center gap-2.5 mb-8 animate-fade-in">
            <span className="live-dot" />
            <span className="text-[10px] text-amber-500/70 font-mono tracking-[0.2em] uppercase">
              Live · DeFiLlama · CoinGecko
            </span>
          </div>

          {/* Main headline */}
          <h1
            className="font-display text-[clamp(3rem,8vw,6.5rem)] leading-[0.92] tracking-tight mb-7"
            style={{ fontFamily: 'var(--font-instrument), Georgia, serif', animationDelay: '80ms' }}
          >
            <span className="block animate-fade-in-up" style={{ animationDelay: '60ms' }}>
              Compare Tokenized
            </span>
            <span className="block animate-fade-in-up" style={{ animationDelay: '120ms' }}>
              Real-World Assets
            </span>
            <span
              className="block animate-fade-in-up"
              style={{
                animationDelay: '180ms',
                fontStyle: 'italic',
                background: 'linear-gradient(135deg, oklch(0.840 0.130 82) 0%, oklch(0.650 0.095 70) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Like an Institution.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mb-10 animate-fade-in-up" style={{ animationDelay: '240ms' }}>
            Live pricing, NAV, TVL, yield, risk, and portfolio role analysis for tokenized
            treasuries, private credit, gold, and institutional on-chain products.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <Link
              href="#market"
              className="inline-flex items-center h-11 px-6 text-sm font-medium rounded-lg transition-all duration-200 text-background font-mono"
              style={{ background: 'oklch(0.718 0.108 82)', color: 'oklch(0.053 0.008 240)' }}
            >
              Explore RWA Market
            </Link>
            <Link
              href="#matrix"
              className="inline-flex items-center h-11 px-6 text-sm font-medium rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-all duration-200 font-mono"
            >
              Compare Assets →
            </Link>
          </div>
        </div>

        {/* Stats strip — bottom of hero */}
        <div className="relative z-10 mt-auto pb-10">
          <div className="divider-gold mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '360ms' }}>
            {[
              { label: 'Total RWA TVL', value: `$${tvlBillions.toFixed(1)}B`, sub: 'across all protocols' },
              { label: 'Protocols Tracked', value: String(protocols.length), sub: 'RWA category' },
              { label: 'Institutional Grade', value: String(institutionalCount), sub: `of ${protocols.length} total` },
              {
                label: 'Top Gainer 7D',
                value: biggest7d?.name.split(' ')[0] ?? '—',
                sub: biggest7d ? formatChange(biggest7d.change7d) : '',
                subClass: biggest7d && (biggest7d.change7d ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400',
              },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-[9px] text-muted-foreground/40 font-mono uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-2xl font-semibold font-mono text-foreground leading-none">{s.value}</p>
                {s.sub && <p className={`text-[11px] mt-1 font-mono ${s.subClass ?? 'text-muted-foreground'}`}>{s.sub}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          MARKET INTELLIGENCE — Live Metrics
          ═══════════════════════════════════════════════════════════ */}
      <section id="market" className="pt-32">
        <Reveal>
          <div className="mb-10">
            <p className="text-[10px] text-amber-500/60 font-mono tracking-[0.2em] uppercase mb-2">01 · Market Overview</p>
            <h2 className="font-display text-4xl sm:text-5xl text-foreground" style={{ fontFamily: 'var(--font-instrument), Georgia, serif' }}>
              The RWA Market, Live.
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl">
              Real-time intelligence across every tokenized asset class on DeFiLlama.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              label: 'Total RWA TVL',
              value: tvlBillions,
              prefix: '$', suffix: 'B', decimals: 1,
              sub: 'across all protocols',
              accent: 'text-amber-400',
              border: 'border-amber-500/20',
            },
            {
              label: 'Protocols',
              value: protocols.length,
              sub: 'RWA category tracked',
              accent: 'text-foreground',
              border: 'border-border/50',
            },
            {
              label: 'Active Chains',
              value: totalChains,
              sub: 'chain deployments',
              accent: 'text-foreground',
              border: 'border-border/50',
            },
            {
              label: 'Inst. Grade',
              value: institutionalCount,
              sub: `of ${protocols.length} protocols`,
              accent: 'text-violet-300',
              border: 'border-border/50',
            },
            {
              label: 'Treasury Share',
              value: treasuryShare,
              suffix: '%',
              sub: 'of total RWA TVL',
              accent: 'text-emerald-400',
              border: 'border-border/50',
            },
            {
              label: 'Top 7D Mover',
              value: biggest7d?.name.split(' ')[0] ?? '—',
              isText: true,
              sub: biggest7d ? formatChange(biggest7d.change7d) + ' 7D' : '',
              accent: 'text-foreground',
              subClass: biggest7d && (biggest7d.change7d ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400',
              border: 'border-border/50',
            },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 60}>
              <Card className={`bg-card ${s.border}`}>
                <CardContent className="p-5">
                  <p className="text-[9px] text-muted-foreground/50 font-mono uppercase tracking-widest mb-2">{s.label}</p>
                  <p className={`text-2xl font-semibold font-mono ${s.accent} leading-none`}>
                    {s.isText ? s.value : (
                      <CountUp
                        end={s.value as number}
                        prefix={s.prefix}
                        suffix={s.suffix}
                        decimals={s.decimals ?? 0}
                      />
                    )}
                  </p>
                  {s.sub && (
                    <p className={`text-xs mt-1.5 font-mono ${s.subClass ?? 'text-muted-foreground/50'}`}>{s.sub}</p>
                  )}
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          MARKET INTELLIGENCE CARDS
          ═══════════════════════════════════════════════════════════ */}
      <section className="pt-20">
        <Reveal>
          <div className="mb-8">
            <p className="text-[10px] text-amber-500/60 font-mono tracking-[0.2em] uppercase mb-2">02 · Intelligence</p>
            <h2 className="font-display text-3xl text-foreground" style={{ fontFamily: 'var(--font-instrument), Georgia, serif' }}>
              Market Signals
            </h2>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <InsightCards />
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CHARTS — TVL + Historical
          ═══════════════════════════════════════════════════════════ */}
      <section className="pt-20">
        <Reveal>
          <div className="mb-8">
            <p className="text-[10px] text-amber-500/60 font-mono tracking-[0.2em] uppercase mb-2">03 · Analytics</p>
            <h2 className="font-display text-3xl text-foreground" style={{ fontFamily: 'var(--font-instrument), Georgia, serif' }}>
              AUM Distribution
            </h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Reveal>
            <Card className="bg-card border-border/50 h-full">
              <CardHeader className="px-6 pt-6 pb-0">
                <p className="text-[9px] text-muted-foreground/40 font-mono uppercase tracking-widest mb-1">By Protocol</p>
                <h3 className="text-sm font-semibold text-foreground">TVL · Top 8</h3>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-4">
                <TVLBarChart protocols={protocols} />
              </CardContent>
            </Card>
          </Reveal>
          <Reveal delay={80}>
            <Card className="bg-card border-border/50 h-full">
              <CardHeader className="px-6 pt-6 pb-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[9px] text-muted-foreground/40 font-mono uppercase tracking-widest mb-1">Featured Asset</p>
                    <h3 className="text-sm font-semibold text-foreground">BlackRock BUIDL — TVL History</h3>
                  </div>
                  <Badge variant="outline" className="text-[9px] border-amber-500/25 bg-amber-500/8 text-amber-400">
                    Flagship
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-4">
                <HistoricalChart slug="blackrock-buidl" name="BlackRock BUIDL" />
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          EDITORIAL STORYTELLING — Apple-style narrative
          ═══════════════════════════════════════════════════════════ */}
      <section className="pt-32">
        <Reveal>
          <div className="mb-16 text-center max-w-2xl mx-auto">
            <p className="text-[10px] text-amber-500/60 font-mono tracking-[0.2em] uppercase mb-4">04 · Product Philosophy</p>
            <h2
              className="font-display text-4xl sm:text-5xl text-foreground leading-tight"
              style={{ fontFamily: 'var(--font-instrument), Georgia, serif' }}
            >
              The new financial infrastructure is being built on-chain.
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-border/30 rounded-xl overflow-hidden">
          {[
            {
              n: '01',
              headline: 'Built for Capital Preservation',
              body: 'Tokenized treasuries deliver T-Bill yields with daily liquidity and 24/7 transferability. BlackRock BUIDL and Ondo OUSG are redefining cash management for institutions operating on-chain.',
              tag: 'Treasury',
              href: '/protocol/blackrock-buidl',
            },
            {
              n: '02',
              headline: 'Engineered for Yield Visibility',
              body: 'Private credit protocols like Centrifuge unlock 8–12% APY on real-world receivables — returns unavailable in public markets. Full on-chain tranche structure with seniority protection.',
              tag: 'Private Credit',
              href: '/protocol/centrifuge-protocol',
            },
            {
              n: '03',
              headline: 'Designed for Global Portfolios',
              body: 'From Swiss-vaulted gold to EU-regulated T-bill funds, RWAs now span every major asset class across 20+ chains. A unified allocation layer for the institutional portfolio manager.',
              tag: 'Global',
              href: '/methodology',
            },
          ].map((item, i) => (
            <Reveal key={item.n} delay={i * 100}>
              <div className="bg-card p-8 h-full flex flex-col">
                <span className="text-[9px] font-mono text-muted-foreground/30 tracking-widest mb-4 block">{item.n}</span>
                <h3
                  className="font-display text-2xl text-foreground mb-4 leading-tight"
                  style={{ fontFamily: 'var(--font-instrument), Georgia, serif' }}
                >
                  {item.headline}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">
                  {item.body}
                </p>
                <Link
                  href={item.href}
                  className="text-[10px] font-mono text-amber-500/60 hover:text-amber-400 transition-colors tracking-widest uppercase"
                >
                  Learn more →
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PROTOCOL PRODUCT CARDS
          ═══════════════════════════════════════════════════════════ */}
      <section className="pt-32">
        <Reveal>
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[10px] text-amber-500/60 font-mono tracking-[0.2em] uppercase mb-2">05 · Asset Universe</p>
              <h2
                className="font-display text-4xl sm:text-5xl text-foreground"
                style={{ fontFamily: 'var(--font-instrument), Georgia, serif' }}
              >
                All RWA Assets
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">
                Select up to 4 assets to compare side by side.
              </p>
            </div>
            <span className="text-[11px] text-muted-foreground/40 font-mono hidden sm:block">{protocols.length} assets tracked</span>
          </div>
        </Reveal>

        <CompareSelection protocols={protocols} />
      </section>

      {/* ═══════════════════════════════════════════════════════════
          ALLOCATION MATRIX — Best-in-class table
          ═══════════════════════════════════════════════════════════ */}
      <section id="matrix" className="pt-32">
        <Reveal>
          <div className="mb-10">
            <p className="text-[10px] text-amber-500/60 font-mono tracking-[0.2em] uppercase mb-2">06 · Comparison Table</p>
            <h2
              className="font-display text-4xl sm:text-5xl text-foreground"
              style={{ fontFamily: 'var(--font-instrument), Georgia, serif' }}
            >
              RWA Allocation Matrix
            </h2>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Sort, filter, and compare all tracked assets by category, risk, yield, and portfolio role.
            </p>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <AllocationMatrix protocols={protocols} />
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          LATAM CTA
          ═══════════════════════════════════════════════════════════ */}
      <section className="pt-24">
        <Reveal>
          <Link href="/latam" className="block group">
            <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-8 sm:p-10 transition-all duration-300 hover:border-amber-500/25 card-premium">
              <div className="absolute inset-0 grid-pattern opacity-20" />
              <div className="relative flex items-center justify-between gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-[9px] border-amber-500/25 bg-amber-500/8 text-amber-400 font-mono">
                      Deep Analysis
                    </Badge>
                    <span className="text-[10px] text-muted-foreground/50 font-mono">LatAm Lens</span>
                  </div>
                  <h3
                    className="font-display text-2xl sm:text-3xl text-foreground mb-3"
                    style={{ fontFamily: 'var(--font-instrument), Georgia, serif' }}
                  >
                    Why LatAm is Ground Zero for Digital Assets
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                    Structural analysis on stablecoin adoption, capital controls, and the $200B+ remittance opportunity
                    across Argentina, Brazil, Mexico, Venezuela, and Colombia.
                  </p>
                </div>
                <span className="text-3xl text-muted-foreground/20 group-hover:text-amber-500/40 group-hover:translate-x-1 transition-all duration-300 shrink-0 hidden sm:block">→</span>
              </div>
            </div>
          </Link>
        </Reveal>
      </section>

    </div>
  )
}
