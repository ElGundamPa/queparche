/**
 * Tipos de la base de datos de Supabase
 *
 * Este archivo será generado automáticamente después de crear el esquema en Supabase
 * con el comando:
 * npx supabase gen types typescript --project-id your-project-ref > types/supabase.ts
 *
 * Por ahora, incluye tipos base para que el proyecto compile.
 */

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
      profiles: {
        Row: {
          id: string
          username: string
          name: string
          bio: string | null
          avatar: string | null
          location: string | null
          interests: string[]
          preferences: string[]
          points: number
          level: number
          badges: string[]
          is_verified: boolean
          is_premium: boolean
          followers_count: number
          following_count: number
          plans_created: number
          plans_attended: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          name: string
          bio?: string | null
          avatar?: string | null
          location?: string | null
          interests?: string[]
          preferences?: string[]
          points?: number
          level?: number
          badges?: string[]
          is_verified?: boolean
          is_premium?: boolean
          followers_count?: number
          following_count?: number
          plans_created?: number
          plans_attended?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          name?: string
          bio?: string | null
          avatar?: string | null
          location?: string | null
          interests?: string[]
          preferences?: string[]
          points?: number
          level?: number
          badges?: string[]
          is_verified?: boolean
          is_premium?: boolean
          followers_count?: number
          following_count?: number
          plans_created?: number
          plans_attended?: number
          created_at?: string
          updated_at?: string
        }
      }
      plans: {
        Row: {
          id: string
          user_id: string | null
          name: string
          description: string | null
          primary_category: string
          categories: string[]
          tags: string[]
          address: string | null
          city: string | null
          zone: string | null
          location: unknown | null
          capacity: number | null
          current_attendees: number
          max_people: number | null
          event_date: string | null
          end_date: string | null
          best_time: string | null
          average_price: number
          price: number | null
          price_type: string | null
          price_avg: string | null
          images: string[]
          likes: number
          favorites: number
          rating: number
          review_count: number
          visits: number
          saves: number
          is_premium: boolean
          is_sponsored: boolean
          is_spotlight: boolean
          vibe: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          description?: string | null
          primary_category: string
          categories?: string[]
          tags?: string[]
          address?: string | null
          city?: string | null
          zone?: string | null
          location?: unknown | null
          capacity?: number | null
          current_attendees?: number
          max_people?: number | null
          event_date?: string | null
          end_date?: string | null
          best_time?: string | null
          average_price?: number
          price?: number | null
          price_type?: string | null
          price_avg?: string | null
          images?: string[]
          likes?: number
          favorites?: number
          rating?: number
          review_count?: number
          visits?: number
          saves?: number
          is_premium?: boolean
          is_sponsored?: boolean
          is_spotlight?: boolean
          vibe?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          description?: string | null
          primary_category?: string
          categories?: string[]
          tags?: string[]
          address?: string | null
          city?: string | null
          zone?: string | null
          location?: unknown | null
          capacity?: number | null
          current_attendees?: number
          max_people?: number | null
          event_date?: string | null
          end_date?: string | null
          best_time?: string | null
          average_price?: number
          price?: number | null
          price_type?: string | null
          price_avg?: string | null
          images?: string[]
          likes?: number
          favorites?: number
          rating?: number
          review_count?: number
          visits?: number
          saves?: number
          is_premium?: boolean
          is_sponsored?: boolean
          is_spotlight?: boolean
          vibe?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // Más tablas se agregarán automáticamente cuando se genere este archivo
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_stats: {
        Args: { user_uuid: string }
        Returns: {
          total_plans: number
          total_attended: number
          total_likes: number
          total_reviews: number
          average_rating: number
          favorite_categories: string[]
        }[]
      }
      find_nearby_plans: {
        Args: {
          user_lat: number
          user_lng: number
          radius_meters?: number
        }
        Returns: {
          id: string
          name: string
          primary_category: string
          distance_meters: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
