# Dynamic Forms Based on Student Background

## Overview

This feature implements a dynamic form system that personalizes the student intake experience based on their academic background, education level, and learning goals. When students log in for the first time, they're presented with a background selection modal that determines which specialized form they'll see.

## Features Implemented

### 1. Background Selection Modal
- **Component**: `src/components/BackgroundSelectionModal.jsx`
- **Purpose**: Collects student's field of study, education level, and learning goals
- **Design**: Matches site theme with glassmorphism effects, orange accents, and dark background
- **Fields**:
  - Field of Study: STEM, Business, Social Sciences, Health & Medicine, Creative Arts, Other
  - Education Level: High School, Undergraduate, Graduate, Postgraduate, Professional
  - Learning Goals: Skill building, Academic support, Career change, Personal growth, Certification, Exploration

### 2. Background Selection Service
- **File**: `src/lib/backgroundSelectionService.js`
- **Functions**:
  - `saveBackgroundSelection()`: Saves user's background choices
  - `getBackgroundSelection()`: Retrieves user's background
  - `hasBackgroundSelection()`: Checks if user has completed background selection
  - `getFormConfigForUser()`: Returns appropriate form configuration based on background
  - `deleteBackgroundSelection()`: Removes background selection

### 3. Field-Specific Form Configurations
- **File**: `src/lib/fieldSpecificFormConfigs.js`
- **Enhanced**: Updated to support new field categories from modal
- **Form Types**:
  - **STEM**: Programming languages, math level, technical interests, project experience
  - **Business**: Business areas, experience level, industry interests, career goals
  - **Social Sciences**: Research interests, cultural focus, writing experience
  - **Health & Medicine**: Medical interests, science background, specializations
  - **Creative Arts**: Creative mediums, artistic experience, portfolio work
  - **General**: Flexible form for "Other" category

### 4. Background Selection Wrapper
- **Component**: `src/components/BackgroundSelectionWrapper.jsx`
- **Purpose**: Manages the flow of showing background selection modal
- **Logic**:
  - Checks if user has completed background selection
  - Shows modal for new users
  - Handles saving and redirecting to appropriate form
  - Provides loading states and error handling

### 5. Updated Intake Page
- **File**: `src/pages/Intake.jsx`
- **Changes**:
  - Integrated with background selection service
  - Loads user-specific form configuration based on background
  - Falls back to default form if no background selection exists
  - Wrapped with BackgroundSelectionWrapper component

### 6. Database Schema
- **File**: `src/sql/add_background_selection_fields.sql`
- **Table**: `background_selections`
- **Fields**:
  - `user_id`: Links to authenticated user
  - `field_of_study`: Selected academic field
  - `class_level`: Education level
  - `learning_goals`: Primary learning objective
  - `created_at`, `updated_at`: Timestamps

## User Flow

1. **Student logs in** → Clerk authentication
2. **Background check** → System checks if user has background selection
3. **Modal appears** → If no background, show selection modal
4. **Background saved** → User selections stored in database
5. **Redirect to form** → User sees personalized intake form
6. **Form submission** → Responses saved with existing student data

## Technical Implementation

### Authentication Integration
- Uses Clerk for user authentication
- Background selection tied to user ID
- Protected routes ensure only authenticated users access forms

### Form Configuration
- Dynamic form generation based on background selection
- Maintains existing form builder functionality
- Admins can still create custom forms that override background-based forms

### Styling
- Consistent with existing site theme
- Dark background with glassmorphism effects
- Orange (#ff7a18) accent color for interactive elements
- Responsive design for mobile and desktop

### Error Handling
- Graceful fallback to default form if background service fails
- Loading states during background checks
- Toast notifications for user feedback

## Database Setup

To enable this feature, run the SQL migration:

```sql
-- Run this in your Supabase SQL editor
-- File: src/sql/add_background_selection_fields.sql
```

This creates the `background_selections` table with proper indexes and RLS policies.

## Configuration

No additional environment variables required. The feature uses existing:
- Supabase configuration for data storage
- Clerk configuration for authentication
- Existing form configuration system

## Future Enhancements

1. **Analytics**: Track which backgrounds are most common
2. **A/B Testing**: Test different form configurations for same background
3. **Progressive Profiling**: Collect additional background info over time
4. **Recommendation Engine**: Suggest learning paths based on background
5. **Background Migration**: Allow users to update their background selection

## Files Modified/Created

### New Files
- `src/components/BackgroundSelectionModal.jsx`
- `src/components/BackgroundSelectionWrapper.jsx`
- `src/sql/add_background_selection_fields.sql`
- `DYNAMIC_FORMS_FEATURE.md`

### Modified Files
- `src/lib/backgroundSelectionService.js` (enhanced)
- `src/lib/fieldSpecificFormConfigs.js` (updated field mapping)
- `src/pages/Intake.jsx` (integrated background-based forms)
- `src/App.jsx` (updated import for wrapped component)

## Testing

1. **New User Flow**: Create new account → Should see background modal
2. **Existing User**: Login with existing account → Should skip modal
3. **Form Variations**: Test different background selections → Should see different forms
4. **Fallback**: Disable background service → Should see default form
5. **Mobile**: Test modal and forms on mobile devices
