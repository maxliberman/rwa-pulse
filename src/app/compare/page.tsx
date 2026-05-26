import Image from 'next/image'
import Link from 'next/link'
import { EnrichedProtocol, Protocol } from '@/lib/types'
import { getMetadata } from '@/lib/metadata'
import { fetchCoinGeckoPrices } from '@/lib/pricing'
import { formatTVL, formatChange, changeColor, riskColor, categoryColor, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Reveal } from '@/components/Reveal'
import RiskBars from '@/components/RiskBars'
import HistoricalChart from '@/components/HistoricalChart'

async function getProtocols(slugs: string[]): Promise<EnrichedProtocol[]> {
  const res = await fetch('https://api.llama.fi/protocols', { next: { revalidate: 3600 } })
  const data = await res.json()
  const raws: Protocol[] = data
    .filter((p: Record<string, unknown>) => p.category === 'RWA' && slugs.includes(p.slug as string))
    .map((p: Record<string, unknown>) => ({
      name: p.name, slug: p.slug, tvl: p.tvl ?? 0,
      change1d: p.change_1d ?? null, change7d: p.change_7d ?? null,
      chains: Array.isArray(p.chains) ? p.chains : [], logo: p.logo ?? null,
    }))

  const cgIds = raws.map((p) => getMetadata(p.slug).coingeckoId).filter(Boolean) as string[]
  const prices = await fetchCoinGeckoPrices(cgIds)

  return slugs
    .map((slug) => raws.find((p) => p.slug === slug))
    .filter((p): p is Protocol => !!p)
    .map((p) => {
      const meta = getMetadata(p.slug)
      const cg = meta.coingeckoId ? prices[meta.coingeckoId] : null
      return { ...p, ...meta, price: cg?.usd ?? meta.nav, nav: meta.nav, priceChange24h: cg?.usd_24h_change ?? null, marketCap: cg?.usd_market_cap ?? null }
    })
}

