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

function MetricCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: 'emerald' | 'amber' }) {
  return (
    <Card className="bg-card border-border/60">
      <CardContent className="p-4">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono mb-1.5">{label}</p>
        <p className={cn('text-xl font-semibold font-mono', accent === 'emerald' ? 'text-emerald-400' : accent === 'amber' ? 'text-amber-400' : 'text-foreground')}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground/50 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  )
}

export default async function ProtocolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const protocol = await getProtocol(slug)
  if (!protocol) notFound()

  const displayPrice = protocol.price != null ? formatPrice(protocol.price) : (protocol.nav ? `$${protocol.nav.toFixed(2)}` : null)

  return (
    <div className="space-y-8 max-w-5xl pt-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
        <Link href="/" className="hover:text-foreground transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-foreground">{protocol.name}</span>
      </div>

      {/* Hero card */}
      <Card className="bg-card border-border/60">
        <CardContent className="p-8">
          <div className="flex items-start gap-5 mb-6">
            {protocol.logo ? (
              <Image src={protocol.logo} alt={protocol.name} width={56} height={56} className="rounded-2xl" unoptimized />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-xl font-bold text-muted-foreground shrink-0">
                {protocol.name[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-semibold text-foreground">{protocol.name}</h1>
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
              {protocol.issuer && <p className="text-sm text-muted-foreground">Issued by {protocol.issuer}</p>}
            </div>
          </div>

          {/* Price / metrics row */}
          <div className="flex flex-wrap items-end gap-8 mb-6">
            {displayPrice && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono mb-1">Price / NAV</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold font-mono text-foreground">{displayPrice}</span>
                  {protocol.priceChange24h != null && (
                    <span className={cn('text-sm font-mono', changeColor(protocol.priceChange24h))}>
                      {formatChange(protocol.priceChange24h)} 24h
                    </span>
                  )}
                </div>
              </div>
            )}
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono mb-1">TVL</p>
              <span className="text-3xl font-semibold font-mono text-foreground">{formatTVL(protocol.tvl)}</span>
            </div>
            {protocol.estimatedYield && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono mb-1">Est. Yield</p>
                <span className="text-3xl font-semibold font-mono text-emerald-400">{protocol.estimatedYield}</span>
              </div>
            )}
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono mb-1">7D Change</p>
              <span className={cn('text-xl font-semibold font-mono', changeColor(protocol.change7d))}>
                {formatChange(protocol.change7d)}
              </span>
            </div>
          </div>

          <Separator className="opacity-30 mb-5" />

          {/* Chains */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {protocol.chains.map((c) => (
              <span key={c} className="text-[10px] text-muted-foreground bg-secondary/60 border border-border/40 px-2 py-1 rounded-md font-mono">
                {shortenChain(c)}
              </span>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {protocol.tags.map((t) => (
              <Badge key={t} variant="outline" className="text-[10px] border-border/50 text-muted-foreground font-mono">
                {t}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard label="TVL" value={formatTVL(protocol.tvl)} sub="Total Value Locked" />
        <MetricCard label="24h Change" value={formatChange(protocol.change1d)} />
        <MetricCard label="Portfolio Role" value={protocol.portfolioRole} accent="amber" />
        <MetricCard label="Asset Type" value={protocol.assetType.split(' ').slice(0, 2).join(' ')} sub={protocol.assetType} />
      </div>

      {/* About + Portfolio use case */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="bg-card border-border/60">
          <CardHeader className="px-6 pt-6 pb-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono mb-1">Overview</p>
            <h2 className="text-base font-semibold text-foreground">About this Asset</h2>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-4">
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{protocol.description}</p>
            {protocol.underlying && (
              <>
                <Separator className="opacity-30 mb-4" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono mb-1">Underlying Assets</p>
                <p className="text-sm text-foreground">{protocol.underlying}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-violet-500/20">
          <CardHeader className="px-6 pt-6 pb-0">
            <p className="text-[10px] text-violet-400 uppercase tracking-widest font-mono mb-1">Strategy</p>
            <h2 className="text-base font-semibold text-foreground">Portfolio Use Case</h2>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-violet-400 mt-0.5 shrink-0">→</span>
              <div>
                <p className="text-sm text-foreground font-medium">{protocol.portfolioRole}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Primary allocation function</p>
              </div>
            </div>
            {protocol.estimatedYield && (
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 mt-0.5 shrink-0">→</span>
                <div>
                  <p className="text-sm text-foreground font-medium">{protocol.estimatedYield} Estimated Annual Yield</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Yield accrual on deployed capital</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <span className="text-amber-400 mt-0.5 shrink-0">→</span>
              <div>
                <p className="text-sm text-foreground font-medium">
                  {protocol.riskLevel === 'Low' ? 'Capital preservation priority' :
                   protocol.riskLevel === 'Medium' ? 'Balanced risk-return tradeoff' :
                   'Enhanced yield with credit risk'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{protocol.riskLevel} risk classification</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-sky-400 mt-0.5 shrink-0">→</span>
              <div>
                <p className="text-sm text-foreground font-medium">{protocol.chains.length} chain{protocol.chains.length !== 1 ? 's' : ''} available</p>
                <p className="text-xs text-muted-foreground mt-0.5">{protocol.chains.slice(0, 3).join(', ')}{protocol.chains.length > 3 ? ` +${protocol.chains.length - 3} more` : ''}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historical chart */}
      <Card className="bg-card border-border/60">
        <CardHeader className="px-6 pt-6 pb-0">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono mb-1">Performance</p>
          <h2 className="text-sm font-semibold text-foreground">TVL History</h2>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-4">
          <HistoricalChart slug={protocol.slug} name={protocol.name} />
        </CardContent>
      </Card>

      {/* Risk analysis */}
      <Card className="bg-card border-border/60">
        <CardHeader className="px-6 pt-6 pb-0">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono mb-1">Due Diligence</p>
          <h2 className="text-sm font-semibold text-foreground">Risk Analysis</h2>
          <p className="text-xs text-muted-foreground mt-1">Indicative risk scores for institutional due diligence. Not financial advice.</p>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-5">
          <RiskBars risks={protocol.risks} />
        </CardContent>
      </Card>

      {/* Back */}
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Back to Dashboard
      </Link>
    </div>
  )
}
