-- Add original_quote column to highlights table
-- This column will store the original unmodified text as captured by the user
-- while highlighted_text stores the formatted markdown version

ALTER TABLE highlights 
ADD COLUMN original_quote TEXT;

-- Add comment to document the purpose of this column
COMMENT ON COLUMN highlights.original_quote IS 'Original unmodified text as captured by the user, before any formatting';

-- Create index for potential search functionality on original quotes
CREATE INDEX IF NOT EXISTS idx_highlights_original_quote_text_search 
ON highlights 
USING gin(to_tsvector('english', original_quote));