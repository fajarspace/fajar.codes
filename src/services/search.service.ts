import { navigation } from '@/constants/site'
import type { SearchEntry } from '@/types/content'
import { listNotes } from './notes.service'
import { listProjects } from './projects.service'

/** Builds the command-palette index from pages, published projects and notes. */
export async function buildSearchIndex(): Promise<SearchEntry[]> {
  const [projects, notes] = await Promise.all([listProjects(), listNotes()])

  const pages: SearchEntry[] = navigation.map((item) => ({
    id: `page:${item.href}`,
    kind: 'page',
    title: item.label,
    subtitle: 'Page',
    href: item.href,
    keywords: ['page', 'go to', item.label.toLowerCase()],
  }))

  const projectEntries: SearchEntry[] = projects.map((p) => ({
    id: `project:${p.id}`,
    kind: 'project',
    title: p.title,
    subtitle: `${p.year} · ${p.category}`,
    href: `/work/${p.slug}`,
    keywords: [...p.techStack.map((t) => t.toLowerCase()), p.category, p.shortDescription.toLowerCase()],
  }))

  const noteEntries: SearchEntry[] = notes.map((n) => ({
    id: `note:${n.id}`,
    kind: 'note',
    title: n.title,
    subtitle: n.tags.map((t) => t.name).join(', ') || 'note',
    href: `/${n.slug}`,
    keywords: [...n.tags.map((t) => t.slug), n.excerpt.toLowerCase()],
  }))

  return [...pages, ...projectEntries, ...noteEntries]
}

/** Very small fuzzy-ish matcher: every query token must appear in title/subtitle/keywords. */
export function filterSearchEntries(entries: SearchEntry[], query: string): SearchEntry[] {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return entries
  return entries
    .map((entry) => {
      const haystack = [entry.title, entry.subtitle ?? '', ...(entry.keywords ?? [])].join(' ').toLowerCase()
      const titleLower = entry.title.toLowerCase()
      let score = 0
      for (const token of tokens) {
        if (!haystack.includes(token)) return null
        if (titleLower.startsWith(token)) score += 3
        else if (titleLower.includes(token)) score += 2
        else score += 1
      }
      return { entry, score }
    })
    .filter((x): x is { entry: SearchEntry; score: number } => x !== null)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.entry)
}
