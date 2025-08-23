-- =====================================================
-- DIAGNOSTIC: RLS POLICIES CAUSING 406 ERRORS
-- =====================================================
-- This script helps diagnose why we're getting 406 Not Acceptable errors

-- =====================================================
-- 1. CHECK CURRENT RLS STATUS
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

-- =====================================================
-- 2. LIST CURRENT POLICIES
-- =====================================================

SELECT 
    'Current Policies' as diagnostic,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual as policy_condition
FROM pg_policies 
WHERE tablename IN (
    'students', 'form_configurations', 'background_selections',
    'study_fields', 'question_banks', 'assignment_attempts'
)
ORDER BY tablename, policyname;

-- =====================================================
-- 3. CHECK TABLE PERMISSIONS
-- =====================================================

SELECT 
    'Table Permissions' as diagnostic,
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_name IN (
    'students', 'form_configurations', 'background_selections',
    'study_fields', 'question_banks', 'assignment_attempts'
)
ORDER BY table_name, grantee;

-- =====================================================
-- 4. IDENTIFY PROBLEMATIC POLICIES
-- =====================================================

SELECT 
    'Problematic Policies' as diagnostic,
    tablename,
    policyname,
    CASE 
        WHEN qual LIKE '%auth.uid()%' THEN 'USES_SUPABASE_AUTH'
        WHEN qual = 'true' THEN 'PERMISSIVE'
        WHEN qual IS NULL THEN 'NO_CONDITION'
        ELSE 'CUSTOM_CONDITION'
    END as policy_type,
    qual as condition
FROM pg_policies 
WHERE tablename IN (
    'students', 'form_configurations', 'background_selections',
    'study_fields', 'question_banks', 'assignment_attempts'
)
ORDER BY 
    CASE 
        WHEN qual LIKE '%auth.uid()%' THEN 1  -- These are problematic
        ELSE 2
    END,
    tablename;

-- =====================================================
-- 5. SHOW SOLUTION
-- =====================================================

SELECT 
    'SOLUTION' as diagnostic,
    'Run fix_rls_for_clerk.sql script to fix 406 errors' as action,
    'The issue is RLS policies using auth.uid() which requires Supabase auth' as problem,
    'We need permissive policies for Clerk authentication' as fix;

-- =====================================================
-- 6. SIMPLE TEST QUERY
-- =====================================================

-- This query will likely fail with current policies
SELECT 
    'Test Query' as diagnostic,
    'Attempting to query students table...' as status;

-- Uncomment this to test (will likely fail):
-- SELECT COUNT(*) as student_count FROM students;