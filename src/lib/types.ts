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

export interface ProtocolRisks {
  smartContract: number  // 0-100
  custody: number
  liquidity: number
  duration: number
  regulatory: number
}

export interface EnrichedProtocol extends Protocol {
  category: string
  assetType: string
  description: string
  portfolioRole: string
  riskLevel: 'Low' | 'Medium' | 'High'
  estimatedYield?: string
  institutionalGrade: boolean
  tags: string[]
  risks: ProtocolRisks
  issuer?: string
  underlying?: string
  price?: number
  nav?: number
  priceChange24h?: number | null
  marketCap?: number | null
}
