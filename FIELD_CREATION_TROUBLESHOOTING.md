# Study Fields Database Troubleshooting Guide

## Problem: Cannot add fields - Getting 400 errors

### Quick Fix Steps:

#### Step 1: Run Diagnostic Script
1. Go to your Supabase dashboard
2. Open SQL Editor
3. Run the file: `src/sql/diagnostic_study_fields.sql`
4. Check what columns are missing

#### Step 2: Run Complete Setup Script
1. In Supabase SQL Editor
2. Run the file: `src/sql/complete_study_fields_setup.sql`
3. This will:
   - Drop and recreate the table with correct structure
   - Insert default fields
   - Set up proper permissions

#### Step 3: Test the Fix
1. Refresh your application
2. Go to Admin → Question Bank Manager → "Manage Fields"
3. Try adding a new field

### Expected Results After Fix:
- ✅ Database has all required columns
- ✅ Default fields (STEM, Business, etc.) are loaded
- ✅ You can add custom fields without errors
- ✅ Console shows detailed logging of what's happening

### If You Still Get Errors:

#### Check Console Logs:
Open browser console (F12) and look for:
- "Loading study fields..." messages
- "Full query successful" or "Minimal query successful"
- Any error details with specific column names

#### Common Issues:

1. **Column doesn't exist**: Run the complete setup script
2. **Permission denied**: Check RLS policies in Supabase
3. **Duplicate field_id**: Use a different field name

#### Manual Verification:
Run this in Supabase SQL Editor to verify setup:
```sql
-- Check table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'study_fields' 
ORDER BY ordinal_position;

-- Check data
SELECT field_id, name, icon FROM study_fields;
```

### Files Created:
- `diagnostic_study_fields.sql` - Check current state
- `complete_study_fields_setup.sql` - Fix all issues
- `fix_study_fields_schema.sql` - Alternative fix (if table exists)

### Support:
If none of these steps work, the console logs will now show exactly what column is missing or what error is occurring.