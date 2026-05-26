import { NextResponse } from 'next/server'
import { Protocol } from '@/lib/types'

export async function GET() {
  const res = await fetch('https://api.llama.fi/protocols', {
    next: { revalidate: 3600 },
  })
  const data = await res.json()

  const protocols: Protocol[] = data
    .filter((p: Record<string, unknown>) => p.category === 'RWA')
    .map((p: Record<string, unknown>) => ({
      name: p.name,
      slug: p.slug,
      tvl: p.tvl ?? 0,
      change1d: p.change_1d ?? null,
      change7d: p.change_7d ?? null,
      chains: Array.isArray(p.chains) ? p.chains : [],
      logo: p.logo ?? null,
    }))
    .sort((a: Protocol, b: Protocol) => b.tvl - a.tvl)

  return NextResponse.json(protocols)
}
