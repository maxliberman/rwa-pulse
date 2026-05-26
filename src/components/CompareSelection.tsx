'use client'
import { useState } from 'react'
import { EnrichedProtocol } from '@/lib/types'
import ProtocolCard from '@/components/ProtocolCard'
import { CompareBar } from '@/components/CompareBar'
import { Reveal } from '@/components/Reveal'

interface CompareSelectionProps {
  protocols: EnrichedProtocol[]
}

export function CompareSelection({ protocols }: CompareSelectionProps) {
  const [selected, setSelected] = useState<string[]>([])

  const toggle = (slug: string) => {
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug)
      if (prev.length >= 4) return prev
      return [...prev, slug]
    })
  }

  const selectedProtocols = protocols.filter((p) => selected.includes(p.slug))

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {protocols.map((p, i) => (
          <Reveal key={p.slug} delay={Math.min(i * 40, 400)}>
            <ProtocolCard
              protocol={p}
              rank={i + 1}
              isSelected={selected.includes(p.slug)}
              onCompare={toggle}
            />
          </Reveal>
        ))}
      </div>

      {selected.length >= 2 && (
        <CompareBar
          selected={selectedProtocols}
          onRemove={(slug) => setSelected((prev) => prev.filter((s) => s !== slug))}
          onClear={() => setSelected([])}
        />
      )}
    </>
  )
}
