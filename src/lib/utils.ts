export function formatTVL(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  return `$${value.toLocaleString()}`
}

export function formatChange(value: number | null | undefined): string {
  if (value == null) return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function changeColor(value: number | null | undefined): string {
  if (value == null) return 'text-slate-500'
  if (value > 0) return 'text-emerald-400'
  if (value < 0) return 'text-red-400'
  return 'text-slate-500'
}

export function shortenChain(chain: string): string {
  const map: Record<string, string> = {
    Ethereum: 'ETH',
    Solana: 'SOL',
    Polygon: 'MATIC',
    Avalanche: 'AVAX',
    Arbitrum: 'ARB',
    Optimism: 'OP',
    Binance: 'BSC',
    Base: 'BASE',
    Stellar: 'XLM',
    Aptos: 'APT',
    Sui: 'SUI',
    Ripple: 'XRP',
    Mantle: 'MNT',
  }
  return map[chain] ?? chain.slice(0, 4).toUpperCase()
}
