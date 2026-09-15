import { useEffect, useRef } from 'react'

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

/** Fires `onMatch` when the user types `sequence` anywhere outside a form field. */
export function useKeySequence(sequences: Record<string, () => void>) {
  const buffer = useRef('')
  const handlers = useRef(sequences)

  useEffect(() => {
    handlers.current = sequences
  })

  useEffect(() => {
    const maxLength = Math.max(...Object.keys(handlers.current).map((s) => s.length), 1)
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key.length !== 1 || isTypingTarget(event.target)) return
      buffer.current = (buffer.current + event.key.toLowerCase()).slice(-maxLength)
      for (const [sequence, handler] of Object.entries(handlers.current)) {
        if (buffer.current.endsWith(sequence)) {
          buffer.current = ''
          handler()
          break
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
