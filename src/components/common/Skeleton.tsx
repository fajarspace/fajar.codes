import { cn } from '@/utils/cn'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton', className)} aria-hidden />
}

/** A few text lines with a natural rhythm. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-3.5', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  )
}

/** Editorial list rows. */
export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="divide-y divide-line border-y border-line" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-[3rem_1fr_5rem] items-center gap-4 py-5">
          <Skeleton className="h-3 w-6" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-3 w-10 justify-self-end" />
        </div>
      ))}
    </div>
  )
}
