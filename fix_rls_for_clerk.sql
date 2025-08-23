-- =====================================================
-- FIX RLS POLICIES FOR CLERK AUTHENTICATION
-- =====================================================
-- This script fixes the 406 "Not Acceptable" errors by setting up
-- proper RLS policies that work with Clerk authentication instead of Supabase auth

-- =====================================================
-- 1. DISABLE RLS TEMPORARILY TO FIX POLICIES
-- =====================================================

-- Temporarily disable RLS to allow policy changes
ALTER TABLE IF EXISTS students DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS form_configurations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS background_selections DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS study_fields DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS question_banks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS question_field_mapping DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS question_usage_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS assignment_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS assignment_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admins DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. DROP ALL EXISTING POLICIES
-- =====================================================

-- Drop all existing policies that might be causing conflicts
-- Include the new policy names that were created
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON students;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on students" ON students;
DROP POLICY IF EXISTS "Users can view their own student record" ON students;
DROP POLICY IF EXISTS "Users can insert their own student record" ON students;
DROP POLICY IF EXISTS "Users can update their own student record" ON students;
DROP POLICY IF EXISTS "clerk_dev_students_all" ON students;

DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON form_configurations;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on form_configurations" ON form_configurations;
DROP POLICY IF EXISTS "clerk_dev_form_configs_all" ON form_configurations;

DROP POLICY IF EXISTS "Allow all operations for authenticated users on background_selections" ON background_selections;
DROP POLICY IF EXISTS "clerk_dev_background_all" ON background_selections;

DROP POLICY IF EXISTS "Anyone can view study fields" ON study_fields;
DROP POLICY IF EXISTS "Only admins can modify study fields" ON study_fields;
DROP POLICY IF EXISTS "Allow all operations on study_fields for development" ON study_fields;
DROP POLICY IF EXISTS "Allow all operations for development" ON study_fields;
DROP POLICY IF EXISTS "clerk_dev_study_fields_all" ON study_fields;

DROP POLICY IF EXISTS "Anyone can view active questions" ON question_banks;
DROP POLICY IF EXISTS "Admins can view all questions" ON question_banks;
DROP POLICY IF EXISTS "Allow all operations on question_banks for development" ON question_banks;
DROP POLICY IF EXISTS "clerk_dev_question_banks_all" ON question_banks;

DROP POLICY IF EXISTS "Allow all operations on question_field_mapping for development" ON question_field_mapping;
DROP POLICY IF EXISTS "clerk_dev_question_mapping_all" ON question_field_mapping;

DROP POLICY IF EXISTS "clerk_dev_question_stats_all" ON question_usage_stats;

DROP POLICY IF EXISTS "Users can view their own assignment attempts" ON assignment_attempts;
DROP POLICY IF EXISTS "Users can insert their own assignment attempts" ON assignment_attempts;
DROP POLICY IF EXISTS "Users can update their own assignment attempts" ON assignment_attempts;
DROP POLICY IF EXISTS "clerk_dev_attempts_all" ON assignment_attempts;

DROP POLICY IF EXISTS "Users can view their own assignment responses" ON assignment_responses;
DROP POLICY IF EXISTS "Users can insert their own assignment responses" ON assignment_responses;
DROP POLICY IF EXISTS "clerk_dev_responses_all" ON assignment_responses;

DROP POLICY IF EXISTS "Allow all operations for development" ON admins;
DROP POLICY IF EXISTS "Admins can read their own data" ON admins;
DROP POLICY IF EXISTS "Allow admin creation" ON admins;
DROP POLICY IF EXISTS "clerk_dev_admins_all" ON admins;

-- =====================================================
-- 3. CREATE DEVELOPMENT-FRIENDLY POLICIES
-- =====================================================
-- Since we're using Clerk authentication, we'll create permissive policies
-- that allow all operations for development purposes

-- Students table policies
CREATE POLICY "clerk_dev_students_all" ON students
  FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

-- Form configurations policies  
CREATE POLICY "clerk_dev_form_configs_all" ON form_configurations
  FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

-- Background selections policies
CREATE POLICY "clerk_dev_background_all" ON background_selections
  FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

-- Study fields policies
CREATE POLICY "clerk_dev_study_fields_all" ON study_fields
  FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

-- Question banks policies
CREATE POLICY "clerk_dev_question_banks_all" ON question_banks
  FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

-- Question field mapping policies
CREATE POLICY "clerk_dev_question_mapping_all" ON question_field_mapping
  FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

-- Question usage stats policies
CREATE POLICY "clerk_dev_question_stats_all" ON question_usage_stats
  FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

-- Assignment attempts policies
CREATE POLICY "clerk_dev_attempts_all" ON assignment_attempts
  FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

-- Assignment responses policies
CREATE POLICY "clerk_dev_responses_all" ON assignment_responses
  FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

-- Admins policies
CREATE POLICY "clerk_dev_admins_all" ON admins
  FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

-- =====================================================
-- 4. RE-ENABLE RLS WITH NEW POLICIES
-- =====================================================

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_field_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. VERIFY POLICIES ARE WORKING
-- =====================================================

-- List all policies to verify they were created
SELECT 
    'Policy verification' as status,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN (
    'students', 'form_configurations', 'background_selections', 
    'study_fields', 'question_banks', 'question_field_mapping',
    'question_usage_stats', 'assignment_attempts', 'assignment_responses', 'admins'
)
ORDER BY tablename, policyname;

-- =====================================================
-- 6. TEST DATA ACCESS
-- =====================================================

-- Test that we can query the students table (this should work now)
SELECT 
    'Test query' as status,
    COUNT(*) as student_count
FROM students;

-- Show current study fields
SELECT 
    'Study fields test' as status,
    field_id,
    name,
    is_active
FROM study_fields
WHERE is_active = true
ORDER BY created_at;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT 
    'RLS policies fixed for Clerk authentication!' as status,
    'All tables now use permissive policies compatible with Clerk' as details,
    'The 406 Not Acceptable errors should be resolved' as result;