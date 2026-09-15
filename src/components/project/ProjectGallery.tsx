import type { ProjectImage } from '@/types/content'
import { SmartImage } from '@/components/common/SmartImage'
import { padIndex } from '@/utils/format'

export function ProjectGallery({ images }: { images: ProjectImage[] }) {
  if (images.length === 0) return null
  return (
    <div className="grid gap-8 sm:grid-cols-2">
      {images.map((image, i) => (
        <figure key={image.id} className={i % 3 === 0 ? 'sm:col-span-2' : undefined}>
          <SmartImage src={image.imageUrl} alt={image.caption ?? ''} ratio="auto" />
          <figcaption className="mt-2 flex gap-3 text-xs text-fg-muted">
            <span className="tabular">{padIndex(i + 1)}</span>
            <span>{image.caption}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
