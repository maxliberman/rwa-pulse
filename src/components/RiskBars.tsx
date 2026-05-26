import Link from 'next/link'
import { ProtocolRisks } from '@/lib/types'
import { riskBarColor } from '@/lib/utils'

const RISK_LABELS: { key: keyof ProtocolRisks; label: string; desc: string }[] = [
  { key: 'smartContract', label: 'Smart Contract', desc: 'Exploit or code vulnerability probability' },
  { key: 'custody', label: 'Custody', desc: 'Custodian failure or mismanagement risk' },
  { key: 'liquidity', label: 'Liquidity', desc: 'Exit difficulty under market stress' },
  { key: 'duration', label: 'Duration', desc: 'Sensitivity to interest rate changes' },
  { key: 'regulatory', label: 'Regulatory', desc: 'Policy change or enforcement exposure' },
]

function label(score: number) {
  if (score <= 30) return { text: 'Low', color: 'text-emerald-400' }
  if (score <= 60) return { text: 'Medium', color: 'text-amber-400' }
  return { text: 'High', color: 'text-red-400' }
}

export default function RiskBars({ risks }: { risks: ProtocolRisks }) {
  return (
    <div className="space-y-5">
      {RISK_LABELS.map(({ key, desc, label: labelText }) => {
        const score = risks[key]
        const { text, color } = label(score)
        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-300 font-medium">{labelText}</span>
                <span className="text-xs text-slate-600 hidden sm:inline">{desc}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-medium ${color}`}>{text}</span>
                <span className="text-xs font-mono text-slate-600">{score}/100</span>
              </div>
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
      <p className="text-xs text-slate-600 pt-2">
        Indicative scores for due diligence context. See full{' '}
        <Link href="/methodology" className="text-violet-400 hover:text-violet-300 underline">
          risk methodology
        </Link>
        .
      </p>
    </div>
  )
}
