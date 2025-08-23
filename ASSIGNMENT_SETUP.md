# Assignment Feature Setup Guide

## Overview

The assignment feature provides logged-in users with AI-generated multidisciplinary assessments covering:
- **Coding**: Programming concepts and problem-solving
- **Logic**: Reasoning and pattern recognition
- **Mathematics**: Real-world mathematical applications
- **Language**: Communication and comprehension
- **Culture**: Global awareness and diversity
- **Vedic Knowledge**: Ancient wisdom and modern applications
- **Current Affairs**: Recent significant events

## Features

✅ **AI-Generated Questions**: 20-30 questions generated using Grok API
✅ **Multidisciplinary Coverage**: 7 different categories
✅ **AI Scoring**: Based on accuracy, explanation quality, and reasoning clarity
✅ **Detailed Feedback**: Personalized feedback for each response
✅ **Progress Tracking**: Results stored in Supabase
✅ **Category Analysis**: Performance breakdown by subject area
✅ **Strengths & Improvements**: Identified based on performance

## Setup Instructions

### 1. Grok API Configuration

1. **Get Grok API Key**:
   - Visit [Groq Console](https://console.groq.com/)
   - Sign up or log in to your account
   - Navigate to API Keys section
   - Create a new API key

2. **Add to Environment Variables**:
   ```env
   # Add this to your .env.local file
   VITE_GROK_API_KEY=your_actual_grok_api_key_here
   ```

3. **Replace Placeholder**:
   - Open `.env.local`
   - Replace `your_grok_api_key_here` with your actual API key

### 2. Database Setup

1. **Run SQL Script**:
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Copy and paste the content from `src/sql/create_assignment_tables.sql`
   - Execute the script

2. **Verify Tables Created**:
   - `assignment_attempts`: Stores overall assignment results
   - `assignment_responses`: Stores detailed question responses
   - Views for analytics and reporting

### 3. Test the Feature

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Login as User**:
   - Navigate to the application
   - Sign in with Clerk authentication

3. **Access Assignment**:
   - Go to `/dashboard` page
   - Click "Take Assessment" button
   - Or navigate directly to `/assignment`

## How It Works

### Question Generation
1. **API Call to Grok**: Generates questions based on category and difficulty
2. **Fallback System**: Uses default questions if API fails
3. **Question Distribution**: Balanced across categories and difficulty levels

### Assessment Flow
1. **Question Display**: One question at a time with navigation
2. **Timer**: 90-minute time limit with visual countdown
3. **Answer Collection**: Multiple choice with optional explanations
4. **Progress Tracking**: Visual indicators for answered questions

### AI Evaluation
1. **Response Analysis**: Each answer evaluated by Grok AI
2. **Multi-Criteria Scoring**:
   - **Accuracy (40%)**: Correctness of the answer
   - **Explanation Quality (30%)**: Quality of reasoning provided
   - **Reasoning Clarity (30%)**: Clarity of thought process

3. **Feedback Generation**: Personalized feedback for improvement

### Results Display
1. **Overall Score**: Grade and percentage
2. **Category Breakdown**: Performance by subject area
3. **Strengths & Improvements**: Identified areas
4. **Detailed Review**: Question-by-question analysis

## Configuration Options

### Assignment Settings
```javascript
// In src/data/assignment.js
export const ASSIGNMENT_CONFIG = {
  TOTAL_QUESTIONS: 25,           // Total questions in assignment
  TIME_LIMIT_MINUTES: 90,        // Time limit in minutes
  CATEGORY_DISTRIBUTION: {       // Questions per category
    'Coding': 4,
    'Logic': 4,
    'Mathematics': 4,
    'Language': 3,
    'Culture': 3,
    'Vedic Knowledge': 4,
    'Current Affairs': 3
  }
};
```

### Scoring Weights
```javascript
export const SCORING_CRITERIA = {
  ACCURACY_WEIGHT: 0.4,          // 40% weight for correctness
  EXPLANATION_QUALITY_WEIGHT: 0.3, // 30% weight for explanation
  REASONING_CLARITY_WEIGHT: 0.3,   // 30% weight for reasoning
  MAX_SCORE_PER_QUESTION: 10
};
```

## API Usage and Costs

### Grok API Considerations
- **Rate Limiting**: Built-in delays between API calls
- **Error Handling**: Fallback to default questions if API fails
- **Cost Management**: Configurable question counts to manage API usage

### Fallback System
If Grok API is unavailable:
- Uses predefined questions from `DEFAULT_ASSIGNMENT`
- Basic scoring without AI evaluation
- Still provides functional assessment experience

## Troubleshooting

### Common Issues

1. **API Key Not Working**:
   - Verify key is correct in `.env.local`
   - Check Groq console for key status
   - Ensure no extra spaces in environment variable

2. **Database Errors**:
   - Verify SQL script ran successfully
   - Check Supabase table permissions
   - Ensure RLS policies are configured

3. **Questions Not Loading**:
   - Check browser console for API errors
   - Verify internet connection
   - Fallback questions should load if API fails

4. **Results Not Saving**:
   - Ensure user is logged in with Clerk
   - Check Supabase connection
   - Verify table structure matches expected schema

### Debug Mode
Enable debug logging by adding to console:
```javascript
localStorage.setItem('debug', 'assignment:*');
```

## Future Enhancements

Potential improvements:
- **Question Bank**: Pre-generated question pools
- **Adaptive Difficulty**: Adjust based on performance
- **Time Analytics**: Track time per question
- **Retake Limits**: Configure retake policies
- **Leaderboards**: Compare performance with others
- **Export Results**: PDF reports of performance

## Support

For issues or questions:
1. Check browser console for errors
2. Verify environment variables are set
3. Test with fallback mode (without API key)
4. Review Supabase logs for database issues

The assignment feature is designed to be robust with fallback options, ensuring users can always complete assessments even if external services are unavailable.
