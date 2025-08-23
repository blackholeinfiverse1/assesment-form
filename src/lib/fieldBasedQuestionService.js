// Field-based question service to replace AI generation

import { ASSIGNMENT_CONFIG, DIFFICULTY_LEVELS } from '../data/assignment.js';
import { QUESTION_BANKS, getQuestionsByCategoryAndDifficulty } from '../data/questionBanks.js';
import { STUDY_FIELDS, getQuestionWeightsForField, getDifficultyDistributionForField, detectStudyFieldFromBackground } from '../data/studyFields.js';
import { supabase } from './supabaseClient.js';
import { grokService } from './grokService.js';
import { DynamicQuestionCategoryService } from './dynamicQuestionCategoryService.js';
import { aiSettingsService } from './aiSettingsService.js';

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

      // Get weights and difficulty distribution for the field
      const questionWeights = getQuestionWeightsForField(studyField);
      const difficultyDistribution = getDifficultyDistributionForField(studyField);

      console.log(`📊 Question weights for ${studyField}:`, questionWeights);
      console.log(`📈 Difficulty distribution:`, difficultyDistribution);

      // Primary category = highest weighted category for the field
      const [primaryCategory] = Object.entries(questionWeights)
        .sort((a, b) => b[1] - a[1])[0];

      // Decide high-priority admin question count: 5 for <=10 total, else up to 10
      const highPriorityCount = totalQuestions <= 10
        ? Math.min(5, totalQuestions)
        : Math.min(10, totalQuestions);

      // Helper for splitting counts by difficulty according to distribution
      const splitByDifficulty = (count) => {
        const entries = [
          [DIFFICULTY_LEVELS.EASY, difficultyDistribution.easy || 0],
          [DIFFICULTY_LEVELS.MEDIUM, difficultyDistribution.medium || 0],
          [DIFFICULTY_LEVELS.HARD, difficultyDistribution.hard || 0]
        ];
        const totals = entries.map(([, weight]) => weight);
        const weightSum = totals.reduce((a, b) => a + b, 0) || 1;
        let allocated = 0;
        const result = {};
        entries.forEach(([diff, weight], idx) => {
          let n = Math.round((weight / weightSum) * count);
          // Ensure at least 1 for the predominant difficulty when count is small
          if (count > 0 && n === 0 && idx === 1 /* medium */) n = 1;
          result[diff] = n;
          allocated += n;
        });
        // Adjust rounding errors
        const diffKeys = Object.keys(result);
        while (allocated > count) {
          for (let k of diffKeys) {
            if (allocated <= count) break;
            if (result[k] > 0) { result[k]--; allocated--; }
          }
        }
        while (allocated < count) {
          // Prefer medium then easy then hard
          for (let k of [DIFFICULTY_LEVELS.MEDIUM, DIFFICULTY_LEVELS.EASY, DIFFICULTY_LEVELS.HARD]) {
            if (allocated >= count) break;
            result[k] = (result[k] || 0) + 1; allocated++;
          }
        }
        return result;
      };

      // 1) Fetch admin-managed questions mapped to the detected field, as highest priority
      const adminCounts = splitByDifficulty(highPriorityCount);
      const adminQuestions = [];

      for (const [difficulty, count] of Object.entries(adminCounts)) {
        if (count <= 0) continue;
        // Prefer field-mapped questions
        let dbQs = await this.getFieldMappedQuestionsFromDatabase(studyField, primaryCategory, difficulty, count);
        // If not enough, fallback to category-only admin questions
        if (dbQs.length < count) {
          const topUp = await this.getQuestionsFromDatabase(primaryCategory, difficulty, count - dbQs.length);
          dbQs = dbQs.concat(topUp);
        }
        // Map to expected structure with metadata
        dbQs.forEach(q => adminQuestions.push({
          ...q,
          category: primaryCategory,
          difficulty,
          type: 'multiple_choice',
          points: q.points ?? 10,
          time_limit_seconds: q.time_limit_seconds ?? 180
        }));
      }

      // Check if AI question generation is enabled globally
      const isAIEnabled = await aiSettingsService.isAIEnabled();
      console.log(`🤖 AI question generation is ${isAIEnabled ? 'enabled' : 'disabled'} globally`);

      // 2) Generate remaining with AI only if enabled, otherwise use admin questions
      const remainingCount = Math.max(0, totalQuestions - adminQuestions.length);
      const aiQuestions = [];

      if (isAIEnabled && remainingCount > 0) {
        // Build Set of normalized question texts to prevent duplicates
        const normalizeText = (t) => (t || '')
          .toLowerCase()
          .replace(/[^\w\s]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        const usedQuestionTexts = new Set(adminQuestions.map(q => normalizeText(q.question_text)));

        const aiCounts = splitByDifficulty(remainingCount);

        for (const [difficulty, count] of Object.entries(aiCounts)) {
          if (count <= 0) continue;
          try {
            const aiQs = await grokService.generateUniqueQuestions(
              primaryCategory,
              difficulty,
              count,
              usedQuestionTexts
            );
            // Persist AI-generated questions for admin visibility and future reuse
            await this.storeGeneratedQuestions(aiQs, studyField, primaryCategory, difficulty);

            aiQs.forEach(q => usedQuestionTexts.add(normalizeText(q.question_text)));
            aiQuestions.push(...aiQs);
          } catch (e) {
            console.warn(`⚠️ Grok generation failed for ${primaryCategory} - ${difficulty}: ${e.message}. Falling back to curated bank.`);
            // Fallback to curated question bank if AI fails
            const fallback = await this.getQuestionsForCategoryAndDifficulty(primaryCategory, difficulty, count);
            fallback.forEach(q => usedQuestionTexts.add(normalizeText(q.question_text)));
            aiQuestions.push(...fallback);
          }
        }
      } else if (remainingCount > 0) {
        // AI is disabled, fill remaining with admin questions
        console.log(`🤖 AI disabled, filling remaining ${remainingCount} questions with admin questions`);
        const normalizeText = (t) => (t || '')
          .toLowerCase()
          .replace(/[^\w\s]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        const usedQuestionTexts = new Set(adminQuestions.map(q => normalizeText(q.question_text)));
        
        const remainingAdminCounts = splitByDifficulty(remainingCount);
        
        for (const [difficulty, count] of Object.entries(remainingAdminCounts)) {
          if (count <= 0) continue;
          try {
            const adminQs = await this.getQuestionsForCategoryAndDifficulty(primaryCategory, difficulty, count);
            // Filter out duplicates
            const uniqueAdminQs = adminQs.filter(q => {
              const normalizedText = normalizeText(q.question_text);
              if (usedQuestionTexts.has(normalizedText)) {
                return false;
              }
              usedQuestionTexts.add(normalizedText);
              return true;
            });
            
            // Map to expected structure with metadata
            uniqueAdminQs.forEach(q => aiQuestions.push({
              ...q,
              category: primaryCategory,
              difficulty,
              type: 'multiple_choice',
              points: q.points ?? 10,
              time_limit_seconds: q.time_limit_seconds ?? 180
            }));
          } catch (e) {
            console.warn(`⚠️ Failed to fetch admin questions for ${primaryCategory} - ${difficulty}: ${e.message}`);
          }
        }
      }

      // Combine: admin high-priority first, then AI-generated or additional admin
      let combined = [...adminQuestions, ...aiQuestions];

      // Top-up if still short using curated bank from the same primary category
      if (combined.length < totalQuestions) {
        const _needed = totalQuestions - combined.length;
        const usedTexts = new Set(combined.map(q => (q.question_text || '').toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim()));
        // Fill order preference: medium -> easy -> hard
        const fillOrder = [DIFFICULTY_LEVELS.MEDIUM, DIFFICULTY_LEVELS.EASY, DIFFICULTY_LEVELS.HARD];
        for (const diff of fillOrder) {
          if (combined.length >= totalQuestions) break;
          const remaining = totalQuestions - combined.length;
          const bank = getQuestionsByCategoryAndDifficulty(primaryCategory, diff);
          const candidates = bank.filter(q => !usedTexts.has((q.question_text || '').toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim()));
          const picked = this.selectRandomQuestions(candidates.length ? candidates : bank, remaining).map(q => ({
            ...q,
            category: primaryCategory,
            difficulty: diff,
            type: 'multiple_choice',
            points: q.points ?? 10,
            time_limit_seconds: q.time_limit_seconds ?? 180
          }));
          picked.forEach(p => usedTexts.add((p.question_text || '').toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim()));
          combined = combined.concat(picked);
        }
      }

      combined = combined.slice(0, totalQuestions);

      console.log(`✅ Generated blended set: ${combined.length} questions (admin: ${adminQuestions.length}, ai: ${aiQuestions.length}) for field ${studyField} [primary: ${primaryCategory}]`);
      return combined;

    } catch (error) {
      console.error('❌ Error generating field-based questions:', error);
      // Fallback to previous distribution-based method
      try {
        const questionWeights = getQuestionWeightsForField(detectStudyFieldFromBackground(studentData));
        const difficultyDistribution = getDifficultyDistributionForField(detectStudyFieldFromBackground(studentData));
        const questionDistribution = this.calculateQuestionDistribution(
          questionWeights,
          difficultyDistribution,
          totalQuestions
        );
        const questions = await this.generateQuestionsFromDistribution(questionDistribution);
        console.warn('↩️ Falling back to distribution-based questions.');
        return questions;
      } catch {
        throw new Error(`Failed to generate questions: ${error.message}`);
      }
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
      console.log(`🔍 Fetching general questions: category=${category}, difficulty=${difficulty}, count=${count}`);
      
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

      console.log(`✅ Successfully fetched ${data?.length || 0} general questions from database`);
      return this.selectRandomQuestions(data || [], count);
    } catch (error) {
      console.error('Database query error:', error);
      return [];
    }
  }

  /**
   * Get questions mapped to a study field via question_field_mapping
   */
  async getFieldMappedQuestionsFromDatabase(fieldId, category, difficulty, count) {
    try {
      console.log(`🔍 Fetching field-mapped questions for field: ${fieldId}, category: ${category}, difficulty: ${difficulty}, count: ${count}`);
      
      // 1) Find question_ids mapped to the field
      const { data: mappings, error: mapErr } = await supabase
        .from('question_field_mapping')
        .select('question_id')
        .eq('field_id', fieldId);

      if (mapErr) {
        console.warn('Mapping fetch error:', mapErr);
        return [];
      }

      console.log(`📋 Found ${mappings?.length || 0} question mappings for field ${fieldId}`);
      
      const ids = (mappings || []).map(m => m.question_id);
      if (!ids.length) {
        console.log(`❌ No questions mapped to field ${fieldId}`);
        return [];
      }

      console.log(`🎯 Looking for questions with IDs:`, ids.slice(0, 5), ids.length > 5 ? `...and ${ids.length - 5} more` : '');

      // 2) Pull questions by ids with filters
      const { data, error } = await supabase
        .from('question_banks')
        .select('*')
        .in('question_id', ids)
        .eq('category', category)
        .eq('difficulty', difficulty)
        .eq('is_active', true)
        .limit(count * 2);

      if (error) {
        console.error('Error fetching mapped questions:', error);
        return [];
      }

      console.log(`✅ Successfully fetched ${data?.length || 0} field-mapped questions for ${fieldId}`);
      return this.selectRandomQuestions(data || [], count);
    } catch (error) {
      console.error('Database query error (mapped):', error);
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

  // Persist AI-generated questions into Supabase and map them to a study field for admin visibility
  async storeGeneratedQuestions(generatedQuestions, fieldId, category, difficulty) {
    try {
      if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) return;

      // Prepare upsert payload for question_banks
      const nowIso = new Date().toISOString();
      const payload = generatedQuestions.map((q) => {
        // Derive a deterministic question_id from text + category + difficulty
        const base = `${(q.question_text || '').toLowerCase()}|${category}|${difficulty}`;
        let hash = 0;
        for (let i = 0; i < base.length; i++) {
          hash = ((hash << 5) - hash) + base.charCodeAt(i);
          hash |= 0;
        }
        const question_id = `AI_${category}_${difficulty}_${Math.abs(hash)}`;
        return {
          question_id,
          category,
          difficulty,
          question_text: q.question_text,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation || '',
          vedic_connection: q.vedic_connection || '',
          modern_application: q.modern_application || '',
          tags: ['ai_generated'],
          is_active: true,
          created_by: 'ai',
          created_at: nowIso,
          updated_at: nowIso
        };
      });

      // Upsert into question_banks
      const { error } = await supabase
        .from('question_banks')
        .upsert(payload, { onConflict: 'question_id' });

      if (error) {
        console.warn('Failed to upsert AI-generated questions:', error);
      } else {
        // Map questions to field if provided
        if (fieldId) {
          const mappings = payload.map(p => ({
            question_id: p.question_id,
            field_id: fieldId,
            weight: 1,
            is_primary: true
          }));
          
          // Try upsert first, fallback to individual inserts if constraint doesn't exist
          const { error: mapErr } = await supabase
            .from('question_field_mapping')
            .upsert(mappings, { onConflict: 'question_id,field_id' });

          if (mapErr && mapErr.code === '42P10') {
            // Constraint doesn't exist, try individual inserts with conflict handling
            console.log('Unique constraint not found, trying individual inserts...');
            for (const mapping of mappings) {
              try {
                // Check if mapping already exists
                const { data: existing } = await supabase
                  .from('question_field_mapping')
                  .select('id')
                  .eq('question_id', mapping.question_id)
                  .eq('field_id', mapping.field_id)
                  .single();

                if (!existing) {
                  // Insert only if it doesn't exist
                  const { error: insertErr } = await supabase
                    .from('question_field_mapping')
                    .insert([mapping]);
                  
                  if (insertErr) {
                    console.warn('Failed to insert question field mapping:', insertErr);
                  }
                }
              } catch (err) {
                console.warn('Error handling question field mapping:', err);
              }
            }
          } else if (mapErr) {
            console.warn('Failed to upsert AI question field mappings:', mapErr);
          }
        }
      }
    } catch (err) {
      console.warn('Error storing AI-generated questions:', err);
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