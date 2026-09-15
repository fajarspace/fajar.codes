/**
 * Link-preview endpoint (Vercel Edge Function).
 *
 * The site is a SPA, so crawlers (WhatsApp, Telegram, Slack, X, Facebook, …) never run the JS
 * that sets per-page Open Graph tags. vercel.json rewrites /notes/:slug and /work/:slug to this
 * function *only* when the User-Agent looks like a link-preview bot; humans keep getting the app.
 */
export const config = { runtime: 'edge' }

const SITE_URL = (process.env.VITE_SITE_URL ?? 'https://fajar.codes').replace(/\/$/, '')
const SITE_NAME = 'fajar.codes'
const DEFAULT_TITLE = 'Fajar — builds useful things for the web'
const DEFAULT_DESCRIPTION =
  'A personal workspace on the web — projects, notes, experiments and whatever Fajar is currently building, learning or thinking about.'
const DEFAULT_IMAGE = `${SITE_URL}/og.png`

interface Meta {
  title: string
  description: string
  image: string
  url: string
  type: 'website' | 'article'
  publishedAt?: string | null
  updatedAt?: string | null
}

interface NoteRow {
  title: string
  excerpt: string
  cover_url: string | null
  published_at: string | null
  updated_at: string
}

interface ProjectRow {
  title: string
  short_description: string
  cover_url: string | null
  updated_at: string
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch] ?? ch)
}

function absolute(url: string | null | undefined): string {
  if (!url) return DEFAULT_IMAGE
  if (/^https?:\/\//.test(url)) return url
  return `${SITE_URL}${url.startsWith('/') ? url : `/${url}`}`
}

async function fetchRow<T>(table: string, slug: string, select: string, extra: string): Promise<T | null> {
  const base = process.env.VITE_SUPABASE_URL?.trim()
  const key = (process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY)?.trim()
  if (!base || !key) return null
  const query = `${base}/rest/v1/${table}?slug=eq.${encodeURIComponent(slug)}&${extra}&select=${select}&limit=1`
  const response = await fetch(query, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
  if (!response.ok) return null
  const rows = (await response.json()) as T[]
  return rows[0] ?? null
}

async function metaFor(type: string | null, slug: string | null): Promise<Meta> {
  const fallback: Meta = { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, image: DEFAULT_IMAGE, url: SITE_URL, type: 'website' }
  if (!slug) return fallback

  if (type === 'note') {
    const note = await fetchRow<NoteRow>('notes', slug, 'title,excerpt,cover_url,published_at,updated_at', 'status=eq.published')
    if (!note) return { ...fallback, url: `${SITE_URL}/notes/${slug}` }
    return {
      title: `${note.title} — Fajar`,
      description: note.excerpt || DEFAULT_DESCRIPTION,
      image: absolute(note.cover_url),
      url: `${SITE_URL}/notes/${slug}`,
      type: 'article',
      publishedAt: note.published_at,
      updatedAt: note.updated_at,
    }
  }

  if (type === 'project') {
    const project = await fetchRow<ProjectRow>('projects', slug, 'title,short_description,cover_url,updated_at', 'status=neq.draft')
    if (!project) return { ...fallback, url: `${SITE_URL}/work/${slug}` }
    return {
      title: `${project.title} — Fajar`,
      description: project.short_description || DEFAULT_DESCRIPTION,
      image: absolute(project.cover_url),
      url: `${SITE_URL}/work/${slug}`,
      type: 'website',
      updatedAt: project.updated_at,
    }
  }

  return fallback
}

function render(meta: Meta): string {
  const title = escapeHtml(meta.title)
  const description = escapeHtml(meta.description)
  const image = escapeHtml(meta.image)
  const url = escapeHtml(meta.url)
  const article =
    meta.type === 'article'
      ? `${meta.publishedAt ? `<meta property="article:published_time" content="${escapeHtml(meta.publishedAt)}" />` : ''}
    ${meta.updatedAt ? `<meta property="article:modified_time" content="${escapeHtml(meta.updatedAt)}" />` : ''}`
      : ''

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:type" content="${meta.type}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:secure_url" content="${image}" />
    <meta property="og:locale" content="en_US" />
    ${article}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    <meta http-equiv="refresh" content="0; url=${url}" />
  </head>
  <body>
    <p><a href="${url}">${title}</a></p>
  </body>
</html>
`
}

export default async function handler(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const meta = await metaFor(searchParams.get('type'), searchParams.get('slug'))
  return new Response(render(meta), {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, s-maxage=600, stale-while-revalidate=86400',
    },
  })
}
