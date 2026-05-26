export interface Protocol {
  name: string
  slug: string
  tvl: number
  change1d: number | null
  change7d: number | null
  chains: string[]
  logo?: string
}

export interface TVLPoint {
  date: number
  totalLiquidityUSD: number
}
