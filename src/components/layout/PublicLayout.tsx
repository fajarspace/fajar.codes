import { Suspense } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Navbar } from '@/components/navigation/Navbar'
import { Footer } from '@/components/navigation/Footer'
import { CommandPalette } from '@/components/common/CommandPalette'
import { EasterEgg } from '@/components/common/EasterEgg'
import { PageTransition } from '@/components/common/PageTransition'
import { useScrollToTop } from '@/hooks/useScrollToTop'

function RouteFallback() {
  return <div className="container-editorial min-h-[60vh] py-16" aria-busy="true" />
}

export function PublicLayout() {
  const location = useLocation()
  // Capture the outlet element so the exiting page keeps rendering its own route during the transition.
  const outlet = useOutlet()
  useScrollToTop()

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main id="main" className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition key={location.pathname}>
            <Suspense fallback={<RouteFallback />}>{outlet}</Suspense>
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
      <CommandPalette />
      <EasterEgg />
    </div>
  )
}
