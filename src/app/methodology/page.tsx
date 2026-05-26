import Link from 'next/link'

const RISK_DIMENSIONS = [
  {
    name: 'Smart Contract Risk',
    score_low: '0–30',
    score_med: '31–60',
    score_high: '61–100',
    what: 'Likelihood of a code exploit, logic bug, or upgrade mechanism failure in the protocol\'s on-chain infrastructure.',
    how: [
      'Audit history: number of audits, auditor reputation (Trail of Bits, OpenZeppelin, Certik), recency',
      'Time since deployment (battle-tested vs. new code)',
      'Contract upgradeability — proxy patterns increase attack surface',
      'Total value secured relative to bug bounty size',
      'Historical exploits in similar protocol architectures',
    ],
    sources: 'DeFiLlama security data, public audit reports (Spearbit, Trail of Bits, etc.), protocol documentation',
    examples: 'BUIDL scores 20 — deployed by Securitize with institutional-grade audits, minimal on-chain logic. Centrifuge scores 50 — complex multi-tranche architecture with more surface area.',
  },
  {
    name: 'Custody Risk',
    score_low: '0–30',
    score_med: '31–60',
    score_high: '61–100',
    what: 'Risk of loss arising from the failure, fraud, or mismanagement of the off-chain custodian holding the underlying assets.',
    how: [
      'Custodian regulatory status (NYDFS, SEC-registered, state-chartered)',
      'Geographic jurisdiction and bankruptcy remoteness',
      'Insurance coverage (SIPC, private, none)',
      'Custodian concentration — single vs. multi-custodian',
      'Redemption mechanism and legal enforceability',
    ],
    sources: 'Custodian public disclosures, regulatory filings, protocol terms of service, fund prospectus',
    examples: 'PAXG scores 25 — Paxos is NYDFS-regulated, Brinks vaults, strong legal framework. Tether Gold scores 40 — less regulatory clarity, Tether issuer risk.',
  },
  {
    name: 'Liquidity Risk',
    score_low: '0–30',
    score_med: '31–60',
    score_high: '61–100',
    what: 'Difficulty of exiting a position at fair value, especially under market stress or large redemption pressure.',
    how: [
      'On-chain secondary market depth (DEX liquidity, order book depth)',
      'Redemption period — T+0 vs. T+5 vs. lock-up periods',
      'Underlying asset liquidity (T-Bills vs. private loans)',
      'TVL concentration — top-10 holder percentage',
      'Historical redemption processing during stress events',
    ],
    sources: 'DeFiLlama on-chain data, DEX liquidity APIs, protocol redemption documentation',
    examples: 'Treasury products score 20–30 — daily liquidity in underlying T-Bills. Centrifuge private loans score 70 — illiquid underlying, no guaranteed exit.',
  },
  {
    name: 'Duration Risk',
    score_low: '0–15',
    score_med: '16–40',
    score_high: '41–100',
    what: 'Sensitivity of the asset\'s NAV to interest rate changes, measured by weighted average maturity of underlying holdings.',
    how: [
      'Weighted Average Maturity (WAM) of the underlying portfolio',
      'Fixed vs. floating rate exposure',
      'DV01 (dollar value of 1bp move) relative to fund size',
      'Reinvestment risk in falling rate environments',
      'Convexity adjustments for longer-duration assets',
    ],
    sources: 'Protocol documentation, underlying fund prospectus (e.g., iShares SHY factsheet), public fund filings',
    examples: 'BUIDL scores 10 — overnight/short T-Bills, near-zero duration. Ondo OUSG scores 15 — SHY ETF, ~1.8yr duration. Private credit scores 60 — multi-year loan maturities.',
  },
  {
    name: 'Regulatory Risk',
    score_low: '0–25',
    score_med: '26–50',
    score_high: '51–100',
    what: 'Exposure to adverse regulatory action, legal uncertainty, or policy changes that could impair the asset\'s operability or legal standing.',
    how: [
      'Regulatory registration status (SEC Investment Adviser, NYDFS, MiCA)',
      'Asset classification risk — security vs. commodity vs. stablecoin',
      'Pending legislation exposure (GENIUS Act, FIT21, MiCA)',
      'Issuer jurisdiction and cross-border enforcement risk',
      'Historical SEC/CFTC enforcement in similar product categories',
    ],
    sources: 'SEC/CFTC public enforcement database, Congressional Record, EU MiCA text, protocol legal disclosures',
    examples: 'BUIDL scores 20 — SEC-registered fund, clear legal structure. Unregulated DeFi credit protocols score 50+ — significant grey area under current US law.',
  },
]