function CompareCell({ value, sub, accent, className }: {
  value: React.ReactNode
  sub?: string
  accent?: boolean
  className?: string
}) {
  return (
    <td className={cn('px-4 py-4 border-r border-border/30 last:border-r-0 align-top', className)}>
      <div className={cn('text-sm font-medium', accent ? 'text-emerald-400' : 'text-foreground')}>
        {value}
      </div>
      {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
    </td>
  )
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ slugs?: string }>
}) {
  const { slugs: slugsParam } = await searchParams
  const slugs = (slugsParam ?? '').split(',').filter(Boolean).slice(0, 4)

  const protocols = slugs.length >= 1 ? await getProtocols(slugs) : []
  const colCount = protocols.length

  if (colCount === 0) {
    return (
      <div className="max-w-5xl pt-20 pb-20 text-center space-y-4">
        <p className="text-muted-foreground">No assets selected.</p>
        <Link href="/" className="text-amber-400 text-sm hover:underline">← Back to Market</Link>
      </div>
    )
  }

  const ROWS = [
    { label: 'Category', render: (p: EnrichedProtocol) => (
      <Badge variant="outline" className={cn('text-[10px] border', categoryColor(p.category))}>{p.category}</Badge>
    )},
    { label: 'Risk Level', render: (p: EnrichedProtocol) => (
      <Badge variant="outline" className={cn('text-[10px] border', riskColor(p.riskLevel))}>{p.riskLevel}</Badge>
    )},
    { label: 'TVL', render: (p: EnrichedProtocol) => formatTVL(p.tvl) },
    { label: 'Est. Yield', render: (p: EnrichedProtocol) => p.estimatedYield ?? '—', accent: true },
    { label: '7D Change', render: (p: EnrichedProtocol) => (
      <span className={cn('font-mono text-xs', changeColor(p.change7d))}>{formatChange(p.change7d)}</span>
    )},
    { label: 'Price / NAV', render: (p: EnrichedProtocol) => p.price != null ? `$${p.price < 10 ? p.price.toFixed(4) : p.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—' },
    { label: 'Asset Type', render: (p: EnrichedProtocol) => p.assetType },
    { label: 'Underlying', render: (p: EnrichedProtocol) => p.underlying ?? '—' },
    { label: 'Issuer', render: (p: EnrichedProtocol) => p.issuer ?? '—' },
    { label: 'TradFi Equivalent', render: (p: EnrichedProtocol) => p.comparableAsset ?? '—' },
    { label: 'Portfolio Role', render: (p: EnrichedProtocol) => p.portfolioRole },
    { label: 'Chains', render: (p: EnrichedProtocol) => `${p.chains.length} chain${p.chains.length !== 1 ? 's' : ''}` },
    { label: 'Institutional Grade', render: (p: EnrichedProtocol) => p.institutionalGrade ? '✓ Yes' : 'No' },
    { label: 'Key Risk', render: (p: EnrichedProtocol) => p.keyRisk ?? '—' },
  ]

  return (
    <div className="max-w-6xl pt-8 pb-20 space-y-10">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
        <Link href="/" className="hover:text-foreground transition-colors">Market</Link>
        <span className="opacity-30">/</span>
        <span className="text-foreground/70">Compare</span>
      </div>

      {/* Header */}
      <div>
        <p className="text-[10px] text-amber-500/60 uppercase tracking-widest font-mono mb-2">Side-by-Side Analysis</p>
        <h1 className="text-3xl font-semibold text-foreground" style={{ fontFamily: 'var(--font-instrument), Georgia, serif' }}>
          Asset Comparison
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Comparing {colCount} tokenized real-world asset{colCount !== 1 ? 's' : ''}.
        </p>
      </div>

      <Reveal>
        {/* ── Header row: logos ── */}
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/40">
                  {/* Row label column */}
                  <th className="w-40 min-w-[160px] px-4 py-5 text-left border-r border-border/30">
                    <p className="text-[9px] text-muted-foreground/40 uppercase tracking-widest font-mono">Metric</p>
                  </th>
                  {protocols.map((p) => (
                    <th key={p.slug} className="px-4 py-5 border-r border-border/30 last:border-r-0 text-left min-w-[180px]">
                      <Link href={`/protocol/${p.slug}`} className="group flex items-center gap-3 hover:opacity-80 transition-opacity">
                        {p.logo ? (
                          <Image src={p.logo} alt={p.name} width={36} height={36} className="rounded-xl shrink-0" unoptimized />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-sm font-bold text-muted-foreground shrink-0">
                            {p.name[0]}
                          </div>
                        )}
                        <span className="text-sm font-semibold text-foreground leading-tight group-hover:text-amber-400 transition-colors">
                          {p.name}
                        </span>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, i) => (
                  <tr
                    key={row.label}
                    className={cn(
                      'border-b border-border/20 last:border-b-0 transition-colors hover:bg-secondary/20',
                      i % 2 === 0 ? 'bg-transparent' : 'bg-secondary/5'
                    )}
                  >
                    <td className="px-4 py-3.5 border-r border-border/30">
                      <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-mono">{row.label}</p>
                    </td>
                    {protocols.map((p) => (
                      <CompareCell
                        key={p.slug}
                        value={row.render(p)}
                        accent={'accent' in row && row.accent}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>

      {/* ── Risk Breakdown ── */}
      <Reveal delay={60}>
        <div>
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-mono mb-4">Risk Analysis</p>
          <div className={cn('grid gap-5', colCount === 1 ? 'grid-cols-1' : colCount === 2 ? 'grid-cols-2' : colCount === 3 ? 'grid-cols-3' : 'grid-cols-2 lg:grid-cols-4')}>
            {protocols.map((p) => (
              <div key={p.slug} className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
                <div className="flex items-center gap-2">
                  {p.logo ? (
                    <Image src={p.logo} alt={p.name} width={24} height={24} className="rounded-lg" unoptimized />
                  ) : (
                    <div className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
                      {p.name[0]}
                    </div>
                  )}
                  <p className="text-xs font-medium text-foreground truncate">{p.name.split(' ')[0]}</p>
                </div>
                <RiskBars risks={p.risks} compact />
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ── TVL Charts (only if 1-2 for readability) ── */}
      {colCount <= 2 && (
        <Reveal delay={80}>
          <div>
            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-mono mb-4">TVL History</p>
            <div className={cn('grid gap-5', colCount === 1 ? 'grid-cols-1' : 'grid-cols-2')}>
              {protocols.map((p) => (
                <div key={p.slug} className="rounded-xl border border-border/50 bg-card p-5">
                  <p className="text-xs font-medium text-foreground mb-4">{p.name}</p>
                  <HistoricalChart slug={p.slug} name={p.name} />
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      <Separator className="opacity-20" />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-mono">
          ← Back to Market
        </Link>
        <p className="text-[10px] text-muted-foreground/40 font-mono">
          {colCount} / 4 assets compared
        </p>
      </div>
    </div>
  )
}
