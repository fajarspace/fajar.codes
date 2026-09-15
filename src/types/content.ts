import type {
  AvailabilityStatus,
  NoteStatus,
  NowItemType,
  ProfileRole,
  ProjectCategory,
  ProjectStatus,
} from './database'

export type {
  AvailabilityStatus,
  NoteStatus,
  NowItemType,
  ProfileRole,
  ProjectCategory,
  ProjectStatus,
}

/** Domain models used by the UI. Services map database rows into these. */

export interface Profile {
  id: string
  fullName: string
  username: string
  headline: string | null
  bio: string | null
  avatarUrl: string | null
  location: string | null
  availabilityStatus: AvailabilityStatus
  currentActivity: string | null
  email: string | null
  role: ProfileRole
  updatedAt: string
}

export interface ProjectImage {
  id: string
  projectId: string
  imageUrl: string
  caption: string | null
  sortOrder: number
}

export interface Project {
  id: string
  title: string
  slug: string
  shortDescription: string
  content: string
  category: ProjectCategory
  year: number
  role: string | null
  techStack: string[]
  coverUrl: string | null
  liveUrl: string | null
  repositoryUrl: string | null
  status: ProjectStatus
  featured: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface ProjectWithImages extends Project {
  images: ProjectImage[]
}

export interface Tag {
  id: string
  name: string
  slug: string
}

export interface Note {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverUrl: string | null
  readingTime: number
  status: NoteStatus
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  tags: Tag[]
}

export interface NowItem {
  id: string
  type: NowItemType
  title: string
  description: string | null
  url: string | null
  isActive: boolean
  updatedAt: string
}

export interface GalleryPhoto {
  id: string
  title: string
  caption: string | null
  imageUrl: string
  width: number | null
  height: number | null
  location: string | null
  takenAt: string | null
  isPublished: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface ContentCounts {
  projects: number
  publishedProjects: number
  notes: number
  publishedNotes: number
  photos: number
  publishedPhotos: number
  nowItems: number
}

/** Result of a search across all content types (command palette). */
export interface SearchEntry {
  id: string
  kind: 'page' | 'project' | 'note' | 'action'
  title: string
  subtitle?: string
  href: string
  keywords?: string[]
}
