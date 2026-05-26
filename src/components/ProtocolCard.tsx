import Link from 'next/link'
import Image from 'next/image'
import { EnrichedProtocol } from '@/lib/types'
import { formatTVL, formatChange, changeColor, shortenChain, riskColor, categoryColor, formatPrice, cn } from '@/lib/utils'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { buttonVariants } from '@/components/ui/button'

export default function ProtocolCard({ protocol, rank }: { protocol: EnrichedProtocol; rank: number }) {
  const displayPrice = protocol.price != null
    ? formatPrice(protocol.price)
    : protocol.nav ? `$${protocol.nav.toFixed(2)}` : null

  return (
    <Card className="bg-card border-border/60 flex flex-col overflow-hidden transition-all duration-200 hover:border-border hover:shadow-lg hover:shadow-primary/5 group">
      <CardHeader className="p-5 pb-4 space-y-0">
        {/* Top row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-muted-foreground/40 font-mono tabular-nums w-5 shrink-0">
              #{rank}
            </span>
            {protocol.logo ? (
              <div className="relative shrink-0">
                <Image src={protocol.logo} alt={protocol.name} width={36} height={36}
                  className="rounded-xl" unoptimized />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-sm font-bold text-muted-foreground shrink-0">
                {protocol.name[0]}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-sm text-foreground leading-tight truncate">{protocol.name}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Badge variant="outline" className={cn('text-[10px] font-medium px-1.5 h-4 border', categoryColor(protocol.category))}>
                  {protocol.category}
                </Badge>
                {protocol.institutionalGrade && (
                  <Badge variant="outline" className="text-[10px] px-1.5 h-4 border-amber-500/25 bg-amber-500/8 text-amber-400">
                    Inst.
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Badge variant="outline" className={cn('text-[10px] font-medium px-2 h-5 border shrink-0', riskColor(protocol.riskLevel))}>
            {protocol.riskLevel}
          </Badge>
        </div>

        {/* Price / NAV */}
        {displayPrice && (
          <div className="flex items-baseline justify-between mb-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold font-mono text-foreground">{displayPrice}</span>
              {protocol.priceChange24h != null ? (
                <span className={cn('text-xs font-mono', changeColor(protocol.priceChange24h))}>
                  {formatChange(protocol.priceChange24h)}
                </span>
              ) : (
                <span className="text-[11px] text-muted-foreground/50 font-mono">Stable NAV</span>
              )}
            </div>
          </div>
        )}

        {/* TVL + Yield */}
        <div className="flex items-center gap-4 py-3">
          <div className="flex-1">
            <p className="text-lg font-semibold font-mono text-foreground">{formatTVL(protocol.tvl)}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">TVL</p>
          </div>
          {protocol.estimatedYield && (
            <>
              <Separator orientation="vertical" className="h-8" />
              <div className="flex-1">
                <p className="text-lg font-semibold font-mono text-emerald-400">{protocol.estimatedYield}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Est. Yield</p>
              </div>
            </>
          )}
          <Separator orientation="vertical" className="h-8" />
          <div className="text-right">
            <p className={cn('text-sm font-mono font-medium', changeColor(protocol.change7d))}>
              {formatChange(protocol.change7d)}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">7D</p>
          </div>
        </div>

        {/* Chains */}
        <div className="flex flex-wrap gap-1">
          {protocol.chains.slice(0, 5).map((c) => (
            <span key={c} className="text-[10px] text-muted-foreground bg-secondary/60 border border-border/40 px-1.5 py-0.5 rounded-md font-mono">
              {shortenChain(c)}
            </span>
          ))}
          {protocol.chains.length > 5 && (
            <span className="text-[10px] text-muted-foreground/50 px-1 py-0.5">
              +{protocol.chains.length - 5}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-4 flex-1">
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{protocol.description}</p>
      </CardContent>

      <Separator className="opacity-50" />

      <CardFooter className="px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">Role</span>
          <span className="text-xs text-violet-300 font-medium">{protocol.portfolioRole}</span>
        </div>
        <Link href={`/protocol/${protocol.slug}`} className={cn(buttonVariants({ variant: 'default', size: 'sm' }), 'h-7 px-3 text-xs bg-primary hover:bg-primary/90')}>
          Analyze →
        </Link>
      </CardFooter>
    </Card>
  )
}
