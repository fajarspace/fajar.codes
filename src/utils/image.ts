/**
 * Client-side image optimisation before upload:
 * resizes to a maximum edge and re-encodes as WebP when the browser supports it.
 */
export interface OptimizeOptions {
  maxEdge?: number
  quality?: number
}

export async function optimizeImage(file: File, options: OptimizeOptions = {}): Promise<File> {
  const { maxEdge = 1800, quality = 0.84 } = options
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file
  }

  const bitmap = await createImageBitmap(file).catch(() => null)
  if (!bitmap) return file

  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) return file
  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality))
  if (!blob || blob.size >= file.size) return file

  const name = file.name.replace(/\.[^.]+$/, '') + '.webp'
  return new File([blob], name, { type: 'image/webp' })
}

export function fileExtension(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase()
  if (fromName && fromName.length <= 5) return fromName
  return file.type.split('/').pop() ?? 'bin'
}

export function randomFileName(file: File): string {
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now())
  return `${id}.${fileExtension(file)}`
}

/** Pixel dimensions of an image file, or null when the browser cannot decode it. */
export async function readImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  if (!file.type.startsWith('image/')) return null
  const bitmap = await createImageBitmap(file).catch(() => null)
  if (!bitmap) return null
  const size = { width: bitmap.width, height: bitmap.height }
  bitmap.close()
  return size
}
