// AI-powered scoring service for assignment evaluation

import { ASSIGNMENT_CATEGORIES, SCORING_CRITERIA } from '../data/assignment.js';
import { grokService } from './grokService.js';

class ScoringService {
  constructor() {
    this.grokService = grokService;
  }

  async evaluateAssignmentAttempt(attempt, userContext = null) {
    console.log(`🎯 Starting assignment evaluation for ${attempt.questions?.length || 0} questions`);

    if (userContext) {
      console.log(`👤 User context:`, {
        id: userContext.id,
        name: userContext.name,
        email: userContext.email
      });
    }

    const { questions, user_answers, user_explanations } = attempt;
    const evaluatedResponses = [];
    let totalScore = 0;
    const categoryScores = {};

    // Initialize category scores
    Object.values(ASSIGNMENT_CATEGORIES).forEach(category => {
      categoryScores[category] = { total: 0, max: 0, count: 0 };
    });

    console.log(`📊 Initialized category scores:`, categoryScores);

    // Evaluate each question
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const userAnswer = user_answers[question.id];
      const userExplanation = user_explanations[question.id] || '';

      console.log(`\n📝 === Evaluating question ${i + 1}/${questions.length} ===`);
      console.log(`📚 Category: ${question.category}`);
      console.log(`❓ Question: ${question.question_text.substring(0, 100)}...`);
      console.log(`✏️ User Answer: "${userAnswer}"`);
      console.log(`💭 User Explanation: "${userExplanation}"`);

      try {
        const evaluation = await this.evaluateResponse(question, userAnswer, userExplanation);
        console.log(`✅ Evaluation completed:`, evaluation);

        evaluatedResponses.push(evaluation);

        // Update category scores
        const category = question.category;
        categoryScores[category].total += evaluation.total_score;
        categoryScores[category].max += SCORING_CRITERIA.MAX_SCORE_PER_QUESTION;
        categoryScores[category].count += 1;

        totalScore += evaluation.total_score;

        console.log(`📊 Updated totals - Question score: ${evaluation.total_score}, Running total: ${totalScore}`);

        // Add small delay to avoid rate limiting
        console.log(`⏳ Waiting 2 seconds before next evaluation...`);
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`❌ Failed to evaluate question ${i + 1}:`, error);
        throw new Error(`Failed to evaluate question ${i + 1}: ${error.message}`);
      }
    }

    // Calculate category percentages
    Object.keys(categoryScores).forEach(category => {
      const categoryData = categoryScores[category];
      categoryData.percentage = categoryData.max > 0 ? (categoryData.total / categoryData.max) * 100 : 0;
    });

    const maxScore = questions.length * SCORING_CRITERIA.MAX_SCORE_PER_QUESTION;
    const overallPercentage = (totalScore / maxScore) * 100;

    // Generate overall feedback
    const overallFeedback = await this.generateOverallFeedback(
      evaluatedResponses,
      categoryScores,
      overallPercentage,
      userContext
    );

    return {
      attempt_id: attempt.id,
      evaluated_responses: evaluatedResponses,
      total_score: Math.round(totalScore * 100) / 100,
      max_score: maxScore,
      percentage: Math.round(overallPercentage * 100) / 100,
      category_scores: categoryScores,
      overall_feedback: overallFeedback,
      grade: this.calculateGrade(overallPercentage),
      strengths: this.identifyStrengths(categoryScores),
      improvement_areas: this.identifyImprovementAreas(categoryScores),
      evaluated_at: new Date().toISOString()
    };
  }

  async evaluateResponse(question, userAnswer, userExplanation) {
    console.log(`🔍 ScoringService: Starting evaluation for question ${question.id}`);

    try {
      // Get AI evaluation from Grok
      console.log(`🤖 Calling Grok API for evaluation...`);
      const aiEvaluation = await this.grokService.evaluateResponse(
        question,
        userAnswer,
        userExplanation
      );

      console.log(`✅ Received AI evaluation:`, aiEvaluation);

      // Calculate weighted total score
      const accuracyScore = aiEvaluation.accuracy_score || 0;
      const explanationScore = aiEvaluation.explanation_score || 0;
      const reasoningScore = aiEvaluation.reasoning_score || 0;

      console.log(`🧮 Calculating weighted scores:`);
      console.log(`- Accuracy: ${accuracyScore} × ${SCORING_CRITERIA.ACCURACY_WEIGHT} = ${accuracyScore * SCORING_CRITERIA.ACCURACY_WEIGHT}`);
      console.log(`- Explanation: ${explanationScore} × ${SCORING_CRITERIA.EXPLANATION_QUALITY_WEIGHT} = ${explanationScore * SCORING_CRITERIA.EXPLANATION_QUALITY_WEIGHT}`);
      console.log(`- Reasoning: ${reasoningScore} × ${SCORING_CRITERIA.REASONING_CLARITY_WEIGHT} = ${reasoningScore * SCORING_CRITERIA.REASONING_CLARITY_WEIGHT}`);

      const totalScore = (
        accuracyScore * SCORING_CRITERIA.ACCURACY_WEIGHT +
        explanationScore * SCORING_CRITERIA.EXPLANATION_QUALITY_WEIGHT +
        reasoningScore * SCORING_CRITERIA.REASONING_CLARITY_WEIGHT
      );

      console.log(`📊 Total weighted score: ${totalScore}`);

      const evaluationResult = {
        question_id: question.id,
        question_category: question.category,
        question_difficulty: question.difficulty,
        user_answer: userAnswer,
        user_explanation: userExplanation,
        correct_answer: question.correct_answer,
        is_correct: userAnswer === question.correct_answer,
        accuracy_score: accuracyScore,
        explanation_score: explanationScore,
        reasoning_score: reasoningScore,
        total_score: Math.round(totalScore * 100) / 100,
        max_score: SCORING_CRITERIA.MAX_SCORE_PER_QUESTION,
        ai_feedback: aiEvaluation.feedback || 'No feedback available',
        suggestions: aiEvaluation.suggestions || 'Keep practicing to improve',
        evaluated_at: new Date().toISOString()
      };

      console.log(`✅ Final evaluation result:`, evaluationResult);
      return evaluationResult;

    } catch (error) {
      console.error('💥 ScoringService evaluation error:', error);
      console.error('💥 Error stack:', error.stack);

      // For debugging purposes, let's provide a fallback evaluation
      console.log('🔄 Attempting fallback evaluation...');
      try {
        const fallbackEvaluation = this.createFallbackEvaluation(question, userAnswer, userExplanation);
        console.log('✅ Fallback evaluation created:', fallbackEvaluation);
        return fallbackEvaluation;
      } catch (fallbackError) {
        console.error('💥 Fallback evaluation also failed:', fallbackError);
        throw new Error(`Failed to evaluate response for question ${question.id}: ${error.message}`);
      }
    }
  }

  createFallbackEvaluation(question, userAnswer, userExplanation) {
    console.log('🔄 Creating fallback evaluation...');

    const isCorrect = userAnswer === question.correct_answer;
    const hasExplanation = userExplanation && userExplanation.trim().length > 0;
    const explanationLength = userExplanation ? userExplanation.trim().length : 0;

    // Simple scoring logic
    const accuracyScore = isCorrect ? 10 : 0;
    const explanationScore = hasExplanation ? Math.min(8, Math.max(3, explanationLength / 10)) : 0;
    const reasoningScore = hasExplanation ? Math.min(7, Math.max(2, explanationLength / 15)) : 0;

    const totalScore = (
      accuracyScore * SCORING_CRITERIA.ACCURACY_WEIGHT +
      explanationScore * SCORING_CRITERIA.EXPLANATION_QUALITY_WEIGHT +
      reasoningScore * SCORING_CRITERIA.REASONING_CLARITY_WEIGHT
    );

    return {
      question_id: question.id,
      question_category: question.category,
      question_difficulty: question.difficulty,
      user_answer: userAnswer,
      user_explanation: userExplanation,
      correct_answer: question.correct_answer,
      is_correct: isCorrect,
      accuracy_score: accuracyScore,
      explanation_score: explanationScore,
      reasoning_score: reasoningScore,
      total_score: Math.round(totalScore * 100) / 100,
      max_score: SCORING_CRITERIA.MAX_SCORE_PER_QUESTION,
      ai_feedback: isCorrect
        ? 'Correct answer! ' + (question.explanation || 'Well done.')
        : `Incorrect. The correct answer is ${question.correct_answer}. ${question.explanation || ''}`,
      suggestions: isCorrect
        ? 'Great work! Continue practicing similar questions.'
        : 'Review the topic and practice similar questions to improve understanding.',
      evaluated_at: new Date().toISOString(),
      fallback_used: true
    };
  }

  async generateOverallFeedback(evaluatedResponses, categoryScores, overallPercentage, userContext = null) {
    try {
      const categoryPerformance = Object.entries(categoryScores)
        .map(([category, data]) => `${category}: ${data.percentage.toFixed(1)}%`)
        .join(', ');

      const userInfo = userContext ? `Student: ${userContext.name || 'Student'}` : 'Student Assessment';

      const prompt = `Generate personalized constructive feedback for ${userInfo} who completed a multidisciplinary assessment.

Overall Score: ${overallPercentage.toFixed(1)}%
Category Performance: ${categoryPerformance}
Total Questions: ${evaluatedResponses.length}
Correct Answers: ${evaluatedResponses.filter(r => r.is_correct).length}

Provide encouraging, specific feedback that:
1. Acknowledges their effort and performance${userContext?.name ? ` (address them by name: ${userContext.name})` : ''}
2. Highlights their strongest areas
3. Identifies areas for improvement
4. Gives actionable next steps
5. Connects their performance to real-world applications

Keep the tone positive and motivating while being honest about areas needing work. Make the feedback personal and encouraging.`;

      const messages = [
        {
          role: 'system',
          content: 'You are an encouraging educational mentor providing constructive feedback to help students grow and improve.'
        },
        {
          role: 'user',
          content: prompt
        }
      ];

      const feedback = await this.grokService.makeApiCall(messages, 800);
      return feedback || this.getFallbackOverallFeedback(overallPercentage);
    } catch (error) {
      console.error('Error generating overall feedback:', error);
      return this.getFallbackOverallFeedback(overallPercentage);
    }
  }

  getFallbackOverallFeedback(percentage) {
    if (percentage >= 90) {
      return "Excellent work! You've demonstrated strong knowledge across multiple disciplines. Your explanations show clear reasoning and deep understanding. Continue this level of excellence and consider exploring advanced topics in your strongest areas.";
    } else if (percentage >= 80) {
      return "Great job! You've shown solid understanding across most areas. Your reasoning is generally clear and your answers demonstrate good knowledge. Focus on strengthening the areas where you scored lower and continue practicing explanations.";
    } else if (percentage >= 70) {
      return "Good effort! You've grasped many of the key concepts. There's room for improvement in some areas, but your foundation is solid. Review the topics where you struggled and practice explaining your reasoning more clearly.";
    } else if (percentage >= 60) {
      return "You're making progress! While there are several areas that need attention, you've shown understanding in some key concepts. Focus on building stronger foundations in your weaker areas and practice more problems to improve your confidence.";
    } else {
      return "Keep working hard! This assessment shows areas where you can grow significantly. Don't be discouraged - use this as a learning opportunity. Focus on understanding the fundamental concepts and practice regularly to build your skills.";
    }
  }

  calculateGrade(percentage) {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  identifyStrengths(categoryScores) {
    return Object.entries(categoryScores)
      .filter(([_, data]) => data.percentage >= 80)
      .map(([category, data]) => ({
        category,
        percentage: data.percentage,
        description: `Strong performance in ${category} (${data.percentage.toFixed(1)}%)`
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }

  identifyImprovementAreas(categoryScores) {
    return Object.entries(categoryScores)
      .filter(([_, data]) => data.percentage < 70)
      .map(([category, data]) => ({
        category,
        percentage: data.percentage,
        description: `Needs improvement in ${category} (${data.percentage.toFixed(1)}%)`,
        suggestion: this.getCategoryImprovementSuggestion(category)
      }))
      .sort((a, b) => a.percentage - b.percentage);
  }

  getCategoryImprovementSuggestion(category) {
    const suggestions = {
      [ASSIGNMENT_CATEGORIES.CODING]: 'Practice more programming problems and focus on algorithm understanding',
      [ASSIGNMENT_CATEGORIES.LOGIC]: 'Work on logical reasoning puzzles and pattern recognition exercises',
      [ASSIGNMENT_CATEGORIES.MATHEMATICS]: 'Review fundamental concepts and practice problem-solving techniques',
      [ASSIGNMENT_CATEGORIES.LANGUAGE]: 'Read more diverse texts and practice writing clear explanations',
      [ASSIGNMENT_CATEGORIES.CULTURE]: 'Explore different cultures and their contributions to human knowledge',
      [ASSIGNMENT_CATEGORIES.VEDIC_KNOWLEDGE]: 'Study ancient texts and their modern applications',
      [ASSIGNMENT_CATEGORIES.CURRENT_AFFAIRS]: 'Stay updated with recent news and global developments'
    };

    return suggestions[category] || 'Focus on understanding core concepts and practice regularly';
  }
}

export const scoringService = new ScoringService();
export default scoringService;
