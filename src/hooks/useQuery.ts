import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { queryCache } from '@/lib/query-cache'

export type QueryStatus = 'loading' | 'success' | 'error'

export interface QueryResult<T> {
  data: T | undefined
  error: unknown
  status: QueryStatus
  isLoading: boolean
  isFetching: boolean
  refetch: () => Promise<void>
}

interface Options {
  /** Skip fetching (e.g. until a dependency is ready). */
  enabled?: boolean
  /** Milliseconds a cached value is considered fresh on mount. 0 = always revalidate on mount. Defaults to 60s. */
  staleTime?: number
}

const noop = () => undefined

/** One in-flight request per key, shared by every component that asks for it. */
const inflight = new Map<string, Promise<unknown>>()

/**
 * Small cached async hook. Data lives in the shared cache (subscribed via useSyncExternalStore),
 * so cached pages render instantly and admin mutations can invalidate them from anywhere.
 *
 * Fetches happen in exactly two situations:
 *   1. on mount / key change, when the cache is empty or older than `staleTime`;
 *   2. when the cache entry disappears while mounted (an invalidation).
 * A successful fetch never triggers another one by itself.
 */
export function useQuery<T>(key: string | null, fetcher: () => Promise<T>, options: Options = {}): QueryResult<T> {
  const { enabled = true, staleTime = 60_000 } = options

  const fetcherRef = useRef(fetcher)
  const activeKey = useRef<string | null>(null)
  useEffect(() => {
    fetcherRef.current = fetcher
  })
  useEffect(() => {
    activeKey.current = key
    return () => {
      activeKey.current = null
    }
  }, [key])

  const subscribe = useCallback((onChange: () => void) => (key ? queryCache.subscribe(key, onChange) : noop), [key])
  const getSnapshot = useCallback(() => (key ? queryCache.get<T>(key) : undefined), [key])
  const entry = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const [errors, setErrors] = useState<Record<string, unknown>>({})
  const [fetchingKey, setFetchingKey] = useState<string | null>(null)

  const run = useCallback(async () => {
    if (!key) return
    const currentKey = key
    setFetchingKey(currentKey)

    let request = inflight.get(currentKey) as Promise<T> | undefined
    if (!request) {
      request = fetcherRef
        .current()
        .then((result) => {
          queryCache.set(currentKey, result)
          return result
        })
        .finally(() => inflight.delete(currentKey))
      inflight.set(currentKey, request)
    }

    try {
      await request
      if (activeKey.current !== currentKey) return
      setErrors((current) => {
        if (!(currentKey in current)) return current
        const next = { ...current }
        delete next[currentKey]
        return next
      })
    } catch (err) {
      if (activeKey.current !== currentKey) return
      setErrors((current) => ({ ...current, [currentKey]: err }))
    } finally {
      if (activeKey.current === currentKey) setFetchingKey(null)
    }
  }, [key])

  // 1. Mount / key change: fetch when nothing is cached or the cached value is stale.
  useEffect(() => {
    if (!key || !enabled) return
    const cached = queryCache.get(key)
    if (cached && Date.now() - cached.updatedAt < staleTime) return
    void run()
  }, [key, enabled, staleTime, run])

  // 2. Invalidation: the entry vanished while we are mounted → refetch (unless the last attempt failed).
  const hasError = key ? key in errors : false
  useEffect(() => {
    if (!key || !enabled || entry !== undefined || hasError) return
    void run()
  }, [key, enabled, entry, hasError, run])

  const error = key ? errors[key] : undefined
  const status: QueryStatus = entry ? 'success' : error !== undefined ? 'error' : 'loading'

  return {
    data: entry?.data,
    error,
    status,
    isLoading: status === 'loading',
    isFetching: fetchingKey === key && key !== null,
    refetch: run,
  }
}
