import { requireSupabase, supabase } from '@/lib/supabase'
import { sampleProjects } from '@/constants/sample-content'
import type { Project, ProjectImage, ProjectStatus, ProjectWithImages } from '@/types/content'
import type { TablesInsert, TablesUpdate } from '@/types/database'
import { mapProject, mapProjectImage } from '@/utils/mappers'
import { NotFoundError } from '@/utils/errors'

export interface ListProjectsOptions {
  /** Include drafts (admin only — RLS will filter them out for anonymous users anyway). */
  includeDrafts?: boolean
  featuredOnly?: boolean
  limit?: number
}

function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => a.sortOrder - b.sortOrder || b.year - a.year)
}

export async function listProjects(options: ListProjectsOptions = {}): Promise<Project[]> {
  const { includeDrafts = false, featuredOnly = false, limit } = options

  if (!supabase) {
    let items = sortProjects(sampleProjects)
    if (!includeDrafts) items = items.filter((p) => p.status !== 'draft')
    if (featuredOnly) items = items.filter((p) => p.featured)
    return typeof limit === 'number' ? items.slice(0, limit) : items
  }

  let query = supabase.from('projects').select('*').order('sort_order', { ascending: true }).order('year', { ascending: false })
  if (!includeDrafts) query = query.neq('status', 'draft')
  if (featuredOnly) query = query.eq('featured', true)
  if (typeof limit === 'number') query = query.limit(limit)

  const { data, error } = await query
  if (error) throw error
  return data.map(mapProject)
}

export async function getProjectBySlug(slug: string): Promise<ProjectWithImages> {
  if (!supabase) {
    const found = sampleProjects.find((p) => p.slug === slug && p.status !== 'draft')
    if (!found) throw new NotFoundError('Project not found')
    return found
  }

  const { data, error } = await supabase.from('projects').select('*').eq('slug', slug).maybeSingle()
  if (error) throw error
  if (!data) throw new NotFoundError('Project not found')
  const images = await listProjectImages(data.id)
  return { ...mapProject(data), images }
}

export async function getProjectById(id: string): Promise<ProjectWithImages> {
  const client = requireSupabase()
  const { data, error } = await client.from('projects').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  if (!data) throw new NotFoundError('Project not found')
  const images = await listProjectImages(id)
  return { ...mapProject(data), images }
}

/** The project after `current` in the public ordering, wrapping around to the first one. */
export async function getNextProject(current: Project): Promise<Project | null> {
  const projects = await listProjects()
  if (projects.length < 2) return null
  const index = projects.findIndex((p) => p.id === current.id)
  const next = projects[(index + 1) % projects.length]
  return next && next.id !== current.id ? next : null
}

export async function listProjectImages(projectId: string): Promise<ProjectImage[]> {
  if (!supabase) return sampleProjects.find((p) => p.id === projectId)?.images ?? []
  const { data, error } = await supabase
    .from('project_images')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data.map(mapProjectImage)
}

export interface ProjectInput {
  title: string
  slug: string
  shortDescription: string
  content: string
  category: Project['category']
  year: number
  role: string | null
  techStack: string[]
  coverUrl: string | null
  liveUrl: string | null
  repositoryUrl: string | null
  status: ProjectStatus
  featured: boolean
  sortOrder: number
}

function toInsert(input: ProjectInput): TablesInsert<'projects'> {
  return {
    title: input.title,
    slug: input.slug,
    short_description: input.shortDescription,
    content: input.content,
    category: input.category,
    year: input.year,
    role: input.role,
    tech_stack: input.techStack,
    cover_url: input.coverUrl,
    live_url: input.liveUrl,
    repository_url: input.repositoryUrl,
    status: input.status,
    featured: input.featured,
    sort_order: input.sortOrder,
  }
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const client = requireSupabase()
  const { data, error } = await client.from('projects').insert(toInsert(input)).select('*').single()
  if (error) throw error
  return mapProject(data)
}

export async function updateProject(id: string, input: Partial<ProjectInput>): Promise<Project> {
  const client = requireSupabase()
  const patch: TablesUpdate<'projects'> = {}
  if (input.title !== undefined) patch.title = input.title
  if (input.slug !== undefined) patch.slug = input.slug
  if (input.shortDescription !== undefined) patch.short_description = input.shortDescription
  if (input.content !== undefined) patch.content = input.content
  if (input.category !== undefined) patch.category = input.category
  if (input.year !== undefined) patch.year = input.year
  if (input.role !== undefined) patch.role = input.role
  if (input.techStack !== undefined) patch.tech_stack = input.techStack
  if (input.coverUrl !== undefined) patch.cover_url = input.coverUrl
  if (input.liveUrl !== undefined) patch.live_url = input.liveUrl
  if (input.repositoryUrl !== undefined) patch.repository_url = input.repositoryUrl
  if (input.status !== undefined) patch.status = input.status
  if (input.featured !== undefined) patch.featured = input.featured
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder

  const { data, error } = await client.from('projects').update(patch).eq('id', id).select('*').single()
  if (error) throw error
  return mapProject(data)
}

export async function setProjectStatus(id: string, status: ProjectStatus): Promise<Project> {
  return updateProject(id, { status })
}

export async function deleteProject(id: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.from('projects').delete().eq('id', id)
  if (error) throw error
}

export async function addProjectImage(input: {
  projectId: string
  imageUrl: string
  caption: string | null
  sortOrder: number
}): Promise<ProjectImage> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('project_images')
    .insert({
      project_id: input.projectId,
      image_url: input.imageUrl,
      caption: input.caption,
      sort_order: input.sortOrder,
    })
    .select('*')
    .single()
  if (error) throw error
  return mapProjectImage(data)
}

export async function updateProjectImage(id: string, patch: { caption?: string | null; sortOrder?: number }): Promise<void> {
  const client = requireSupabase()
  const update: TablesUpdate<'project_images'> = {}
  if (patch.caption !== undefined) update.caption = patch.caption
  if (patch.sortOrder !== undefined) update.sort_order = patch.sortOrder
  const { error } = await client.from('project_images').update(update).eq('id', id)
  if (error) throw error
}

export async function deleteProjectImage(id: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.from('project_images').delete().eq('id', id)
  if (error) throw error
}
