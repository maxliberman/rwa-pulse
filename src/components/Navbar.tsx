'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const path = usePathname()

  return (
    <nav className="border-b border-[#1C1C2E] mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-semibold tracking-tight text-white">
            RWA <span className="text-amber-400">Pulse</span>
          </span>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/"
            className={path === '/' ? 'text-white' : 'text-slate-400 hover:text-white transition-colors'}
          >
            Dashboard
          </Link>
          <Link
            href="/latam"
            className={path === '/latam' ? 'text-white' : 'text-slate-400 hover:text-white transition-colors'}
          >
            LatAm Lens
          </Link>
          <a
            href="https://defillama.com/protocols/RWA"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors"
          >
            DeFiLlama ↗
          </a>
        </div>
      </div>
    </nav>
  )
}
