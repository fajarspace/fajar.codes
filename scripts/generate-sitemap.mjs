/**
 * Writes public/sitemap.xml before every build.
 * Pulls published slugs from Supabase when VITE_SUPABASE_URL and a public key
 * are set (Vercel env vars or a local .env); otherwise falls back to the bundled sample content.
 *
 * Run: npm run sitemap
 */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

try {
  process.loadEnvFile?.('.env')
} catch {
  /* no .env file — fine */
}

const siteUrl = (process.env.VITE_SITE_URL ?? 'https://fajar.codes').replace(/\/$/, '')
const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim()
const anonKey = (process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY)?.trim()

const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/work', priority: '0.8', changefreq: 'weekly' },
  { path: '/notes', priority: '0.8', changefreq: 'weekly' },
  { path: '/photos', priority: '0.6', changefreq: 'weekly' },
]

async function fromSupabase() {
  const headers = { apikey: anonKey, Authorization: `Bearer ${anonKey}` }
  const [projects, notes] = await Promise.all([
    fetch(`${supabaseUrl}/rest/v1/projects?select=slug,updated_at&status=neq.draft`, { headers }).then((r) => r.json()),
    fetch(`${supabaseUrl}/rest/v1/notes?select=slug,updated_at&status=eq.published`, { headers }).then((r) => r.json()),
  ])
  if (!Array.isArray(projects) || !Array.isArray(notes)) throw new Error('Unexpected response from Supabase')
  return { projects, notes }
}

async function fromSample() {
  const mod = await import(pathToFileURL(join(process.cwd(), 'src/constants/sample-content.ts')).href)
  return {
    projects: mod.sampleProjects.filter((p) => p.status !== 'draft').map((p) => ({ slug: p.slug, updated_at: p.updatedAt })),
    notes: mod.sampleNotes.filter((n) => n.status === 'published').map((n) => ({ slug: n.slug, updated_at: n.updatedAt })),
  }
}

let source = 'sample content'
let data
if (supabaseUrl && anonKey) {
  try {
    data = await fromSupabase()
    source = 'Supabase'
  } catch (error) {
    console.warn(`[sitemap] Supabase fetch failed (${error.message}); using sample content.`)
  }
}
if (!data) data = await fromSample()

const iso = (value) => (value ? new Date(value).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10))
const entry = (path, lastmod, changefreq, priority) =>
  `  <url>\n    <loc>${siteUrl}${path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`

const urls = [
  ...staticRoutes.map((r) => entry(r.path, iso(), r.changefreq, r.priority)),
  ...data.projects.map((p) => entry(`/work/${p.slug}`, iso(p.updated_at), 'monthly', '0.7')),
  ...data.notes.map((n) => entry(`/notes/${n.slug}`, iso(n.updated_at), 'monthly', '0.7')),
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
writeFileSync(join(process.cwd(), 'public/sitemap.xml'), xml)
console.log(`[sitemap] ${urls.length} URLs written from ${source}.`)