const DATA_SOURCES = [
  {
    name: 'DeFiLlama',
    url: 'https://defillama.com',
    logo: '📊',
    what: 'Total Value Locked (TVL), historical TVL data, protocol categorization, chain deployment data',
    how: 'All TVL figures are fetched in real-time from DeFiLlama\'s public API (api.llama.fi). Data refreshes every hour via Next.js ISR. DeFiLlama aggregates on-chain data directly from protocol smart contracts.',
    coverage: 'All RWA protocols on the dashboard',
    latency: 'Hourly refresh via ISR',
  },
  {
    name: 'CoinGecko',
    url: 'https://coingecko.com',
    logo: '🦎',
    what: 'Live market prices, 24h price change, market capitalization for tradeable RWA tokens',
    how: 'Used for XAUT (Tether Gold) and PAXG (Paxos Gold) live market prices via the CoinGecko free API. Most treasury RWA products (BUIDL, OUSG) are not openly tradeable and use estimated NAV instead.',
    coverage: 'Tradeable commodity-backed tokens (XAUT, PAXG)',
    latency: '5-minute refresh',
  },
  {
    name: 'Chainalysis',
    url: 'https://chainalysis.com',
    logo: '🔍',
    what: 'LatAm crypto adoption data, stablecoin volume by country, global crypto adoption index rankings',
    how: 'Data cited in the LatAm Lens section is sourced from Chainalysis\'s Geography of Crypto 2024 report, the most comprehensive public dataset on regional crypto adoption. Used as static reference data.',
    coverage: 'LatAm Lens section only',
    latency: 'Annual report (static data)',
  },
  {
    name: 'Manual Curation',
    url: '',
    logo: '📋',
    what: 'Risk scores, institutional descriptions, portfolio roles, yield estimates, asset metadata',
    how: 'Institutional descriptions, risk scores, and yield estimates are manually curated from primary sources: protocol documentation, fund prospectuses, audit reports, and public regulatory filings. Reviewed and updated periodically.',
    coverage: 'All asset metadata, risk analysis',
    latency: 'Manual periodic updates',
  },
]

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-1">{title}</h2>
      {sub && <p className="text-sm text-slate-500 mb-6">{sub}</p>}
      {children}
    </div>
  )
}

