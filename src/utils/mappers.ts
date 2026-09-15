import type { Tables } from '@/types/database'
import type { GalleryPhoto, Note, NowItem, Profile, Project, ProjectImage, Tag } from '@/types/content'

export function mapProfile(row: Tables<'profiles'>): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    username: row.username,
    headline: row.headline,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    location: row.location,
    availabilityStatus: row.availability_status,
    currentActivity: row.current_activity,
    email: row.email,
    role: row.role,
    updatedAt: row.updated_at,
  }
}

export function mapProject(row: Tables<'projects'>): Project {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    shortDescription: row.short_description,
    content: row.content,
    category: row.category,
    year: row.year,
    role: row.role,
    techStack: row.tech_stack ?? [],
    coverUrl: row.cover_url,
    liveUrl: row.live_url,
    repositoryUrl: row.repository_url,
    status: row.status,
    featured: row.featured,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapProjectImage(row: Tables<'project_images'>): ProjectImage {
  return {
    id: row.id,
    projectId: row.project_id,
    imageUrl: row.image_url,
    caption: row.caption,
    sortOrder: row.sort_order,
  }
}

export function mapTag(row: Tables<'tags'>): Tag {
  return { id: row.id, name: row.name, slug: row.slug }
}

export function mapNote(row: Tables<'notes'>, tags: Tag[] = []): Note {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    coverUrl: row.cover_url,
    readingTime: row.reading_time,
    status: row.status,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    tags,
  }
}

export function mapNowItem(row: Tables<'now_items'>): NowItem {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    url: row.url,
    isActive: row.is_active,
    updatedAt: row.updated_at,
  }
}

export function mapGalleryPhoto(row: Tables<'gallery_photos'>): GalleryPhoto {
  return {
    id: row.id,
    title: row.title,
    caption: row.caption,
    imageUrl: row.image_url,
    width: row.width,
    height: row.height,
    location: row.location,
    takenAt: row.taken_at,
    isPublished: row.is_published,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
