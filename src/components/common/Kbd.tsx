import type { ReactNode } from 'react'

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center border border-line px-1 font-sans text-[10px] font-medium text-fg-muted">
      {children}
    </kbd>
  )
}
