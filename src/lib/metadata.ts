import { ProtocolRisks } from './types'

export interface ProtocolMetadata {
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
  nav?: number
  coingeckoId?: string
  comparableAsset?: string
  targetUser?: string
  keyRisk?: string
}

const DEFAULT: ProtocolMetadata = {
  category: 'RWA',
  assetType: 'Tokenized Asset',
  description: 'A tokenized real-world asset protocol providing on-chain access to off-chain financial instruments.',
  portfolioRole: 'Diversifier',
  riskLevel: 'Medium',
  institutionalGrade: false,
  tags: ['On-chain', 'Tokenized'],
  risks: { smartContract: 40, custody: 40, liquidity: 50, duration: 30, regulatory: 40 },
  comparableAsset: 'Alternative Investment',
  targetUser: 'Investors seeking on-chain exposure to real-world assets',
  keyRisk: 'Smart contract and custodian risk',
}

export const PROTOCOL_METADATA: Record<string, ProtocolMetadata> = {
  'blackrock-buidl': {
    category: 'Treasury',
    assetType: 'Tokenized Money Market Fund',
    description: 'BlackRock USD Institutional Digital Liquidity Fund (BUIDL) — a tokenized money market fund investing in US Treasury bills, repo agreements, and cash equivalents. Issued on Ethereum via Securitize, now deployed across 8 chains. The flagship institutional on-chain cash management vehicle with daily yield accrual.',
    portfolioRole: 'Cash Alternative',
    riskLevel: 'Low',
    estimatedYield: '~4.9% APY',
    institutionalGrade: true,
    tags: ['Institutional', 'Treasury-backed', 'Yield-bearing', 'Stable NAV', 'SEC-registered', 'Daily Accrual'],
    risks: { smartContract: 20, custody: 15, liquidity: 25, duration: 10, regulatory: 20 },
    issuer: 'BlackRock / Securitize',
    underlying: 'US Treasury Bills, Repo, Cash',
    nav: 1.00,
    comparableAsset: 'Money Market Fund (VMFXX)',
    targetUser: 'Institutions, DAOs, and stablecoin issuers seeking yield on idle treasury with daily liquidity.',
    keyRisk: 'Redemption limited to qualified investors; requires KYC/AML through Securitize.',
  },
  'ondo-yield-assets': {
    category: 'Treasury',
    assetType: 'Tokenized Government Bond Exposure',
    description: 'Ondo Finance provides on-chain tokenized exposure to short-duration US government securities. OUSG tracks the BlackRock iShares Short Treasury Bond ETF (SHY). Designed for institutions and DAOs seeking USD yield with daily NAV accrual and 24/7 transferability.',
    portfolioRole: 'Treasury Exposure',
    riskLevel: 'Low',
    estimatedYield: '~4.7% APY',
    institutionalGrade: true,
    tags: ['Institutional', 'Treasury-backed', 'Yield-bearing', 'Multi-chain', 'Daily NAV'],
    risks: { smartContract: 25, custody: 20, liquidity: 30, duration: 15, regulatory: 25 },
    issuer: 'Ondo Finance',
    underlying: 'BlackRock iShares SHY ETF (US Treasuries)',
    nav: 1.00,
    comparableAsset: 'Treasury ETF (iShares SHY)',
    targetUser: 'Accredited investors and protocols seeking DeFi-native T-Bill exposure with secondary market liquidity.',
    keyRisk: 'Accredited investor restriction; NAV may trail Fed rate moves by a lag period.',
  },
  'circle-usyc': {
    category: 'Stable Yield',
    assetType: 'Tokenized Treasury Instrument',
    description: 'Circle USYC is a short-duration treasury instrument for institutions and DeFi protocols to earn yield on idle USDC. Backed by US Treasury bills and designed as the yield-bearing counterpart to USDC. Optimized for protocols deploying idle reserves.',
    portfolioRole: 'Yield Enhancement',
    riskLevel: 'Low',
    estimatedYield: '~4.8% APY',
    institutionalGrade: true,
    tags: ['Institutional', 'Treasury-backed', 'Yield-bearing', 'Circle-issued', 'Stable NAV'],
    risks: { smartContract: 20, custody: 15, liquidity: 20, duration: 10, regulatory: 20 },
    issuer: 'Circle',
    underlying: 'US Treasury Bills',
    nav: 1.00,
    comparableAsset: 'Fed Funds Rate Instrument',
    targetUser: 'DeFi protocols and institutions holding idle USDC seeking to earn T-Bill yield without leaving the Circle ecosystem.',
    keyRisk: 'Circle counterparty concentration; limited to institutional participants.',
  },
  'tether-gold': {
    category: 'Gold',
    assetType: 'Tokenized Commodity',
    description: 'Tether Gold (XAUT) — each token represents one troy ounce of physical gold held in Swiss vaults by Tether. Redeemable for physical delivery. Provides tokenized commodity exposure for portfolio diversification and inflation hedging with 24/7 on-chain transferability.',
    portfolioRole: 'Inflation Hedge',
    riskLevel: 'Medium',
    institutionalGrade: false,
    tags: ['Commodity', 'Gold-backed', 'Physical Delivery', 'Inflation Hedge', 'Swiss Custody'],
    risks: { smartContract: 35, custody: 40, liquidity: 35, duration: 5, regulatory: 45 },
    issuer: 'Tether',
    underlying: 'Physical Gold (Swiss Vaults)',
    coingeckoId: 'tether-gold',
    comparableAsset: 'SPDR Gold Trust (GLD)',
    targetUser: 'Retail and institutional investors seeking gold exposure with blockchain transferability and no custody fees.',
    keyRisk: 'Tether issuer risk; less regulatory clarity than PAXG; Swiss vault audit transparency.',
  },
  'paxos-gold': {
    category: 'Gold',
    assetType: 'Tokenized Commodity',
    description: 'PAX Gold (PAXG) — each token backed by one fine troy ounce of gold in Brinks vaults. Regulated by NYDFS. The institutional-grade gold tokenization standard for compliant portfolios. Preferred by institutional investors seeking regulated commodity exposure on-chain.',
    portfolioRole: 'Inflation Hedge',
    riskLevel: 'Low',
    institutionalGrade: true,
    tags: ['Institutional', 'Gold-backed', 'NYDFS-regulated', 'Inflation Hedge', 'Brinks Custody'],
    risks: { smartContract: 25, custody: 25, liquidity: 35, duration: 5, regulatory: 20 },
    issuer: 'Paxos',
    underlying: 'Physical Gold (Brinks Vaults)',
    coingeckoId: 'pax-gold',
    comparableAsset: 'Physical Gold Bar / Perth Mint',
    targetUser: 'Institutional investors, family offices, and compliance-conscious allocators needing regulated on-chain gold.',
    keyRisk: 'Gold price volatility; no yield; NYDFS-regulated but gold commodity rules still apply.',
  },
  'centrifuge-protocol': {
    category: 'Private Debt',
    assetType: 'On-chain Credit Protocol',
    description: 'Centrifuge is the largest decentralized protocol for on-chain securitization of real-world credit assets including trade finance, mortgages, consumer credit, and private loans. Enables asset originators to bring off-chain receivables on-chain as structured tranches with seniority protection.',
    portfolioRole: 'Yield Sleeve',
    riskLevel: 'High',
    estimatedYield: '8–12% APY',
    institutionalGrade: false,
    tags: ['Private Credit', 'Structured Finance', 'High Yield', 'Multi-tranche', 'Real-world Collateral'],
    risks: { smartContract: 50, custody: 55, liquidity: 70, duration: 60, regulatory: 50 },
    issuer: 'Centrifuge DAO',
    underlying: 'Trade Finance, Mortgages, Private Loans',
    comparableAsset: 'Private Credit Fund (Ares, Blue Owl)',
    targetUser: 'Sophisticated DeFi investors and alternative credit allocators seeking yield above T-Bill rates with tolerance for illiquidity.',
    keyRisk: 'Borrower default risk; illiquid pools; smart contract complexity; no SIPC/FDIC protection.',
  },
  'spiko': {
    category: 'Treasury',
    assetType: 'Tokenized Money Market Fund',
    description: 'Spiko issues French and European law-compliant tokenized fund units investing in short-duration government securities. Structured as regulated collective investment schemes, Spiko bridges institutional European fund infrastructure with on-chain transferability across multiple blockchains.',
    portfolioRole: 'Cash Alternative',
    riskLevel: 'Low',
    estimatedYield: '~3.8% APY',
    institutionalGrade: true,
    tags: ['Institutional', 'EU-regulated', 'Treasury-backed', 'Yield-bearing', 'Multi-chain'],
    risks: { smartContract: 25, custody: 20, liquidity: 25, duration: 15, regulatory: 20 },
    issuer: 'Spiko',
    underlying: 'European Government Securities',
    nav: 1.00,
    comparableAsset: 'Euro T-Bill Fund (Amundi)',
    targetUser: 'European institutions and DAOs seeking EU-regulated on-chain cash management with UCITS-like protections.',
    keyRisk: 'EUR-denominated yield; MiCA regulatory evolution; redemption restricted to eligible investors.',
  },
}

export function getMetadata(slug: string): ProtocolMetadata {
  return PROTOCOL_METADATA[slug] ?? {
    ...DEFAULT,
    tags: [...DEFAULT.tags],
    risks: { ...DEFAULT.risks },
  }
}
