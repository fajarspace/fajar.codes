import { useEffect } from 'react'

interface HotkeyOptions {
  meta?: boolean
  enabled?: boolean
}

/** Registers a global keyboard shortcut. `meta` matches ⌘ on macOS and Ctrl elsewhere. */
export function useHotkey(key: string, handler: (event: KeyboardEvent) => void, options: HotkeyOptions = {}) {
  const { meta = false, enabled = true } = options
  useEffect(() => {
    if (!enabled) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== key.toLowerCase()) return
      if (meta && !(event.metaKey || event.ctrlKey)) return
      if (!meta && (event.metaKey || event.ctrlKey || event.altKey)) return
      handler(event)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [key, meta, enabled, handler])
}
