'use client'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const countries = [
  {
    name: 'Argentina',
    flag: '🇦🇷',
    inflation: 117,
    adoptionScore: 94,
    globalRank: 15,
    remittance: 0,
    color: '#D97706',
    insight: "Capital controls ('cepo cambiario') cap legal FX at $200/month. USDT P2P volume is consistently top-3 globally. Even after Milei's reforms cut inflation from 211% (Dec 2023 peak) to 117% by end 2024, stablecoins remain the primary savings vehicle for millions.",
  },
  {
    name: 'Venezuela',
    flag: '🇻🇪',
    inflation: 100,
    adoptionScore: 88,
    globalRank: 10,
    remittance: 0,
    color: '#B45309',
    insight: 'USDT is de facto currency in everyday transactions. After hyperinflation of millions of percent in 2018–2020, the bolivar stabilised somewhat — 2024 inflation settled near 100% — but institutional trust in the currency is permanently broken. Crypto adoption is structural, not speculative.',
  },
  {
    name: 'Brazil',
    flag: '🇧🇷',
    inflation: 4.8,
    adoptionScore: 72,
    globalRank: 9,
    remittance: 0,
    color: '#78350F',
    insight: 'Largest crypto market in LatAm by volume. Nubank (100M+ users) integrated crypto. B3 launched tokenised equity pilots in 2024. PIX processed R$17T in 2024, creating a population accustomed to instant digital settlement.',
  },
  {
    name: 'Colombia',
    flag: '🇨🇴',
    inflation: 5.2,
    adoptionScore: 61,
    globalRank: 20,
    remittance: 10.5,
    color: '#92400E',
    insight: 'Inflation dropped sharply from 9.3% (2023) to 5.2% by end 2024, but peso volatility remains structurally high. Remittance inflows topped $10.5B in 2024, driving USDC corridor demand — Bitso and Stellar-based rails now handle a meaningful share.',
  },
  {
    name: 'Mexico',
    flag: '🇲🇽',
    inflation: 4.7,
    adoptionScore: 58,
    globalRank: 16,
    remittance: 67,
    color: '#78350F',
    insight: '$67B in annual remittances from the US — the largest bilateral corridor globally. Bitso + Ripple process $3B+/year. Stablecoin rails cost under 0.5% vs 5–8% on Western Union, settling in seconds rather than days.',
  },
]

const milestones = [
  { date: 'Mar 2024', event: 'BlackRock BUIDL launches on Ethereum via Securitize', tvl: 0.1 },
  { date: 'Apr 2024', event: 'BUIDL crosses $500M AUM — fastest fund growth in history', tvl: 0.5 },
  { date: 'Jul 2024', event: 'Ondo Finance expands OUSG to Solana & Aptos', tvl: 1.5 },
  { date: 'Oct 2024', event: 'BUIDL expands to 6 additional chains; total RWA TVL hits $4B', tvl: 4.0 },
  { date: 'Jan 2025', event: 'Franklin Templeton BENJI on 11 chains; Circle USYC passes $500M', tvl: 6.5 },
  { date: 'Mar 2025', event: 'GENIUS Act introduced in US Senate; MiCA fully live in EU', tvl: 9.2 },
  { date: 'May 2026', event: 'Total RWA TVL approaches $20B across 7 major protocols', tvl: 19.5 },
]

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: (typeof countries)[number] }> }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 text-sm shadow-xl shadow-black/40 max-w-xs">
      <p className="text-foreground font-medium">{d.flag} {d.name}</p>
      <p className="text-muted-foreground text-xs mt-1">Adoption score: <span className="text-amber-400">{d.adoptionScore}</span></p>
    </div>
  )
}

