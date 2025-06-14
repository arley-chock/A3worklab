import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          department: string
          role: 'user' | 'admin'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          department: string
          role?: 'user' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          department?: string
          role?: 'user' | 'admin'
          created_at?: string
        }
      }
      resources: {
        Row: {
          id: string
          type: 'room' | 'desk' | 'laptop' | 'projector'
          name: string
          description: string
          capacity: number
          location: string
          restrictions: Record<string, any>
          created_at: string
        }
        Insert: {
          id?: string
          type: 'room' | 'desk' | 'laptop' | 'projector'
          name: string
          description: string
          capacity: number
          location: string
          restrictions: Record<string, any>
          created_at?: string
        }
        Update: {
          id?: string
          type?: 'room' | 'desk' | 'laptop' | 'projector'
          name?: string
          description?: string
          capacity?: number
          location?: string
          restrictions?: Record<string, any>
          created_at?: string
        }
      }
      reservations: {
        Row: {
          id: string
          resource_id: string
          user_id: string
          starts_at: string
          ends_at: string
          status: 'active' | 'cancelled' | 'completed'
          created_at: string
        }
        Insert: {
          id?: string
          resource_id: string
          user_id: string
          starts_at: string
          ends_at: string
          status?: 'active' | 'cancelled' | 'completed'
          created_at?: string
        }
        Update: {
          id?: string
          resource_id?: string
          user_id?: string
          starts_at?: string
          ends_at?: string
          status?: 'active' | 'cancelled' | 'completed'
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          data: Record<string, any>
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          data: Record<string, any>
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          data?: Record<string, any>
          created_at?: string
        }
      }
    }
    Views: {
      usage_reports: {
        Row: {
          resource_id: string
          resource_name: string
          total_reservations: number
          total_hours: number
          utilization_rate: number
          period: string
        }
      }
    }
  }
} 