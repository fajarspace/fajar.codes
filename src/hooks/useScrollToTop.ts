import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Scrolls to the top on pathname change (hash links keep their target). */
export function useScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView({ block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])
}
