-- Diagnostic migration to check current database state

DO $$
DECLARE
    rec RECORD;
BEGIN
    -- List all tables that contain 'highlight' or 'notes' in the name
    RAISE NOTICE 'Checking for tables with highlight or notes in name:';
    
    FOR rec IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND (tablename ILIKE '%highlight%' OR tablename ILIKE '%note%')
    LOOP
        RAISE NOTICE 'Found table: %', rec.tablename;
    END LOOP;

    -- Check if highlights table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'highlights') THEN
        RAISE NOTICE 'highlights table EXISTS';
        
        -- List columns in highlights table
        FOR rec IN 
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'highlights'
            ORDER BY column_name
        LOOP
            RAISE NOTICE 'highlights column: % (%)', rec.column_name, rec.data_type;
        END LOOP;
    ELSE
        RAISE NOTICE 'highlights table does NOT exist';
    END IF;

    -- Check if notes table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notes') THEN
        RAISE NOTICE 'notes table EXISTS';
        
        -- List columns in notes table
        FOR rec IN 
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'notes'
            ORDER BY column_name
        LOOP
            RAISE NOTICE 'notes column: % (%)', rec.column_name, rec.data_type;
        END LOOP;
    ELSE
        RAISE NOTICE 'notes table does NOT exist';
    END IF;

END
$$;