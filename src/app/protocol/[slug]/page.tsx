import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EnrichedProtocol, Protocol } from '@/lib/types'
import { getMetadata } from '@/lib/metadata'
import { fetchCoinGeckoPrices, formatPrice } from '@/lib/pricing'
import { formatTVL, formatChange, changeColor, riskColor, categoryColor, shortenChain } from '@/lib/utils'
import HistoricalChart from '@/components/HistoricalChart'
import RiskBars from '@/components/RiskBars'

async function getProtocol(slug: string): Promise<EnrichedProtocol | null> {
  const res = await fetch('https://api.llama.fi/protocols', { next: { revalidate: 3600 } })
  const data = await res.json()
  const raw: Protocol | undefined = data.find(
    (p: Record<string, unknown>) => p.slug === slug && p.category === 'RWA'
  )
  if (!raw) return null

  const meta = getMetadata(slug)
  const prices = meta.coingeckoId ? await fetchCoinGeckoPrices([meta.coingeckoId]) : {}
  const cgData = meta.coingeckoId ? prices[meta.coingeckoId] : null

  return {
    name: raw.name, slug: raw.slug, tvl: (raw as unknown as Record<string, number>).tvl ?? 0,
    change1d: (raw as unknown as Record<string, number>).change_1d ?? null,
    change7d: (raw as unknown as Record<string, number>).change_7d ?? null,
    chains: Array.isArray((raw as unknown as Record<string, unknown>).chains) ? (raw as unknown as Record<string, string[]>).chains : [],
    logo: (raw as unknown as Record<string, string>).logo ?? undefined,
    ...meta,
    price: cgData?.usd ?? meta.nav,
    priceChange24h: cgData?.usd_24h_change ?? null,
    marketCap: cgData?.usd_market_cap ?? null,
  }
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-[#0A0A14] border border-[#1C1C2E] rounded-xl p-4">
      <p className="text-xs text-slate-500 uppercase tracking-widest mb-1.5">{label}</p>
      <p className="text-xl font-semibold font-mono text-white">{value}</p>
      {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
    </div>
  )
}

export default async function ProtocolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const protocol = await getProtocol(slug)
  if (!protocol) notFound()

  const displayPrice = protocol.price != null ? formatPrice(protocol.price) : (protocol.nav ? `$${protocol.nav.toFixed(2)}` : null)

  return (
    <div className="space-y-10 max-w-5xl">
      {/* Breadcrumb */}
      <div className="pt-8 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/" className="hover:text-white transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-slate-300">{protocol.name}</span>
      </div>

      {/* Hero */}
      <div className="bg-[#0E0E1C] border border-[#1C1C2E] rounded-2xl p-8">
        <div className="flex items-start gap-5 mb-6">
          {protocol.logo ? (
            <Image src={protocol.logo} alt={protocol.name} width={56} height={56} className="rounded-2xl" unoptimized />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-[#1C1C2E] flex items-center justify-center text-xl font-bold text-slate-400">
              {protocol.name[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-semibold text-white">{protocol.name}</h1>
              <span className={`text-xs font-medium px-2 py-0.5 rounded border ${categoryColor(protocol.category)}`}>
                {protocol.category}
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded border ${riskColor(protocol.riskLevel)}`}>
                {protocol.riskLevel} Risk
              </span>
              {protocol.institutionalGrade && (
                <span className="text-xs font-medium px-2 py-0.5 rounded border text-amber-400 bg-amber-400/10 border-amber-400/20">
                  Institutional Grade
                </span>
              )}
            </div>
            {protocol.issuer && <p className="text-sm text-slate-500">Issued by {protocol.issuer}</p>}
          </div>
        </div>

        {/* Price row */}
        <div className="flex flex-wrap items-end gap-6 mb-6">
          {displayPrice && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Price / NAV</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold font-mono text-white">{displayPrice}</span>
                {protocol.priceChange24h != null && (
                  <span className={`text-sm font-mono ${changeColor(protocol.priceChange24h)}`}>
                    {formatChange(protocol.priceChange24h)} 24h
                  </span>
                )}
              </div>
            </div>
          )}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">TVL</p>
            <span className="text-3xl font-semibold font-mono text-white">{formatTVL(protocol.tvl)}</span>
          </div>
          {protocol.estimatedYield && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Est. Yield</p>
              <span className="text-3xl font-semibold font-mono text-emerald-400">{protocol.estimatedYield}</span>
            </div>
          )}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">7d Change</p>
            <span className={`text-xl font-semibold font-mono ${changeColor(protocol.change7d)}`}>
              {formatChange(protocol.change7d)}
            </span>
          </div>
        </div>

        {/* Chains */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {protocol.chains.map((c) => (
            <span key={c} className="text-xs text-slate-400 bg-[#13131F] border border-[#1C1C2E] px-2 py-1 rounded-md font-mono">
              {shortenChain(c)}
            </span>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {protocol.tags.map((t) => (
            <span key={t} className="text-xs text-slate-500 border border-[#1C1C2E] px-2 py-0.5 rounded-full">{t}</span>
          ))}
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard label="TVL" value={formatTVL(protocol.tvl)} sub="Total Value Locked" />
        <MetricCard label="24h Change" value={formatChange(protocol.change1d)} />
        <MetricCard label="Portfolio Role" value={protocol.portfolioRole} />
        <MetricCard label="Asset Type" value={protocol.assetType.split(' ').slice(0, 2).join(' ')} sub={protocol.assetType} />
      </div>

      {/* About + Portfolio use case */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0E0E1C] border border-[#1C1C2E] rounded-xl p-6">
          <p className="text-xs text-slate-600 uppercase tracking-widest font-mono mb-1">Overview</p>
          <h2 className="text-base font-semibold text-white mb-3">About this Asset</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">{protocol.description}</p>
          {protocol.underlying && (
            <div className="border-t border-[#1C1C2E] pt-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Underlying Assets</p>
              <p className="text-sm text-slate-300">{protocol.underlying}</p>
            </div>
          )}
        </div>

        <div className="bg-[#0E0E1C] border border-violet-500/15 rounded-xl p-6">
          <p className="text-xs text-violet-400 uppercase tracking-widest font-mono mb-1">Strategy</p>
          <h2 className="text-base font-semibold text-white mb-3">Portfolio Use Case</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-violet-400 mt-0.5">→</span>
              <div>
                <p className="text-sm text-white font-medium">{protocol.portfolioRole}</p>
                <p className="text-xs text-slate-400 mt-0.5">Primary allocation function</p>
              </div>
            </div>
            {protocol.estimatedYield && (
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 mt-0.5">→</span>
                <div>
                  <p className="text-sm text-white font-medium">{protocol.estimatedYield} Estimated Annual Yield</p>
                  <p className="text-xs text-slate-400 mt-0.5">Yield accrual on deployed capital</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <span className="text-amber-400 mt-0.5">→</span>
              <div>
                <p className="text-sm text-white font-medium">
                  {protocol.riskLevel === 'Low' ? 'Capital preservation priority' :
                   protocol.riskLevel === 'Medium' ? 'Balanced risk-return tradeoff' :
                   'Enhanced yield with credit risk'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{protocol.riskLevel} risk classification</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-sky-400 mt-0.5">→</span>
              <div>
                <p className="text-sm text-white font-medium">{protocol.chains.length} chain{protocol.chains.length !== 1 ? 's' : ''} available</p>
                <p className="text-xs text-slate-400 mt-0.5">{protocol.chains.slice(0, 3).join(', ')}{protocol.chains.length > 3 ? ` +${protocol.chains.length - 3} more` : ''}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historical chart */}
      <div className="bg-[#0E0E1C] border border-[#1C1C2E] rounded-xl p-6">
        <p className="text-xs text-slate-600 uppercase tracking-widest font-mono mb-1">Performance</p>
        <h2 className="text-base font-semibold text-white mb-5">TVL History</h2>
        <HistoricalChart slug={protocol.slug} name={protocol.name} />
      </div>

      {/* Risk analysis */}
      <div className="bg-[#0E0E1C] border border-[#1C1C2E] rounded-xl p-6">
        <p className="text-xs text-slate-600 uppercase tracking-widest font-mono mb-1">Due Diligence</p>
        <h2 className="text-base font-semibold text-white mb-2">Risk Analysis</h2>
        <p className="text-xs text-slate-500 mb-6">Indicative risk scores for institutional due diligence. Not financial advice.</p>
        <RiskBars risks={protocol.risks} />
      </div>

      {/* Back */}
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors">
        ← Back to Dashboard
      </Link>
    </div>
  )
}
