import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database schema
export interface Project {
  id: string
  name: string
  created_at: string
}

export interface Card {
  id: string
  project_id: string
  body: string
  reference: Reference | null
  created_at: string
  updated_at: string
}

export interface Reference {
  title?: string
  authors?: string[]
  url?: string
  publication?: string
  date?: string
  doi?: string
}

export interface Attachment {
  id: string
  card_id: string
  type: 'image' | 'video' | 'pdf' | 'web' | 'audio'
  url: string
  meta: Record<string, any>
  created_at: string
}

export interface Synthesis {
  id: string
  project_id: string
  markdown: string
  bibliography: any[]
  created_at: string
}

