import { Protocol } from '@/lib/types'
import { formatTVL, formatChange, changeColor, shortenChain } from '@/lib/utils'
import Image from 'next/image'

export default function ProtocolCard({ protocol, rank }: { protocol: Protocol; rank: number }) {
  return (
    <div className="bg-[#0E0E1C] border border-[#1C1C2E] rounded-xl p-5 hover:border-[#2A2A40] transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-600 font-mono w-4">#{rank}</span>
          {protocol.logo ? (
            <Image
              src={protocol.logo}
              alt={protocol.name}
              width={32}
              height={32}
              className="rounded-full"
              unoptimized
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#1C1C2E] flex items-center justify-center text-xs font-bold text-slate-400">
              {protocol.name[0]}
            </div>
          )}
          <div>
            <p className="font-medium text-sm text-white leading-tight">{protocol.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{protocol.chains.slice(0, 3).map(shortenChain).join(' · ')}</p>
          </div>
        </div>
        <span
          className={`text-xs font-mono font-medium ${changeColor(protocol.change7d)}`}
        >
          {formatChange(protocol.change7d)} 7d
        </span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-semibold text-white">{formatTVL(protocol.tvl)}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total Value Locked</p>
        </div>
        <div className="text-right">
          <p className={`text-sm font-mono ${changeColor(protocol.change1d)}`}>
            {formatChange(protocol.change1d)}
          </p>
          <p className="text-xs text-slate-500">24h</p>
        </div>
      </div>
    </div>
  )
}