export default function MethodologyPage() {
  return (
    <div className="max-w-4xl space-y-14">
      {/* Hero */}
      <div className="pt-8">
        <div className="flex items-center gap-2 mb-3">
          <Link href="/" className="text-xs text-slate-500 hover:text-white transition-colors">Dashboard</Link>
          <span className="text-slate-700">/</span>
          <span className="text-xs text-slate-300">Methodology</span>
        </div>
        <h1 className="text-4xl font-semibold text-white mb-3 tracking-tight">Data Sources &amp; Risk Methodology</h1>
        <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
          Full transparency on where data comes from, how risk scores are calculated, and what the numbers mean for institutional allocators.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5">
        <p className="text-sm text-amber-300/80 leading-relaxed">
          <span className="font-semibold text-amber-300">Disclaimer:</span> All content on RWA Pulse is for informational and educational purposes only. Risk scores are indicative and do not constitute investment advice, financial recommendations, or an offer to buy or sell any security. Always conduct independent due diligence before making any investment decision.
        </p>
      </div>

      {/* Data sources */}
      <Section title="Data Sources" sub="Where every number on this platform comes from.">
        <div className="space-y-4">
          {DATA_SOURCES.map((src) => (
            <div key={src.name} className="bg-[#0E0E1C] border border-[#1C1C2E] rounded-xl p-6">
              <div className="flex items-start gap-4">
                <span className="text-2xl shrink-0">{src.logo}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-white">{src.name}</h3>
                    {src.url && (
                      <a href={src.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-violet-400 hover:text-violet-300">
                        {src.url.replace('https://', '')} ↗
                      </a>
                    )}
                    <span className="text-xs text-slate-600 ml-auto font-mono">{src.latency}</span>
                  </div>
                  <p className="text-sm text-amber-300/80 mb-2 font-medium">What: {src.what}</p>
                  <p className="text-sm text-slate-400 leading-relaxed mb-3">{src.how}</p>
                  <p className="text-xs text-slate-600">Coverage: {src.coverage}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Yield estimates */}
      <Section title="Yield Estimates" sub="How we estimate APY for tokenized RWA products.">
        <div className="bg-[#0E0E1C] border border-[#1C1C2E] rounded-xl p-6 space-y-4 text-sm text-slate-400 leading-relaxed">
          <p>
            Yield estimates for tokenized treasury products (BUIDL, OUSG, USYC, Spiko) are derived from the underlying instruments — primarily the Federal Funds Rate or the 1-3 month US Treasury Bill yield, minus management fees disclosed in fund documentation.
          </p>
          <p>
            For private credit protocols (Centrifuge), yield ranges reflect historical pool-level data aggregated by the protocol and disclosed in their public documentation. These yields are inherently variable and depend on borrower performance.
          </p>
          <p>
            Commodity-backed tokens (XAUT, PAXG) show no yield — gold does not generate income. Price appreciation is determined by spot gold market dynamics.
          </p>
          <div className="bg-[#0A0A14] border border-[#1C1C2E] rounded-lg p-4">
            <p className="text-xs text-slate-500">
              <span className="text-slate-300 font-medium">Primary sources:</span> Protocol fund prospectuses, EDGAR filings (Franklin Templeton, BlackRock), public rate data (FRED, US Treasury), protocol documentation pages.
            </p>
          </div>
        </div>
      </Section>

      {/* Risk framework */}
      <Section
        title="Risk Scoring Framework"
        sub="Each asset is scored across 5 dimensions on a 0–100 scale. Lower is better. Scores are manually assigned based on primary source research and updated periodically."
      >
        <div className="space-y-6">
          {RISK_DIMENSIONS.map((dim, i) => (
            <div key={i} className="bg-[#0E0E1C] border border-[#1C1C2E] rounded-xl p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-white text-base">{dim.name}</h3>
                <div className="flex gap-2 text-xs shrink-0">
                  <span className="text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded">Low {dim.score_low}</span>
                  <span className="text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded">Med {dim.score_med}</span>
                  <span className="text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded">High {dim.score_high}</span>
                </div>
              </div>
              <p className="text-sm text-slate-300 mb-4 leading-relaxed">{dim.what}</p>
              <div className="mb-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Scoring factors</p>
                <ul className="space-y-1.5">
                  {dim.how.map((h, j) => (
                    <li key={j} className="text-sm text-slate-400 flex items-start gap-2">
                      <span className="text-violet-500 shrink-0 mt-0.5">·</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-[#1C1C2E] pt-4 space-y-2">
                <p className="text-xs text-slate-500">
                  <span className="text-slate-400 font-medium">Sources: </span>{dim.sources}
                </p>
                <p className="text-xs text-slate-500">
                  <span className="text-slate-400 font-medium">Example: </span>{dim.examples}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Composite risk */}
      <Section title="Composite Risk Level" sub="How Low / Medium / High is assigned.">
        <div className="bg-[#0E0E1C] border border-[#1C1C2E] rounded-xl p-6 text-sm text-slate-400 leading-relaxed space-y-4">
          <p>
            The overall risk level badge (Low / Medium / High) is derived from a weighted average of the 5 dimension scores:
          </p>
          <div className="bg-[#0A0A14] border border-[#1C1C2E] rounded-lg p-4 font-mono text-xs text-slate-400 space-y-1">
            <p>Composite = (SmartContract × 0.25) + (Custody × 0.25) + (Liquidity × 0.20) + (Duration × 0.15) + (Regulatory × 0.15)</p>
            <p className="text-slate-600 mt-2">Low: composite ≤ 30 · Medium: 31–55 · High: &gt; 55</p>
          </div>
          <p>
            Smart Contract and Custody carry the highest weight (25% each) because they represent the most common sources of total loss in tokenized asset products. Liquidity risk (20%) reflects the practical ability to exit. Duration and Regulatory risk (15% each) are important but typically do not cause immediate capital loss.
          </p>
        </div>
      </Section>

      {/* Limitations */}
      <Section title="Limitations & Coverage Gaps">
        <div className="bg-[#0E0E1C] border border-[#1C1C2E] rounded-xl p-6 space-y-3">
          {[
            'Risk scores reflect conditions at time of last manual review and may not capture recent protocol changes, audits, or regulatory developments.',
            'Yield estimates are approximations based on publicly available fund documentation. Actual yield depends on fee structures, deployment timing, and market rates.',
            'TVL data from DeFiLlama may differ from protocol-reported AUM due to differences in how multi-chain deployments are counted.',
            'Protocols without DeFiLlama entries or insufficient public documentation are not covered. Coverage expands as the RWA ecosystem grows.',
            'This platform does not have access to proprietary data, non-public fund filings, or real-time redemption data.',
          ].map((lim, i) => (
            <div key={i} className="flex items-start gap-3 text-sm text-slate-400">
              <span className="text-slate-600 shrink-0 font-mono mt-0.5">{i + 1}.</span>
              {lim}
            </div>
          ))}
        </div>
      </Section>

      <div className="border-t border-[#1C1C2E] pt-6 pb-4">
        <p className="text-xs text-slate-600">
          Questions or corrections? Open an issue at{' '}
          <a href="https://github.com/maxliberman/rwa-pulse" target="_blank" rel="noopener noreferrer"
            className="text-violet-400 hover:text-violet-300">
            github.com/maxliberman/rwa-pulse
          </a>
        </p>
      </div>
    </div>
  )
}
