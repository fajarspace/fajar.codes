import { requireSupabase } from '@/lib/supabase'
import type { ContentCounts } from '@/types/content'

export async function getContentCounts(): Promise<ContentCounts> {
  const client = requireSupabase()
  const [projects, publishedProjects, notes, publishedNotes, photos, publishedPhotos, nowItems] = await Promise.all([
    client.from('projects').select('id', { count: 'exact', head: true }),
    client.from('projects').select('id', { count: 'exact', head: true }).neq('status', 'draft'),
    client.from('notes').select('id', { count: 'exact', head: true }),
    client.from('notes').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    client.from('gallery_photos').select('id', { count: 'exact', head: true }),
    client.from('gallery_photos').select('id', { count: 'exact', head: true }).eq('is_published', true),
    client.from('now_items').select('id', { count: 'exact', head: true }).eq('is_active', true),
  ])
  const first = [projects, publishedProjects, notes, publishedNotes, photos, publishedPhotos, nowItems].find((r) => r.error)
  if (first?.error) throw first.error
  return {
    projects: projects.count ?? 0,
    publishedProjects: publishedProjects.count ?? 0,
    notes: notes.count ?? 0,
    publishedNotes: publishedNotes.count ?? 0,
    photos: photos.count ?? 0,
    publishedPhotos: publishedPhotos.count ?? 0,
    nowItems: nowItems.count ?? 0,
  }
}
