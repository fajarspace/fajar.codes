import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { env, isSupabaseConfigured } from './env'

export type TypedSupabaseClient = SupabaseClient<Database>

let client: TypedSupabaseClient | null = null

if (isSupabaseConfigured) {
  client = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
}

/** Nullable client: public pages fall back to sample content when it is null. */
export const supabase = client

/** Throws when Supabase is not configured — used by admin-only code paths. */
export function requireSupabase(): TypedSupabaseClient {
  if (!client) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.',
    )
  }
  return client
}

export { isSupabaseConfigured }
