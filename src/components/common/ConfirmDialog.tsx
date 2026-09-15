import { useEffect, useRef } from 'react'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  destructive?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Native <dialog> based confirmation — accessible, focus-trapped, escape to close. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
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
        if (!loading) onCancel()
      }}
      onClick={(event) => {
        if (event.target === ref.current && !loading) onCancel()
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md border border-line bg-bg p-0 text-fg backdrop:bg-fg/40"
    >
      <div className="p-6">
        <h2 className="font-serif text-2xl">{title}</h2>
        {description ? <p className="mt-2 text-sm text-fg-muted">{description}</p> : null}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant={destructive ? 'primary' : 'accent'} size="sm" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  )
}
