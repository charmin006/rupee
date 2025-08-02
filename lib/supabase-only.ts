import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          preferences: any
          profiles: any[]
          activeProfileId: string
          securitySettings: any
          achievements: any[]
          streaks: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          preferences?: any
          profiles?: any[]
          activeProfileId?: string
          securitySettings?: any
          achievements?: any[]
          streaks?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          preferences?: any
          profiles?: any[]
          activeProfileId?: string
          securitySettings?: any
          achievements?: any[]
          streaks?: any
          created_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          amount: number
          description: string
          category_id: string
          date: string
          payment_method: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          description: string
          category_id: string
          date: string
          payment_method: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          description?: string
          category_id?: string
          date?: string
          payment_method?: string
          created_at?: string
          updated_at?: string
        }
      }
      incomes: {
        Row: {
          id: string
          user_id: string
          amount: number
          source: string
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          source: string
          date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          source?: string
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          icon: string
          is_custom: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color: string
          icon: string
          is_custom?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          icon?: string
          is_custom?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      savings_goals: {
        Row: {
          id: string
          user_id: string
          name: string
          target_amount: number
          current_amount: number
          target_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          target_amount: number
          current_amount?: number
          target_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          target_amount?: number
          current_amount?: number
          target_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      budget_limits: {
        Row: {
          id: string
          user_id: string
          category_id: string
          amount: number
          period: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          amount: number
          period: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          amount?: number
          period?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      insights: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          description: string
          data: any
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          description: string
          data?: any
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          description?: string
          data?: any
          is_read?: boolean
          created_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          severity: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          severity: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          severity?: string
          is_read?: boolean
          created_at?: string
        }
      }
      recurring_expenses: {
        Row: {
          id: string
          user_id: string
          amount: number
          description: string
          category_id: string
          frequency: string
          next_due_date: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          description: string
          category_id: string
          frequency: string
          next_due_date: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          description?: string
          category_id?: string
          frequency?: string
          next_due_date?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          role: string
          permissions: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          role: string
          permissions?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          role?: string
          permissions?: any
          created_at?: string
          updated_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string
          icon: string
          progress: number
          max_progress: number
          is_unlocked: boolean
          unlocked_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description: string
          icon: string
          progress?: number
          max_progress: number
          is_unlocked?: boolean
          unlocked_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          icon?: string
          progress?: number
          max_progress?: number
          is_unlocked?: boolean
          unlocked_at?: string | null
          created_at?: string
        }
      }
      backup_history: {
        Row: {
          id: string
          user_id: string
          type: string
          status: string
          file_size: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          status: string
          file_size: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          status?: string
          file_size?: number
          created_at?: string
        }
      }
    }
  }
}

// Typed Supabase client
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey)

export default supabase 