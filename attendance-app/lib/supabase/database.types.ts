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
          id: string
          email: string
          name: string
          role: 'admin' | 'member'
          approved: boolean
          year: '1st' | '2nd' | '3rd' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: 'admin' | 'member'
          approved?: boolean
          year?: '1st' | '2nd' | '3rd' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'member'
          approved?: boolean
          year?: '1st' | '2nd' | '3rd' | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      attendance_sessions: {
        Row: {
          id: string
          title: string
          description: string | null
          qr_token: string
          expires_at: string
          mom_pdf_url: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          qr_token?: string
          expires_at: string
          mom_pdf_url?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          qr_token?: string
          expires_at?: string
          mom_pdf_url?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      attendance_logs: {
        Row: {
          id: string
          user_id: string
          session_id: string
          marked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id: string
          marked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string
          marked_at?: string
        }
        Relationships: []
      }
      faculty: {
        Row: {
          id: string
          name: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      faculty_view_tokens: {
        Row: {
          id: string
          faculty_id: string
          token: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          faculty_id: string
          token?: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          faculty_id?: string
          token?: string
          expires_at?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}
