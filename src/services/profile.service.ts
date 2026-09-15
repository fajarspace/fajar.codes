import { requireSupabase, supabase } from '@/lib/supabase'
import { sampleProfile } from '@/constants/sample-content'
import type { Profile } from '@/types/content'
import type { TablesUpdate } from '@/types/database'
import { mapProfile } from '@/utils/mappers'
import { NotFoundError } from '@/utils/errors'

/** The site owner's public profile (the first profile with role = admin). */
export async function getPublicProfile(): Promise<Profile> {
  if (!supabase) return sampleProfile
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'admin')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  if (!data) return sampleProfile
  return mapProfile(data)
}

export async function getProfileById(id: string): Promise<Profile> {
  const client = requireSupabase()
  const { data, error } = await client.from('profiles').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  if (!data) throw new NotFoundError('Profile not found')
  return mapProfile(data)
}

export interface ProfilePatch {
  fullName?: string
  username?: string
  headline?: string | null
  bio?: string | null
  avatarUrl?: string | null
  location?: string | null
  availabilityStatus?: Profile['availabilityStatus']
  currentActivity?: string | null
  email?: string | null
}

export async function updateProfile(id: string, patch: ProfilePatch): Promise<Profile> {
  const client = requireSupabase()
  const update: TablesUpdate<'profiles'> = {}
  if (patch.fullName !== undefined) update.full_name = patch.fullName
  if (patch.username !== undefined) update.username = patch.username
  if (patch.headline !== undefined) update.headline = patch.headline
  if (patch.bio !== undefined) update.bio = patch.bio
  if (patch.avatarUrl !== undefined) update.avatar_url = patch.avatarUrl
  if (patch.location !== undefined) update.location = patch.location
  if (patch.availabilityStatus !== undefined) update.availability_status = patch.availabilityStatus
  if (patch.currentActivity !== undefined) update.current_activity = patch.currentActivity
  if (patch.email !== undefined) update.email = patch.email

  const { data, error } = await client.from('profiles').update(update).eq('id', id).select('*').single()
  if (error) throw error
  return mapProfile(data)
}
