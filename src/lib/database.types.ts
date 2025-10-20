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
          is_transparent: boolean
          disc_type: 'Putter' | 'Midrange' | 'Fairway Driver' | 'Distance Driver' | null
          plastic: string | null
          manufacturer: string | null
          purchase_year: number | null
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
          is_transparent?: boolean
          disc_type?: 'Putter' | 'Midrange' | 'Fairway Driver' | 'Distance Driver' | null
          plastic?: string | null
          manufacturer?: string | null
          purchase_year?: number | null
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
          is_transparent?: boolean
          disc_type?: 'Putter' | 'Midrange' | 'Fairway Driver' | 'Distance Driver' | null
          plastic?: string | null
          manufacturer?: string | null
          purchase_year?: number | null
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
      courses: {
        Row: {
          course_id: number
          user_id: string
          name: string
          description: string | null
          hole_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          course_id?: number
          user_id: string
          name: string
          description?: string | null
          hole_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          course_id?: number
          user_id?: string
          name?: string
          description?: string | null
          hole_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      course_holes: {
        Row: {
          hole_id: number
          course_id: number
          hole_number: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          hole_id?: number
          course_id: number
          hole_number: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          hole_id?: number
          course_id?: number
          hole_number?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      hole_discs: {
        Row: {
          hole_id: number
          disc_id: number
          notes: string | null
          added_at: string
        }
        Insert: {
          hole_id: number
          disc_id: number
          notes?: string | null
          added_at?: string
        }
        Update: {
          hole_id?: number
          disc_id?: number
          notes?: string | null
          added_at?: string
        }
      }
      user_settings: {
        Row: {
          user_id: string
          favorite_pages: Json
          dark_mode: boolean
          hand_preference: string | null
          throw_type_preference: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          favorite_pages?: Json
          dark_mode?: boolean
          hand_preference?: string | null
          throw_type_preference?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          favorite_pages?: Json
          dark_mode?: boolean
          hand_preference?: string | null
          throw_type_preference?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      wishlist_items: {
        Row: {
          item_id: number
          user_id: string
          product_name: string
          notes: string | null
          product_link: string | null
          priority: number
          created_at: string
          updated_at: string
        }
        Insert: {
          item_id?: number
          user_id: string
          product_name: string
          notes?: string | null
          product_link?: string | null
          priority?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          item_id?: number
          user_id?: string
          product_name?: string
          notes?: string | null
          product_link?: string | null
          priority?: number
          created_at?: string
          updated_at?: string
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
export type Course = Database['public']['Tables']['courses']['Row']
export type CourseInsert = Database['public']['Tables']['courses']['Insert']
export type CourseHole = Database['public']['Tables']['course_holes']['Row']
export type CourseHoleInsert = Database['public']['Tables']['course_holes']['Insert']
export type HoleDisc = Database['public']['Tables']['hole_discs']['Row']
export type HoleDiscInsert = Database['public']['Tables']['hole_discs']['Insert']
export type UserSettings = Database['public']['Tables']['user_settings']['Row']
export type UserSettingsInsert = Database['public']['Tables']['user_settings']['Insert']
export type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update']
export type WishlistItem = Database['public']['Tables']['wishlist_items']['Row']
export type WishlistItemInsert = Database['public']['Tables']['wishlist_items']['Insert']
export type WishlistItemUpdate = Database['public']['Tables']['wishlist_items']['Update']
