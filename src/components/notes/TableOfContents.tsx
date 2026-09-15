import { useMemo } from 'react'
import type { Heading } from '@/utils/markdown'
import { useActiveHeading } from '@/hooks/useActiveHeading'
import { cn } from '@/utils/cn'

export function TableOfContents({ headings, className }: { headings: Heading[]; className?: string }) {
  const ids = useMemo(() => headings.map((h) => h.id), [headings])
  const active = useActiveHeading(ids)
  if (headings.length < 2) return null

  return (
    <nav aria-label="Table of contents" className={cn('text-sm', className)}>
      <p className="label-caps mb-3">On this page</p>
      <ol className="space-y-1.5 border-l border-line">
        {headings.map((h) => {
          const isActive = h.id === active
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                className={cn(
                  '-ml-px block border-l py-0.5 pl-3 text-xs leading-snug transition-colors',
                  h.level === 3 ? 'ml-3 pl-3' : '',
                  isActive ? 'border-fg text-fg' : 'border-transparent text-fg-muted hover:text-fg',
                )}
                aria-current={isActive ? 'location' : undefined}
              >
                {h.text}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
