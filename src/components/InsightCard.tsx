const INSIGHTS = [
  { icon: '📈', text: 'Tokenized Treasuries crossed $10B TVL in under 18 months — faster adoption than any bond ETF in history.' },
  { icon: '🏦', text: 'BUIDL\'s 8-chain deployment signals institutional demand for chain-agnostic settlement infrastructure.' },
  { icon: '🌎', text: 'LatAm stablecoin volumes correlate with domestic inflation — structural demand from 650M+ people, not speculation.' },
  { icon: '💰', text: 'Private credit on-chain yields 200–400bps over tokenized treasury equivalents, with commensurate liquidity risk.' },
  { icon: '⚖️', text: 'The GENIUS Act may unlock bank-issued stablecoins on the same rails as these RWA products — watch Circle and JPMorgan Onyx.' },
]

export default function InsightCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {INSIGHTS.map((insight, i) => (
        <div key={i} className="bg-[#0A0A14] border border-[#1C1C2E] rounded-xl px-4 py-3.5 flex gap-3 items-start">
          <span className="text-lg shrink-0 mt-0.5">{insight.icon}</span>
          <p className="text-xs text-slate-400 leading-relaxed">{insight.text}</p>
        </div>
      ))}
    </div>
  )
}
