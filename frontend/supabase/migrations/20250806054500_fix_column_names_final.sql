-- Fix the incomplete column renaming in notes table
-- This migration ensures all columns match what the API expects

DO $$
BEGIN
    -- Rename original_quote to snippet (if not already done)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notes' 
        AND column_name = 'original_quote'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE notes RENAME COLUMN original_quote TO snippet;
        RAISE NOTICE 'Renamed original_quote to snippet';
    END IF;

    -- Rename url to page_url (if not already done)  
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notes' 
        AND column_name = 'url'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE notes RENAME COLUMN url TO page_url;
        RAISE NOTICE 'Renamed url to page_url';
    END IF;

    -- Rename title to page_title (if not already done)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notes' 
        AND column_name = 'title'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE notes RENAME COLUMN title TO page_title;
        RAISE NOTICE 'Renamed title to page_title';
    END IF;

    -- Remove highlighted_text column if content exists (content should be the primary field)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notes' 
        AND column_name = 'highlighted_text'
        AND table_schema = 'public'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notes' 
        AND column_name = 'content'  
        AND table_schema = 'public'
    ) THEN
        -- First copy any data from highlighted_text to content where content is null/empty
        -- Double-check columns still exist before UPDATE (defensive programming)
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'notes' AND column_name = 'highlighted_text' AND table_schema = 'public'
        ) AND EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'notes' AND column_name = 'content' AND table_schema = 'public'
        ) THEN
            UPDATE notes 
            SET content = COALESCE(NULLIF(content, ''), highlighted_text)
            WHERE (content IS NULL OR content = '') AND highlighted_text IS NOT NULL;
        END IF;
        
        -- Now drop the old column (check again it exists)
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'notes' AND column_name = 'highlighted_text' AND table_schema = 'public'
        ) THEN
            ALTER TABLE notes DROP COLUMN highlighted_text;
            RAISE NOTICE 'Removed highlighted_text column (data preserved in content)';
        END IF;
    END IF;

END
$$;