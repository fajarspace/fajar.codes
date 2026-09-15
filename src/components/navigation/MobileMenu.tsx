import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { navigation, site } from '@/constants/site'
import { useCommandPalette } from '@/hooks/useCommandPalette'
import { cn } from '@/utils/cn'
import { LocalClock } from '@/components/common/LocalClock'
import { Wordmark } from '@/components/common/Wordmark'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const reduced = useReducedMotion()
  const { open: openPalette } = useCommandPalette()

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-50 flex flex-col bg-bg md:hidden"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? undefined : { opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="container-editorial flex h-14 items-center justify-between border-b border-line">
            <Wordmark />
            <button
              type="button"
              onClick={onClose}
              className="-mr-2 inline-flex size-9 items-center justify-center text-fg"
              aria-label="Close menu"
              autoFocus
            >
              <X className="size-5" strokeWidth={1.5} />
            </button>
          </div>

          <nav aria-label="Mobile" className="container-editorial flex flex-1 flex-col justify-center gap-2 py-8">
            {navigation.map((item, i) => (
              <motion.div
                key={item.href}
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.05, duration: 0.3 }}
              >
                <NavLink
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn('flex items-center gap-3 py-2 font-serif text-5xl leading-none', isActive ? 'text-fg' : 'text-fg-muted')
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      {isActive ? <span className="size-1.5 rounded-full bg-accent" aria-hidden /> : null}
                    </>
                  )}
                </NavLink>
              </motion.div>
            ))}
            <button
              type="button"
              onClick={() => {
                onClose()
                openPalette()
              }}
              className="mt-6 self-start text-sm text-fg-muted underline underline-offset-4"
            >
              Search everything
            </button>
          </nav>

          <div className="container-editorial flex items-center justify-between border-t border-line py-4 text-2xs text-fg-muted">
            <span>{site.location}</span>
            <LocalClock withSeconds={false} />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
