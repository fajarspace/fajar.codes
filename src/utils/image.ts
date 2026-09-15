/**
 * Client-side image optimisation before upload:
 * resizes to a maximum edge and re-encodes as WebP when the browser supports it.
 */
export interface OptimizeOptions {
  maxEdge?: number
  quality?: number
  /** Output format. WebP is smaller; JPEG is what every link-preview crawler (WhatsApp, iMessage, …) accepts. */
  format?: 'image/webp' | 'image/jpeg'
}

export async function optimizeImage(file: File, options: OptimizeOptions = {}): Promise<File> {
  const { maxEdge = 1800, quality = 0.84, format = 'image/webp' } = options
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
  if (format === 'image/jpeg') {
    // JPEG has no alpha: flatten onto the paper tone instead of black.
    context.fillStyle = '#f5f4f0'
    context.fillRect(0, 0, width, height)
  }
  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, format, quality))
  if (!blob) return file
  // Keep the original only when it is already the right format and smaller.
  if (blob.size >= file.size && file.type === format) return file

  const extension = format === 'image/jpeg' ? 'jpg' : 'webp'
  const name = file.name.replace(/\.[^.]+$/, '') + `.${extension}`
  return new File([blob], name, { type: format })
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
