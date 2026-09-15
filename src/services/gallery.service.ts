import { requireSupabase, supabase } from '@/lib/supabase'
import { sampleGallery } from '@/constants/sample-content'
import type { GalleryPhoto } from '@/types/content'
import type { TablesInsert, TablesUpdate } from '@/types/database'
import { mapGalleryPhoto } from '@/utils/mappers'

export interface ListPhotosOptions {
  /** Include unpublished photos (admin only — RLS hides them from anonymous users anyway). */
  includeUnpublished?: boolean
  limit?: number
}

function sortPhotos(photos: GalleryPhoto[]): GalleryPhoto[] {
  return [...photos].sort((a, b) => a.sortOrder - b.sortOrder || (b.takenAt ?? '').localeCompare(a.takenAt ?? ''))
}

export async function listPhotos(options: ListPhotosOptions = {}): Promise<GalleryPhoto[]> {
  const { includeUnpublished = false, limit } = options

  if (!supabase) {
    let items = sortPhotos(sampleGallery)
    if (!includeUnpublished) items = items.filter((p) => p.isPublished)
    return typeof limit === 'number' ? items.slice(0, limit) : items
  }

  let query = supabase
    .from('gallery_photos')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('taken_at', { ascending: false, nullsFirst: false })
  if (!includeUnpublished) query = query.eq('is_published', true)
  if (typeof limit === 'number') query = query.limit(limit)

  const { data, error } = await query
  if (error) throw error
  return data.map(mapGalleryPhoto)
}

export interface PhotoInput {
  title: string
  caption: string | null
  imageUrl: string
  width: number | null
  height: number | null
  location: string | null
  takenAt: string | null
  isPublished: boolean
  sortOrder: number
}

function toInsert(input: PhotoInput): TablesInsert<'gallery_photos'> {
  return {
    title: input.title,
    caption: input.caption,
    image_url: input.imageUrl,
    width: input.width,
    height: input.height,
    location: input.location,
    taken_at: input.takenAt,
    is_published: input.isPublished,
    sort_order: input.sortOrder,
  }
}

export async function createPhoto(input: PhotoInput): Promise<GalleryPhoto> {
  const client = requireSupabase()
  const { data, error } = await client.from('gallery_photos').insert(toInsert(input)).select('*').single()
  if (error) throw error
  return mapGalleryPhoto(data)
}

export async function updatePhoto(id: string, input: Partial<PhotoInput>): Promise<GalleryPhoto> {
  const client = requireSupabase()
  const patch: TablesUpdate<'gallery_photos'> = {}
  if (input.title !== undefined) patch.title = input.title
  if (input.caption !== undefined) patch.caption = input.caption
  if (input.imageUrl !== undefined) patch.image_url = input.imageUrl
  if (input.width !== undefined) patch.width = input.width
  if (input.height !== undefined) patch.height = input.height
  if (input.location !== undefined) patch.location = input.location
  if (input.takenAt !== undefined) patch.taken_at = input.takenAt
  if (input.isPublished !== undefined) patch.is_published = input.isPublished
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder

  const { data, error } = await client.from('gallery_photos').update(patch).eq('id', id).select('*').single()
  if (error) throw error
  return mapGalleryPhoto(data)
}

export async function deletePhoto(id: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.from('gallery_photos').delete().eq('id', id)
  if (error) throw error
}
