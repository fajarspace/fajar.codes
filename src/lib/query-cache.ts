/**
 * Tiny stale-while-revalidate cache shared by `useQuery`.
 * Keeps navigation snappy without pulling in a data-fetching library.
 */
interface CacheEntry<T> {
  data: T
  updatedAt: number
}

const store = new Map<string, CacheEntry<unknown>>()
const listeners = new Map<string, Set<() => void>>()

export const queryCache = {
  get<T>(key: string): CacheEntry<T> | undefined {
    return store.get(key) as CacheEntry<T> | undefined
  },
  set<T>(key: string, data: T) {
    store.set(key, { data, updatedAt: Date.now() })
    listeners.get(key)?.forEach((fn) => fn())
  },
  invalidate(prefix?: string) {
    if (!prefix) {
      store.clear()
      listeners.forEach((set) => set.forEach((fn) => fn()))
      return
    }
    for (const key of Array.from(store.keys())) {
      if (key.startsWith(prefix)) {
        store.delete(key)
        listeners.get(key)?.forEach((fn) => fn())
      }
    }
  },
  subscribe(key: string, fn: () => void) {
    const set = listeners.get(key) ?? new Set()
    set.add(fn)
    listeners.set(key, set)
    return () => {
      set.delete(fn)
      if (set.size === 0) listeners.delete(key)
    }
  },
}
