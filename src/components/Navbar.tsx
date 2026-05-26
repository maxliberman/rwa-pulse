'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '/', label: 'Market' },
  { href: '/portfolio', label: 'Portfolio Builder' },
  { href: '/compare', label: 'Compare' },
  { href: '/latam', label: 'LatAm' },
  { href: '/methodology', label: 'Methodology' },
]

export default function Navbar() {
  const path = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/85 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="relative w-5 h-5 flex items-center justify-center">
            <span className="absolute w-4 h-4 rounded-full border border-amber-500/30" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 block" />
            <span className="absolute w-1.5 h-1.5 rounded-full bg-amber-500/30 block animate-ping" />
          </div>
          <span className="font-semibold tracking-tight text-foreground text-sm">
            RWA <span className="text-amber-500">Pulse</span>
          </span>
          <Badge variant="outline" className="text-[9px] text-amber-500/60 border-amber-500/20 font-mono px-1.5 py-0 hidden sm:flex tracking-widest">
            LIVE
          </Badge>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-0.5">
          {LINKS.map(({ href, label }) => {
            const active = path === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative px-3 py-2 text-[11px] font-medium tracking-wide rounded-md transition-all duration-150',
                  active
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {label}
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-px bg-amber-500 rounded-full" />
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
