import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

/** Short cross-fade between routes. Disabled entirely under prefers-reduced-motion. */
export function PageTransition({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? undefined : { opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
