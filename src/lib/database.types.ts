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
          created_at?: string
        }
      }
    }
  }
}

export type User = Database['public']['Tables']['users']['Row']
export type Disc = Database['public']['Tables']['discs']['Row']
export type DiscInsert = Database['public']['Tables']['discs']['Insert']
export type DiscUpdate = Database['public']['Tables']['discs']['Update']
