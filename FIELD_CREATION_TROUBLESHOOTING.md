# Field & Question Creation Troubleshooting Guide

## Problem: Cannot add fields or questions - Getting 400 errors

### Root Cause:
Both `study_fields` and `question_banks` tables have schema mismatches:
- Missing required columns (`field_id`, `short_name`, `question_id`, etc.)
- NULL constraint violations
- Frontend expecting different structure than database

### Quick Fix Steps:

#### Step 1: Run Complete Database Setup
1. Go to your Supabase dashboard
2. Open SQL Editor
3. **Run the file: `src/sql/complete_study_fields_setup.sql`**
4. This will recreate ALL tables with correct structure:
   - ✅ `study_fields` table
   - ✅ `question_banks` table 
   - ✅ `question_field_mapping` table
   - ✅ All required columns and constraints
   - ✅ Default data inserted

#### Step 2: Test Both Features
1. **Refresh your application**
2. **Test Field Creation:**
   - Go to Admin → Question Bank Manager → "Manage Fields"
   - Click "Add New Field"
   - Fill: Name: "Test Field", Icon: "🧪", Description: "Test"
   - Should see: "Field added" success message

3. **Test Question Creation:**
   - Click "Add Question" in Question Bank Manager
   - Fill in all required fields (question text, category, difficulty, options)
   - Should see: "Question added" success message

### Expected Results After Fix:
- ✅ No more 400 errors for fields or questions
- ✅ 5 default study fields loaded (STEM, Business, etc.)
- ✅ Both "Add Field" and "Add Question" work
- ✅ Questions can be assigned to study fields
- ✅ Console shows detailed logging

### What's Been Fixed:

#### Frontend Code Updates:
- ✅ **Field creation**: Added required `question_id` generation
- ✅ **Question creation**: Added all missing fields (`tags`, proper `explanation` handling)
- ✅ **Smart fallback queries**: Handles missing columns gracefully
- ✅ **Enhanced error messages**: Shows specific issues
- ✅ **Better validation**: Prevents NULL constraint violations

#### Database Schema Updates:
- ✅ **study_fields**: All required columns added
- ✅ **question_banks**: Fixed `question_id` constraint
- ✅ **question_field_mapping**: Proper foreign keys
- ✅ **Indexes**: Performance optimization
- ✅ **RLS Policies**: Permissive for development
- ✅ **Triggers**: Auto-update timestamps

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