import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Brain, Calculator, Code, Globe, Newspaper, Scroll, Plus, Edit2, Trash2, Search, Users, Tag, Filter, Settings, Info, MessageCircle, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { DIFFICULTY_LEVELS } from '../data/assignment.js';
import { supabase } from '../lib/supabaseClient';
import { DynamicQuestionCategoryService } from '../lib/dynamicQuestionCategoryService';

// Icon mapping for question categories (supports dynamic categories)
const DEFAULT_CATEGORY_ICONS = {
  Code,
  Brain,
  Calculator,
  BookOpen,
  Globe,
  Scroll,
  Newspaper,
  MessageCircle,
  HelpCircle
};

// Helper function to get icon component by name
const getIconComponent = (iconName, category) => {
  if (iconName && DEFAULT_CATEGORY_ICONS[iconName]) {
    return DEFAULT_CATEGORY_ICONS[iconName];
  }
  // Fallback to category-based mapping for backward compatibility
  const legacyIcons = {
    'Coding': Code,
    'Logic': Brain,
    'Mathematics': Calculator,
    'Language': MessageCircle,
    'Culture': Globe,
    'Vedic Knowledge': Scroll,
    'Current Affairs': Newspaper
  };
  return legacyIcons[category] || BookOpen;
};

const DIFFICULTY_COLORS = {
  [DIFFICULTY_LEVELS.EASY]: 'text-green-400 bg-green-400/10 border-green-400/20',
  [DIFFICULTY_LEVELS.MEDIUM]: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  [DIFFICULTY_LEVELS.HARD]: 'text-red-400 bg-red-400/10 border-red-400/20'
};

const FIELD_COLORS = [
  'text-blue-400 bg-blue-400/10 border-blue-400/20',
  'text-green-400 bg-green-400/10 border-green-400/20',
  'text-purple-400 bg-purple-400/10 border-purple-400/20',
  'text-red-400 bg-red-400/10 border-red-400/20',
  'text-pink-400 bg-pink-400/10 border-pink-400/20',
  'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
  'text-teal-400 bg-teal-400/10 border-teal-400/20',
  'text-orange-400 bg-orange-400/10 border-orange-400/20',
  'text-cyan-400 bg-cyan-400/10 border-cyan-400/20'
];

const DEFAULT_EMOJIS = ['🔬', '💼', '🏛️', '⚕️', '🎨', '📚', '🌟', '🚀', '💡', '🎯', '🔥', '⭐', '🌈', '🎪', '🎭'];

