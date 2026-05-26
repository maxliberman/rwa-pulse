import Link from 'next/link'
import Image from 'next/image'
import { EnrichedProtocol } from '@/lib/types'
import { formatTVL, formatChange, changeColor, shortenChain, riskColor, categoryColor, formatPrice } from '@/lib/utils'

export default function ProtocolCard({ protocol, rank }: { protocol: EnrichedProtocol; rank: number }) {
  const displayPrice = protocol.price != null ? formatPrice(protocol.price) : (protocol.nav ? `$${protocol.nav.toFixed(2)} NAV` : null)

  return (
    <div className="bg-[#0E0E1C] border border-[#1C1C2E] rounded-xl overflow-hidden card-glow transition-all duration-200 flex flex-col">
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-600 font-mono w-4 shrink-0">#{rank}</span>
            {protocol.logo ? (
              <Image src={protocol.logo} alt={protocol.name} width={36} height={36} className="rounded-full shrink-0" unoptimized />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#1C1C2E] flex items-center justify-center text-sm font-bold text-slate-400 shrink-0">
                {protocol.name[0]}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-sm text-white leading-tight truncate">{protocol.name}</p>
              <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded border mt-1 ${categoryColor(protocol.category)}`}>
                {protocol.category}
              </span>
            </div>
          </div>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded border shrink-0 ${riskColor(protocol.riskLevel)}`}>
            {protocol.riskLevel}
          </span>
        </div>

        {/* Price / NAV */}
        {displayPrice && (
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-xl font-semibold text-white font-mono">{displayPrice}</span>
            {protocol.priceChange24h != null ? (
              <span className={`text-xs font-mono ${changeColor(protocol.priceChange24h)}`}>
                {formatChange(protocol.priceChange24h)} 24h
              </span>
            ) : (
              <span className="text-xs text-slate-600">Stable NAV</span>
            )}
          </div>
        )}

        {/* TVL + Yield row */}
        <div className="flex items-center gap-4 mb-3">
          <div>
            <p className="text-lg font-semibold text-white">{formatTVL(protocol.tvl)}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">TVL</p>
          </div>
          {protocol.estimatedYield && (
            <div className="border-l border-[#1C1C2E] pl-4">
              <p className="text-lg font-semibold text-emerald-400">{protocol.estimatedYield}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Est. Yield</p>
            </div>
          )}
          <div className="border-l border-[#1C1C2E] pl-4 ml-auto text-right">
            <p className={`text-sm font-mono ${changeColor(protocol.change7d)}`}>{formatChange(protocol.change7d)}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">7d</p>
          </div>
        </div>

        {/* Chains */}
        <div className="flex flex-wrap gap-1 mb-3">
          {protocol.chains.slice(0, 5).map((c) => (
            <span key={c} className="text-[10px] text-slate-500 bg-[#13131F] border border-[#1C1C2E] px-1.5 py-0.5 rounded font-mono">
              {shortenChain(c)}
            </span>
          ))}
          {protocol.chains.length > 5 && (
            <span className="text-[10px] text-slate-600 px-1.5 py-0.5">+{protocol.chains.length - 5}</span>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="px-5 pb-3 flex-1">
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{protocol.description}</p>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-[#1C1C2E] flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-600 uppercase tracking-wider mr-1">Role</span>
          <span className="text-xs text-violet-300 font-medium">{protocol.portfolioRole}</span>
          {protocol.institutionalGrade && (
            <span className="ml-2 text-[10px] text-amber-400/70 border border-amber-400/20 px-1.5 py-0.5 rounded">
              Inst. Grade
            </span>
          )}
        </div>
        <Link
          href={`/protocol/${protocol.slug}`}
          className="text-xs text-white bg-violet-600 hover:bg-violet-500 transition-colors px-3 py-1.5 rounded-lg font-medium"
        >
          Analyze →
        </Link>
      </div>
    </div>
  )
}
