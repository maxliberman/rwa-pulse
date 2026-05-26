import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EnrichedProtocol, Protocol } from '@/lib/types'
import { getMetadata } from '@/lib/metadata'
import { fetchCoinGeckoPrices } from '@/lib/pricing'
import { formatTVL, formatChange, changeColor, riskColor, categoryColor, shortenChain, formatPrice, cn } from '@/lib/utils'
import HistoricalChart from '@/components/HistoricalChart'
import RiskBars from '@/components/RiskBars'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Reveal } from '@/components/Reveal'

async function getProtocol(slug: string): Promise<EnrichedProtocol | null> {
  const res = await fetch('https://api.llama.fi/protocols', { next: { revalidate: 3600 } })
  const data = await res.json()
  const raw: Protocol | undefined = data.find(
    (p: Record<string, unknown>) => p.slug === slug && p.category === 'RWA'
  )
  if (!raw) return null

  const meta = getMetadata(slug)
  const prices = meta.coingeckoId ? await fetchCoinGeckoPrices([meta.coingeckoId]) : {}
  const cgData = meta.coingeckoId ? prices[meta.coingeckoId] : null

  return {
    name: raw.name, slug: raw.slug, tvl: (raw as unknown as Record<string, number>).tvl ?? 0,
    change1d: (raw as unknown as Record<string, number>).change_1d ?? null,
    change7d: (raw as unknown as Record<string, number>).change_7d ?? null,
    chains: Array.isArray((raw as unknown as Record<string, unknown>).chains) ? (raw as unknown as Record<string, string[]>).chains : [],
    logo: (raw as unknown as Record<string, string>).logo ?? undefined,
    ...meta,
    price: cgData?.usd ?? meta.nav,
    priceChange24h: cgData?.usd_24h_change ?? null,
    marketCap: cgData?.usd_market_cap ?? null,
  }
}

function StatPill({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[9px] text-muted-foreground/50 uppercase tracking-widest font-mono">{label}</p>
      <p className={cn('text-2xl font-semibold font-mono leading-none', accent ? 'text-emerald-400' : 'text-foreground')}>{value}</p>
    </div>
  )
}

function EditorialCard({ icon, label, title, body, accent }: {
  icon: string
  label: string
  title: string
  body: string
  accent: 'amber' | 'emerald' | 'rose' | 'sky'
}) {
  const colors = {
    amber: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
    emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    rose: 'text-rose-400 border-rose-500/20 bg-rose-500/5',
    sky: 'text-sky-400 border-sky-500/20 bg-sky-500/5',
  }
  return (
    <div className={cn('rounded-xl border p-5 space-y-3', colors[accent])}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className={cn('text-[10px] uppercase tracking-widest font-mono', colors[accent].split(' ')[0])}>{label}</span>
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  )
}