function QuestionCard({ question, questionFields, studyFields, onEdit, onDelete, onManageFields, aiEnabled, categories }) {
  const IconComponent = getIconComponent(categories?.find(cat => cat.name === question.category)?.icon, question.category);
  const difficultyClass = DIFFICULTY_COLORS[question.difficulty] || DIFFICULTY_COLORS[DIFFICULTY_LEVELS.EASY];
  const isAiQuestion = question.created_by === 'ai';

  return (
    <div 
      className={`rounded-xl border border-white/20 ${isAiQuestion && !aiEnabled ? 'bg-gray-800/30' : 'bg-white/10'} p-4 space-y-4`}
      style={{
        // When AI is disabled and this is an AI question, use a dimmer background
        backgroundColor: isAiQuestion && !aiEnabled ? 'rgba(100, 116, 139, 0.3)' : undefined
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <IconComponent className="h-5 w-5 text-orange-400" />
          <span className="text-sm font-medium text-orange-400">{question.category}</span>
          <span className={`text-xs px-2 py-1 rounded-full border ${difficultyClass}`}>
            {question.difficulty}
          </span>
          {isAiQuestion && (
            <span 
              className={`text-xs px-2 py-1 rounded-full ${aiEnabled ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'}`}
            >
              {aiEnabled ? 'AI Generated' : 'AI Disabled'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onManageFields(question)}
            className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-blue-400"
            title="Manage Fields"
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(question)}
            className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white"
            title="Edit Question"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(question)}
            className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-red-400"
            title="Delete Question"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Field Tags */}
      {questionFields && questionFields.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {questionFields.map(fieldId => {
            const field = studyFields.find(f => f.field_id === fieldId);
            if (!field) return null;
            return (
              <span
                key={fieldId}
                className={`text-xs px-2 py-1 rounded-full border ${field.color}`}
                title={`Assigned to ${field.name} students`}
              >
                {field.icon} {field.name}
              </span>
            );
          })}
        </div>
      )}

      {/* Question Content */}
      <div className="text-sm text-white/80">
        {question.content}
      </div>

      <div className="space-y-3">
        <h4 className="text-white font-medium">{question.question_text}</h4>
        
        <div className="space-y-1">
          {question.options?.map((option, index) => (
            <div
              key={index}
              className={`text-sm p-2 rounded ${
                option === question.correct_answer
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'text-white/70'
              }`}
            >
              {option}
            </div>
          ))}
        </div>

        {question.explanation && (
          <div className="text-sm text-white/60">
            <strong>Explanation:</strong> {question.explanation}
          </div>
        )}

        {question.vedic_connection && (
          <div className="text-sm text-orange-400/80">
            <strong>Vedic Connection:</strong> {question.vedic_connection}
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuestionBankManager() {
  const [questions, setQuestions] = useState([]);
  const [studyFields, setStudyFields] = useState([]);
  const [questionCategories, setQuestionCategories] = useState([]);
  const [questionFieldMappings, setQuestionFieldMappings] = useState({});
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showFieldManager, setShowFieldManager] = useState(false);
  const [managingQuestion, setManagingQuestion] = useState(null);
  const [showFieldSettings, setShowFieldSettings] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [fieldDeleteConfirm, setFieldDeleteConfirm] = useState(null);
  const [stats, setStats] = useState({});
  const [aiEnabled, setAiEnabled] = useState(true); // New state for AI toggle
  const [showTooltip, setShowTooltip] = useState(false); // Tooltip state

  useEffect(() => {
    loadStudyFields();
    loadQuestions();
    loadQuestionFieldMappings();
    loadQuestionCategories();
  }, []);

  useEffect(() => {
    filterQuestions();
    calculateStats();
  }, [questions, questionFieldMappings, studyFields, questionCategories, searchTerm, selectedCategory, selectedDifficulty, selectedField, aiEnabled]); // Added questionCategories to dependency array

  async function loadQuestionCategories() {
    try {
      const categories = await DynamicQuestionCategoryService.getAllCategories();
      setQuestionCategories(categories);
      console.log('Question categories loaded:', categories);
    } catch (error) {
      console.error('Error loading question categories:', error);
      toast.error('Failed to load question categories');
      // Fallback to empty array - the service will handle fallback categories internally
      setQuestionCategories([]);
    }
  }

  async function loadQuestions() {
    setLoading(true);
    try {
      // Get all questions, but filter out AI-generated ones if AI is disabled
      const { data, error } = await supabase
        .from('question_banks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Filter questions based on AI toggle
      const filtered = (data || []).filter(q => {
        // Always show admin-created questions
        if (q.created_by === 'admin') return true;
        // Show AI questions only if AI is enabled
        return aiEnabled || false;
      });
      
      setQuestions(filtered);
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error('Failed to load questions from database');
    } finally {
      setLoading(false);
    }
  }

  function filterQuestions() {
    let filtered = [...(questions || [])];

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      filtered = filtered.filter(q =>
        (q.question_text || '').toLowerCase().includes(s) ||
        (q.explanation || '').toLowerCase().includes(s)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(q => q.category === selectedCategory);
    }

    if (selectedDifficulty) {
      filtered = filtered.filter(q => (q.difficulty || '').toLowerCase() === selectedDifficulty.toLowerCase());
    }

    if (selectedField) {
      filtered = filtered.filter(q => {
        const fields = questionFieldMappings[q.question_id] || [];
        return fields.includes(selectedField);
      });
    }
    
    // Filter out AI-generated questions if AI is disabled
    if (!aiEnabled) {
      filtered = filtered.filter(q => q.created_by === 'admin');
    }

    setFilteredQuestions(filtered);
  }

  async function loadStudyFields() {
    try {
      console.log('Loading study fields...');
      
      // Try different query strategies based on what columns exist
      let data = null;
      let error = null;
      
      // Strategy 1: Try full query
      try {
        const result = await supabase
          .from('study_fields')
          .select(`
            field_id,
            name,
            short_name,
            icon,
            description,
            color,
            is_active,
            subcategories,
            question_weights,
            difficulty_distribution,
            created_at,
            updated_at
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: true });
        
        data = result.data;
        error = result.error;
        
        if (!error) {
          console.log('Full query successful:', data);
        }
      } catch (fullQueryError) {
        console.log('Full query failed, trying minimal query...');
        error = fullQueryError;
      }
      
      // Strategy 2: Try minimal query if full query fails
      if (error) {
        try {
          const result = await supabase
            .from('study_fields')
            .select('*')
            .order('created_at', { ascending: true });
          
          data = result.data;
          error = result.error;
          
          if (!error) {
            console.log('Minimal query successful:', data);
          }
        } catch (minimalError) {
          console.log('Minimal query also failed:', minimalError);
          error = minimalError;
        }
      }
      
      if (error) {
        console.error('All query strategies failed:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      // Add colors to fields and ensure required properties
      const fieldsWithColors = (data || []).map((field, index) => ({
        field_id: field.field_id || field.id,
        name: field.name || 'Unknown Field',
        short_name: field.short_name || field.name || 'Unknown',
        icon: field.icon || '📚',
        description: field.description || '',
        color: field.color || FIELD_COLORS[index % FIELD_COLORS.length],
        is_active: field.is_active !== undefined ? field.is_active : true,
        subcategories: field.subcategories || [],
        question_weights: field.question_weights || {},
        difficulty_distribution: field.difficulty_distribution || {},
        created_at: field.created_at,
        updated_at: field.updated_at
      }));
      
      setStudyFields(fieldsWithColors);
      console.log('Study fields loaded successfully:', fieldsWithColors);
      
    } catch (error) {
      console.error('Error loading study fields:', error);
      console.error('Detailed error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      // Initialize with default fields if table doesn't exist or is empty
      await initializeDefaultFields();
    }
  }

  async function initializeDefaultFields() {
    const defaultFields = [
      { field_id: 'stem', name: 'STEM', icon: '🔬', description: 'Science, Technology, Engineering, and Mathematics', short_name: 'STEM' },
      { field_id: 'business', name: 'Business', icon: '💼', description: 'Business and Economics', short_name: 'Business' },
      { field_id: 'social_sciences', name: 'Social Sciences', icon: '🏛️', description: 'Social Sciences and Humanities', short_name: 'Social Sciences' },
      { field_id: 'health_medicine', name: 'Health & Medicine', icon: '⚕️', description: 'Healthcare and Medical Sciences', short_name: 'Health & Medicine' },
      { field_id: 'creative_arts', name: 'Creative Arts', icon: '🎨', description: 'Arts, Design, and Creative Fields', short_name: 'Creative Arts' }
    ];

    try {
      const fieldsWithColors = defaultFields.map((field, index) => ({
        ...field,
        color: FIELD_COLORS[index],
        is_active: true,
        subcategories: [],
        question_weights: {},
        difficulty_distribution: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      console.log('Attempting to insert default fields:', fieldsWithColors);
      
      const { error } = await supabase
        .from('study_fields')
        .upsert(fieldsWithColors, { onConflict: 'field_id' });

      if (error) {
        console.error('Error initializing default fields:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        // Fallback to local state if database operations fail
        setStudyFields(fieldsWithColors);
      } else {
        console.log('Default fields initialized successfully');
        setStudyFields(fieldsWithColors);
      }
    } catch (error) {
      console.error('Error initializing fields:', error);
      // Fallback to local state
      setStudyFields(defaultFields.map((field, index) => ({
        ...field,
        color: FIELD_COLORS[index]
      })));
    }
  }

  async function loadQuestionFieldMappings() {
    try {
      const { data, error } = await supabase
        .from('question_field_mapping')
        .select('question_id, field_id');
      if (error) throw error;
      
      // Group by question_id
      const mappings = {};
      (data || []).forEach(mapping => {
        if (!mappings[mapping.question_id]) {
          mappings[mapping.question_id] = [];
        }
        mappings[mapping.question_id].push(mapping.field_id);
      });
      setQuestionFieldMappings(mappings);
    } catch (error) {
      console.error('Error loading question field mappings:', error);
    }
  }

  function calculateStats() {
    const newStats = {};
    
    // Initialize stats for dynamic categories
    questionCategories.forEach(category => {
      newStats[category.name] = { total: 0, easy: 0, medium: 0, hard: 0 };
    });
    
    // Add field stats
    studyFields.forEach(field => {
      newStats[`field_${field.field_id}`] = { total: 0, easy: 0, medium: 0, hard: 0 };
    });

    // Calculate stats based on filtered questions (which respect AI toggle)
    (filteredQuestions || []).forEach(q => {
      // Category stats
      if (newStats[q.category]) {
        newStats[q.category].total++;
        const diff = (q.difficulty || '').toLowerCase();
        if (diff === 'easy') newStats[q.category].easy++;
        else if (diff === 'medium') newStats[q.category].medium++;
        else if (diff === 'hard') newStats[q.category].hard++;
      }

      // Field stats - only for active questions
      const fields = questionFieldMappings[q.question_id] || [];
      fields.forEach(fieldId => {
        const key = `field_${fieldId}`;
        if (newStats[key]) {
          newStats[key].total++;
          const diff = (q.difficulty || '').toLowerCase();
          if (diff === 'easy') newStats[key].easy++;
          else if (diff === 'medium') newStats[key].medium++;
          else if (diff === 'hard') newStats[key].hard++;
        }
      });
    });

    setStats(newStats);
  }

  async function saveQuestionFromModal() {
    try {
      const question_text = document.getElementById('qb-question-text')?.value?.trim();
      const category = document.getElementById('qb-category')?.value;
      const difficulty = document.getElementById('qb-difficulty')?.value;
      const optionA = document.getElementById('qb-option-a')?.value?.trim();
      const optionB = document.getElementById('qb-option-b')?.value?.trim();
      const optionC = document.getElementById('qb-option-c')?.value?.trim();
      const optionD = document.getElementById('qb-option-d')?.value?.trim();
      const correctLetter = document.getElementById('qb-correct-answer')?.value;
      const explanation = document.getElementById('qb-explanation')?.value?.trim();
      const vedic_connection = document.getElementById('qb-vedic')?.value?.trim();
      const modern_application = document.getElementById('qb-modern')?.value?.trim();

      // Get selected fields
      const selectedFields = [];
      studyFields.forEach(field => {
        const checkbox = document.getElementById(`qb-field-${field.field_id}`);
        if (checkbox?.checked) {
          selectedFields.push(field.field_id);
        }
      });

      // Basic validation
      if (!question_text) return toast.error('Question text is required');
      if (!category) return toast.error('Category is required');
      if (!difficulty) return toast.error('Difficulty is required');
      const options = [optionA, optionB, optionC, optionD].filter(Boolean);
      if (options.length < 2) return toast.error('Please enter at least two options');
      if (!correctLetter) return toast.error('Please select the correct answer');

      const correctIndex = { A: 0, B: 1, C: 2, D: 3 }[correctLetter] ?? 0;
      const correct_answer = [optionA, optionB, optionC, optionD][correctIndex] || '';
      if (!correct_answer) return toast.error('Correct answer is empty');

      // Generate question_id if creating new question
      const question_id = editingQuestion?.question_id || 
        `${category.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const payload = {
        question_id, // This is required!
        question_text,
        options,
        correct_answer,
        category,
        difficulty,
        explanation: explanation || '',
        vedic_connection: vedic_connection || '',
        modern_application: modern_application || '',
        tags: [],
        is_active: true,
        created_by: 'admin',
        updated_at: new Date().toISOString()
      };

      console.log('Saving question with payload:', payload);

      let questionIdResult = question_id;
      if (editingQuestion && editingQuestion.question_id) {
        // Update existing question
        const updatePayload = { ...payload };
        delete updatePayload.question_id; // Don't update the ID
        
        const { error } = await supabase
          .from('question_banks')
          .update(updatePayload)
          .eq('question_id', editingQuestion.question_id);
        
        if (error) {
          console.error('Update error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }
        questionIdResult = editingQuestion.question_id;
      } else {
        // Insert new question - add created_at for new records
        payload.created_at = new Date().toISOString();
        
        const { data, error } = await supabase
          .from('question_banks')
          .insert([payload])
          .select('question_id')
          .single();
        
        if (error) {
          console.error('Insert error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }
        questionIdResult = data?.question_id || question_id;
      }

      // Update field mappings
      await updateQuestionFieldMappings(questionIdResult, selectedFields);

      toast.success(editingQuestion ? 'Question updated' : 'Question added');
      setShowForm(false);
      setEditingQuestion(null);
      await loadQuestions();
      await loadQuestionFieldMappings();
    } catch (error) {
      console.error('Error saving question:', error);
      
      let errorMessage = 'Failed to save question';
      if (error.message?.includes('duplicate key')) {
        errorMessage = 'A question with this ID already exists';
      } else if (error.message?.includes('null value')) {
        errorMessage = 'Required field is missing - please check all fields';
      } else if (error.message?.includes('violates')) {
        errorMessage = 'Database constraint violation - please check your data';
      } else if (error.message) {
        errorMessage = `Failed to save question: ${error.message}`;
      }
      
      toast.error(errorMessage);
    }
  }

  async function updateQuestionFieldMappings(questionId, fieldIds) {
    try {
      // Delete existing mappings
      await supabase
        .from('question_field_mapping')
        .delete()
        .eq('question_id', questionId);

      // Insert new mappings
      if (fieldIds.length > 0) {
        const mappings = fieldIds.map(fieldId => ({
          question_id: questionId,
          field_id: fieldId,
          weight: 1,
          is_primary: true
        }));

        const { error } = await supabase
          .from('question_field_mapping')
          .insert(mappings);
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating field mappings:', error);
      throw error;
    }
  }

  async function saveFieldFromModal() {
    try {
      const name = document.getElementById('field-name')?.value?.trim();
      const icon = document.getElementById('field-icon')?.value?.trim();
      const description = document.getElementById('field-description')?.value?.trim();

      if (!name) return toast.error('Field name is required');
      if (!icon) return toast.error('Field icon is required');

      const field_id = editingField?.field_id || name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const color = editingField?.color || FIELD_COLORS[studyFields.length % FIELD_COLORS.length];
      const short_name = name; // Use name as short_name

      if (editingField) {
        // Update existing field - try different strategies
        const updatePayload = {
          name,
          icon,
          description: description || null,
          color,
          is_active: true,
          updated_at: new Date().toISOString()
        };
        
        // Add optional fields if they exist in the schema
        try {
          updatePayload.short_name = short_name;
        } catch {
          console.log('short_name column may not exist, skipping');
        }
        
        console.log('Updating field with payload:', updatePayload);
        
        const { error } = await supabase
          .from('study_fields')
          .update(updatePayload)
          .eq('field_id', editingField.field_id);
        
        if (error) {
          console.error('Update error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }
      } else {
        // Insert new field - try comprehensive payload first, then minimal
        let insertPayload = {
          field_id,
          name,
          icon,
          description: description || null,
          color,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Try to add optional fields
        try {
          insertPayload.short_name = short_name;
          insertPayload.subcategories = [];
          insertPayload.question_weights = {};
          insertPayload.difficulty_distribution = {};
        } catch {
          console.log('Some optional columns may not exist');
        }
        
        console.log('Inserting field with payload:', insertPayload);
        
        let { error } = await supabase
          .from('study_fields')
          .insert([insertPayload]);
        
        // If comprehensive insert fails, try minimal payload
        if (error && error.message?.includes('column')) {
          console.log('Comprehensive insert failed, trying minimal payload...');
          
          const minimalPayload = {
            field_id,
            name,
            icon,
            description: description || null,
            color,
            is_active: true
          };
          
          console.log('Trying minimal payload:', minimalPayload);
          
          const result = await supabase
            .from('study_fields')
            .insert([minimalPayload]);
          
          error = result.error;
        }
        
        if (error) {
          console.error('Insert error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }
      }

      toast.success(editingField ? 'Field updated' : 'Field added');
      setShowFieldSettings(false);
      setEditingField(null);
      await loadStudyFields();
    } catch (error) {
      console.error('Error saving field:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      let errorMessage = 'Failed to save field';
      if (error.message?.includes('duplicate key')) {
        errorMessage = 'A field with this name already exists';
      } else if (error.message?.includes('column')) {
        errorMessage = 'Database schema issue - please run the setup script';
      } else if (error.message) {
        errorMessage = `Failed to save field: ${error.message}`;
      }
      
      toast.error(errorMessage);
    }
  }

  async function deleteField() {
    if (!fieldDeleteConfirm) return;
    
    try {
      // Check if field has questions assigned
      const questionCount = Object.values(questionFieldMappings).filter(fields => 
        fields.includes(fieldDeleteConfirm.field_id)
      ).length;

      if (questionCount > 0) {
        toast.error(`Cannot delete field "${fieldDeleteConfirm.name}" - it has ${questionCount} questions assigned. Please reassign or delete those questions first.`);
        setFieldDeleteConfirm(null);
        return;
      }

      // Delete field
      const { error } = await supabase
        .from('study_fields')
        .delete()
        .eq('field_id', fieldDeleteConfirm.field_id);
      
      if (error) throw error;
      
      toast.success(`Field "${fieldDeleteConfirm.name}" deleted`);
      await loadStudyFields();
    } catch (error) {
      console.error('Error deleting field:', error);
      toast.error('Failed to delete field');
    } finally {
      setFieldDeleteConfirm(null);
    }
  }

  async function handleDeleteQuestion(question) {
    setDeleteConfirm(question);
  }

  async function confirmDelete() {
    if (!deleteConfirm) return;
    try {
      // Delete field mappings first
      await supabase
        .from('question_field_mapping')
        .delete()
        .eq('question_id', deleteConfirm.question_id);

      // Delete question
      const { error } = await supabase
        .from('question_banks')
        .delete()
        .eq('question_id', deleteConfirm.question_id);
      if (error) throw error;
      
      toast.success('Question deleted');
      await loadQuestions();
      await loadQuestionFieldMappings();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    } finally {
      setDeleteConfirm(null);
    }
  }

  function handleEditQuestion(question) {
    setEditingQuestion(question);
    setShowForm(true);
  }

  function handleManageFields(question) {
    setManagingQuestion(question);
    setShowFieldManager(true);
  }

  async function saveFieldMappings() {
    if (!managingQuestion) return;

    try {
      const selectedFields = [];
      studyFields.forEach(field => {
        const checkbox = document.getElementById(`field-manager-${field.field_id}`);
        if (checkbox?.checked) {
          selectedFields.push(field.field_id);
        }
      });

      await updateQuestionFieldMappings(managingQuestion.question_id, selectedFields);
      
      toast.success('Field assignments updated');
      setShowFieldManager(false);
      setManagingQuestion(null);
      await loadQuestionFieldMappings();
    } catch (error) {
      console.error('Error updating field mappings:', error);
      toast.error('Failed to update field assignments');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Loading questions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Question Bank Manager</h2>
          <p className="text-white/70">Manage questions and assign them to specific study fields</p>
          {/* AI Status Indicator */}
          <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
            aiEnabled 
              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' 
              : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              aiEnabled ? 'bg-orange-400' : 'bg-gray-400'
            }`}></div>
            AI Questions: {aiEnabled ? 'Enabled' : 'Disabled'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* AI Toggle Button */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 border border-white/20">
            <span className="text-sm text-white">AI Questions:</span>
            <button
              onClick={() => setAiEnabled(!aiEnabled)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                aiEnabled 
                  ? 'bg-orange-500 text-white hover:bg-orange-600' 
                  : 'bg-gray-500 text-gray-200 hover:bg-gray-400'
              }`}
              title={aiEnabled ? 'Click to disable AI-generated questions' : 'Click to enable AI-generated questions'}
            >
              {aiEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <button
            onClick={() => setShowFieldSettings(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
            title="Manage Fields"
          >
            <Settings className="w-4 h-4" />
            Manage Fields
          </button>
          <button
            onClick={() => {
              setEditingQuestion(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
            title="Add Question"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>
      </div>

      {/* Field Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {studyFields.map(field => {
          const data = stats[`field_${field.field_id}`] || { total: 0, easy: 0, medium: 0, hard: 0 };
          const aiQuestions = questions.filter(q => q.created_by === 'ai' && (questionFieldMappings[q.question_id] || []).includes(field.field_id)).length;
          const _adminQuestions = data.total - aiQuestions;
          
          return (
            <div key={field.field_id} className="rounded-xl border border-white/20 bg-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{field.icon}</span>
                <span className="text-sm font-medium text-white">{field.name}</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{data.total}</div>
              <div className="text-xs text-white/60">
                Easy: {data.easy} | Medium: {data.medium} | Hard: {data.hard}
              </div>
              
              {/* Show AI disabled indicator if AI is off */}
              {!aiEnabled && (
                <div className="mt-2 p-1 text-center text-xs bg-orange-500/10 text-orange-400 rounded">
                  AI Questions Disabled
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Category Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {questionCategories.map(category => {
          const data = stats[category.name] || { total: 0, easy: 0, medium: 0, hard: 0 };
          const aiQuestions = questions.filter(q => q.created_by === 'ai' && q.category === category.name).length;
          const adminQuestions = data.total - aiQuestions;
          const IconComponent = getIconComponent(category.icon, category.name);
          
          return (
            <div key={category.category_id} className="rounded-xl border border-white/20 bg-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <IconComponent className="h-5 w-5 text-orange-400" />
                <span className="text-sm font-medium text-white">{category.name}</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{data.total}</div>
              <div className="text-xs text-white/60">
                Admin: {adminQuestions} | AI: {aiQuestions}
              </div>
              
              {/* Show AI disabled indicator if AI is off */}
              {!aiEnabled && (
                <div className="mt-2 p-1 text-center text-xs bg-orange-500/10 text-orange-400 rounded">
                  AI Questions Disabled
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
        />
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
        >
          <option value="">All Categories</option>
          {questionCategories.map(category => (
            <option key={category.category_id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          value={selectedDifficulty}
          onChange={e => setSelectedDifficulty(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
        >
          <option value="">All Difficulties</option>
          {Object.values(DIFFICULTY_LEVELS).map(difficulty => (
            <option key={difficulty} value={difficulty}>
              {difficulty}
            </option>
          ))}
        </select>
        <select
          value={selectedField}
          onChange={e => setSelectedField(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
        >
          <option value="">All Fields</option>
          {studyFields.map(field => (
            <option key={field.field_id} value={field.field_id}>
              {field.name}
            </option>
          ))}
        </select>
      </div>

      {/* Question List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredQuestions.map(question => {
          const fields = questionFieldMappings[question.question_id] || [];
          return (
            <QuestionCard
              key={question.question_id}
              question={question}
              questionFields={fields}
              studyFields={studyFields}
              onEdit={handleEditQuestion}
              onDelete={handleDeleteQuestion}
              onManageFields={handleManageFields}
              aiEnabled={aiEnabled}
              categories={questionCategories}
            />
          );
        })}
      </div>

      {/* Modals and other UI components would continue here */}
      {/* Field Settings Modal */}
      {showFieldSettings && createPortal(
        <div 
          style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
            background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', 
            zIndex: 10000000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.3s ease-out'
          }}
          onClick={() => setShowFieldSettings(false)}
        >
          <div 
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
              backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '20px', padding: '2rem', maxWidth: '800px', width: '90%', maxHeight: '90vh', overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Settings className="w-6 h-6" />
                  Manage Study Fields
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
                  Add, edit, or remove study fields for question assignment
                </p>
              </div>
              <button 
                onClick={() => setShowFieldSettings(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px', padding: '0.5rem 0.75rem', color: 'rgba(255,255,255,0.85)'
                }}
              >
                ×
              </button>
            </div>

            {/* Add AI Toggle with Tooltip */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'white', fontSize: '0.875rem' }}>Enable AI Generated Questions</span>
                  <button
                    onClick={() => setAiEnabled(!aiEnabled)}
                    style={{
                      background: aiEnabled ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '12px', padding: '0.5rem 0.75rem', color: 'rgba(255,255,255,0.85)'
                    }}
                  >
                    {aiEnabled ? 'On' : 'Off'}
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowTooltip(!showTooltip)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '12px', padding: '0.5rem 0.75rem', color: 'rgba(255,255,255,0.85)'
                    }}
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  {showTooltip && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(255, 255, 255, 0.15)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        padding: '0.5rem 1rem',
                        color: 'rgba(255,255,255,0.85)',
                        marginTop: '0.5rem',
                        maxWidth: '200px',
                        textAlign: 'center',
                        zIndex: 1000
                      }}
                    >
                      Enabling AI will allow the system to generate questions automatically.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Field List */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'white', fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Fields</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {studyFields.map(field => (
                  <div key={field.field_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: field.color, fontSize: '1.25rem' }}>{field.icon}</span>
                      <span style={{ color: 'white', fontSize: '0.875rem' }}>{field.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => {
                          setEditingField(field);
                          setShowFieldSettings(true);
                        }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '12px', padding: '0.5rem 0.75rem', color: 'rgba(255,255,255,0.85)'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setFieldDeleteConfirm(field)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '12px', padding: '0.5rem 0.75rem', color: 'rgba(255,255,255,0.85)'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add/Edit Field Form */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'white', fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {editingField ? 'Edit Field' : 'Add New Field'}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ color: 'white', fontSize: '0.875rem' }}>Name</label>
                  <input
                    type="text"
                    id="field-name"
                    defaultValue={editingField?.name || ''}
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '12px', padding: '0.5rem 0.75rem', color: 'rgba(255,255,255,0.85)'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ color: 'white', fontSize: '0.875rem' }}>Icon</label>
                  <input
                    type="text"
                    id="field-icon"
                    defaultValue={editingField?.icon || ''}
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '12px', padding: '0.5rem 0.75rem', color: 'rgba(255,255,255,0.85)'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ color: 'white', fontSize: '0.875rem' }}>Description</label>
                  <textarea
                    id="field-description"
                    defaultValue={editingField?.description || ''}
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '12px', padding: '0.5rem 0.75rem', color: 'rgba(255,255,255,0.85)'
                    }}
                  />
                </div>
                <button
                  onClick={saveFieldFromModal}
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px', padding: '0.5rem 0.75rem', color: 'rgba(255,255,255,0.85)'
                  }}
                >
                  {editingField ? 'Save Changes' : 'Add Field'}
                </button>
              </div>
            </div>

            // Add New Field Button
            <div style={{ marginBottom: '1.5rem' }}>
              <button
                onClick={() => {
                  setEditingField(null);
                  // Show field form inline
                  const form = document.getElementById('field-form');
                  if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
                }}
                style={{
                  padding: '0.75rem 1rem', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #10b981, #059669)', 
                  color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}
              >
                <Plus className="w-4 h-4" />
                Add New Field
              </button>
            </div>

            {/* Field Form */}
            <div id="field-form" style={{ display: 'none', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h4 style={{ color: 'white', marginBottom: '1rem' }}>
                {editingField ? 'Edit Field' : 'Add New Field'}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white', fontSize: '0.875rem' }}>
                    Field Name *
                  </label>
                  <input
                    id="field-name"
                    type="text"
                    defaultValue={editingField?.name || ''}
                    placeholder="e.g., Data Science"
                    style={{
                      width: '100%', padding: '0.75rem', borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.2)', color: 'white', background: 'rgba(255,255,255,0.08)'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white', fontSize: '0.875rem' }}>
                    Icon *
                  </label>
                  <input
                    id="field-icon"
                    type="text"
                    defaultValue={editingField?.icon || ''}
                    placeholder="📊"
                    style={{
                      width: '100%', padding: '0.75rem', borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.2)', color: 'white', background: 'rgba(255,255,255,0.08)',
                      textAlign: 'center', fontSize: '1.2rem'
                    }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white', fontSize: '0.875rem' }}>
                  Description
                </label>
                <textarea
                  id="field-description"
                  defaultValue={editingField?.description || ''}
                  placeholder="Brief description of this field..."
                  rows={2}
                  style={{
                    width: '100%', padding: '0.75rem', borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)', color: 'white', background: 'rgba(255,255,255,0.08)'
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={saveFieldFromModal}
                  style={{
                    padding: '0.75rem 1rem', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #10b981, #059669)', 
                    color: 'white', border: 'none'
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Field Delete Confirmation */}
      {fieldDeleteConfirm && createPortal(
        <div 
          style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
            background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', 
            zIndex: 10000001, display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.3s ease-out'
          }}
          onClick={() => setFieldDeleteConfirm(null)}
        >
          <div 
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
              backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '20px', padding: '2rem', maxWidth: '400px', width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '50%', 
                background: 'rgba(239, 68, 68, 0.2)', margin: '0 auto 1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Delete Field "{fieldDeleteConfirm.name}"?
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
                This action cannot be undone. The field will be permanently removed and unassigned from all questions.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setFieldDeleteConfirm(null)}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.25)', 
                  background: 'rgba(255,255,255,0.12)', color: 'white'
                }}
              >
                Cancel
              </button>
              <button
                onClick={deleteField}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #dc2626, #ef4444)', 
                  color: 'white', border: 'none'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Question Form Modal */}
      {showForm && createPortal(
        <div 
          style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
            background: 'radial-gradient(circle at center, rgba(234, 88, 12, 0.15) 0%, rgba(0, 0, 0, 0.8) 70%)',
            backdropFilter: 'blur(12px)', zIndex: 9999999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.3s ease-out'
          }}
          onClick={() => setShowForm(false)}
        >
          <div 
            className="modal-container"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
              backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '24px', padding: '2rem', width: '90vw', maxWidth: '900px',
              maxHeight: '90vh', overflow: 'auto', position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', margin: 0 }}>
                  {editingQuestion ? 'Edit Question' : 'Create New Question'}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', margin: 0 }}>
                  {editingQuestion ? 'Modify the question details and field assignments' : 'Add a new question and assign it to study fields'}
                </p>
              </div>
              <button 
                onClick={() => setShowForm(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px', padding: '0.5rem 0.75rem', color: 'rgba(255,255,255,0.85)'
                }}
              >
                ×
              </button>
            </div>

            {/* Question Text */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white', fontWeight: 600 }}>
                Question Text <span style={{ color: '#f97316' }}>*</span>
              </label>
              <textarea
                id="qb-question-text"
                defaultValue={editingQuestion?.question_text || ''}
                style={{
                  width: '100%', padding: '0.75rem', borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.2)', color: 'white', background: 'rgba(255,255,255,0.08)'
                }}
                rows={4}
                placeholder="Enter your question here..."
              />
            </div>

            {/* Category & Difficulty */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white', fontWeight: 600 }}>
                  Category <span style={{ color: '#f97316' }}>*</span>
                </label>
                <select
                  id="qb-category"
                  className="modal-select"
                  defaultValue={editingQuestion?.category || ''}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: 'white' }}
                >
                  <option value="" style={{ background: '#1f2937', color: 'white' }}>Select a category...</option>
                  {questionCategories.map(category => {
                    const IconComponent = getIconComponent(category.icon, category.name);
                    return (
                      <option key={category.category_id} value={category.name} style={{ background: '#1f2937', color: 'white' }}>
                        {category.name}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white', fontWeight: 600 }}>
                  Difficulty <span style={{ color: '#f97316' }}>*</span>
                </label>
                <select
                  id="qb-difficulty"
                  className="modal-select"
                  defaultValue={editingQuestion?.difficulty || ''}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: 'white' }}
                >
                  <option value="">Select difficulty...</option>
                  <option value="Easy">🟢 Easy</option>
                  <option value="Medium">🟡 Medium</option>
                  <option value="Hard">🔴 Hard</option>
                </select>
              </div>
            </div>

            {/* Study Fields Assignment */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white', fontWeight: 600 }}>
                <Users className="w-4 h-4 inline mr-2" />
                Assign to Study Fields
              </label>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                Select which study fields should see this question in their assessments
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {studyFields.map(field => {
                  const isAssigned = editingQuestion ? 
                    (questionFieldMappings[editingQuestion.question_id] || []).includes(field.field_id) : 
                    false;
                  return (
                    <label
                      key={field.field_id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem',
                        borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.05)', cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      className="hover:bg-white/10"
                    >
                      <input
                        type="checkbox"
                        id={`qb-field-${field.field_id}`}
                        defaultChecked={isAssigned}
                        style={{ marginRight: '0.5rem' }}
                      />
                      <span style={{ fontSize: '1rem' }}>{field.icon}</span>
                      <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: 500 }}>
                        {field.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Options */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white', fontWeight: 600 }}>
                Answer Options <span style={{ color: '#f97316' }}>*</span>
              </label>
              {["A","B","C","D"].map((letter, idx) => (
                <div key={letter} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: idx === 3 ? 0 : '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #f97316, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>{letter}</div>
                  <input
                    id={`qb-option-${letter.toLowerCase()}`}
                    defaultValue={editingQuestion?.options?.[idx] || ''}
                    type="text"
                    placeholder={`Enter option ${letter}...`}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: 'white' }}
                  />
                </div>
              ))}
            </div>

            {/* Correct Answer */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white', fontWeight: 600 }}>
                Correct Answer <span style={{ color: '#f97316' }}>*</span>
              </label>
              <select
                id="qb-correct-answer"
                className="modal-select"
                defaultValue={editingQuestion ? (
                  editingQuestion.correct_answer === editingQuestion.options?.[0] ? 'A' :
                  editingQuestion.correct_answer === editingQuestion.options?.[1] ? 'B' :
                  editingQuestion.correct_answer === editingQuestion.options?.[2] ? 'C' :
                  editingQuestion.correct_answer === editingQuestion.options?.[3] ? 'D' : ''
                ) : ''}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(34,197,94,0.12)', color: 'white' }}
              >
                <option value="">Select the correct answer...</option>
                <option value="A">✓ Option A</option>
                <option value="B">✓ Option B</option>
                <option value="C">✓ Option C</option>
                <option value="D">✓ Option D</option>
              </select>
            </div>

            {/* Explanation */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white', fontWeight: 600 }}>
                Explanation
              </label>
              <textarea
                id="qb-explanation"
                defaultValue={editingQuestion?.explanation || ''}
                rows={3}
                placeholder="Explain why this is the correct answer..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: 'white' }}
              />
            </div>

            {/* Vedic + Modern */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white', fontWeight: 600 }}>
                  Vedic Connection (optional)
                </label>
                <textarea
                  id="qb-vedic"
                  defaultValue={editingQuestion?.vedic_connection || ''}
                  rows={2}
                  placeholder="Connect to ancient Vedic knowledge..."
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: 'white' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white', fontWeight: 600 }}>
                  Modern Application (optional)
                </label>
                <textarea
                  id="qb-modern"
                  defaultValue={editingQuestion?.modern_application || ''}
                  rows={2}
                  placeholder="How does this apply in modern contexts?"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: 'white' }}
                />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setShowForm(false)}
                style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.12)', color: 'white' }}
              >
                Cancel
              </button>
              <button
                onClick={saveQuestionFromModal}
                style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', background: 'linear-gradient(135deg, #ea580c, #f97316)', color: 'white', border: 'none' }}
              >
                {editingQuestion ? 'Update Question' : 'Save Question'}
              </button>
            </div>
          </div>

          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @media (max-width: 768px) {
              .modal-container { width: 95vw !important; padding: 1.25rem !important; max-height: 95vh !important; }
            }
            @media (max-height: 600px) {
              .modal-container { padding: 1rem !important; max-height: 98vh !important; }
            }
            .modal-select {
              appearance: none;
              -webkit-appearance: none;
              -moz-appearance: none;
              background-color: rgba(255, 255, 255, 0.1) !important;
              color: #fff !important;
              border: 1px solid rgba(255,255,255,0.2) !important;
              border-radius: 12px !important;
              padding: 0.75rem !important;
            }
            .modal-select:focus {
              outline: none;
              box-shadow: 0 0 0 2px rgba(249,115,22,0.35);
              border-color: rgba(249,115,22,0.6);
            }
            .modal-select option {
              background-color: #111827;
              color: #fff;
            }
          `}</style>
        </div>,
        document.body
      )}

      {/* Field Manager Modal */}
      {showFieldManager && managingQuestion && createPortal(
        <div 
          style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
            background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', 
            zIndex: 10000000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.3s ease-out'
          }}
          onClick={() => setShowFieldManager(false)}
        >
          <div 
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
              backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '20px', padding: '2rem', maxWidth: '500px', width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users className="w-5 h-5" />
                Manage Field Assignments
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
                Select which study fields should see this question
              </p>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <strong>Question:</strong> {managingQuestion.question_text.substring(0, 100)}...
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                {studyFields.map(field => {
                  const isAssigned = (questionFieldMappings[managingQuestion.question_id] || []).includes(field.field_id);
                  return (
                    <label
                      key={field.field_id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
                        borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)',
                        background: isAssigned ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)', 
                        cursor: 'pointer', transition: 'all 0.2s ease'
                      }}
                      className="hover:bg-white/10"
                    >
                      <input
                        type="checkbox"
                        id={`field-manager-${field.field_id}`}
                        defaultChecked={isAssigned}
                        style={{ marginRight: '0.5rem' }}
                      />
                      <span style={{ fontSize: '1.2rem' }}>{field.icon}</span>
                      <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: 500 }}>
                        {field.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowFieldManager(false)}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.25)', 
                  background: 'rgba(255,255,255,0.12)', color: 'white'
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveFieldMappings}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #ea580c, #f97316)', 
                  color: 'white', border: 'none'
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && createPortal(
        <div 
          style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
            background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', 
            zIndex: 10000000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.3s ease-out'
          }}
          onClick={() => setDeleteConfirm(null)}
        >
          <div 
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
              backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '20px', padding: '2rem', maxWidth: '400px', width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '50%', 
                background: 'rgba(239, 68, 68, 0.2)', margin: '0 auto 1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Delete Question?
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
                This action cannot be undone. The question and all its field assignments will be permanently removed.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.25)', 
                  background: 'rgba(255,255,255,0.12)', color: 'white'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #dc2626, #ef4444)', 
                  color: 'white', border: 'none'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}