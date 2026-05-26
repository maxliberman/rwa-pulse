'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

const LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/portfolio', label: 'Portfolio Builder' },
  { href: '/latam', label: 'LatAm Lens' },
  { href: '/methodology', label: 'Methodology' },
]

export default function Navbar() {
  const path = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="relative">
            <span className="w-2 h-2 rounded-full bg-amber-400 block animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-amber-400/30 block absolute inset-0 animate-ping" />
          </div>
          <span className="font-semibold tracking-tight text-foreground text-sm">
            RWA <span className="text-amber-400">Pulse</span>
          </span>
          <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/50 font-mono px-1.5 py-0 hidden sm:flex">
            LIVE
          </Badge>
        </Link>

        <nav className="flex items-center gap-1">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`relative px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${
                path === href
                  ? 'text-foreground bg-secondary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
            >
              {label}
              {path === href && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-px bg-primary rounded-full" />
              )}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
