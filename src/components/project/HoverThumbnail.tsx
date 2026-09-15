import { useEffect } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'
import type { Project } from '@/types/content'

interface HoverThumbnailProps {
  project: Project | null
}

/**
 * A small cover preview that trails the cursor while a project row is hovered.
 * Rendered once per list; positioned with motion values so it never causes layout.
 */
export function HoverThumbnail({ project }: HoverThumbnailProps) {
  const reduced = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 400, damping: 40, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 400, damping: 40, mass: 0.6 })

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      x.set(event.clientX + 24)
      y.set(event.clientY - 90)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [x, y])

  return (
    <AnimatePresence>
      {project?.coverUrl ? (
        <motion.div
          key={project.id}
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-30 hidden w-64 border border-line bg-bg-elevated lg:block"
          style={{ x: reduced ? x : sx, y: reduced ? y : sy, aspectRatio: '16 / 10' }}
          initial={reduced ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduced ? undefined : { opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <img src={project.coverUrl} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