export default function LatamPage() {
  return (
    <div className="space-y-12 pt-10">
      {/* Hero */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <Badge variant="outline" className="text-[10px] border-violet-500/25 bg-violet-500/8 text-violet-400">
            Deep Analysis
          </Badge>
          <span className="text-[11px] text-muted-foreground font-mono tracking-widest">LatAm Lens</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight mb-4">
          Why LatAm is <span className="gradient-text">Ground Zero</span><br className="hidden sm:block" /> for Digital Assets
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
          In most markets, crypto is a speculative asset. In Latin America, it&apos;s infrastructure — the rational response to currency instability, capital controls, and broken cross-border payment rails. The on-chain data tells the structural story.
        </p>
      </section>

      {/* Key stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'LatAm crypto volume', value: '$562B+', sub: 'Jul 2023–Jun 2024 (Chainalysis)' },
          { label: 'Argentina USDT rank', value: 'Top 3', sub: 'Global P2P volume, Chainalysis 2024' },
          { label: 'Mexico remittances', value: '$67B/yr', sub: 'Banxico 2024, largest corridor globally' },
          { label: 'Argentina peak CPI', value: '211%', sub: '12-month peak, Dec 2023 — down to 117% by Dec 2024' },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-border/60">
            <CardContent className="p-5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono mb-1">{s.label}</p>
              <p className="text-2xl font-semibold font-mono text-amber-400">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* The thesis */}
      <Card className="bg-card border-border/60">
        <CardHeader className="px-8 pt-8 pb-0">
          <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-widest mb-1">Analysis</p>
          <h2 className="text-xl font-semibold text-foreground">The Structural Thesis</h2>
        </CardHeader>
        <CardContent className="px-8 pb-8 pt-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm text-muted-foreground leading-relaxed">
            <div>
              <h3 className="text-foreground font-medium mb-2">1. Currency Failure → Stablecoin Demand</h3>
              <p>When a central bank destroys purchasing power — Argentina lost 99%+ of the peso&apos;s value in 20 years — citizens don&apos;t ask for better monetary policy. They exit. USDT is the exit. This is structural demand that doesn&apos;t disappear when crypto markets fall.</p>
            </div>
            <div>
              <h3 className="text-foreground font-medium mb-2">2. Capital Controls → DeFi Rails</h3>
              <p>Argentina&apos;s &quot;cepo cambiario&quot; limits legal FX to $200/month. For anyone needing to preserve savings or do cross-border business, DeFi isn&apos;t a speculative playground — it&apos;s the only functional tool. Peer-to-peer USDT markets emerged as a parallel financial system.</p>
            </div>
            <div>
              <h3 className="text-foreground font-medium mb-2">3. Remittances → Stablecoin Infrastructure</h3>
              <p>$67B flows from the US to Mexico annually. Western Union takes 5–8%. USDC via Bitso-Ripple takes &lt;0.5% and settles in seconds. This isn&apos;t a feature — it&apos;s an order-of-magnitude improvement that incumbent banks can&apos;t replicate on legacy rails.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Country charts */}
      <section>
        <div className="mb-6">
          <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-widest mb-1">Data</p>
          <h2 className="text-xl font-semibold text-foreground mb-1">Adoption by Country</h2>
          <p className="text-sm text-muted-foreground">Composite adoption score (Chainalysis Geography of Crypto 2024) vs. inflation context</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="bg-card border-border/60">
            <CardHeader className="px-6 pt-6 pb-0">
              <h3 className="text-sm font-medium text-foreground">Crypto Adoption Score</h3>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-4">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={countries} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                  <XAxis type="number" domain={[0, 100]}
                    tick={{ fill: 'oklch(0.490 0.040 250)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                    axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name"
                    tick={{ fill: 'oklch(0.708 0 0)', fontSize: 11 }}
                    axisLine={false} tickLine={false} width={80} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'oklch(0.155 0.030 275)' }} />
                  <Bar dataKey="adoptionScore" radius={[0, 4, 4, 0]}>
                    {countries.map((c, i) => <Cell key={i} fill={c.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/60">
            <CardHeader className="px-6 pt-6 pb-0">
              <h3 className="text-sm font-medium text-foreground">Inflation Rate (%) — Peak Year</h3>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-4">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={countries} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                  <XAxis type="number"
                    tick={{ fill: 'oklch(0.490 0.040 250)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                    axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name"
                    tick={{ fill: 'oklch(0.708 0 0)', fontSize: 11 }}
                    axisLine={false} tickLine={false} width={80} />
                  <Tooltip cursor={{ fill: 'oklch(0.155 0.030 275)' }} />
                  <Bar dataKey="inflation" radius={[0, 4, 4, 0]} fill="#EF4444" opacity={0.7} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Country cards */}
      <section>
        <div className="mb-6">
          <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-widest mb-1">Context</p>
          <h2 className="text-xl font-semibold text-foreground">Country Breakdown</h2>
        </div>
        <div className="space-y-4">
          {countries.map((c) => (
            <Card key={c.name} className="bg-card border-border/60">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{c.flag}</span>
                    <div>
                      <h3 className="font-medium text-foreground">{c.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono">Global crypto rank #{c.globalRank} (Chainalysis 2024)</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-right">
                    <div>
                      <p className="text-sm text-red-400 font-mono">{c.inflation}%</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">peak CPI</p>
                    </div>
                    <div>
                      <p className="text-sm text-amber-400 font-mono">{c.adoptionScore}/100</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">adoption</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.insight}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* RWA Timeline */}
      <Card className="bg-card border-border/60">
        <CardHeader className="px-8 pt-8 pb-0">
          <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-widest mb-1">Timeline</p>
          <h2 className="text-xl font-semibold text-foreground mb-1">RWA Tokenization Timeline</h2>
          <p className="text-sm text-muted-foreground">From BUIDL launch to a $20B+ market in under 3 years</p>
        </CardHeader>
        <CardContent className="px-8 pb-8 pt-6">
          <div className="relative space-y-6">
            <div className="absolute left-2 top-0 bottom-0 w-px bg-border/40" />
            {milestones.map((m, i) => (
              <div key={i} className="flex gap-5 pl-8 relative">
                <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-amber-500/60 bg-card" />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-0.5">
                    <span className="text-xs text-amber-400 font-mono">{m.date}</span>
                    <span className="text-muted-foreground/30">·</span>
                    <span className="text-xs text-muted-foreground/50 font-mono">${m.tvl}B TVL</span>
                  </div>
                  <p className="text-sm text-foreground">{m.event}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* What comes next */}
      <Card className="bg-card border-amber-500/20">
        <CardHeader className="px-8 pt-8 pb-0">
          <p className="text-[11px] text-amber-500/60 font-mono uppercase tracking-widest mb-1">Forward</p>
          <h2 className="text-xl font-semibold text-foreground">What Comes Next</h2>
        </CardHeader>
        <CardContent className="px-8 pb-8 pt-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm text-muted-foreground leading-relaxed">
            <div>
              <h3 className="text-amber-400 font-medium mb-2">GENIUS Act → Institutional Stablecoins</h3>
              <p>US regulatory clarity, once passed, unlocks bank-issued stablecoins. For LatAm, this means JPMorgan, Citi, and others can build compliant stablecoin rails into the $200B+ remittance and trade finance market.</p>
            </div>
            <div>
              <h3 className="text-amber-400 font-medium mb-2">Tokenized Treasuries in EM Portfolios</h3>
              <p>Argentine and Brazilian family offices are already exploring BUIDL as a yield vehicle. On-chain T-bills denominated in USD, accessible 24/7 without a US brokerage account — this reshapes how EM wealth managers handle dollar allocation.</p>
            </div>
            <div>
              <h3 className="text-amber-400 font-medium mb-2">Central Bank DLT Infrastructure</h3>
              <p>SWIFT has completed blockchain pilots. Brazil's DREX (CBDC) is in production testing with major banks. If LatAm central banks adopt ISO 20022 + DLT settlement rails, the cross-border cost structure changes permanently.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground/40 text-center">
        Sources: Chainalysis Geography of Crypto 2024 · DeFiLlama · Circle · IMF · World Bank · SWIFT gpi
      </p>
    </div>
  )
}
