'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/portfolio', label: 'Portfolio Builder' },
  { href: '/latam', label: 'LatAm Lens' },
  { href: '/methodology', label: 'Methodology' },
]

export default function Navbar() {
  const path = usePathname()

  return (
    <nav className="border-b border-[#1C1C2E] mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-semibold tracking-tight text-white">
            RWA <span className="text-amber-400">Pulse</span>
          </span>
        </Link>
        <div className="flex items-center gap-1 text-sm overflow-x-auto">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                path === href
                  ? 'text-white bg-[#1C1C2E]'
                  : 'text-slate-400 hover:text-white hover:bg-[#1C1C2E]/50'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
