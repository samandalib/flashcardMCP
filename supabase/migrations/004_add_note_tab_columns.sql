-- Add missing columns for note tabs functionality
-- Migration: 004_add_note_tab_columns.sql

-- Add active_tab column to notes table
ALTER TABLE notes 
ADD COLUMN IF NOT EXISTS active_tab VARCHAR(100) DEFAULT 'finding';

-- Add default_tabs column to notes table  
ALTER TABLE notes 
ADD COLUMN IF NOT EXISTS default_tabs JSONB DEFAULT '["finding", "evidence", "details"]';

-- Update existing notes to have proper tab structure
UPDATE notes 
SET 
  tabs = CASE 
    WHEN tabs IS NULL OR tabs = '{}' THEN 
      jsonb_build_object(
        'finding', jsonb_build_object(
          'content', COALESCE(content, ''),
          'order', 1,
          'created_at', created_at::text
        ),
        'evidence', jsonb_build_object(
          'content', '',
          'order', 2,
          'created_at', created_at::text
        ),
        'details', jsonb_build_object(
          'content', '',
          'order', 3,
          'created_at', created_at::text
        )
      )
    ELSE tabs
  END,
  active_tab = COALESCE(active_tab, 'finding'),
  default_tabs = COALESCE(default_tabs, '["finding", "evidence", "details"]')
WHERE tabs IS NULL OR tabs = '{}' OR active_tab IS NULL OR default_tabs IS NULL;

-- Create index for active_tab column for better performance
CREATE INDEX IF NOT EXISTS idx_notes_active_tab ON notes(active_tab);
