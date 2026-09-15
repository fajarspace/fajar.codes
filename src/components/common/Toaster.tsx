import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/utils/cn'

export function Toaster() {
  const { toasts, dismiss } = useToast()
  const reduced = useReducedMotion()
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[90] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout={!reduced}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 border bg-bg px-4 py-3 text-sm',
              t.tone === 'error' ? 'border-fg' : 'border-line',
            )}
            role="status"
          >
            <span
              className={cn('mt-1.5 size-2 shrink-0 rounded-full', {
                'bg-accent': t.tone === 'success',
                'bg-fg': t.tone === 'error',
                'bg-fg-muted': t.tone === 'neutral',
              })}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium">{t.title}</p>
              {t.description ? <p className="mt-0.5 text-fg-muted">{t.description}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="-mr-1 p-1 text-fg-muted hover:text-fg"
              aria-label="Dismiss notification"
            >
              <X className="size-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
