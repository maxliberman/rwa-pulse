import { ProtocolRisks } from '@/lib/types'
import { riskBarColor } from '@/lib/utils'

const RISK_LABELS: { key: keyof ProtocolRisks; label: string; desc: string }[] = [
  { key: 'smartContract', label: 'Smart Contract', desc: 'Probability of code exploit or bug' },
  { key: 'custody', label: 'Custody', desc: 'Risk of custodian failure or mismanagement' },
  { key: 'liquidity', label: 'Liquidity', desc: 'Exit risk under stress scenarios' },
  { key: 'duration', label: 'Duration', desc: 'Sensitivity to interest rate changes' },
  { key: 'regulatory', label: 'Regulatory', desc: 'Exposure to policy change or enforcement' },
]

export default function RiskBars({ risks }: { risks: ProtocolRisks }) {
  return (
    <div className="space-y-4">
      {RISK_LABELS.map(({ key, label, desc }) => {
        const score = risks[key]
        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <span className="text-sm text-slate-300 font-medium">{label}</span>
                <span className="text-xs text-slate-600 ml-2">{desc}</span>
              </div>
              <span className="text-xs font-mono text-slate-400">{score}/100</span>
            </div>
            <div className="h-1.5 bg-[#1C1C2E] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${riskBarColor(score)}`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
