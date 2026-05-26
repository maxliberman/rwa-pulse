'use client'
import Image from 'next/image'
import Link from 'next/link'
import { EnrichedProtocol } from '@/lib/types'
import { cn } from '@/lib/utils'

interface CompareBarProps {
  selected: EnrichedProtocol[]
  onRemove: (slug: string) => void
  onClear: () => void
}

export function CompareBar({ selected, onRemove, onClear }: CompareBarProps) {
  const slugs = selected.map((p) => p.slug).join(',')

  return (
    <div className="compare-bar-enter fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <div className="glass rounded-xl border border-amber-500/20 shadow-2xl shadow-black/60 px-5 py-3.5 flex items-center gap-4">
        {/* Label */}
        <div className="shrink-0">
          <p className="text-[9px] text-amber-500/60 font-mono uppercase tracking-widest">Compare</p>
          <p className="text-xs text-foreground font-medium">{selected.length} / 4 selected</p>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-border/40 shrink-0" />

        {/* Selected assets */}
        <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
          {selected.map((p) => (
            <div key={p.slug} className="flex items-center gap-1.5 shrink-0 group/item">
              {p.logo ? (
                <Image src={p.logo} alt={p.name} width={20} height={20} className="rounded-md" unoptimized />
              ) : (
                <div className="w-5 h-5 rounded-md bg-secondary text-[9px] flex items-center justify-center text-muted-foreground font-bold">
                  {p.name[0]}
                </div>
              )}
              <span className="text-xs text-foreground hidden sm:block max-w-[80px] truncate">{p.name.split(' ')[0]}</span>
              <button
                onClick={() => onRemove(p.slug)}
                className="text-muted-foreground/30 hover:text-rose-400 transition-colors text-sm leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onClear}
            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors font-mono px-2.5 py-1.5 rounded border border-border/40 hover:border-border"
          >
            Clear
          </button>
          {selected.length >= 2 && (
            <Link
              href={`/compare?slugs=${slugs}`}
              className="text-[10px] font-mono px-3 py-1.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors whitespace-nowrap"
            >
              Compare {selected.length} Assets →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
