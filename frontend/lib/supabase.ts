import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function createSupabaseServerClient() {
  return createServerComponentClient({ cookies })
}

export function createSupabaseBrowserClient() {
  return createClientComponentClient()
}

export type Database = {
  public: {
    Tables: {
      species: {
        Row: {
          id: string
          common_name: string
          scientific_name: string
          type: 'animal' | 'plant'
          image_url: string | null
          safety_level: 'safe' | 'caution' | 'danger'
          is_legal: boolean
          is_domestic: boolean
          short_desc: string
          diet: string | null
          lifespan: string | null
          habitat: string | null
          care_notes: string | null
          legal_notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['species']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['species']['Insert']>
      }
      virtual_pets: {
        Row: {
          id: string
          user_id: string
          species_id: string
          name: string
          avatar_url: string | null
          personality: string
          message: string
          level: number
          happiness: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['virtual_pets']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['virtual_pets']['Insert']>
      }
      reminders: {
        Row: {
          id: string
          user_id: string
          pet_id: string
          type: 'food' | 'sun' | 'water' | 'cleaning' | 'other'
          label: string
          time: string
          frequency: string
          active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['reminders']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['reminders']['Insert']>
      }
      pet_photos: {
        Row: {
          id: string
          user_id: string
          pet_id: string
          photo_url: string
          caption: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['pet_photos']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['pet_photos']['Insert']>
      }
    }
  }
}
