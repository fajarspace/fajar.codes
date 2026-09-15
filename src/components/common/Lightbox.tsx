import { useCallback, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { GalleryPhoto } from '@/types/content'
import { formatDate } from '@/utils/format'

interface LightboxProps {
  photos: GalleryPhoto[]
  index: number | null
  onChange: (index: number | null) => void
}

/** Native <dialog> lightbox: arrow keys to move, Escape or backdrop click to close. */
export function Lightbox({ photos, index, onChange }: LightboxProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const open = index !== null
  const photo = index !== null ? photos[index] : undefined

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const step = useCallback(
    (delta: number) => {
      if (index === null || photos.length === 0) return
      onChange((index + delta + photos.length) % photos.length)
    },
    [index, photos.length, onChange],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') step(1)
      if (event.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, step])

  return (
    <dialog
      ref={ref}
      aria-label={photo ? photo.title || 'Photo' : 'Photo'}
      onCancel={(event) => {
        event.preventDefault()
        onChange(null)
      }}
      onClick={(event) => {
        if (event.target === ref.current) onChange(null)
      }}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 text-bg backdrop:bg-fg/95"
    >
      {photo ? (
        <div className="flex h-full flex-col" onClick={() => onChange(null)}>
          <div className="flex items-center justify-between px-4 py-3 text-xs sm:px-6" onClick={(event) => event.stopPropagation()}>
            <span className="tabular text-bg/70">
              {String((index ?? 0) + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
            </span>
            <button type="button" onClick={() => onChange(null)} className="inline-flex items-center gap-1.5 text-bg/70 hover:text-bg" aria-label="Close">
              Close <X className="size-4" />
            </button>
          </div>

          <figure className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-4 pb-6 sm:px-16">
            <img
              key={photo.id}
              src={photo.imageUrl}
              alt={photo.title}
              width={photo.width ?? undefined}
              height={photo.height ?? undefined}
              className="max-h-[78vh] max-w-full object-contain"
              onClick={(event) => event.stopPropagation()}
              decoding="async"
            />
            <figcaption className="max-w-xl text-center text-sm" onClick={(event) => event.stopPropagation()}>
              <p className="font-serif text-xl">{photo.title}</p>
              {photo.caption ? <p className="mt-1 text-bg/70">{photo.caption}</p> : null}
              <p className="mt-2 text-2xs uppercase tracking-[0.14em] text-bg/50">
                {[photo.location, photo.takenAt ? formatDate(photo.takenAt) : null].filter(Boolean).join(' · ')}
              </p>
            </figcaption>
          </figure>

          {photos.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  step(-1)
                }}
                className="absolute left-2 top-1/2 hidden -translate-y-1/2 p-3 text-bg/60 hover:text-bg sm:block"
                aria-label="Previous photo"
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  step(1)
                }}
                className="absolute right-2 top-1/2 hidden -translate-y-1/2 p-3 text-bg/60 hover:text-bg sm:block"
                aria-label="Next photo"
              >
                <ChevronRight className="size-6" />
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </dialog>
  )
}
