'use client'
import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface RevealProps {
  children: ReactNode
  delay?: number
  direction?: 'up' | 'left' | 'none'
  className?: string
  once?: boolean
}

export function Reveal({ children, delay = 0, direction = 'up', className, once = true }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          if (once) observer.disconnect()
        } else if (!once) {
          el.classList.remove('is-visible')
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [once])

  const baseClass = direction === 'left' ? 'reveal-left' : direction === 'none' ? '' : 'reveal'

  return (
    <div
      ref={ref}
      className={cn(baseClass, className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
