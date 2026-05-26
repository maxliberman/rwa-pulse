import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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
  if (value == null) return 'text-muted-foreground'
  if (value > 0) return 'text-emerald-400'
  if (value < 0) return 'text-rose-400'
  return 'text-muted-foreground'
}

export function shortenChain(chain: string): string {
  const map: Record<string, string> = {
    Ethereum: 'ETH', Solana: 'SOL', Polygon: 'MATIC', Avalanche: 'AVAX',
    Arbitrum: 'ARB', Optimism: 'OP', Binance: 'BSC', Base: 'BASE',
    Stellar: 'XLM', Aptos: 'APT', Sui: 'SUI', Ripple: 'XRP', Mantle: 'MNT',
  }
  return map[chain] ?? chain.slice(0, 4).toUpperCase()
}

export function riskColor(level: 'Low' | 'Medium' | 'High'): string {
  if (level === 'Low') return 'text-emerald-400 bg-emerald-400/8 border-emerald-400/20'
  if (level === 'Medium') return 'text-amber-400 bg-amber-400/8 border-amber-400/20'
  return 'text-rose-400 bg-rose-400/8 border-rose-400/20'
}

export function riskBarColor(score: number): string {
  if (score <= 30) return 'bg-emerald-500'
  if (score <= 60) return 'bg-amber-500'
  return 'bg-rose-500'
}

export function categoryColor(category: string): string {
  const map: Record<string, string> = {
    Treasury: 'text-violet-300 bg-violet-500/10 border-violet-500/25',
    Gold: 'text-amber-300 bg-amber-500/10 border-amber-500/25',
    'Private Debt': 'text-rose-300 bg-rose-500/10 border-rose-500/25',
    'Stable Yield': 'text-sky-300 bg-sky-500/10 border-sky-500/25',
    Credit: 'text-orange-300 bg-orange-500/10 border-orange-500/25',
    'Real Estate': 'text-teal-300 bg-teal-500/10 border-teal-500/25',
    RWA: 'text-slate-300 bg-slate-500/10 border-slate-500/25',
  }
  return map[category] ?? 'text-slate-300 bg-slate-500/10 border-slate-500/25'
}

export function formatPrice(price: number | undefined): string {
  if (price == null) return '—'
  if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  if (price >= 1) return `$${price.toFixed(2)}`
  return `$${price.toFixed(4)}`
}
