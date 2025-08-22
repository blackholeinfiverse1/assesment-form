// Field-based question service to replace AI generation

import { ASSIGNMENT_CATEGORIES, ASSIGNMENT_CONFIG, DIFFICULTY_LEVELS } from '../data/assignment.js';
import { QUESTION_BANKS, getQuestionsByCategoryAndDifficulty } from '../data/questionBanks.js';
import { STUDY_FIELDS, getQuestionWeightsForField, getDifficultyDistributionForField, detectStudyFieldFromBackground } from '../data/studyFields.js';
import { supabase } from './supabaseClient.js';

class FieldBasedQuestionService {
  constructor() {
    this.usedQuestions = new Set();
  }

  /**
   * Generate questions based on student's study field
   * @param {Object} studentData - Student's background information
   * @param {number} totalQuestions - Total number of questions to generate
   * @returns {Promise<Array>} Array of questions
   */
  async generateQuestionsForStudent(studentData, totalQuestions = ASSIGNMENT_CONFIG.TOTAL_QUESTIONS) {
    try {
      // Detect student's study field
      const studyField = detectStudyFieldFromBackground(studentData);
      console.log(`🎯 Detected study field: ${studyField} for student`, studentData);

      // Get question weights for the field
      const questionWeights = getQuestionWeightsForField(studyField);
      const difficultyDistribution = getDifficultyDistributionForField(studyField);

      console.log(`📊 Question weights for ${studyField}:`, questionWeights);
      console.log(`📈 Difficulty distribution:`, difficultyDistribution);

      // Calculate question distribution
      const questionDistribution = this.calculateQuestionDistribution(
        questionWeights,
        difficultyDistribution,
        totalQuestions
      );

      console.log(`📋 Question distribution:`, questionDistribution);

      // Generate questions based on distribution
      const questions = await this.generateQuestionsFromDistribution(questionDistribution);

      console.log(`✅ Generated ${questions.length} questions for field ${studyField}`);
      return questions;

    } catch (error) {
      console.error('❌ Error generating field-based questions:', error);
      throw new Error(`Failed to generate questions: ${error.message}`);
    }
  }

  /**
   * Calculate question distribution based on weights and difficulty
   */
  calculateQuestionDistribution(questionWeights, difficultyDistribution, totalQuestions) {
    const distribution = {};

    // Calculate questions per category based on weights
    Object.entries(questionWeights).forEach(([category, weight]) => {
      const questionsForCategory = Math.round((weight / 100) * totalQuestions);
      if (questionsForCategory > 0) {
        distribution[category] = {
          total: questionsForCategory,
          difficulties: {}
        };

        // Distribute across difficulties
        Object.entries(difficultyDistribution).forEach(([difficulty, diffWeight]) => {
          const questionsForDifficulty = Math.round((diffWeight / 100) * questionsForCategory);
          if (questionsForDifficulty > 0) {
            distribution[category].difficulties[difficulty] = questionsForDifficulty;
          }
        });
      }
    });

    // Ensure we have exactly the right number of questions
    this.adjustDistributionToTotal(distribution, totalQuestions);

    return distribution;
  }

  /**
   * Adjust distribution to match exact total
   */
  adjustDistributionToTotal(distribution, totalQuestions) {
    let currentTotal = 0;
    
    // Count current total
    Object.values(distribution).forEach(categoryDist => {
      Object.values(categoryDist.difficulties).forEach(count => {
        currentTotal += count;
      });
    });

    // Adjust if needed
    const difference = totalQuestions - currentTotal;
    if (difference !== 0) {
      // Find the category with the highest weight to adjust
      const categories = Object.keys(distribution);
      if (categories.length > 0) {
        const mainCategory = categories[0]; // Assume first category has highest weight
        const difficulties = Object.keys(distribution[mainCategory].difficulties);
        if (difficulties.length > 0) {
          const mainDifficulty = difficulties[0];
          distribution[mainCategory].difficulties[mainDifficulty] += difference;
          
          // Ensure no negative values
          if (distribution[mainCategory].difficulties[mainDifficulty] < 0) {
            distribution[mainCategory].difficulties[mainDifficulty] = 1;
          }
        }
      }
    }
  }

