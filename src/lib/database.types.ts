export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          user_id: string;
          initialer: string | null;
          created_at: string | null;
        };
        Insert: {
          user_id: string;
          initialer?: string | null;
          created_at?: string | null;
        };
        Update: {
          user_id?: string;
          initialer?: string | null;
          created_at?: string | null;
        };
      };
      discs: {
        Row: {
          disc_id: number;
          user_id: string;
          name: string;
          speed: number;
          glide: number;
          turn: number;
          fade: number;
          throw_type: 'forh�nd' | 'bagh�nd' | 'begge' | null;
          note: string | null;
          created_at: string | null;
          weight: number | null;
          is_glow: boolean | null;
          personal_speed: number | null;
          personal_glide: number | null;
          personal_turn: number | null;
          personal_fade: number | null;
          color: string | null;
          visual_description: string | null;
          is_transparent: boolean;
          disc_type: 'Putter' | 'Midrange' | 'Fairway Driver' | 'Distance Driver' | null;
          plastic: string | null;
          manufacturer: string | null;
          purchase_year: number | null;
          rim_color: string | null;
          photo_url: string | null;
          throw_style: string | null;
          release_angle: string | null;
          is_lost: boolean;
          lost_date: string | null;
          lost_location: string | null;
        };
        Insert: {
          user_id: string;
          name: string;
          speed: number;
          glide: number;
          turn: number;
          fade: number;
          throw_type: 'forh�nd' | 'bagh�nd' | 'begge' | null;
          note?: string | null;
          created_at?: string | null;
          weight?: number | null;
          is_glow?: boolean | null;
          personal_speed?: number | null;
          personal_glide?: number | null;
          personal_turn?: number | null;
          personal_fade?: number | null;
          color?: string | null;
          visual_description?: string | null;
          is_transparent?: boolean;
          disc_type?: 'Putter' | 'Midrange' | 'Fairway Driver' | 'Distance Driver' | null;
          plastic?: string | null;
          manufacturer?: string | null;
          purchase_year?: number | null;
          rim_color?: string | null;
          photo_url?: string | null;
          throw_style?: string | null;
          release_angle?: string | null;
          is_lost?: boolean;
          lost_date?: string | null;
          lost_location?: string | null;
        };
        Update: {
          user_id?: string;
          name?: string;
          speed?: number;
          glide?: number;
          turn?: number;
          fade?: number;
          throw_type?: 'forh�nd' | 'bagh�nd' | 'begge';
          note?: string | null;
          created_at?: string | null;
          weight?: number | null;
          is_glow?: boolean | null;
          personal_speed?: number | null;
          personal_glide?: number | null;
          personal_turn?: number | null;
          personal_fade?: number | null;
          color?: string | null;
          visual_description?: string | null;
          is_transparent?: boolean;
          disc_type?: 'Putter' | 'Midrange' | 'Fairway Driver' | 'Distance Driver' | null;
          plastic?: string | null;
          manufacturer?: string | null;
          purchase_year?: number | null;
          rim_color?: string | null;
          photo_url?: string | null;
          throw_style?: string | null;
          release_angle?: string | null;
          is_lost?: boolean;
          lost_date?: string | null;
          lost_location?: string | null;
        };
      };
      bags: {
        Row: {
          bag_id: number;
          user_id: string;
          name: string;
          description: string | null;
          created_at: string | null;
          updated_at: string | null;
          share_token: string | null;
          is_public: boolean | null;
        };
        Insert: {
          user_id: string;
          name: string;
          description?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          share_token?: string | null;
          is_public?: boolean | null;
        };
        Update: {
          user_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          share_token?: string | null;
          is_public?: boolean | null;
        };
      };
      bag_discs: {
        Row: {
          bag_id: number;
          disc_id: number;
          position: number | null;
          added_at: string | null;
        };
        Insert: {
          bag_id: number;
          disc_id: number;
          position?: number | null;
          added_at?: string | null;
        };
        Update: {
          bag_id?: number;
          disc_id?: number;
          position?: number | null;
          added_at?: string | null;
        };
      };
      courses: {
        Row: {
          course_id: number;
          user_id: string;
          name: string;
          description: string | null;
          hole_count: number | null;
          created_at: string | null;
          updated_at: string | null;
          photo_urls: string[] | null;
          link1: string | null;
          link2: string | null;
          is_shared: boolean | null;
          share_photos: boolean | null;
          share_notes: boolean | null;
          original_course_id: number | null;
        };
        Insert: {
          user_id: string;
          name: string;
          description?: string | null;
          hole_count?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
          photo_urls?: string[] | null;
          link1?: string | null;
          link2?: string | null;
          is_shared?: boolean | null;
          share_photos?: boolean | null;
          share_notes?: boolean | null;
          original_course_id?: number | null;
        };
        Update: {
          user_id?: string;
          name?: string;
          description?: string | null;
          hole_count?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
          photo_urls?: string[] | null;
          link1?: string | null;
          link2?: string | null;
          is_shared?: boolean | null;
          share_photos?: boolean | null;
          share_notes?: boolean | null;
          original_course_id?: number | null;
        };
      };
      course_holes: {
        Row: {
          hole_id: number;
          course_id: number;
          hole_number: number;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
          photo_urls: string[] | null;
          background_photo_url: string | null;
          link1: string | null;
          link2: string | null;
          position: number | null;
          custom_name: string | null;
        };
        Insert: {
          course_id: number;
          hole_number: number;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          photo_urls?: string[] | null;
          background_photo_url?: string | null;
          link1?: string | null;
          link2?: string | null;
          position?: number | null;
          custom_name?: string | null;
        };
        Update: {
          course_id?: number;
          hole_number?: number;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          photo_urls?: string[] | null;
          background_photo_url?: string | null;
          link1?: string | null;
          link2?: string | null;
          position?: number | null;
          custom_name?: string | null;
        };
      };
      hole_discs: {
        Row: {
          hole_id: number;
          disc_id: number;
          notes: string | null;
          added_at: string | null;
        };
        Insert: {
          hole_id: number;
          disc_id: number;
          notes?: string | null;
          added_at?: string | null;
        };
        Update: {
          hole_id?: number;
          disc_id?: number;
          notes?: string | null;
          added_at?: string | null;
        };
      };
      user_settings: {
        Row: {
          user_id: string;
          favorite_pages: any | null;
          dark_mode: boolean | null;
          hand_preference: 'R' | 'L' | null;
          throw_type_preference: 'BH' | 'FH' | 'begge' | null;
          created_at: string | null;
          updated_at: string | null;
          startup_page: 'calculator' | 'collection' | 'bags' | 'courses' | 'wishlist' | 'links' | 'settings' | null;
          share_token: string | null;
          share_collection: boolean | null;
        };
        Insert: {
          user_id: string;
          favorite_pages?: any | null;
          dark_mode?: boolean | null;
          hand_preference?: 'R' | 'L' | null;
          throw_type_preference?: 'BH' | 'FH' | 'begge' | null;
          created_at?: string | null;
          updated_at?: string | null;
          startup_page?: 'calculator' | 'collection' | 'bags' | 'courses' | 'wishlist' | 'links' | 'settings' | null;
          share_token?: string | null;
          share_collection?: boolean | null;
        };
        Update: {
          user_id?: string;
          favorite_pages?: any | null;
          dark_mode?: boolean | null;
          hand_preference?: 'R' | 'L' | null;
          throw_type_preference?: 'BH' | 'FH' | 'begge' | null;
          created_at?: string | null;
          updated_at?: string | null;
          startup_page?: 'calculator' | 'collection' | 'bags' | 'courses' | 'wishlist' | 'links' | 'settings' | null;
          share_token?: string | null;
          share_collection?: boolean | null;
        };
      };
      wishlist_items: {
        Row: {
          item_id: number;
          user_id: string;
          product_name: string;
          notes: string | null;
          product_link: string | null;
          priority: number | null;
          created_at: string | null;
          updated_at: string | null;
          photo_url: string | null;
        };
        Insert: {
          user_id: string;
          product_name: string;
          notes?: string | null;
          product_link?: string | null;
          priority?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
          photo_url?: string | null;
        };
        Update: {
          user_id?: string;
          product_name?: string;
          notes?: string | null;
          product_link?: string | null;
          priority?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
          photo_url?: string | null;
        };
      };
      link_groups: {
        Row: {
          group_id: number;
          user_id: string;
          name: string;
          position: number | null;
          is_public: boolean | null;
          allow_editing: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          name: string;
          position?: number | null;
          is_public?: boolean | null;
          allow_editing?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          user_id?: string;
          name?: string;
          position?: number | null;
          is_public?: boolean | null;
          allow_editing?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      links: {
        Row: {
          link_id: number;
          group_id: number;
          url: string;
          description: string | null;
          position: number | null;
          is_favorite: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          group_id: number;
          url: string;
          description?: string | null;
          position?: number | null;
          is_favorite?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          group_id?: number;
          url?: string;
          description?: string | null;
          position?: number | null;
          is_favorite?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      link_group_followers: {
        Row: {
          user_id: string;
          group_id: number;
          is_read_only: boolean | null;
          followed_at: string | null;
        };
        Insert: {
          user_id: string;
          group_id: number;
          is_read_only?: boolean | null;
          followed_at?: string | null;
        };
        Update: {
          user_id?: string;
          group_id?: number;
          is_read_only?: boolean | null;
          followed_at?: string | null;
        };
      };
    };
  };
}

export type Disc = Database['public']['Tables']['discs']['Row'];
export type DiscInsert = Database['public']['Tables']['discs']['Insert'];
export type Bag = Database['public']['Tables']['bags']['Row'];
export type BagInsert = Database['public']['Tables']['bags']['Insert'];
export type Course = Database['public']['Tables']['courses']['Row'];
export type CourseInsert = Database['public']['Tables']['courses']['Insert'];
export type CourseHole = Database['public']['Tables']['course_holes']['Row'];
export type CourseHoleInsert = Database['public']['Tables']['course_holes']['Insert'];
export type WishlistItem = Database['public']['Tables']['wishlist_items']['Row'];
export type WishlistItemInsert = Database['public']['Tables']['wishlist_items']['Insert'];
