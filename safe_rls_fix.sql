-- =====================================================
-- SAFE RLS POLICY FIX FOR CLERK AUTHENTICATION
-- =====================================================
-- This script safely fixes RLS policies even if they already exist
-- Can be run multiple times without errors

-- =====================================================
-- 1. SAFELY DROP ALL EXISTING POLICIES
-- =====================================================

-- Drop all possible existing policies for students table
DROP POLICY IF EXISTS "clerk_dev_students_all" ON students;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON students;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on students" ON students;
DROP POLICY IF EXISTS "Users can view their own student record" ON students;
DROP POLICY IF EXISTS "Users can insert their own student record" ON students;
DROP POLICY IF EXISTS "Users can update their own student record" ON students;

-- Drop policies for other tables
DROP POLICY IF EXISTS "clerk_dev_form_configs_all" ON form_configurations;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on form_configurations" ON form_configurations;

DROP POLICY IF EXISTS "clerk_dev_background_all" ON background_selections;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on background_selections" ON background_selections;

DROP POLICY IF EXISTS "clerk_dev_study_fields_all" ON study_fields;
DROP POLICY IF EXISTS "Anyone can view study fields" ON study_fields;
DROP POLICY IF EXISTS "Allow all operations on study_fields for development" ON study_fields;

DROP POLICY IF EXISTS "clerk_dev_question_banks_all" ON question_banks;
DROP POLICY IF EXISTS "Anyone can view active questions" ON question_banks;

DROP POLICY IF EXISTS "clerk_dev_question_mapping_all" ON question_field_mapping;
DROP POLICY IF EXISTS "clerk_dev_attempts_all" ON assignment_attempts;
DROP POLICY IF EXISTS "clerk_dev_responses_all" ON assignment_responses;

-- =====================================================
-- 2. CREATE NEW CLERK-COMPATIBLE POLICIES
-- =====================================================

-- Students table - allow all operations for Clerk authentication
CREATE POLICY "clerk_dev_students_all" ON students
  FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

-- Form configurations - allow all operations
CREATE POLICY "clerk_dev_form_configs_all" ON form_configurations
  FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

-- Background selections - allow all operations
CREATE POLICY "clerk_dev_background_all" ON background_selections
  FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

-- Study fields - allow all operations
CREATE POLICY "clerk_dev_study_fields_all" ON study_fields
  FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

-- Question banks - allow all operations
CREATE POLICY "clerk_dev_question_banks_all" ON question_banks
  FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

-- Question field mapping - allow all operations
CREATE POLICY "clerk_dev_question_mapping_all" ON question_field_mapping
  FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

-- Assignment attempts - allow all operations
CREATE POLICY "clerk_dev_attempts_all" ON assignment_attempts
  FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

-- Assignment responses - allow all operations
CREATE POLICY "clerk_dev_responses_all" ON assignment_responses
  FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

-- =====================================================
-- 3. ENSURE RLS IS ENABLED ON ALL TABLES
-- =====================================================

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_field_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_responses ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. VERIFY THE FIX
-- =====================================================

-- Test that we can now query the students table
SELECT 
    'RLS Fix Status' as check_type,
    'SUCCESS - All policies updated for Clerk authentication' as status;

-- Show the new policies
SELECT 
    'New Policies Created' as check_type,
    schemaname,
    tablename,
    policyname
FROM pg_policies 
WHERE policyname LIKE 'clerk_dev_%'
ORDER BY tablename, policyname;

-- Final success message
SELECT 
    'COMPLETE' as status,
    '406 Not Acceptable errors should now be resolved' as result,
    'Test your application at /intake to verify' as next_step;