-- Fix RLS policies for notes table
-- The previous migration failed because of UUID vs text comparison

-- Clean up any partial policies that might exist
DROP POLICY IF EXISTS "Users can view their own highlights" ON notes;
DROP POLICY IF EXISTS "Users can insert their own highlights" ON notes;
DROP POLICY IF EXISTS "Users can update their own highlights" ON notes;
DROP POLICY IF EXISTS "Users can delete their own highlights" ON notes;
DROP POLICY IF EXISTS "Users can view their own notes" ON notes;
DROP POLICY IF EXISTS "Users can insert their own notes" ON notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON notes;

-- Create new policies with proper UUID comparison
CREATE POLICY "Users can view their own notes" ON notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes" ON notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON notes
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON notes
    FOR DELETE USING (auth.uid() = user_id);

-- Complete the related table updates that may have been interrupted
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

-- Grant permissions
GRANT ALL ON notes TO authenticated;

-- Update table and column comments
COMMENT ON TABLE notes IS 'User notes captured from various sources with AI-enhanced entity extraction';
COMMENT ON COLUMN notes.content IS 'Main content of the note (may be edited/formatted by user)';
COMMENT ON COLUMN notes.snippet IS 'Original unmodified text as captured from the source';