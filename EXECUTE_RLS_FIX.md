# 🚀 EXECUTE RLS FIX - Complete Task

## ⚡ Quick Execution Steps

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a new query

### Step 2: Run Diagnostic (Optional)
Copy and paste the contents of `diagnose_rls_issues.sql`:

```sql
-- =====================================================
-- DIAGNOSTIC: RLS POLICIES CAUSING 406 ERRORS
-- =====================================================

SELECT 
    'RLS Status Check' as diagnostic,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN (
    'students', 'form_configurations', 'background_selections',
    'study_fields', 'question_banks', 'assignment_attempts'
)
ORDER BY tablename;

SELECT 
    'Problematic Policies' as diagnostic,
    tablename,
    policyname,
    CASE 
        WHEN qual LIKE '%auth.uid()%' THEN 'USES_SUPABASE_AUTH (PROBLEMATIC)'
        WHEN qual = 'true' THEN 'PERMISSIVE (GOOD)'
        ELSE 'CUSTOM_CONDITION'
    END as policy_type,
    qual as condition
FROM pg_policies 
WHERE tablename IN ('students', 'form_configurations', 'study_fields')
ORDER BY tablename;
```

### Step 3: Apply the Fix (REQUIRED)
Copy and paste the contents of `fix_rls_for_clerk.sql`:

```sql
-- =====================================================
-- FIX RLS POLICIES FOR CLERK AUTHENTICATION
-- =====================================================

-- Temporarily disable RLS to allow policy changes
ALTER TABLE IF EXISTS students DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS form_configurations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS background_selections DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS study_fields DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS question_banks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS question_field_mapping DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS assignment_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS assignment_responses DISABLE ROW LEVEL SECURITY;

-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON students;
DROP POLICY IF EXISTS "Users can view their own student record" ON students;
DROP POLICY IF EXISTS "Users can insert their own student record" ON students;
DROP POLICY IF EXISTS "Users can update their own student record" ON students;

-- Create Clerk-compatible permissive policies
CREATE POLICY "clerk_dev_students_all" ON students
  FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

CREATE POLICY "clerk_dev_form_configs_all" ON form_configurations
  FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

CREATE POLICY "clerk_dev_background_all" ON background_selections
  FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

CREATE POLICY "clerk_dev_study_fields_all" ON study_fields
  FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

CREATE POLICY "clerk_dev_question_banks_all" ON question_banks
  FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

CREATE POLICY "clerk_dev_question_mapping_all" ON question_field_mapping
  FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

CREATE POLICY "clerk_dev_attempts_all" ON assignment_attempts
  FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

CREATE POLICY "clerk_dev_responses_all" ON assignment_responses
  FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

-- Re-enable RLS with new policies
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_field_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_responses ENABLE ROW LEVEL SECURITY;

-- Verify success
SELECT 'RLS policies fixed for Clerk authentication!' as status;
```

### Step 4: Test the Fix
1. **Go to the application**: http://localhost:5174/intake
2. **Check browser console**: Should see successful database queries (200 OK)
3. **Verify no 406 errors**: Profile should load without errors

## ✅ Success Criteria

After running the fix, you should see:
- ✅ **No 406 Not Acceptable errors** in browser console
- ✅ **Successful profile loading** in intake form
- ✅ **200 OK responses** from Supabase queries
- ✅ **Intake form works normally** with existing user data

## 🎯 Expected Console Output

### Before Fix:
```
❌ GET .../students?user_id=eq.user_123 406 (Not Acceptable)
❌ Profile query result: {data: null, error: {...}}
```

### After Fix:
```
✅ GET .../students?user_id=eq.user_123 200 (OK)
✅ Profile query result: {data: [...], error: null}
```

---

## 🚀 READY TO EXECUTE!

**Copy the SQL from Step 3 above and run it in your Supabase SQL Editor to complete the task!**