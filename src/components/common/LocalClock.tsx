import { useNow } from '@/hooks/useLocalTime'
import { formatJakartaDate, formatJakartaTime } from '@/utils/format'
import { cn } from '@/utils/cn'

interface LocalClockProps {
  withDate?: boolean
  withSeconds?: boolean
  className?: string
}

/** Realtime Indonesian (WIB) clock. Tabular digits so the width never jumps. */
export function LocalClock({ withDate = false, withSeconds = true, className }: LocalClockProps) {
  const now = useNow(withSeconds ? 1000 : 15_000)
  return (
    <time dateTime={now.toISOString()} className={cn('tabular', className)}>
      {withDate ? `${formatJakartaDate(now)} · ` : null}
      {formatJakartaTime(now, withSeconds)} WIB
    </time>
  )
}
