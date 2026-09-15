import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface SectionHeadingProps {
  label: string
  title?: ReactNode
  aside?: ReactNode
  className?: string
}

/** Small-caps section label with an optional serif title and right-aligned aside. */
export function SectionHeading({ label, title, aside, className }: SectionHeadingProps) {
  return (
    <header className={cn('mb-8 border-t border-line pt-4', className)}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="label-caps">{label}</p>
        {aside ? <div className="text-xs text-fg-muted">{aside}</div> : null}
      </div>
      {title ? <h2 className="mt-4 font-serif text-3xl leading-tight tracking-tight sm:text-4xl">{title}</h2> : null}
    </header>
  )
}
