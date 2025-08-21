import { AlertCircle, BookOpen, Brain, Calculator, Clock, Code, Globe, Newspaper, Scroll } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { ASSIGNMENT_CATEGORIES, ASSIGNMENT_CONFIG } from '../data/assignment';
import { grokService } from '../lib/grokService';

const CATEGORY_ICONS = {
  [ASSIGNMENT_CATEGORIES.CODING]: Code,
  [ASSIGNMENT_CATEGORIES.LOGIC]: Brain,
  [ASSIGNMENT_CATEGORIES.MATHEMATICS]: Calculator,
  [ASSIGNMENT_CATEGORIES.LANGUAGE]: BookOpen,
  [ASSIGNMENT_CATEGORIES.CULTURE]: Globe,
  [ASSIGNMENT_CATEGORIES.VEDIC_KNOWLEDGE]: Scroll,
  [ASSIGNMENT_CATEGORIES.CURRENT_AFFAIRS]: Newspaper
};

function QuestionCard({ question, questionNumber, userAnswer, onAnswerChange, onExplanationChange, userExplanation, timeRemaining }) {
  const IconComponent = CATEGORY_ICONS[question.category] || BookOpen;

  return (
    <div className="rounded-xl border border-white/20 bg-white/10 p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <IconComponent className="h-5 w-5 text-orange-400" />
            <span className="text-sm font-medium text-orange-400">{question.category}</span>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70">
            {question.difficulty}
          </span>
        </div>
        <div className="text-sm text-white/60">
          Question {questionNumber} of {ASSIGNMENT_CONFIG.TOTAL_QUESTIONS}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">{question.question_text}</h3>

        <div className="space-y-2">
          {question.options.map((option, index) => (
            <label
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                userAnswer === option
                  ? 'border-orange-400 bg-orange-400/10'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'
              }`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option}
                checked={userAnswer === option}
                onChange={(e) => onAnswerChange(question.id, e.target.value)}
                className="text-orange-400"
              />
              <span className="text-white">{option}</span>
            </label>
          ))}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/80">
            Explain your reasoning (optional but recommended for better scoring):
          </label>
          <textarea
            value={userExplanation || ''}
            onChange={(e) => onExplanationChange(question.id, e.target.value)}
            placeholder="Explain why you chose this answer..."
            className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
            rows={3}
          />
        </div>

        {question.vedic_connection && (
          <div className="p-3 rounded-lg bg-orange-400/10 border border-orange-400/20">
            <div className="text-sm font-medium text-orange-400 mb-1">Vedic Connection:</div>
            <div className="text-sm text-white/80">{question.vedic_connection}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function Timer({ timeRemaining, totalTime }) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const percentage = (timeRemaining / totalTime) * 100;

  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-white/10 border border-white/20">
      <Clock className="h-5 w-5 text-orange-400" />
      <div className="flex-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/80">Time Remaining</span>
          <span className={`font-mono ${timeRemaining < 300 ? 'text-red-400' : 'text-white'}`}>
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
        <div className="mt-1 h-2 w-full rounded bg-white/10">
          <div
            className={`h-2 rounded transition-all duration-1000 ${
              percentage > 20 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.max(0, percentage)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function ProgressIndicator({ currentQuestion, totalQuestions, answeredQuestions }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/80">Progress</span>
        <span className="text-white">
          {answeredQuestions.size} of {totalQuestions} answered
        </span>
      </div>
      <div className="h-2 w-full rounded bg-white/10">
        <div
          className="h-2 rounded bg-orange-500 transition-all duration-300"
          style={{ width: `${(answeredQuestions.size / totalQuestions) * 100}%` }}
        />
      </div>
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: totalQuestions }, (_, i) => (
          <div
            key={i}
            className={`h-2 rounded ${
              i < currentQuestion
                ? answeredQuestions.has(i)
                  ? 'bg-green-500'
                  : 'bg-red-400'
                : i === currentQuestion
                ? 'bg-orange-500'
                : 'bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Assignment({ onComplete }) {
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [userExplanations, setUserExplanations] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Load assignment on component mount
  useEffect(() => {
    loadAssignment();
  }, []);

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmit(true); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const loadAssignment = async () => {
    try {
      setLoading(true);
      setLoadingProgress(0);
      setLoadingMessage('Initializing AI question generation...');

      const loadingToast = toast.loading('Generating your personalized assignment with AI...');

      // Progress callback to update UI
      const progressCallback = (message, progress) => {
        setLoadingMessage(message);
        setLoadingProgress(progress);
        console.log(`📊 Progress: ${progress.toFixed(1)}% - ${message}`);
      };

      const generatedAssignment = await grokService.generateFullAssignment(progressCallback);
      setAssignment(generatedAssignment);
      setTimeRemaining(ASSIGNMENT_CONFIG.TIME_LIMIT_MINUTES * 60);
      setStartTime(new Date());

      toast.success('Assignment loaded successfully!', { id: loadingToast });
    } catch (error) {
      console.error('Failed to load assignment:', error);

      // Show specific error message based on error type
      let errorMessage = 'Failed to generate assignment. Please try again.';
      if (error.message.includes('API key')) {
        errorMessage = 'Assessment service is not properly configured. Please contact support.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network connection error. Please check your internet connection and try again.';
      } else if (error.message.includes('rate limit') || error.message.includes('429')) {
        errorMessage = 'API rate limit reached. Please wait a few minutes and try again.';
      } else if (error.message.includes('too few questions')) {
        errorMessage = 'Could not generate enough questions due to API limitations. Please try again in a few minutes.';
      }

      toast.error(errorMessage);
      setAssignment(null); // Ensure assignment is null on error
    } finally {
      setLoading(false);
      setLoadingProgress(0);
      setLoadingMessage('');
    }
  };

  const handleAnswerChange = useCallback((questionId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  }, []);

  const handleExplanationChange = useCallback((questionId, explanation) => {
    setUserExplanations(prev => ({
      ...prev,
      [questionId]: explanation
    }));
  }, []);

  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit && !showConfirmSubmit) {
      setShowConfirmSubmit(true);
      return;
    }

    const endTime = new Date();
    const timeTaken = Math.floor((endTime - startTime) / 1000);

    const attempt = {
      id: `attempt_${Date.now()}`,
      assignment_id: assignment.id,
      started_at: startTime.toISOString(),
      completed_at: endTime.toISOString(),
      time_taken_seconds: timeTaken,
      user_answers: userAnswers,
      user_explanations: userExplanations,
      questions: assignment.questions,
      auto_submitted: autoSubmit
    };

    onComplete(attempt);
  };

  const navigateToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < assignment.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-6 max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>

          <div className="space-y-3">
            <div className="text-xl font-semibold text-white">Generating Your Assignment</div>
            <div className="text-white/80">{loadingMessage || 'Preparing AI-powered questions...'}</div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.max(5, loadingProgress)}%` }}
            ></div>
          </div>
          <div className="text-sm text-orange-400 font-medium">
            {loadingProgress > 0 ? `${Math.round(loadingProgress)}% Complete` : 'Starting...'}
          </div>

          <div className="space-y-2 text-sm text-white/60">
            <div>🤖 Using advanced AI to create unique questions</div>
            <div>⏳ This process may take 2-3 minutes due to API rate limits</div>
            <div>🎯 Generating questions across 7 different categories</div>
          </div>

          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="text-sm text-blue-300">
              💡 <strong>Why the wait?</strong> We're generating completely unique questions
              tailored to your assessment using AI, which requires careful rate limiting
              to ensure quality results.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center space-y-6 max-w-md mx-auto">
        <AlertCircle className="h-16 w-16 text-red-400 mx-auto" />
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Assignment Generation Failed</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            We couldn't generate your assignment using our AI system. This could be due to:
          </p>
          <ul className="text-left text-sm text-white/60 space-y-1">
            <li>• Network connectivity issues</li>
            <li>• AI service temporarily unavailable</li>
            <li>• API rate limits exceeded</li>
          </ul>
        </div>
        <div className="space-y-3">
          <button
            onClick={loadAssignment}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
          <div className="text-xs text-white/50">
            If the problem persists, please contact support
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = assignment.questions[currentQuestionIndex];
  const answeredQuestions = new Set(
    assignment.questions
      .map((q, index) => userAnswers[q.id] ? index : null)
      .filter(index => index !== null)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white">{assignment.title}</h1>
        <p className="text-white/70">{assignment.description}</p>
      </div>

      {/* Timer and Progress */}
      <div className="grid gap-4 md:grid-cols-2">
        <Timer timeRemaining={timeRemaining} totalTime={ASSIGNMENT_CONFIG.TIME_LIMIT_MINUTES * 60} />
        <ProgressIndicator
          currentQuestion={currentQuestionIndex}
          totalQuestions={assignment.questions.length}
          answeredQuestions={answeredQuestions}
        />
      </div>

      {/* Current Question */}
      <QuestionCard
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        userAnswer={userAnswers[currentQuestion.id]}
        userExplanation={userExplanations[currentQuestion.id]}
        onAnswerChange={handleAnswerChange}
        onExplanationChange={handleExplanationChange}
        timeRemaining={timeRemaining}
      />

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg border border-white/20"
        >
          Previous
        </button>

        <div className="flex items-center gap-2">
          {assignment.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => navigateToQuestion(index)}
              className={`w-8 h-8 rounded text-sm ${
                index === currentQuestionIndex
                  ? 'bg-orange-500 text-white'
                  : answeredQuestions.has(index)
                  ? 'bg-green-500 text-white'
                  : 'bg-white/20 text-white/70 hover:bg-white/30'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {currentQuestionIndex === assignment.questions.length - 1 ? (
          <button
            onClick={() => handleSubmit(false)}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
          >
            Submit Assignment
          </button>
        ) : (
          <button
            onClick={nextQuestion}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
          >
            Next
          </button>
        )}
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/20 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Submit Assignment?</h3>
            <p className="text-white/70 mb-6">
              You have answered {answeredQuestions.size} out of {assignment.questions.length} questions. 
              Are you sure you want to submit your assignment?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20"
              >
                Continue Working
              </button>
              <button
                onClick={() => handleSubmit(false)}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
