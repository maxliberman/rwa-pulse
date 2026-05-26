import { Card, CardContent } from '@/components/ui/card'

const INSIGHTS = [
  {
    label: 'Growth',
    text: 'Tokenized Treasuries crossed $10B TVL in under 18 months — faster adoption than any bond ETF in history.',
  },
  {
    label: 'Infra',
    text: "BUIDL's 8-chain deployment signals institutional demand for chain-agnostic settlement infrastructure.",
  },
  {
    label: 'LatAm',
    text: 'LatAm stablecoin volumes correlate with domestic inflation — structural demand from 650M+ people, not speculation.',
  },
  {
    label: 'Yield',
    text: 'Private credit on-chain yields 200–400bps over tokenized treasury equivalents, with commensurate liquidity risk.',
  },
  {
    label: 'Reg',
    text: 'The GENIUS Act may unlock bank-issued stablecoins on the same rails as these RWA products — watch Circle and JPMorgan Onyx.',
  },
]

const ACCENT_COLORS = [
  'border-l-violet-500/50 bg-violet-500/3',
  'border-l-amber-500/50 bg-amber-500/3',
  'border-l-emerald-500/50 bg-emerald-500/3',
  'border-l-sky-500/50 bg-sky-500/3',
  'border-l-rose-500/50 bg-rose-500/3',
]

const LABEL_COLORS = [
  'text-violet-400',
  'text-amber-400',
  'text-emerald-400',
  'text-sky-400',
  'text-rose-400',
]

export default function InsightCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {INSIGHTS.map((insight, i) => (
        <Card key={i} className={`bg-card border-border/60 border-l-2 ${ACCENT_COLORS[i]} transition-all duration-200 hover:border-border`}>
          <CardContent className="p-4">
            <p className={`text-[10px] font-mono uppercase tracking-widest mb-2 ${LABEL_COLORS[i]}`}>
              {insight.label}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">{insight.text}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