export default async function ProtocolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const protocol = await getProtocol(slug)
  if (!protocol) notFound()

  const displayPrice = protocol.price != null ? formatPrice(protocol.price) : (protocol.nav ? `$${protocol.nav.toFixed(2)}` : null)
  const change7dPositive = (protocol.change7d ?? 0) >= 0

  return (
    <div className="max-w-5xl pt-8 pb-20 space-y-12">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
        <Link href="/" className="hover:text-foreground transition-colors">Market</Link>
        <span className="opacity-30">/</span>
        <span className="text-foreground/70">{protocol.name}</span>
      </div>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card">
        {/* ambient top-left glow */}
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

        <div className="relative p-8 lg:p-10">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-8">
            {/* Logo + identity */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {protocol.logo ? (
                <Image src={protocol.logo} alt={protocol.name} width={64} height={64} className="rounded-2xl shrink-0" unoptimized />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-2xl font-bold text-muted-foreground shrink-0">
                  {protocol.name[0]}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="outline" className={cn('text-[10px] border', categoryColor(protocol.category))}>
                    {protocol.category}
                  </Badge>
                  <Badge variant="outline" className={cn('text-[10px] border', riskColor(protocol.riskLevel))}>
                    {protocol.riskLevel} Risk
                  </Badge>
                  {protocol.institutionalGrade && (
                    <Badge variant="outline" className="text-[10px] border-amber-500/25 bg-amber-500/8 text-amber-400">
                      Institutional Grade
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl lg:text-4xl font-semibold text-foreground leading-tight">{protocol.name}</h1>
                {protocol.issuer && (
                  <p className="text-sm text-muted-foreground mt-1">Issued by <span className="text-foreground/80">{protocol.issuer}</span></p>
                )}
              </div>
            </div>

            {/* Primary metric */}
            {displayPrice && (
              <div className="shrink-0 text-right sm:text-left">
                <p className="text-[9px] text-muted-foreground/50 uppercase tracking-widest font-mono mb-1">Price / NAV</p>
                <p className="text-3xl font-semibold font-mono text-foreground">{displayPrice}</p>
                {protocol.priceChange24h != null && (
                  <p className={cn('text-xs font-mono mt-0.5', changeColor(protocol.priceChange24h))}>
                    {formatChange(protocol.priceChange24h)} 24h
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap items-end gap-8 pt-6 border-t border-border/30">
            <StatPill label="TVL" value={formatTVL(protocol.tvl)} />
            {protocol.estimatedYield && (
              <StatPill label="Est. Yield" value={protocol.estimatedYield} accent />
            )}
            <div className="flex flex-col gap-0.5">
              <p className="text-[9px] text-muted-foreground/50 uppercase tracking-widest font-mono">7D Change</p>
              <p className={cn('text-2xl font-semibold font-mono leading-none', change7dPositive ? 'text-emerald-400' : 'text-rose-400')}>
                {change7dPositive ? '↑' : '↓'} {formatChange(protocol.change7d)}
              </p>
            </div>
            <StatPill label="Role" value={protocol.portfolioRole} />
            {protocol.marketCap && (
              <StatPill label="Market Cap" value={formatTVL(protocol.marketCap)} />
            )}
            {/* Chains */}
            <div className="flex flex-col gap-1 ml-auto">
              <p className="text-[9px] text-muted-foreground/50 uppercase tracking-widest font-mono">Available on</p>
              <div className="flex flex-wrap gap-1">
                {protocol.chains.slice(0, 5).map((c) => (
                  <span key={c} className="text-[9px] text-muted-foreground/60 bg-secondary/60 border border-border/30 px-1.5 py-0.5 rounded font-mono">
                    {shortenChain(c)}
                  </span>
                ))}
                {protocol.chains.length > 5 && (
                  <span className="text-[9px] text-muted-foreground/40 px-1 py-0.5 font-mono">+{protocol.chains.length - 5}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Description ── */}
      <Reveal>
        <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
          {protocol.description}
        </p>
      </Reveal>

      {/* ── Editorial Insights: 3 cards ── */}
      <Reveal delay={60}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {protocol.comparableAsset && (
            <EditorialCard
              icon="⚖️"
              label="TradFi Equivalent"
              title={protocol.comparableAsset}
              body={`Think of ${protocol.name} as the on-chain version of a ${protocol.comparableAsset} — giving you equivalent exposure with blockchain-native benefits: 24/7 transferability, programmability, and composability with DeFi protocols.`}
              accent="amber"
            />
          )}
          {protocol.targetUser && (
            <EditorialCard
              icon="🎯"
              label="Who Should Use This"
              title="Ideal Allocator Profile"
              body={protocol.targetUser}
              accent="sky"
            />
          )}
          {protocol.keyRisk && (
            <EditorialCard
              icon="⚠️"
              label="Key Risk"
              title="Primary Risk Factor"
              body={protocol.keyRisk}
              accent="rose"
            />
          )}
        </div>
      </Reveal>

      {/* ── Portfolio Use Case ── */}
      <Reveal delay={80}>
        <Card className="bg-card border-border/60 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
          <CardHeader className="px-6 pt-6 pb-0">
            <p className="text-[10px] text-amber-500/60 uppercase tracking-widest font-mono mb-1">Strategy</p>
            <h2 className="text-base font-semibold text-foreground">Portfolio Use Case</h2>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-amber-400 mt-0.5 shrink-0 text-lg">→</span>
                <div>
                  <p className="text-sm text-foreground font-medium">{protocol.portfolioRole}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Primary allocation function</p>
                </div>
              </div>
              {protocol.estimatedYield && (
                <div className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-0.5 shrink-0 text-lg">→</span>
                  <div>
                    <p className="text-sm text-foreground font-medium">{protocol.estimatedYield} Estimated Annual Yield</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Yield accrual on deployed capital</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <span className="text-amber-400/60 mt-0.5 shrink-0 text-lg">→</span>
                <div>
                  <p className="text-sm text-foreground font-medium">
                    {protocol.riskLevel === 'Low' ? 'Capital preservation priority' :
                     protocol.riskLevel === 'Medium' ? 'Balanced risk-return tradeoff' :
                     'Enhanced yield with credit risk'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{protocol.riskLevel} risk classification</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {protocol.underlying && (
                <div>
                  <p className="text-[9px] text-muted-foreground/50 uppercase tracking-widest font-mono mb-1">Underlying Assets</p>
                  <p className="text-sm text-foreground">{protocol.underlying}</p>
                </div>
              )}
              <div>
                <p className="text-[9px] text-muted-foreground/50 uppercase tracking-widest font-mono mb-1.5">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {protocol.tags.map((t) => (
                    <Badge key={t} variant="outline" className="text-[9px] border-border/50 text-muted-foreground font-mono">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Reveal>

      {/* ── Historical TVL Chart ── */}
      <Reveal delay={100}>
        <Card className="bg-card border-border/60">
          <CardHeader className="px-6 pt-6 pb-0">
            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-mono mb-1">Performance</p>
            <h2 className="text-sm font-semibold text-foreground">TVL History</h2>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-4">
            <HistoricalChart slug={protocol.slug} name={protocol.name} />
          </CardContent>
        </Card>
      </Reveal>

      {/* ── Risk Analysis ── */}
      <Reveal delay={120}>
        <Card className="bg-card border-border/60">
          <CardHeader className="px-6 pt-6 pb-0">
            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-mono mb-1">Due Diligence</p>
            <h2 className="text-sm font-semibold text-foreground">Risk Analysis</h2>
            <p className="text-xs text-muted-foreground mt-1">Indicative risk scores for institutional due diligence. Not financial advice.</p>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-5">
            <RiskBars risks={protocol.risks} />
          </CardContent>
        </Card>
      </Reveal>

      {/* ── Why This Matters ── */}
      <Reveal delay={140}>
        <div className="rounded-2xl border border-border/40 bg-card/50 p-8 lg:p-10 relative overflow-hidden">
          <div className="grid-pattern absolute inset-0 opacity-30 pointer-events-none" />
          <div className="relative">
            <p className="text-[10px] text-amber-500/60 uppercase tracking-widest font-mono mb-3">Why This Matters</p>
            <h2 className="text-xl font-semibold text-foreground mb-4" style={{ fontFamily: 'var(--font-instrument), Georgia, serif' }}>
              The institutional case for {protocol.name}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              {protocol.category === 'Treasury' || protocol.category === 'Stable Yield'
                ? `In a world where idle capital earns nothing, ${protocol.name} represents the evolution of cash management. By tokenizing access to ${protocol.underlying ?? 'government securities'}, serious allocators can put treasury reserves to work without leaving the on-chain ecosystem — earning competitive yields while maintaining the liquidity needed to operate.`
                : protocol.category === 'Gold'
                ? `Gold has been the inflation hedge of choice for institutional portfolios for centuries. ${protocol.name} removes the operational barriers — no vault fees, no delivery logistics, 24/7 price discovery, and seamless DeFi composability — making it the natural evolution of commodity allocation for digital-native portfolios.`
                : `${protocol.name} opens access to ${protocol.assetType} that was previously only available to institutional allocators with minimum tickets of $1M+. On-chain securitization democratizes yield generation while preserving the structural protections — tranching, overcollateralization, and legal frameworks — that sophisticated investors require.`}
            </p>
          </div>
        </div>
      </Reveal>

      {/* ── Footer ── */}
      <Separator className="opacity-20" />
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-mono">
          ← Back to Market
        </Link>
        <Link
          href={`/compare?slugs=${protocol.slug}`}
          className="text-[11px] font-mono px-3 py-1.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
        >
          + Add to Compare
        </Link>
      </div>
    </div>
  )
}
