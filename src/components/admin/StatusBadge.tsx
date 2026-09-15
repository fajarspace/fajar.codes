import { cn } from '@/utils/cn'

interface StatusBadgeProps {
  label: string
  tone?: 'live' | 'muted' | 'ink'
}

export function StatusBadge({ label, tone = 'muted' }: StatusBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span
        className={cn('size-1.5 rounded-full', {
          'bg-accent ring-1 ring-fg/20': tone === 'live',
          'bg-fg': tone === 'ink',
          'bg-line': tone === 'muted',
        })}
        aria-hidden
      />
      {label}
    </span>
  )
}
