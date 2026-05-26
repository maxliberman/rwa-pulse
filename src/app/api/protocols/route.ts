import { NextResponse } from 'next/server'
import { EnrichedProtocol, Protocol } from '@/lib/types'
import { getMetadata } from '@/lib/metadata'
import { fetchCoinGeckoPrices } from '@/lib/pricing'

export async function GET() {
  const res = await fetch('https://api.llama.fi/protocols', { next: { revalidate: 3600 } })
  const data = await res.json()

  const raw: Protocol[] = data
    .filter((p: Record<string, unknown>) => p.category === 'RWA')
    .map((p: Record<string, unknown>) => ({
      name: p.name, slug: p.slug, tvl: p.tvl ?? 0,
      change1d: p.change_1d ?? null, change7d: p.change_7d ?? null,
      chains: Array.isArray(p.chains) ? p.chains : [],
      logo: p.logo ?? null,
    }))
    .sort((a: Protocol, b: Protocol) => b.tvl - a.tvl)

  // Collect CoinGecko IDs that exist
  const cgIds = raw.map((p) => getMetadata(p.slug).coingeckoId).filter(Boolean) as string[]
  const prices = await fetchCoinGeckoPrices(cgIds)

  const enriched: EnrichedProtocol[] = raw.map((p) => {
    const meta = getMetadata(p.slug)
    const cgData = meta.coingeckoId ? prices[meta.coingeckoId] : null
    return {
      ...p, ...meta,
      price: cgData?.usd ?? meta.nav,
      nav: meta.nav,
      priceChange24h: cgData?.usd_24h_change ?? null,
      marketCap: cgData?.usd_market_cap ?? null,
    }
  })

  return NextResponse.json(enriched)
}
