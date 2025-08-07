-- Corrective migration to fix notes table structure
-- This migration handles the case where the table was renamed but columns weren't fully updated

-- Step 1: Check if notes table exists and has correct structure
-- If the table exists with old column names, rename them

DO $$ 
BEGIN
    -- Check if highlighted_text column exists and rename to content
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notes' 
        AND column_name = 'highlighted_text'
    ) THEN
        ALTER TABLE notes RENAME COLUMN highlighted_text TO content;
        RAISE NOTICE 'Renamed highlighted_text to content';
    ELSE
        RAISE NOTICE 'Column highlighted_text already renamed or does not exist';
    END IF;

    -- Check if original_quote column exists and rename to snippet
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notes' 
        AND column_name = 'original_quote'
    ) THEN
        ALTER TABLE notes RENAME COLUMN original_quote TO snippet;
        RAISE NOTICE 'Renamed original_quote to snippet';
    ELSE
        RAISE NOTICE 'Column original_quote already renamed or does not exist';
    END IF;

    -- Check if url column exists and rename to page_url
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notes' 
        AND column_name = 'url'
    ) THEN
        ALTER TABLE notes RENAME COLUMN url TO page_url;
        RAISE NOTICE 'Renamed url to page_url';
    ELSE
        RAISE NOTICE 'Column url already renamed or does not exist';
    END IF;

    -- Check if title column exists and rename to page_title
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notes' 
        AND column_name = 'title'
    ) THEN
        ALTER TABLE notes RENAME COLUMN title TO page_title;
        RAISE NOTICE 'Renamed title to page_title';
    ELSE
        RAISE NOTICE 'Column title already renamed or does not exist';
    END IF;
END
$$;

-- Step 2: Update column comments for clarity (safe to run multiple times)
COMMENT ON TABLE notes IS 'User notes captured from various sources with AI-enhanced entity extraction';

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notes' 
        AND column_name = 'content'
    ) THEN
        COMMENT ON COLUMN notes.content IS 'Main content of the note (may be edited/formatted by user)';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notes' 
        AND column_name = 'snippet'
    ) THEN
        COMMENT ON COLUMN notes.snippet IS 'Original unmodified text as captured from the source';
    END IF;
END
$$;

-- Step 3: Update indexes - drop old ones if they exist, create new ones
-- Drop old indexes if they exist
DROP INDEX IF EXISTS idx_highlights_user_id;
DROP INDEX IF EXISTS idx_highlights_created_at;
DROP INDEX IF EXISTS idx_highlights_url;
DROP INDEX IF EXISTS idx_highlights_original_quote_text_search;

-- Create new indexes with updated names and column references (safe to run multiple times)
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notes' 
        AND column_name = 'page_url'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_notes_page_url ON notes(page_url);
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notes' 
        AND column_name = 'snippet'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_notes_snippet_text_search ON notes USING gin(to_tsvector('english', snippet));
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notes' 
        AND column_name = 'content'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_notes_content_text_search ON notes USING gin(to_tsvector('english', content));
    END IF;
END
$$;

-- Step 4: Update RLS policies - drop old ones and create new ones
-- Drop existing policies (safe to run multiple times)
DROP POLICY IF EXISTS "Users can view their own highlights" ON notes;
DROP POLICY IF EXISTS "Users can insert their own highlights" ON notes;
DROP POLICY IF EXISTS "Users can update their own highlights" ON notes;
DROP POLICY IF EXISTS "Users can delete their own highlights" ON notes;
DROP POLICY IF EXISTS "Users can view their own notes" ON notes;
DROP POLICY IF EXISTS "Users can insert their own notes" ON notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON notes;

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

-- Step 5: Grant necessary permissions
GRANT ALL ON notes TO authenticated;