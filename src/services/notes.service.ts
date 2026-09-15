import { requireSupabase, supabase } from '@/lib/supabase'
import { sampleNotes, sampleTags } from '@/constants/sample-content'
import type { Note, NoteStatus, Tag } from '@/types/content'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database'
import { mapNote, mapTag } from '@/utils/mappers'
import { NotFoundError } from '@/utils/errors'
import { slugify } from '@/utils/format'

export interface ListNotesOptions {
  includeDrafts?: boolean
  limit?: number
}

/** Shape returned by the notes ↔ tags join. */
type NoteRowWithTags = Tables<'notes'> & { note_tags: { tags: Tables<'tags'> | null }[] }

const NOTE_WITH_TAGS = '*, note_tags(tags(*))'

function fromJoined(row: NoteRowWithTags): Note {
  const tags = row.note_tags
    .map((nt) => nt.tags)
    .filter((t): t is Tables<'tags'> => t !== null)
    .map(mapTag)
    .sort((a, b) => a.name.localeCompare(b.name))
  return mapNote(row, tags)
}

function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    const da = a.publishedAt ?? a.updatedAt
    const db = b.publishedAt ?? b.updatedAt
    return db.localeCompare(da)
  })
}

export async function listNotes(options: ListNotesOptions = {}): Promise<Note[]> {
  const { includeDrafts = false, limit } = options

  if (!supabase) {
    let items = sortNotes(sampleNotes)
    if (!includeDrafts) items = items.filter((n) => n.status === 'published')
    return typeof limit === 'number' ? items.slice(0, limit) : items
  }

  let query = supabase
    .from('notes')
    .select(NOTE_WITH_TAGS)
    .order('published_at', { ascending: false, nullsFirst: includeDrafts })
    .order('updated_at', { ascending: false })
  if (!includeDrafts) query = query.eq('status', 'published')
  if (typeof limit === 'number') query = query.limit(limit)

  const { data, error } = await query
  if (error) throw error
  return (data as NoteRowWithTags[]).map(fromJoined)
}

export async function getNoteBySlug(slug: string): Promise<Note> {
  if (!supabase) {
    const found = sampleNotes.find((n) => n.slug === slug && n.status === 'published')
    if (!found) throw new NotFoundError('Note not found')
    return found
  }
  const { data, error } = await supabase.from('notes').select(NOTE_WITH_TAGS).eq('slug', slug).maybeSingle()
  if (error) throw error
  if (!data) throw new NotFoundError('Note not found')
  return fromJoined(data as NoteRowWithTags)
}

export async function getNoteById(id: string): Promise<Note> {
  const client = requireSupabase()
  const { data, error } = await client.from('notes').select(NOTE_WITH_TAGS).eq('id', id).maybeSingle()
  if (error) throw error
  if (!data) throw new NotFoundError('Note not found')
  return fromJoined(data as NoteRowWithTags)
}

/** Notes sharing the most tags with `note`, falling back to the latest ones. */
export async function getRelatedNotes(note: Note, limit = 3): Promise<Note[]> {
  const all = (await listNotes()).filter((n) => n.id !== note.id)
  const tagIds = new Set(note.tags.map((t) => t.id))
  return all
    .map((n) => ({ note: n, score: n.tags.filter((t) => tagIds.has(t.id)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.note)
}

export async function getRandomNote(excludeSlug?: string): Promise<Note | null> {
  const notes = (await listNotes()).filter((n) => n.slug !== excludeSlug)
  if (notes.length === 0) return null
  return notes[Math.floor(Math.random() * notes.length)] ?? null
}

export async function listTags(): Promise<Tag[]> {
  if (!supabase) return [...sampleTags].sort((a, b) => a.name.localeCompare(b.name))
  const { data, error } = await supabase.from('tags').select('*').order('name', { ascending: true })
  if (error) throw error
  return data.map(mapTag)
}

export interface NoteInput {
  title: string
  slug: string
  excerpt: string
  content: string
  coverUrl: string | null
  readingTime: number
  status: NoteStatus
  publishedAt: string | null
  /** Tag names; unknown tags are created on the fly. */
  tagNames: string[]
}

function toInsert(input: NoteInput): TablesInsert<'notes'> {
  return {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    content: input.content,
    cover_url: input.coverUrl,
    reading_time: input.readingTime,
    status: input.status,
    published_at: input.publishedAt,
  }
}

export async function createNote(input: NoteInput): Promise<Note> {
  const client = requireSupabase()
  const { data, error } = await client.from('notes').insert(toInsert(input)).select('*').single()
  if (error) throw error
  await syncNoteTags(data.id, input.tagNames)
  return getNoteById(data.id)
}

export async function updateNote(id: string, input: Partial<NoteInput>): Promise<Note> {
  const client = requireSupabase()
  const patch: TablesUpdate<'notes'> = {}
  if (input.title !== undefined) patch.title = input.title
  if (input.slug !== undefined) patch.slug = input.slug
  if (input.excerpt !== undefined) patch.excerpt = input.excerpt
  if (input.content !== undefined) patch.content = input.content
  if (input.coverUrl !== undefined) patch.cover_url = input.coverUrl
  if (input.readingTime !== undefined) patch.reading_time = input.readingTime
  if (input.status !== undefined) patch.status = input.status
  if (input.publishedAt !== undefined) patch.published_at = input.publishedAt

  if (Object.keys(patch).length > 0) {
    const { error } = await client.from('notes').update(patch).eq('id', id)
    if (error) throw error
  }
  if (input.tagNames !== undefined) await syncNoteTags(id, input.tagNames)
  return getNoteById(id)
}

export async function setNoteStatus(id: string, status: NoteStatus): Promise<Note> {
  const publishedAt = status === 'published' ? new Date().toISOString() : null
  const current = await getNoteById(id)
  return updateNote(id, {
    status,
    publishedAt: status === 'published' ? (current.publishedAt ?? publishedAt) : null,
  })
}

export async function deleteNote(id: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.from('notes').delete().eq('id', id)
  if (error) throw error
}

/** Ensures tags exist (creating missing ones) and replaces the note's tag set. */
async function syncNoteTags(noteId: string, tagNames: string[]): Promise<void> {
  const client = requireSupabase()
  const names = Array.from(new Set(tagNames.map((n) => n.trim()).filter(Boolean)))
  const slugs = names.map(slugify)

  const { data: existing, error: fetchError } = slugs.length
    ? await client.from('tags').select('*').in('slug', slugs)
    : { data: [] as Tables<'tags'>[], error: null }
  if (fetchError) throw fetchError

  const existingBySlug = new Map(existing.map((t) => [t.slug, t]))
  const missing = names.filter((name) => !existingBySlug.has(slugify(name))).map((name) => ({ name, slug: slugify(name) }))

  if (missing.length > 0) {
    const { data: created, error: createError } = await client.from('tags').insert(missing).select('*')
    if (createError) throw createError
    for (const tag of created) existingBySlug.set(tag.slug, tag)
  }

  const { error: clearError } = await client.from('note_tags').delete().eq('note_id', noteId)
  if (clearError) throw clearError

  const rows = slugs
    .map((slug) => existingBySlug.get(slug))
    .filter((t): t is Tables<'tags'> => Boolean(t))
    .map((t) => ({ note_id: noteId, tag_id: t.id }))
  if (rows.length > 0) {
    const { error: linkError } = await client.from('note_tags').insert(rows)
    if (linkError) throw linkError
  }
}
