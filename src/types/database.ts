/**
 * Hand-written Supabase schema types. Keep in sync with supabase/migrations.
 * (You can regenerate with `supabase gen types typescript --local > src/types/database.ts`
 *  once the CLI is set up; the shape below mirrors the generated output.)
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type ProfileRole = 'admin' | 'user'
export type AvailabilityStatus = 'available' | 'limited' | 'unavailable'
export type ProjectCategory = 'web' | 'system' | 'experiment' | 'research'
export type ProjectStatus = 'draft' | 'in_progress' | 'live' | 'archived'
export type NoteStatus = 'draft' | 'published'
export type NowItemType = 'building' | 'learning' | 'reading' | 'thinking'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          username: string
          headline: string | null
          bio: string | null
          avatar_url: string | null
          location: string | null
          availability_status: AvailabilityStatus
          current_activity: string | null
          email: string | null
          role: ProfileRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string
          username?: string
          headline?: string | null
          bio?: string | null
          avatar_url?: string | null
          location?: string | null
          availability_status?: AvailabilityStatus
          current_activity?: string | null
          email?: string | null
          role?: ProfileRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          username?: string
          headline?: string | null
          bio?: string | null
          avatar_url?: string | null
          location?: string | null
          availability_status?: AvailabilityStatus
          current_activity?: string | null
          email?: string | null
          role?: ProfileRole
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          title: string
          slug: string
          short_description: string
          content: string
          category: ProjectCategory
          year: number
          role: string | null
          tech_stack: string[]
          cover_url: string | null
          live_url: string | null
          repository_url: string | null
          status: ProjectStatus
          featured: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          short_description?: string
          content?: string
          category?: ProjectCategory
          year?: number
          role?: string | null
          tech_stack?: string[]
          cover_url?: string | null
          live_url?: string | null
          repository_url?: string | null
          status?: ProjectStatus
          featured?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          short_description?: string
          content?: string
          category?: ProjectCategory
          year?: number
          role?: string | null
          tech_stack?: string[]
          cover_url?: string | null
          live_url?: string | null
          repository_url?: string | null
          status?: ProjectStatus
          featured?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_images: {
        Row: {
          id: string
          project_id: string
          image_url: string
          caption: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          image_url: string
          caption?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          image_url?: string
          caption?: string | null
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'project_images_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
        ]
      }
      notes: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string
          content: string
          cover_url: string | null
          reading_time: number
          status: NoteStatus
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string
          content?: string
          cover_url?: string | null
          reading_time?: number
          status?: NoteStatus
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string
          content?: string
          cover_url?: string | null
          reading_time?: number
          status?: NoteStatus
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      note_tags: {
        Row: {
          note_id: string
          tag_id: string
        }
        Insert: {
          note_id: string
          tag_id: string
        }
        Update: {
          note_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'note_tags_note_id_fkey'
            columns: ['note_id']
            isOneToOne: false
            referencedRelation: 'notes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'note_tags_tag_id_fkey'
            columns: ['tag_id']
            isOneToOne: false
            referencedRelation: 'tags'
            referencedColumns: ['id']
          },
        ]
      }
      gallery_photos: {
        Row: {
          id: string
          title: string
          caption: string | null
          image_url: string
          width: number | null
          height: number | null
          location: string | null
          taken_at: string | null
          is_published: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title?: string
          caption?: string | null
          image_url: string
          width?: number | null
          height?: number | null
          location?: string | null
          taken_at?: string | null
          is_published?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          caption?: string | null
          image_url?: string
          width?: number | null
          height?: number | null
          location?: string | null
          taken_at?: string | null
          is_published?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      now_items: {
        Row: {
          id: string
          type: NowItemType
          title: string
          description: string | null
          url: string | null
          is_active: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          type: NowItemType
          title: string
          description?: string | null
          url?: string | null
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          type?: NowItemType
          title?: string
          description?: string | null
          url?: string | null
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
