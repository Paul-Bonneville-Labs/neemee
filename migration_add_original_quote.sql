-- Migration: Add original_quote column to highlights table
-- Date: 2025-08-02
-- Description: Add original_quote column to store the unmodified highlighted text
-- This preserves the original captured text separately from the formatted version

-- Add the original_quote column
ALTER TABLE highlights 
ADD COLUMN original_quote TEXT NULL;

-- Add a comment to document the column purpose
COMMENT ON COLUMN highlights.original_quote IS 'Stores the original, unmodified highlighted text as captured from the website. This preserves the exact text selected by the user before any processing or formatting.';

-- Optional: Update existing records to populate original_quote with current highlighted_text
-- Uncomment the following line if you want to backfill existing data
-- UPDATE highlights SET original_quote = highlighted_text WHERE original_quote IS NULL;

-- Create an index on original_quote for potential search functionality
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_highlights_original_quote_gin 
ON highlights USING gin(to_tsvector('english', original_quote))
WHERE original_quote IS NOT NULL;

-- Verify the column was added successfully
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'highlights' 
AND column_name = 'original_quote';