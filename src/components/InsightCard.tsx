import { Card, CardContent } from '@/components/ui/card'

const INSIGHTS = [
  {
    label: 'Growth',
    text: 'Tokenized treasury assets grew from ~$1.2B to over $4B in 2024 alone. BlackRock BUIDL hit $500M AUM within weeks of its March 2024 launch — the fastest-growing fund product on record.',
  },
  {
    label: 'Infra',
    text: "BUIDL expanded from Ethereum to 7 additional chains by Q4 2024, signalling institutional demand for chain-agnostic settlement. Multi-chain deployment is the new baseline, not a differentiator.",
  },
  {
    label: 'LatAm',
    text: 'LatAm processed $562B+ in on-chain value (Jul 2023–Jun 2024, Chainalysis) — structural demand from 650M+ people driven by inflation, capital controls, and broken FX infrastructure.',
  },
  {
    label: 'Yield',
    text: 'Private credit on-chain (Centrifuge, Maple) yields 800–1200bps over tokenized treasury equivalents — but with 10–30x higher liquidity risk and no SIPC protection. The yield premium is real; so is the risk.',
  },
  {
    label: 'Reg',
    text: 'MiCA went fully live in the EU in 2024. The GENIUS Act, introduced in 2025, would create a federal framework for US stablecoins — potentially unlocking bank-issued instruments on the same RWA rails.',
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
