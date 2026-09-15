import { requireSupabase } from '@/lib/supabase'
import { storage } from '@/constants/site'
import { optimizeImage, randomFileName } from '@/utils/image'

export type StorageFolder = keyof typeof storage.folders

/** Optimises then uploads an image, returning its public URL. */
export async function uploadImage(file: File, folder: StorageFolder): Promise<string> {
  const client = requireSupabase()
  const optimized = await optimizeImage(file)
  const path = `${storage.folders[folder]}/${randomFileName(optimized)}`

  const { error } = await client.storage.from(storage.bucket).upload(path, optimized, {
    cacheControl: '31536000',
    contentType: optimized.type,
    upsert: false,
  })
  if (error) throw error

  const { data } = client.storage.from(storage.bucket).getPublicUrl(path)
  return data.publicUrl
}

/** Deletes a file from the bucket when the URL points into it; ignores external URLs. */
export async function deleteImageByUrl(url: string | null | undefined): Promise<void> {
  if (!url) return
  const client = requireSupabase()
  const marker = `/storage/v1/object/public/${storage.bucket}/`
  const index = url.indexOf(marker)
  if (index === -1) return
  const path = decodeURIComponent(url.slice(index + marker.length))
  const { error } = await client.storage.from(storage.bucket).remove([path])
  if (error) throw error
}
