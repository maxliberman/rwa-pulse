interface CoinGeckoPrice {
  usd: number
  usd_24h_change: number
  usd_market_cap?: number
}

type PriceMap = Record<string, CoinGeckoPrice>

export async function fetchCoinGeckoPrices(ids: string[]): Promise<PriceMap> {
  if (!ids.length) return {}
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`
    const res = await fetch(url, { next: { revalidate: 300 } })
    if (!res.ok) return {}
    return res.json()
  } catch {
    return {}
  }
}

export function formatPrice(price: number | undefined): string {
  if (price == null) return '—'
  if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  if (price >= 1) return `$${price.toFixed(2)}`
  return `$${price.toFixed(4)}`
}
