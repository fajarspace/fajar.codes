import { useState, type ImgHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface SmartImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string | null | undefined
  alt: string
  /** CSS aspect ratio, e.g. "16 / 10". Reserves space so the layout never shifts. */
  ratio?: string
  priority?: boolean
  wrapperClassName?: string
}

/**
 * Lazy image with reserved aspect ratio, a placeholder tone while loading,
 * and a typographic fallback when no source is available.
 */
export function SmartImage({ src, alt, ratio = '16 / 10', priority = false, className, wrapperClassName, ...rest }: SmartImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const showFallback = !src || failed

  return (
    <div
      className={cn('relative overflow-hidden border border-line bg-bg-elevated', wrapperClassName)}
      style={{ aspectRatio: ratio }}
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
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-500',
            loaded ? 'opacity-100' : 'opacity-0',
            className,
          )}
          {...rest}
        />
      )}
    </div>
  )
}
