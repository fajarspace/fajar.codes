import { useState, type ImgHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface SmartImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string | null | undefined
  alt: string
  /**
   * CSS aspect ratio, e.g. "16 / 10" — the box is reserved and the image is cropped to fill it.
   * Pass "auto" to show the whole image at its natural ratio (no cropping).
   */
  ratio?: string
  priority?: boolean
  wrapperClassName?: string
}

/**
 * Lazy image with a placeholder tone while loading and a typographic fallback when no source is available.
 * Fixed ratios reserve space so the layout never shifts; "auto" keeps the full image visible.
 */
export function SmartImage({ src, alt, ratio = '16 / 10', priority = false, className, wrapperClassName, ...rest }: SmartImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const showFallback = !src || failed
  const natural = ratio === 'auto' && !showFallback

  return (
    <div
      className={cn('relative overflow-hidden border border-line bg-bg-elevated', wrapperClassName)}
      style={natural ? undefined : { aspectRatio: ratio === 'auto' ? '16 / 10' : ratio }}
    >
      {showFallback ? (
        <div className="absolute inset-0 flex items-end p-4">
          <span className="label-caps">No image</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            'transition-opacity duration-500',
            natural ? 'block h-auto w-full' : 'absolute inset-0 h-full w-full object-cover',
            loaded ? 'opacity-100' : 'opacity-0',
            className,
          )}
          {...rest}
        />
      )}
    </div>
  )
}
