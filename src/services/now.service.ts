import { requireSupabase, supabase } from '@/lib/supabase'
import { sampleNowItems } from '@/constants/sample-content'
import type { NowItem, NowItemType } from '@/types/content'
import type { TablesInsert, TablesUpdate } from '@/types/database'
import { mapNowItem } from '@/utils/mappers'

const typeOrder: Record<NowItemType, number> = { building: 0, learning: 1, reading: 2, thinking: 3 }

export async function listNowItems(options: { activeOnly?: boolean } = {}): Promise<NowItem[]> {
  const { activeOnly = true } = options
  if (!supabase) {
    return sampleNowItems
      .filter((item) => !activeOnly || item.isActive)
      .sort((a, b) => typeOrder[a.type] - typeOrder[b.type])
  }
  let query = supabase.from('now_items').select('*').order('updated_at', { ascending: false })
  if (activeOnly) query = query.eq('is_active', true)
  const { data, error } = await query
  if (error) throw error
  return data.map(mapNowItem).sort((a, b) => typeOrder[a.type] - typeOrder[b.type])
}

export interface NowItemInput {
  type: NowItemType
  title: string
  description: string | null
  url: string | null
  isActive: boolean
}

function toInsert(input: NowItemInput): TablesInsert<'now_items'> {
  return {
    type: input.type,
    title: input.title,
    description: input.description,
    url: input.url,
    is_active: input.isActive,
  }
}

export async function createNowItem(input: NowItemInput): Promise<NowItem> {
  const client = requireSupabase()
  const { data, error } = await client.from('now_items').insert(toInsert(input)).select('*').single()
  if (error) throw error
  return mapNowItem(data)
}

export async function updateNowItem(id: string, input: Partial<NowItemInput>): Promise<NowItem> {
  const client = requireSupabase()
  const patch: TablesUpdate<'now_items'> = {}
  if (input.type !== undefined) patch.type = input.type
  if (input.title !== undefined) patch.title = input.title
  if (input.description !== undefined) patch.description = input.description
  if (input.url !== undefined) patch.url = input.url
  if (input.isActive !== undefined) patch.is_active = input.isActive
  const { data, error } = await client.from('now_items').update(patch).eq('id', id).select('*').single()
  if (error) throw error
  return mapNowItem(data)
}

export async function deleteNowItem(id: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.from('now_items').delete().eq('id', id)
  if (error) throw error
}
