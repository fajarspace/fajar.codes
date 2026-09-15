/** Typed access to Vite environment variables. */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
// Supabase now issues `sb_publishable_…` keys in place of the legacy anon JWT; both work the same way.
const publicKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)
const siteUrl = (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'https://fajar.codes'

export const env = {
  supabaseUrl: url?.trim() ?? '',
  supabaseAnonKey: publicKey?.trim() ?? '',
  siteUrl: siteUrl.replace(/\/$/, ''),
  isDev: import.meta.env.DEV,
} as const

/** True when both Supabase variables are present. Otherwise the site runs on bundled sample content. */
export const isSupabaseConfigured = env.supabaseUrl.length > 0 && env.supabaseAnonKey.length > 0
