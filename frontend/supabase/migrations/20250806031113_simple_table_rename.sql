-- Simple table rename from highlights to notes
-- Since the column renaming was successful, we just need to rename the table and update policies

-- Step 1: Rename the table
ALTER TABLE highlights RENAME TO notes;

-- Step 2: Create RLS policies for the renamed table (with correct UUID comparison)
CREATE POLICY "Users can view their own notes" ON notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes" ON notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON notes
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON notes
    FOR DELETE USING (auth.uid() = user_id);

-- Step 3: Grant permissions
GRANT ALL ON notes TO authenticated;