-- Verification migration to check that the migration was successful

DO $$
DECLARE
    rec RECORD;
BEGIN
    -- Check if notes table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notes') THEN
        RAISE NOTICE 'SUCCESS: notes table EXISTS';
        
        -- List columns in notes table to verify field names
        FOR rec IN 
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'notes'
            AND column_name IN ('content', 'snippet', 'page_url', 'page_title')
            ORDER BY column_name
        LOOP
            RAISE NOTICE 'SUCCESS: notes has correct column: % (%)', rec.column_name, rec.data_type;
        END LOOP;
        
        -- Check for old columns that should be gone
        FOR rec IN 
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'notes'
            AND column_name IN ('highlighted_text', 'original_quote', 'url', 'title')
        LOOP
            RAISE NOTICE 'WARNING: Old column still exists: %', rec.column_name;
        END LOOP;
    ELSE
        RAISE NOTICE 'ERROR: notes table does NOT exist';
    END IF;

    -- Check if old highlights table still exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'highlights') THEN
        RAISE NOTICE 'WARNING: highlights table still EXISTS - migration incomplete';
    ELSE
        RAISE NOTICE 'SUCCESS: highlights table has been renamed';
    END IF;

    -- Check policies
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'notes' 
        AND policyname = 'Users can view their own notes'
    ) THEN
        RAISE NOTICE 'SUCCESS: RLS policy exists for notes table';
    ELSE
        RAISE NOTICE 'WARNING: RLS policy missing for notes table';
    END IF;

END
$$;