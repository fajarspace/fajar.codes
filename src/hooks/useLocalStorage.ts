import { useCallback, useState } from 'react'

export function useLocalStorage<T extends string>(key: string, initial: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return (stored as T | null) ?? initial
    } catch {
      return initial
    }
  })

  const set = useCallback(
    (next: T) => {
      setValue(next)
      try {
        window.localStorage.setItem(key, next)
      } catch {
        /* private mode etc. */
      }
    },
    [key],
  )

  return [value, set]
}
