# Running the original_quote Migration

## Prerequisites
- Access to your Supabase project dashboard
- Or Supabase CLI installed and configured

## Method 1: Supabase Dashboard (Recommended)

1. **Access SQL Editor**:
   - Go to: https://vmgpoyloolwtixsffijn.supabase.co
   - Navigate to SQL Editor in the sidebar

2. **Run Migration**:
   ```sql
   -- Copy and paste the contents of migration_add_original_quote.sql
   -- Then click "Run" button
   ```

3. **Verify Success**:
   - Check that the verification query at the end returns column information
   - Go to Table Editor > highlights to see the new column

## Method 2: Supabase CLI

```bash
# If you have Supabase CLI configured
supabase db push

# Or run the migration directly
psql "postgresql://postgres:[password]@db.vmgpoyloolwtixsffijn.supabase.co:5432/postgres" < migration_add_original_quote.sql
```

## Post-Migration Steps

1. **Update TypeScript Types**:
   - Run type generation to update your local types
   - Or manually add to the highlights interface

2. **Update Application Code**:
   - Modify capture endpoints to populate original_quote
   - Update UI components to use original_quote where appropriate

3. **Test the Migration**:
   - Create a test highlight to verify the column works
   - Check that existing highlights still function normally