import { useEffect, useState } from 'react'

/** Tracks which heading id is currently in the upper part of the viewport. */
export function useActiveHeading(ids: string[], offset = 120): string | null {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    if (ids.length === 0) return
    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el))
    if (elements.length === 0) return

    const update = () => {
      let current: string | null = elements[0]?.id ?? null
      for (const el of elements) {
        if (el.getBoundingClientRect().top - offset <= 0) current = el.id
        else break
      }
      setActive(current)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [ids, offset])

  return active
}
