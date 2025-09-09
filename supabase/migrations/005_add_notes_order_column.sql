-- Add order column to notes table for drag-and-drop reordering
ALTER TABLE notes ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Create index for faster ordering queries
CREATE INDEX IF NOT EXISTS idx_notes_display_order ON notes(project_id, display_order);

-- Update existing notes to have sequential order values
-- This will set order based on creation time (oldest = 0, newest = highest)
UPDATE notes 
SET display_order = subquery.row_number - 1
FROM (
  SELECT 
    id, 
    ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY created_at) as row_number
  FROM notes
) AS subquery
WHERE notes.id = subquery.id;
