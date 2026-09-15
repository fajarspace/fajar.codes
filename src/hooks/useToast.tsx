import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'

export type ToastTone = 'neutral' | 'success' | 'error'

export interface Toast {
  id: number
  title: string
  description?: string
  tone: ToastTone
}

interface ToastContextValue {
  toasts: Toast[]
  toast: (input: { title: string; description?: string; tone?: ToastTone; duration?: number }) => void
  dismiss: (id: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback<ToastContextValue['toast']>(
    ({ title, description, tone = 'neutral', duration = 3200 }) => {
      const id = ++counter.current
      setToasts((current) => [...current.slice(-3), { id, title, description, tone }])
      window.setTimeout(() => dismiss(id), duration)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toasts, toast, dismiss }), [toasts, toast, dismiss])
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