  /**
   * Generate questions from calculated distribution
   */
  async generateQuestionsFromDistribution(distribution) {
    const questions = [];
    this.usedQuestions.clear();

    for (const [category, categoryDist] of Object.entries(distribution)) {
      for (const [difficulty, count] of Object.entries(categoryDist.difficulties)) {
        if (count > 0) {
          const categoryQuestions = await this.getQuestionsForCategoryAndDifficulty(
            category,
            difficulty,
            count
          );
          questions.push(...categoryQuestions);
        }
      }
    }

    // Shuffle questions to randomize order
    return this.shuffleArray(questions);
  }

  /**
   * Get questions for specific category and difficulty
   */
  async getQuestionsForCategoryAndDifficulty(category, difficulty, count) {
    const availableQuestions = getQuestionsByCategoryAndDifficulty(category, difficulty);
    
    if (availableQuestions.length === 0) {
      console.warn(`⚠️ No questions available for ${category} - ${difficulty}`);
      return [];
    }

    // Filter out already used questions
    const unusedQuestions = availableQuestions.filter(q => !this.usedQuestions.has(q.id));
    
    if (unusedQuestions.length === 0) {
      console.warn(`⚠️ All questions for ${category} - ${difficulty} have been used`);
      // If all questions used, reset and use available questions
      return this.selectRandomQuestions(availableQuestions, count);
    }

    const selectedQuestions = this.selectRandomQuestions(unusedQuestions, count);
    
    // Mark questions as used
    selectedQuestions.forEach(q => this.usedQuestions.add(q.id));

    // Add metadata
    return selectedQuestions.map(question => ({
      ...question,
      category,
      difficulty,
      type: 'multiple_choice',
      points: 10,
      time_limit_seconds: 180
    }));
  }

  /**
   * Select random questions from array
   */
  selectRandomQuestions(questions, count) {
    const shuffled = this.shuffleArray([...questions]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Get questions from database (for admin-managed questions)
   */
  async getQuestionsFromDatabase(category, difficulty, count) {
    try {
      const { data, error } = await supabase
        .from('question_banks')
        .select('*')
        .eq('category', category)
        .eq('difficulty', difficulty)
        .eq('is_active', true)
        .limit(count * 2); // Get more than needed for randomization

      if (error) {
        console.error('Error fetching questions from database:', error);
        return [];
      }

      return this.selectRandomQuestions(data || [], count);
    } catch (error) {
      console.error('Database query error:', error);
      return [];
    }
  }

  /**
   * Update question usage statistics
   */
  async updateQuestionStats(questionId, isCorrect, timeSeconds) {
    try {
      const { error } = await supabase.rpc('update_question_usage_stats', {
        p_question_id: questionId,
        p_is_correct: isCorrect,
        p_time_seconds: timeSeconds
      });

      if (error) {
        console.error('Error updating question stats:', error);
      }
    } catch (error) {
      console.error('Error updating question statistics:', error);
    }
  }

  /**
   * Get available categories and their question counts
   */
  async getQuestionBankSummary() {
    const summary = {};
    
    Object.entries(QUESTION_BANKS).forEach(([category, difficulties]) => {
      summary[category] = {};
      Object.entries(difficulties).forEach(([difficulty, questions]) => {
        summary[category][difficulty] = questions.length;
      });
    });

    return summary;
  }

  /**
   * Search questions by text
   */
  searchQuestions(searchTerm) {
    const results = [];
    
    Object.entries(QUESTION_BANKS).forEach(([category, difficulties]) => {
      Object.entries(difficulties).forEach(([difficulty, questions]) => {
        questions.forEach(question => {
          if (
            question.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            question.explanation.toLowerCase().includes(searchTerm.toLowerCase())
          ) {
            results.push({
              ...question,
              category,
              difficulty
            });
          }
        });
      });
    });

    return results;
  }

  /**
   * Validate question format
   */
  validateQuestion(question) {
    const required = ['question_text', 'options', 'correct_answer', 'explanation'];
    const missing = required.filter(field => !question[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    if (!Array.isArray(question.options) || question.options.length !== 4) {
      throw new Error('Questions must have exactly 4 options');
    }

    if (!question.options.includes(question.correct_answer)) {
      throw new Error('Correct answer must be one of the provided options');
    }

    return true;
  }
}

// Export singleton instance
export const fieldBasedQuestionService = new FieldBasedQuestionService();
export default fieldBasedQuestionService;