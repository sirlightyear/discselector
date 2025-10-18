export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          user_id: string
          initialer: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          initialer?: string | null
          created_at?: string
        }
        Update: {
          user_id?: string
          initialer?: string | null
          created_at?: string
        }
      }
      discs: {
        Row: {
          disc_id: number
          user_id: string
          name: string
          speed: number
          glide: number
          turn: number
          fade: number
          throw_type: 'forhånd' | 'baghånd' | 'begge'
          note: string | null
          weight: number | null
          is_glow: boolean
          personal_speed: number | null
          personal_glide: number | null
          personal_turn: number | null
          personal_fade: number | null
          color: string | null
          visual_description: string | null
          created_at: string
        }
        Insert: {
          disc_id?: number
          user_id: string
          name: string
          speed: number
          glide: number
          turn: number
          fade: number
          throw_type: 'forhånd' | 'baghånd' | 'begge'
          note?: string | null
          weight?: number | null
          is_glow?: boolean
          personal_speed?: number | null
          personal_glide?: number | null
          personal_turn?: number | null
          personal_fade?: number | null
          color?: string | null
          visual_description?: string | null
          created_at?: string
        }
        Update: {
          disc_id?: number
          user_id?: string
          name?: string
          speed?: number
          glide?: number
          turn?: number
          fade?: number
          throw_type?: 'forhånd' | 'baghånd' | 'begge'
          note?: string | null
          weight?: number | null
          is_glow?: boolean
          personal_speed?: number | null
          personal_glide?: number | null
          personal_turn?: number | null
          personal_fade?: number | null
          color?: string | null
          visual_description?: string | null
          created_at?: string
        }
      }
      bags: {
        Row: {
          bag_id: number
          user_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          bag_id?: number
          user_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          bag_id?: number
          user_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bag_discs: {
        Row: {
          bag_id: number
          disc_id: number
          position: number | null
          added_at: string
        }
        Insert: {
          bag_id: number
          disc_id: number
          position?: number | null
          added_at?: string
        }
        Update: {
          bag_id?: number
          disc_id?: number
          position?: number | null
          added_at?: string
        }
      }
    }
  }
}

export type User = Database['public']['Tables']['users']['Row']
export type Disc = Database['public']['Tables']['discs']['Row']
export type DiscInsert = Database['public']['Tables']['discs']['Insert']
export type DiscUpdate = Database['public']['Tables']['discs']['Update']
export type Bag = Database['public']['Tables']['bags']['Row']
export type BagInsert = Database['public']['Tables']['bags']['Insert']
export type BagUpdate = Database['public']['Tables']['bags']['Update']
export type BagDisc = Database['public']['Tables']['bag_discs']['Row']
export type BagDiscInsert = Database['public']['Tables']['bag_discs']['Insert']
