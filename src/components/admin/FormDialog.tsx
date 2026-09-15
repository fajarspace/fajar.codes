import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface FormDialogProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

/** Native <dialog> wrapper for small create/edit forms. */
export function FormDialog({ open, title, onClose, children }: FormDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose()
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg border border-line bg-bg p-0 text-fg backdrop:bg-fg/40"
    >
      {open ? (
        <div className="max-h-[85vh] overflow-y-auto p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-serif text-2xl">{title}</h2>
            <button type="button" onClick={onClose} className="-mr-1 p-1 text-fg-muted hover:text-fg" aria-label="Close">
              <X className="size-4" />
            </button>
          </div>
          {children}
        </div>
      ) : null}
    </dialog>
  )
}
