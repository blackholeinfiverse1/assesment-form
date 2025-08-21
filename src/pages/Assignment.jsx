import { useUser } from '@clerk/clerk-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Assignment from '../components/Assignment';
import AssignmentResults from '../components/AssignmentResults';
import ErrorBoundary from '../components/ErrorBoundary';
import { CLERK_ENABLED } from '../config/auth';
import { scoringService } from '../lib/scoringService';
import { supabase } from '../lib/supabaseClient';

export default function AssignmentPage() {
  const [currentView, setCurrentView] = useState('assignment'); // 'assignment', 'evaluating', 'results'
  const [assignmentAttempt, setAssignmentAttempt] = useState(null);
  const [evaluationResults, setEvaluationResults] = useState(null);
  const { user } = useUser();

  const handleAssignmentComplete = async (attempt) => {
    setAssignmentAttempt(attempt);
    setCurrentView('evaluating');

    try {
      // Show evaluation progress
      const evaluationToast = toast.loading('Evaluating your assignment with AI...');

      // Prepare user context for evaluation
      const userContext = CLERK_ENABLED && user ? {
        id: user.id,
        name: user.fullName || user.firstName || 'Student',
        email: user.emailAddresses[0]?.emailAddress
      } : null;

      console.log('🎯 Starting evaluation with user context:', userContext);

      // Evaluate the assignment with user context
      const results = await scoringService.evaluateAssignmentAttempt(attempt, userContext);

      // Store results in Supabase if user is logged in
      if (CLERK_ENABLED && user) {
        await storeAssignmentResults(attempt, results);
      }

      setEvaluationResults(results);
      setCurrentView('results');

      toast.success('Assignment evaluated successfully!', { id: evaluationToast });
    } catch (error) {
      console.error('Error evaluating assignment:', error);

      // Show specific error message
      let errorMessage = 'Failed to evaluate assignment. Please try again.';
      if (error.message.includes('API key')) {
        errorMessage = 'Evaluation service is not properly configured. Please contact support.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network connection error. Please check your internet connection and try again.';
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      }

      toast.error(errorMessage);
      setCurrentView('assignment');
    }
  };

  const storeAssignmentResults = async (attempt, results) => {
    console.log('💾 Starting to store assignment results...');
    console.log('👤 User info:', {
      id: user?.id,
      name: user?.fullName || user?.firstName,
      email: user?.emailAddresses[0]?.emailAddress
    });

    try {
      // Verify user authentication
      if (!CLERK_ENABLED || !user) {
        console.warn('⚠️ User not authenticated, skipping data storage');
        return;
      }

      // First, get or create student record
      const userEmail = user.emailAddresses[0]?.emailAddress;
      let studentRecord = null;

      console.log('🔍 Looking for existing student record...');

      // Try to find existing student record
      const { data: existingStudent, error: findError } = await supabase
        .from('students')
        .select('id, name, email')
        .eq('user_id', user.id)
        .single();

      if (findError && findError.code !== 'PGRST116') {
        console.error('❌ Error finding student record:', findError);
        throw new Error(`Failed to find student record: ${findError.message}`);
      }

      if (existingStudent) {
        console.log('✅ Found existing student record:', existingStudent);
        studentRecord = existingStudent;
      } else {
        console.log('📝 Creating new student record...');
        // Create student record if it doesn't exist
        const newStudentData = {
          user_id: user.id,
          name: user.fullName || user.firstName || 'Unknown Student',
          email: userEmail,
          student_id: `STU${Math.floor(Math.random() * 100000000)}`,
          responses: {}
        };

        const { data: newStudent, error: studentError } = await supabase
          .from('students')
          .insert([newStudentData])
          .select()
          .single();

        if (studentError) {
          console.error('❌ Error creating student record:', studentError);
          throw new Error(`Failed to create student record: ${studentError.message}`);
        } else {
          console.log('✅ Created new student record:', newStudent);
          studentRecord = newStudent;
        }
      }

      // Prepare assignment attempt data
      const assignmentData = {
        user_id: user.id,
        student_id: studentRecord?.id || null,
        user_email: userEmail,
        assignment_id: attempt.assignment_id,
        started_at: attempt.started_at,
        completed_at: attempt.completed_at,
        time_taken_seconds: attempt.time_taken_seconds,
        total_score: results.total_score,
        max_score: results.max_score,
        percentage: results.percentage,
        grade: results.grade,
        category_scores: results.category_scores,
        overall_feedback: results.overall_feedback,
        strengths: results.strengths,
        improvement_areas: results.improvement_areas,
        auto_submitted: attempt.auto_submitted || false,
        evaluated_at: results.evaluated_at
      };

      console.log('💾 Storing assignment attempt data:', assignmentData);

      // Insert assignment attempt
      const { data: attemptData, error: attemptError } = await supabase
        .from('assignment_attempts')
        .insert([assignmentData])
        .select()
        .single();

      if (attemptError) {
        console.error('❌ Error storing assignment attempt:', attemptError);
        throw new Error(`Failed to store assignment attempt: ${attemptError.message}`);
      }

      console.log('✅ Assignment attempt stored successfully:', attemptData);

      // Prepare detailed responses data
      const responseData = results.evaluated_responses.map(response => ({
        attempt_id: attemptData.id,
        question_id: response.question_id,
        question_category: response.question_category,
        question_difficulty: response.question_difficulty,
        user_answer: response.user_answer,
        user_explanation: response.user_explanation,
        correct_answer: response.correct_answer,
        is_correct: response.is_correct,
        accuracy_score: response.accuracy_score,
        explanation_score: response.explanation_score,
        reasoning_score: response.reasoning_score,
        total_score: response.total_score,
        max_score: response.max_score,
        ai_feedback: response.ai_feedback,
        suggestions: response.suggestions,
        evaluated_at: response.evaluated_at
      }));

      console.log(`💾 Storing ${responseData.length} detailed responses...`);

      // Insert detailed responses
      const { error: responsesError } = await supabase
        .from('assignment_responses')
        .insert(responseData);

      if (responsesError) {
        console.error('❌ Error storing assignment responses:', responsesError);
        throw new Error(`Failed to store assignment responses: ${responsesError.message}`);
      }

      console.log('✅ All assignment data stored successfully!');

      // Add the attempt data to results for display
      results.attempt = {
        ...attempt,
        stored_at: new Date().toISOString(),
        student_record: studentRecord
      };

    } catch (error) {
      console.error('💥 Error storing assignment results:', error);

      // Provide specific error messages based on the error type
      let errorMessage = 'Results evaluated successfully, but failed to save to database.';

      if (error.message.includes('row-level security policy')) {
        errorMessage = 'Database security policy error. Please ensure you are properly logged in and try again.';
        console.error('🔒 RLS Policy Error - User may not be properly authenticated or policies need to be updated');
      } else if (error.message.includes('permission denied')) {
        errorMessage = 'Database permission error. Please contact support.';
        console.error('🚫 Permission Error - Database permissions may need to be configured');
      } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
        errorMessage = 'Database table missing. Please contact support to set up the database.';
        console.error('🗄️ Table Missing Error - Database tables may not be created');
      }

      // Don't throw the error - evaluation was successful, storage is secondary
      toast.error(errorMessage);

      // Log detailed error information for debugging
      console.error('💾 Storage Error Details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        userAuthenticated: !!user,
        userId: user?.id
      });
    }
  };

  const handleRetakeAssignment = () => {
    setCurrentView('assignment');
    setAssignmentAttempt(null);
    setEvaluationResults(null);
  };

  const handleBackToDashboard = () => {
    // Navigate back to learn page or dashboard
    window.location.href = '/learn';
  };

  if (currentView === 'evaluating') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">Evaluating Your Assignment</h2>
            <p className="text-white/70">Our AI is analyzing your responses...</p>
            <div className="text-sm text-white/60">
              This may take a few minutes as we evaluate each answer for accuracy, explanation quality, and reasoning clarity.
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-orange-400">✓ Checking answers for accuracy</div>
            <div className="text-sm text-orange-400">✓ Evaluating explanation quality</div>
            <div className="text-sm text-orange-400">✓ Analyzing reasoning clarity</div>
            <div className="text-sm text-white/60">⏳ Generating personalized feedback</div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'results' && evaluationResults) {
    return (
      <ErrorBoundary fallbackMessage="Failed to display assignment results. Your evaluation was successful, but there was an error showing the results.">
        <AssignmentResults
          results={evaluationResults}
          onRetakeAssignment={handleRetakeAssignment}
          onBackToDashboard={handleBackToDashboard}
        />
      </ErrorBoundary>
    );
  }

  return (
    <Assignment onComplete={handleAssignmentComplete} />
  );
}
