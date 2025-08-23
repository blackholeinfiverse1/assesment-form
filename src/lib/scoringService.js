// Field-based scoring service for assignment evaluation (replaces AI evaluation)

import { ASSIGNMENT_CATEGORIES, SCORING_CRITERIA } from '../data/assignment.js';
import { fieldBasedQuestionService } from './fieldBasedQuestionService.js';
import { grokService } from './grokService.js';

class ScoringService {
  constructor() {
    this.fieldBasedQuestionService = fieldBasedQuestionService;
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
      // Direct evaluation using predefined correct answers (no AI needed)
      console.log(`✅ Evaluating using hardcoded correct answer...`);
      
      const isCorrect = userAnswer === question.correct_answer;
      const hasExplanation = userExplanation && userExplanation.trim().length > 0;
      const explanationLength = userExplanation ? userExplanation.trim().length : 0;
      
      // Enhanced scoring logic for hardcoded questions
      let accuracyScore = 0;
      let explanationScore = 0;
      let reasoningScore = 0;
      
      // Accuracy scoring (0-10)
      if (isCorrect) {
        accuracyScore = 10;
      } else {
        // Partial credit for multiple choice questions based on option analysis
        accuracyScore = 0;
      }
      
      // Explanation quality scoring (0-10)
      if (hasExplanation) {
        // Base score for providing an explanation
        explanationScore = 3;
        
        // Additional points based on explanation length and content
        if (explanationLength >= 20) explanationScore += 2;
        if (explanationLength >= 50) explanationScore += 2;
        if (explanationLength >= 100) explanationScore += 2;
        
        // Bonus for keyword matching (simple heuristic)
        const explanation = userExplanation.toLowerCase();
        const questionText = question.question_text.toLowerCase();
        const correctAnswer = question.correct_answer.toLowerCase();
        
        // Check for relevant keywords
        const relevantKeywords = this.extractKeywords(questionText + ' ' + correctAnswer);
        const matchedKeywords = relevantKeywords.filter(keyword => 
          explanation.includes(keyword.toLowerCase())
        ).length;
        
        if (matchedKeywords > 0) explanationScore += Math.min(1, matchedKeywords * 0.5);
        
        explanationScore = Math.min(10, explanationScore);
      }
      
      // Reasoning clarity scoring (0-10)
      if (hasExplanation) {
        reasoningScore = 2; // Base score for attempting reasoning
        
        // Points for structured thinking indicators
        const explanation = userExplanation.toLowerCase();
        const reasoningIndicators = [
          'because', 'therefore', 'since', 'due to', 'as a result',
          'first', 'second', 'finally', 'however', 'moreover',
          'for example', 'such as', 'in conclusion'
        ];
        
        const indicatorCount = reasoningIndicators.filter(indicator => 
          explanation.includes(indicator)
        ).length;
        
        reasoningScore += Math.min(4, indicatorCount * 1);
        
        // Bonus for correct reasoning even if answer is wrong
        if (!isCorrect && explanation.includes(question.explanation.toLowerCase().substring(0, 20))) {
          reasoningScore += 2;
        }
        
        // Bonus for correct answer with good reasoning
        if (isCorrect && explanationLength > 30) {
          reasoningScore += 2;
        }
        
        reasoningScore = Math.min(10, reasoningScore);
      }
      
      console.log(`🧮 Calculated scores:`);
      console.log(`- Accuracy: ${accuracyScore}/10`);
      console.log(`- Explanation: ${explanationScore}/10`);
      console.log(`- Reasoning: ${reasoningScore}/10`);

      // Calculate weighted total score
      const totalScore = (
        accuracyScore * SCORING_CRITERIA.ACCURACY_WEIGHT +
        explanationScore * SCORING_CRITERIA.EXPLANATION_QUALITY_WEIGHT +
        reasoningScore * SCORING_CRITERIA.REASONING_CLARITY_WEIGHT
      );

      console.log(`📊 Total weighted score: ${totalScore}`);

      // Generate feedback based on performance
      const feedback = this.generateFeedback(isCorrect, explanationScore, reasoningScore, question);
      const suggestions = this.generateSuggestions(isCorrect, explanationScore, reasoningScore, question);

      const evaluationResult = {
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
        ai_feedback: feedback,
        suggestions: suggestions,
        evaluated_at: new Date().toISOString()
      };

      console.log(`✅ Final evaluation result:`, evaluationResult);
      
      // Update question usage statistics
      try {
        await this.fieldBasedQuestionService.updateQuestionStats(
          question.id, 
          isCorrect, 
          180 // default time, could be passed as parameter
        );
      } catch (statsError) {
        console.warn('Could not update question statistics:', statsError);
      }
      
      return evaluationResult;

    } catch (error) {
      console.error('💥 ScoringService evaluation error:', error);
      throw new Error(`Failed to evaluate response for question ${question.id}: ${error.message}`);
    }
  }

  extractKeywords(text) {
    // Simple keyword extraction for scoring
    const commonWords = ['the', 'is', 'at', 'which', 'on', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'as', 'by'];
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word));
    
    return [...new Set(words)]; // Remove duplicates
  }

  generateFeedback(isCorrect, explanationScore, reasoningScore) {
    if (isCorrect) {
      if (explanationScore >= 7 && reasoningScore >= 7) {
        return "Excellent work! You got the correct answer and provided a well-reasoned explanation.";
      } else if (explanationScore >= 5) {
        return "Good job on getting the correct answer! Consider providing more detailed reasoning to strengthen your response.";
      } else {
        return "Correct answer, but try to explain your thinking process to demonstrate understanding.";
      }
    } else {
      if (explanationScore >= 5) {
        return "While your answer was incorrect, you showed good effort in explaining your reasoning. Review the correct answer and explanation to understand where to improve.";
      } else {
        return "The answer was incorrect. Review the explanation to understand the correct reasoning and try to provide more detailed explanations in future responses.";
      }
    }
  }

  generateSuggestions(isCorrect, explanationScore, reasoningScore, question) {
    const suggestions = [];
    
    if (!isCorrect) {
      suggestions.push("Review the correct answer and explanation carefully.");
      suggestions.push(`Focus on understanding ${question.category} concepts better.`);
    }
    
    if (explanationScore < 5) {
      suggestions.push("Provide more detailed explanations for your answers.");
      suggestions.push("Try to explain your thought process step by step.");
    }
    
    if (reasoningScore < 5) {
      suggestions.push("Use logical connectors like 'because', 'therefore', 'since' to show your reasoning.");
      suggestions.push("Break down complex problems into smaller steps.");
    }
    
    if (question.vedic_connection) {
      suggestions.push("Explore the Vedic connections to deepen your understanding.");
    }
    
    if (question.modern_application) {
      suggestions.push("Consider how this knowledge applies in modern contexts.");
    }
    
    return suggestions.length > 0 ? suggestions.join(' ') : 'Keep practicing to improve your skills!';
  }

  async generateOverallFeedback(evaluatedResponses, categoryScores, overallPercentage, userContext = null) {
    try {
      console.log('🎯 Attempting to generate AI-powered overall feedback...');
      
      // Try to use Grok AI for personalized feedback
      const grokFeedback = await this.grokService.generateOverallFeedback(
        evaluatedResponses,
        categoryScores,
        overallPercentage,
        userContext
      );
      
      console.log('✅ Successfully generated AI feedback:', grokFeedback);
      return grokFeedback;
      
    } catch (error) {
      console.error('❌ Failed to generate AI feedback, using fallback:', error);
      
      // Fallback to rule-based approach if Grok fails
      const totalQuestions = evaluatedResponses.length;
      const correctAnswers = evaluatedResponses.filter(r => r.is_correct).length;
      const accuracyRate = (correctAnswers / totalQuestions) * 100;
      
      // Analyze category performance
      const strongCategories = Object.entries(categoryScores)
        .filter(([, data]) => data.percentage >= 80)
        .map(([category]) => category);
      
      const weakCategories = Object.entries(categoryScores)
        .filter(([, data]) => data.percentage < 60)
        .map(([category]) => category);
      
      const userName = userContext?.name || 'Student';
      
      let feedback = `Hello ${userName}! `;
      
      // Performance overview
      if (overallPercentage >= 90) {
        feedback += "Outstanding performance! You've demonstrated excellent knowledge across multiple disciplines. ";
      } else if (overallPercentage >= 80) {
        feedback += "Great work! You've shown strong understanding in most areas. ";
      } else if (overallPercentage >= 70) {
        feedback += "Good effort! You've grasped many important concepts. ";
      } else if (overallPercentage >= 60) {
        feedback += "You're making progress! There are areas where you can improve. ";
      } else {
        feedback += "Keep working hard! This assessment shows opportunities for growth. ";
      }
      
      // Highlight strengths
      if (strongCategories.length > 0) {
        feedback += `You performed particularly well in ${strongCategories.join(', ')}. `;
      }
      
      // Address improvement areas
      if (weakCategories.length > 0) {
        feedback += `Focus on strengthening your knowledge in ${weakCategories.join(', ')}. `;
      }
      
      // Explanation quality feedback
      const avgExplanationScore = evaluatedResponses.reduce((sum, r) => sum + r.explanation_score, 0) / totalQuestions;
      if (avgExplanationScore < 5) {
        feedback += "Try to provide more detailed explanations for your answers to demonstrate your thinking process. ";
      } else if (avgExplanationScore >= 7) {
        feedback += "Your explanations show good reasoning skills! ";
      }
      
      // Motivational conclusion
      if (overallPercentage >= 80) {
        feedback += "Continue this excellent work and consider exploring advanced topics in your strongest areas.";
      } else {
        feedback += "Use this assessment as a learning opportunity and practice regularly to build your skills.";
      }
      
      console.log('🔄 Using fallback feedback:', feedback);
      return feedback;
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
      .filter(([, data]) => data.percentage >= 80)
      .map(([category, data]) => ({
        category,
        percentage: data.percentage,
        description: `Strong performance in ${category} (${data.percentage.toFixed(1)}%)`
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }

  identifyImprovementAreas(categoryScores) {
    return Object.entries(categoryScores)
      .filter(([, data]) => data.percentage < 70)
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
