-- Migration: Rename highlights table to notes and update field names for better terminology
-- This migration transforms the highlights-focused terminology to a more generic notes system

-- Step 1: Rename the table from 'highlights' to 'notes'
ALTER TABLE highlights RENAME TO notes;

-- Step 2: Rename columns to match new terminology
-- highlighted_text -> content (the main text content of the note)
ALTER TABLE notes RENAME COLUMN highlighted_text TO content;

-- original_quote -> snippet (the original captured text snippet)
ALTER TABLE notes RENAME COLUMN original_quote TO snippet;

-- Step 3: Update column comments for clarity
COMMENT ON TABLE notes IS 'User notes captured from various sources with AI-enhanced entity extraction';
COMMENT ON COLUMN notes.content IS 'Main content of the note (may be edited/formatted by user)';
COMMENT ON COLUMN notes.snippet IS 'Original unmodified text as captured from the source';

-- Step 4: Rename indexes to match new table name
-- Drop old indexes and recreate with new names
DROP INDEX IF EXISTS idx_highlights_user_id;
DROP INDEX IF EXISTS idx_highlights_created_at;
DROP INDEX IF EXISTS idx_highlights_url;
DROP INDEX IF EXISTS idx_highlights_original_quote_text_search;

-- Create new indexes with updated names and column references
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);
CREATE INDEX IF NOT EXISTS idx_notes_url ON notes(url);
CREATE INDEX IF NOT EXISTS idx_notes_snippet_text_search ON notes USING gin(to_tsvector('english', snippet));
CREATE INDEX IF NOT EXISTS idx_notes_content_text_search ON notes USING gin(to_tsvector('english', content));

-- Step 5: Update any RLS (Row Level Security) policies
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own highlights" ON notes;
DROP POLICY IF EXISTS "Users can insert their own highlights" ON notes;
DROP POLICY IF EXISTS "Users can update their own highlights" ON notes;
DROP POLICY IF EXISTS "Users can delete their own highlights" ON notes;

-- Create new policies with updated names
CREATE POLICY "Users can view their own notes" ON notes
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own notes" ON notes
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own notes" ON notes
    FOR UPDATE USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own notes" ON notes
    FOR DELETE USING (auth.uid()::text = user_id);

-- Step 6: Update any functions or procedures that reference the old table/column names
-- Note: This would need to be customized based on existing functions in your database
-- For now, we're documenting that any stored procedures will need manual updates

-- Step 7: Grant necessary permissions
-- Ensure authenticated users can access the renamed table
GRANT ALL ON notes TO authenticated;

-- Migration completed successfully
-- The highlights table is now renamed to notes with updated terminology:
-- - highlighted_text -> content
-- - original_quote -> snippet
-- All indexes and policies have been updated accordingly