const JAKARTA_TZ = 'Asia/Jakarta'

export function formatDate(iso: string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(date)
}

export function formatMonthYear(iso: string | null | undefined): string {
  if (!iso) return 'Now'
  return formatDate(iso, { day: undefined, month: 'short', year: 'numeric' })
}

export function formatYear(iso: string | null | undefined): string {
  if (!iso) return 'Now'
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '—' : String(date.getFullYear())
}

/** Local time in Indonesia (WIB), e.g. "14:03:22". */
export function formatJakartaTime(date: Date, withSeconds = true): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: JAKARTA_TZ,
    hour: '2-digit',
    minute: '2-digit',
    second: withSeconds ? '2-digit' : undefined,
    hour12: false,
  }).format(date)
}

export function formatJakartaDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: JAKARTA_TZ,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date)
}

export function padIndex(index: number, width = 2): string {
  return String(index).padStart(width, '0')
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function estimateReadingTime(markdown: string, wordsPerMinute = 200): number {
  const words = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`~-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / wordsPerMinute))
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`
}

export function truncate(text: string, max = 140): string {
  if (text.length <= max) return text
  return `${text.slice(0, max - 1).trimEnd()}…`
}

export const labels = {
  category: {
    web: 'Web',
    system: 'System',
    experiment: 'Experiment',
    research: 'Research',
  },
  projectStatus: {
    draft: 'Draft',
    in_progress: 'In progress',
    live: 'Live',
    archived: 'Archived',
  },
  noteStatus: {
    draft: 'Draft',
    published: 'Published',
  },
  nowType: {
    building: 'Building',
    learning: 'Learning',
    reading: 'Reading',
    thinking: 'Thinking about',
  },
} as const
