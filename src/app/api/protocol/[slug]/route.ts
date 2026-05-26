import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const res = await fetch(`https://api.llama.fi/protocol/${slug}`, {
    next: { revalidate: 3600 },
  })
  const data = await res.json()

  const tvlHistory = (data.tvl ?? [])
    .map((pt: { date: number; totalLiquidityUSD: number }) => ({
      date: pt.date,
      totalLiquidityUSD: pt.totalLiquidityUSD,
    }))

  return NextResponse.json({ name: data.name, tvlHistory })
}
