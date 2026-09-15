import type { GalleryPhoto } from '@/types/content'
import { formatDate, padIndex } from '@/utils/format'
import { cn } from '@/utils/cn'

interface PhotoGridProps {
  photos: GalleryPhoto[]
  onOpen?: (index: number) => void
  className?: string
}

/** Column-flow photo wall. Aspect ratios are reserved from stored dimensions, so nothing shifts while loading. */
export function PhotoGrid({ photos, onOpen, className }: PhotoGridProps) {
  return (
    <ul className={cn('columns-1 gap-6 sm:columns-2 lg:columns-3', className)}>
      {photos.map((photo, i) => {
        const ratio = photo.width && photo.height ? `${photo.width} / ${photo.height}` : '4 / 5'
        const meta = [photo.location, photo.takenAt ? formatDate(photo.takenAt, { day: undefined }) : null].filter(Boolean).join(' · ')
        return (
          <li key={photo.id} className="mb-8 break-inside-avoid">
            <figure>
              <button
                type="button"
                onClick={() => onOpen?.(i)}
                className="group block w-full overflow-hidden border border-line bg-bg-elevated text-left"
                style={{ aspectRatio: ratio }}
                aria-label={`Open ${photo.title || 'photo'}`}
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  width={photo.width ?? undefined}
                  height={photo.height ?? undefined}
                  loading={i < 3 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
                />
              </button>
              <figcaption className="mt-2 flex items-baseline gap-3 text-xs">
                <span className="tabular text-fg-muted">{padIndex(i + 1)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{photo.title}</span>
                  {meta ? <span className="block text-fg-muted">{meta}</span> : null}
                </span>
              </figcaption>
            </figure>
          </li>
        )
      })}
    </ul>
  )
}
