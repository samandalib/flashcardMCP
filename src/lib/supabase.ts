import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
export interface Project {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

// Tab structure for notes
export interface NoteTab {
  content: string
  order: number
  created_at: string
}

export interface NoteTabs {
  [tabName: string]: NoteTab
}

export interface Note {
  id: string
  project_id: string
  title: string
  content: string
  tabs?: NoteTabs
  active_tab?: string
  default_tabs?: string[]
  created_at: string
  updated_at: string
}
