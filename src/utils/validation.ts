import { z } from 'zod'

const slug = z
  .string()
  .trim()
  .min(2, 'Slug is too short')
  .max(80, 'Slug is too long')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens only')

const optionalUrl = z
  .string()
  .trim()
  .refine((v) => v === '' || /^https?:\/\/\S+$/.test(v) || v.startsWith('/'), 'Enter a full URL (https://…) or a path (/…)')

const optionalText = z.string().trim()

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
export type LoginValues = z.infer<typeof loginSchema>

export const projectSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120),
  slug,
  shortDescription: z.string().trim().min(1, 'A one-line description is required').max(240),
  content: z.string(),
  category: z.enum(['web', 'system', 'experiment', 'research']),
  year: z.number({ error: 'Year is required' }).int().min(1990).max(2100),
  role: optionalText.max(120),
  techStack: z.string().trim(),
  coverUrl: z.string().trim(),
  liveUrl: optionalUrl,
  repositoryUrl: optionalUrl,
  status: z.enum(['draft', 'in_progress', 'live', 'archived']),
  featured: z.boolean(),
  sortOrder: z.number({ error: 'Sort order must be a number' }).int().min(0).max(9999),
})
export type ProjectFormValues = z.infer<typeof projectSchema>

/** Top-level routes a note slug must not collide with (notes are served at /<slug>). */
const reservedSlugs = ['work', 'notes', 'photos', 'admin', 'api', 'assets', 'images']

export const noteSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(160),
  slug: slug.refine((v) => !reservedSlugs.includes(v), 'This slug is reserved for a page'),
  excerpt: z.string().trim().min(1, 'An excerpt is required').max(300),
  content: z.string().min(1, 'Write something first'),
  coverUrl: z.string().trim(),
  tags: z.string().trim(),
  status: z.enum(['draft', 'published']),
  publishedAt: z.string().trim(),
})
export type NoteFormValues = z.infer<typeof noteSchema>

export const nowItemSchema = z.object({
  type: z.enum(['building', 'learning', 'reading', 'thinking']),
  title: z.string().trim().min(1, 'Title is required').max(120),
  description: optionalText.max(300),
  url: optionalUrl,
  isActive: z.boolean(),
})
export type NowItemFormValues = z.infer<typeof nowItemSchema>

export const photoSchema = z.object({
  title: z.string().trim().max(120),
  caption: optionalText.max(400),
  location: optionalText.max(120),
  takenAt: z.string(),
  isPublished: z.boolean(),
  sortOrder: z.number({ error: 'Sort order must be a number' }).int().min(0).max(9999),
})
export type PhotoFormValues = z.infer<typeof photoSchema>

export const profileSchema = z.object({
  fullName: z.string().trim().min(1, 'Name is required').max(120),
  username: z
    .string()
    .trim()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9_]+$/, 'Lowercase letters, numbers and underscores only'),
  headline: optionalText.max(160),
  bio: optionalText.max(600),
  avatarUrl: z.string().trim(),
  location: optionalText.max(120),
  email: z.string().trim().refine((v) => v === '' || z.email().safeParse(v).success, 'Enter a valid email'),
})
export type ProfileFormValues = z.infer<typeof profileSchema>

/** "React, TypeScript, Supabase" → ["React", "TypeScript", "Supabase"] */
export function splitList(value: string): string[] {
  return Array.from(new Set(value.split(/[,\n]/).map((s) => s.trim()).filter(Boolean)))
}

export function emptyToNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}
