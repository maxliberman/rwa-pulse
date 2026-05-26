import Link from 'next/link'
import Image from 'next/image'
import { EnrichedProtocol } from '@/lib/types'
import { formatTVL, formatChange, changeColor, shortenChain, riskColor, categoryColor, formatPrice, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { buttonVariants } from '@/components/ui/button'

interface ProtocolCardProps {
  protocol: EnrichedProtocol
  rank: number
  isSelected?: boolean
  onCompare?: (slug: string) => void
}

export default function ProtocolCard({ protocol, rank, isSelected, onCompare }: ProtocolCardProps) {
  const displayPrice = protocol.price != null
    ? formatPrice(protocol.price)
    : protocol.nav ? `$${protocol.nav.toFixed(2)}` : null

  const change7dPositive = (protocol.change7d ?? 0) >= 0

  return (
    <div className={cn(
      'group relative bg-card border border-border/50 rounded-xl flex flex-col overflow-hidden card-premium',
      isSelected && 'card-selected'
    )}>
      {/* Gold accent top line — appears on hover or selected */}
      <div className={cn(
        'absolute top-0 left-0 right-0 h-px transition-opacity duration-300',
        isSelected
          ? 'bg-amber-500/50 opacity-100'
          : 'bg-gradient-to-r from-transparent via-amber-500/30 to-transparent opacity-0 group-hover:opacity-100'
      )} />

      {/* Header */}
      <div className="p-5 pb-4">
        {/* Row 1: rank + logo + name + risk */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground/35 font-mono tabular-nums w-4 shrink-0">
              {String(rank).padStart(2, '0')}
            </span>
            <div className="shrink-0">
              {protocol.logo ? (
                <Image src={protocol.logo} alt={protocol.name} width={36} height={36}
                  className="rounded-xl" unoptimized />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-sm font-semibold text-muted-foreground">
                  {protocol.name[0]}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-foreground leading-tight truncate">{protocol.name}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Badge variant="outline" className={cn('text-[9px] font-medium px-1.5 h-4 border', categoryColor(protocol.category))}>
                  {protocol.category}
                </Badge>
                {protocol.institutionalGrade && (
                  <Badge variant="outline" className="text-[9px] px-1.5 h-4 border-amber-500/25 bg-amber-500/8 text-amber-400">
                    Inst.
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Badge variant="outline" className={cn('text-[9px] font-medium px-1.5 h-5 border shrink-0', riskColor(protocol.riskLevel))}>
            {protocol.riskLevel}
          </Badge>
        </div>

        {/* Row 2: Price / TVL / Yield */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* TVL */}
          <div>
            <p className="text-[9px] text-muted-foreground/50 uppercase tracking-widest font-mono mb-0.5">TVL</p>
            <p className="text-xl font-semibold font-mono text-foreground leading-none">{formatTVL(protocol.tvl)}</p>
          </div>
          {/* Yield or Price */}
          {protocol.estimatedYield ? (
            <div className="text-right">
              <p className="text-[9px] text-muted-foreground/50 uppercase tracking-widest font-mono mb-0.5">Est. Yield</p>
              <p className="text-xl font-semibold font-mono text-emerald-400 leading-none">{protocol.estimatedYield.replace('~', '')}</p>
            </div>
          ) : displayPrice ? (
            <div className="text-right">
              <p className="text-[9px] text-muted-foreground/50 uppercase tracking-widest font-mono mb-0.5">Price</p>
              <p className="text-xl font-semibold font-mono text-foreground leading-none">{displayPrice}</p>
            </div>
          ) : null}
        </div>

        {/* Row 3: 7D change + price change */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className={cn(
              'text-xs font-mono font-medium',
              change7dPositive ? 'text-emerald-400' : 'text-rose-400'
            )}>
              {change7dPositive ? '↑' : '↓'} {formatChange(protocol.change7d)}
            </span>
            <span className="text-[9px] text-muted-foreground/40 font-mono">7D</span>
          </div>
          {protocol.priceChange24h != null && (
            <span className={cn('text-[10px] font-mono', changeColor(protocol.priceChange24h))}>
              {formatChange(protocol.priceChange24h)} 24h
            </span>
          )}
        </div>
      </div>

      <Separator className="opacity-30" />

      {/* Description */}
      <div className="px-5 py-3 flex-1">
        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{protocol.description}</p>
      </div>

      {/* Comparable + Role */}
      {(protocol.comparableAsset || protocol.portfolioRole) && (
        <>
          <Separator className="opacity-20" />
          <div className="px-5 py-3 space-y-1.5">
            {protocol.comparableAsset && (
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-muted-foreground/40 uppercase tracking-widest font-mono w-16 shrink-0">TradFi ≈</span>
                <span className="text-[11px] text-muted-foreground">{protocol.comparableAsset}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-muted-foreground/40 uppercase tracking-widest font-mono w-16 shrink-0">Role</span>
              <span className="text-[11px] text-amber-400/80 font-medium">{protocol.portfolioRole}</span>
            </div>
          </div>
        </>
      )}

      {/* Chains */}
      <div className="px-5 pb-3">
        <div className="flex flex-wrap gap-1">
          {protocol.chains.slice(0, 4).map((c) => (
            <span key={c} className="text-[9px] text-muted-foreground/50 bg-secondary/50 border border-border/30 px-1.5 py-0.5 rounded font-mono">
              {shortenChain(c)}
            </span>
          ))}
          {protocol.chains.length > 4 && (
            <span className="text-[9px] text-muted-foreground/30 px-1 py-0.5 font-mono">+{protocol.chains.length - 4}</span>
          )}
        </div>
      </div>

      <Separator className="opacity-30" />

      {/* Footer actions */}
      <div className="px-5 py-3 flex items-center justify-between gap-2">
        {onCompare && (
          <button
            onClick={() => onCompare(protocol.slug)}
            className={cn(
              'text-[10px] font-mono px-2.5 py-1 rounded border transition-colors',
              isSelected
                ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                : 'border-border/40 text-muted-foreground hover:border-amber-500/30 hover:text-amber-400/70'
            )}
          >
            {isSelected ? '✓ Selected' : '+ Compare'}
          </button>
        )}
        <Link
          href={`/protocol/${protocol.slug}`}
          className={cn(
            buttonVariants({ size: 'sm' }),
            'h-7 px-3 text-[11px] font-mono bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/35 ml-auto',
            '[background:none] [box-shadow:none]'
          )}
          style={{
            background: 'oklch(0.718 0.108 82 / 0.08)',
            borderColor: 'oklch(0.718 0.108 82 / 0.20)',
            color: 'oklch(0.718 0.108 82)',
          }}
        >
          Analyze →
        </Link>
      </div>
    </div>
  )
}
