# Errors and Bugs Report

This document catalogs all known errors and bugs in the frontend project.

## 1. JSX Structure Error in QuestionBankManager.jsx

### Error Details
- **File**: `src/components/QuestionBankManager.jsx`
- **Line**: ~148
- **Error Message**: "Adjacent JSX elements must be wrapped in an enclosing tag. Did you want a JSX fragment <>...</>?"
- **Type**: Syntax Error

### Description
The component has a JSX structure issue where adjacent elements are not properly wrapped. This causes the application to fail to compile.

### Evidence
From `test-results/tests-ai-toggle-AI-toggle-in-Question-Banks-tab/error-context.md`:
```
"[plugin:vite:react-babel]" 
"C:\\Users\\Microsoft\\Desktop\\frontend\\src\\components\\QuestionBankManager.jsx: Adjacent JSX elements must be wrapped in an enclosing tag. Did you want a JSX fragment <>...</>? (148:4) 151 |"
```

## 2. Test Failures

### AI Toggle Test Issues
- **File**: `tests/ai-toggle.test.js`
- **Issue**: Tests related to AI toggle functionality may be failing due to the JSX error in QuestionBankManager.jsx

### AI Settings Service Test Issues
- **File**: `tests/ai-settings-service.test.js`
- **Issue**: Tests for AI settings persistence and functionality may be affected by the component error

## 3. Database Schema Issues

### Form Field Repetition
- **File**: `src/sql/fix_form_field_repetition.sql`
- **Issue**: Previous issues with duplicate fields in form configurations required database-level fixes
- **Status**: Fixed with SQL script, but monitoring needed

## 4. Potential Runtime Issues

### Unused Imports
Based on historical experience documented in memory, unused imports can cause module-related errors even when they don't appear to be used in the code flow.

### Data Type Validation
Array operations should always be preceded by `Array.isArray` checks to prevent type errors when handling data from external sources.

### State Variable Management
All state variables must be properly declared with useState and imported from React. Duplicate imports should be checked.

## 5. UI/UX Issues

### React Portal Implementation
When implementing modals using React's createPortal:
1. Always provide two arguments (React element and DOM element)
2. Use proper flexbox alignment
3. Use high z-index values to ensure visibility
4. Place portal-related logic after state declarations
5. Avoid JSX comments inside portal contexts

## 6. Styling Issues

### Color Consistency
All UI components must maintain strict color consistency:
- Use neutral white/gray tones (text-white/70, bg-white/10, bg-white/5)
- Use brand orange colors (border-orange-400, text-orange-300)
- Eliminate blue tones from all components

## 7. Authentication Issues

### RLS Policy Problems
- **Files**: `fix_rls_for_clerk.sql`, `RLS_POLICY_FIX_GUIDE.md`
- **Issue**: 406 Not Acceptable errors with Supabase queries when using Clerk authentication
- **Solution**: Replace RLS policies using auth.uid() with permissive policies during development

## 8. Build and Development Issues

### Development Server Issues
- Vite HMR may fail when components have syntax errors
- Error overlay may persist until code is fixed

## Recommendations

1. Fix the JSX structure error in QuestionBankManager.jsx first
2. Run all tests after the fix to verify functionality
3. Monitor database queries for any field repetition issues
4. Ensure all state variables are properly declared
5. Validate data types before array operations
6. Check for unused imports that might cause module errors
7. Verify React Portal implementations follow best practices
8. Maintain consistent color scheme throughout the application
9. Test authentication flows after any RLS policy changes

## Next Steps

1. Fix the immediate JSX syntax error
2. Re-run failing tests
3. Perform end-to-end testing of the AI toggle functionality
4. Verify database schema integrity
5. Check all modals and UI components for proper implementation