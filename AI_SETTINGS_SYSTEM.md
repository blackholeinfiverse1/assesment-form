# AI Settings System Documentation

## Overview

The AI Settings System provides a centralized way to control AI features across the application. The system includes a global toggle that affects question generation while keeping AI functionality available for other features like summaries and dashboard analytics.

## Key Features

### Global AI Toggle
- **Purpose**: Control whether AI-generated questions are included in student assignments
- **Scope**: Affects all students and assignments system-wide
- **Default**: Enabled by default
- **Persistence**: Settings are stored in database with localStorage fallback

### Selective AI Usage
- **Question Generation**: Controlled by the global toggle
- **Other AI Features**: Always available (summaries, dashboard, evaluations)
- **Admin Questions**: Always available regardless of AI toggle state

## How It Works

### System Architecture

```
[Admin Panel] ───┐
                 ├──► [AI Settings Service] ◄──► [Database/LocalStorage]
[Assignments] ────┘
                 │
                 └──► [Field-Based Question Service] ───► [Students]
```

### AI Toggle Logic

1. **When AI is ENABLED**:
   - Students receive a mix of admin-created and AI-generated questions
   - AI question generation runs during assignment creation
   - All AI features work normally

2. **When AI is DISABLED**:
   - Students receive only admin-created questions
   - AI question generation is skipped
   - Other AI features (summaries, dashboard) continue to work
   - AI evaluation of student responses continues to function

## Implementation Details

### AI Settings Service (`aiSettingsService.js`)

The service provides:
- `isAIEnabled()` - Check if AI question generation is enabled
- `setAIEnabled(enabled)` - Update the global AI setting
- `shouldUseAIGeneration(context)` - Context-aware AI usage check
- `initializeAISettings()` - Initialize database table if needed

### Field-Based Question Service Integration

The service now:
1. Checks global AI setting before generating questions
2. Falls back to admin-only questions when AI is disabled
3. Maintains all other functionality regardless of AI state

### Database Schema (`ai_settings` table)

```sql
CREATE TABLE ai_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  ai_enabled BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Setup Instructions

### 1. Database Setup

Run the SQL script to create the AI settings table:

```sql
-- Execute this in your Supabase SQL Editor
-- File: src/sql/setup_ai_settings.sql
```

### 2. Verify Installation

After running the script, you should see:
- `ai_settings` table created in your database
- Default setting `global_question_generation` with value `true`
- Proper RLS policies and permissions set

### 3. Test the System

1. Go to Admin Panel → Question Bank Manager
2. Find the "Enable AI Generated Questions" toggle
3. Toggle it OFF and verify:
   - AI questions are filtered out from display
   - "AI Questions Disabled" indicator appears
4. Toggle it ON and verify:
   - AI questions reappear
   - Indicator is removed

## Admin Usage

### Accessing AI Settings
1. Navigate to Admin Panel
2. Go to Question Bank Manager
3. Find the "Enable AI Generated Questions" toggle
4. Toggle ON/OFF as needed

### Effects of Disabling AI
- New assignments will contain only admin-created questions
- Existing AI-generated questions remain in the database
- Question Bank Manager filters out AI questions from display
- All other AI features continue to work

## Student Experience

### With AI Enabled
- Mixed question sets (admin + AI generated)
- Personalized question generation
- Full assessment experience

### With AI Disabled
- Admin-only question sets
- Consistent, curated content
- No change to evaluation or feedback features

## Technical Implementation

### Caching Strategy
- Settings cached for 5 minutes to reduce database queries
- Cache automatically invalidated on setting changes
- Manual cache clearing available via `clearCache()`

### Fallback Mechanisms
1. **Database First**: Check `ai_settings` table
2. **LocalStorage**: Fallback if database unavailable
3. **Default**: Enable AI if all else fails

### Error Handling
- Graceful degradation to default behavior
- Comprehensive logging for debugging
- User notifications for setting changes

## Testing

### Manual Testing
- Admin panel toggle operation
- Student assignment generation with different AI states
- Database setting persistence

### Test Procedures

1. **Toggle Functionality**:
   - Navigate to Admin Panel → Question Bank Manager
   - Verify AI toggle is visible and shows "ON"
   - Click toggle to turn AI OFF
   - Verify state changes to "OFF"
   - Refresh page and verify setting persists

2. **Question Filtering**:
   - With AI ON, note number of questions displayed
   - Turn AI OFF
   - Verify questions are filtered (count may change)
   - Check that only admin-created questions remain

3. **Assignment Generation**:
   - Complete an assignment with AI ON
   - Note presence of AI-generated questions
   - Turn AI OFF
   - Complete another assignment
   - Verify only admin questions are used

## Troubleshooting

### Common Issues

1. **Settings Not Persisting**:
   - Check database connectivity
   - Verify `ai_settings` table exists
   - Check browser console for errors

2. **AI Questions Still Appearing When Disabled**:
   - Refresh the Question Bank Manager
   - Check browser console for JavaScript errors
   - Verify database setting value

3. **Database Table Missing**:
   - Run the setup SQL script
   - Check Supabase table permissions
   - Verify RLS policies are correctly applied

### Debugging Steps

1. **Check Browser Console**:
   - Look for "🤖 AI Settings" log messages
   - Check for any error messages related to aiSettingsService

2. **Verify Database Values**:
   ```sql
   SELECT * FROM ai_settings;
   ```

3. **Clear Cache**:
   - Call `aiSettingsService.clearCache()` in browser console
   - Or clear localStorage manually

## Future Enhancements

### Planned Features
1. **Per-Field AI Settings**: Control AI per study field
2. **Per-Category AI Settings**: Control AI per question category
3. **Scheduled AI Toggles**: Automatically enable/disable AI at specific times
4. **Usage Analytics**: Track AI feature utilization

### Extensibility
The system is designed to support additional AI settings:
- Add new `setting_key` values to `ai_settings` table
- Extend `shouldUseAIGeneration()` with context-specific logic
- Update admin UI to manage new settings