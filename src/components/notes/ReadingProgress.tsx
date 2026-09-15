import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion'
import type { RefObject } from 'react'

/** Thin accent bar at the top of the viewport tracking scroll through `target`. */
export function ReadingProgress({ target }: { target: RefObject<HTMLElement | null> }) {
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target, offset: ['start start', 'end end'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 })
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-14 z-40 h-0.5 origin-left bg-accent"
      style={{ scaleX: reduced ? scrollYProgress : smooth }}
    />
  )
}
