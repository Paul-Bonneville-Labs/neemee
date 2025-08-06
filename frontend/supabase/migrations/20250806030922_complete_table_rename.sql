-- Complete the highlights to notes table migration
-- The table still exists as 'highlights' with both old and new columns

-- Step 1: Remove the duplicate columns that were added incorrectly
-- Since both highlighted_text and content exist, we'll keep content and drop highlighted_text
-- Since both original_quote and snippet should exist, we'll check what's actually there

DO $$
BEGIN
    -- Drop highlighted_text if it still exists (keep content)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'highlights' 
        AND column_name = 'highlighted_text'
    ) THEN
        -- First copy any data that might only be in highlighted_text to content
        UPDATE highlights 
        SET content = COALESCE(content, highlighted_text) 
        WHERE content IS NULL OR content = '';
        
        -- Now drop the old column
        ALTER TABLE highlights DROP COLUMN highlighted_text;
        RAISE NOTICE 'Dropped highlighted_text column';
    END IF;

    -- Handle original_quote - check if snippet exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'highlights' 
        AND column_name = 'snippet'
    ) THEN
        -- If snippet doesn't exist, rename original_quote to snippet
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'highlights' 
            AND column_name = 'original_quote'
        ) THEN
            ALTER TABLE highlights RENAME COLUMN original_quote TO snippet;
            RAISE NOTICE 'Renamed original_quote to snippet';
        END IF;
    END IF;

    -- Rename url to page_url
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'highlights' 
        AND column_name = 'url'
    ) THEN
        ALTER TABLE highlights RENAME COLUMN url TO page_url;
        RAISE NOTICE 'Renamed url to page_url';
    END IF;

    -- Rename title to page_title
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'highlights' 
        AND column_name = 'title'
    ) THEN
        ALTER TABLE highlights RENAME COLUMN title TO page_title;
        RAISE NOTICE 'Renamed title to page_title';
    END IF;
END
$$;

-- Step 2: Now rename the table itself
ALTER TABLE highlights RENAME TO notes;

-- Step 3: Update indexes
DROP INDEX IF EXISTS idx_highlights_user_id;
DROP INDEX IF EXISTS idx_highlights_created_at;
DROP INDEX IF EXISTS idx_highlights_url;
DROP INDEX IF EXISTS idx_highlights_original_quote_text_search;

CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);
CREATE INDEX IF NOT EXISTS idx_notes_page_url ON notes(page_url);
CREATE INDEX IF NOT EXISTS idx_notes_snippet_text_search ON notes USING gin(to_tsvector('english', snippet));
CREATE INDEX IF NOT EXISTS idx_notes_content_text_search ON notes USING gin(to_tsvector('english', content));

-- Step 4: Update RLS policies
DROP POLICY IF EXISTS "Users can view their own highlights" ON notes;
DROP POLICY IF EXISTS "Users can insert their own highlights" ON notes;
DROP POLICY IF EXISTS "Users can update their own highlights" ON notes;
DROP POLICY IF EXISTS "Users can delete their own highlights" ON notes;

CREATE POLICY "Users can view their own notes" ON notes
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own notes" ON notes
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own notes" ON notes
    FOR UPDATE USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own notes" ON notes
    FOR DELETE USING (auth.uid()::text = user_id);

-- Step 5: Update related tables to reference 'notes' instead of 'highlights'
-- Update foreign key references in other tables
DO $$
BEGIN
    -- Update highlight_collections to note_collections
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'highlight_collections') THEN
        ALTER TABLE highlight_collections RENAME TO note_collections;
        
        -- Rename the column if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'note_collections' 
            AND column_name = 'highlight_id'
        ) THEN
            ALTER TABLE note_collections RENAME COLUMN highlight_id TO note_id;
        END IF;
        
        RAISE NOTICE 'Renamed highlight_collections to note_collections';
    END IF;

    -- Update highlight_entities to note_entities  
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'highlight_entities') THEN
        ALTER TABLE highlight_entities RENAME TO note_entities;
        
        -- Rename the column if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'note_entities' 
            AND column_name = 'highlight_id'
        ) THEN
            ALTER TABLE note_entities RENAME COLUMN highlight_id TO note_id;
        END IF;
        
        RAISE NOTICE 'Renamed highlight_entities to note_entities';
    END IF;

    -- Update entity_relationships table
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'entity_relationships' 
        AND column_name = 'highlight_id'
    ) THEN
        ALTER TABLE entity_relationships RENAME COLUMN highlight_id TO note_id;
        RAISE NOTICE 'Renamed highlight_id to note_id in entity_relationships';
    END IF;

    -- Update processing_jobs table
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'processing_jobs' 
        AND column_name = 'highlight_id'
    ) THEN
        ALTER TABLE processing_jobs RENAME COLUMN highlight_id TO note_id;
        RAISE NOTICE 'Renamed highlight_id to note_id in processing_jobs';
    END IF;
END
$$;

-- Step 6: Grant permissions
GRANT ALL ON notes TO authenticated;

-- Step 7: Update table and column comments
COMMENT ON TABLE notes IS 'User notes captured from various sources with AI-enhanced entity extraction';
COMMENT ON COLUMN notes.content IS 'Main content of the note (may be edited/formatted by user)';
COMMENT ON COLUMN notes.snippet IS 'Original unmodified text as captured from the source';