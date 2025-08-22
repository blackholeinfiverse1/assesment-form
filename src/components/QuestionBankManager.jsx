import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Brain, Calculator, Code, Globe, Newspaper, Scroll, Plus, Edit2, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { ASSIGNMENT_CATEGORIES, DIFFICULTY_LEVELS } from '../data/assignment.js';
import { supabase } from '../lib/supabaseClient';

const CATEGORY_ICONS = {
  [ASSIGNMENT_CATEGORIES.CODING]: Code,
  [ASSIGNMENT_CATEGORIES.LOGIC]: Brain,
  [ASSIGNMENT_CATEGORIES.MATHEMATICS]: Calculator,
  [ASSIGNMENT_CATEGORIES.LANGUAGE]: BookOpen,
  [ASSIGNMENT_CATEGORIES.CULTURE]: Globe,
  [ASSIGNMENT_CATEGORIES.VEDIC_KNOWLEDGE]: Scroll,
  [ASSIGNMENT_CATEGORIES.CURRENT_AFFAIRS]: Newspaper
};

const DIFFICULTY_COLORS = {
  [DIFFICULTY_LEVELS.EASY]: 'text-green-400 bg-green-400/10 border-green-400/20',
  [DIFFICULTY_LEVELS.MEDIUM]: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  [DIFFICULTY_LEVELS.HARD]: 'text-red-400 bg-red-400/10 border-red-400/20'
};

function QuestionCard({ question, onEdit, onDelete }) {
  const IconComponent = CATEGORY_ICONS[question.category] || BookOpen;
  const difficultyClass = DIFFICULTY_COLORS[question.difficulty] || DIFFICULTY_COLORS[DIFFICULTY_LEVELS.EASY];

  return (
    <div className="rounded-xl border border-white/20 bg-white/10 p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <IconComponent className="h-5 w-5 text-orange-400" />
          <span className="text-sm font-medium text-orange-400">{question.category}</span>
          <span className={`text-xs px-2 py-1 rounded-full border ${difficultyClass}`}>
            {question.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(question)}
            className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(question)}
            className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
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
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    filterQuestions();
    calculateStats();
  }, [questions, searchTerm, selectedCategory, selectedDifficulty]);

  async function loadQuestions() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('question_banks')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error('Failed to load questions from database');
    } finally {
      setLoading(false);
    }
  }

  function calculateStats() {
    const newStats = {};
    Object.values(ASSIGNMENT_CATEGORIES).forEach(category => {
      newStats[category] = { total: 0, easy: 0, medium: 0, hard: 0 };
    });
    (questions || []).forEach(q => {
      if (newStats[q.category]) {
        newStats[q.category].total++;
        const diff = (q.difficulty || '').toLowerCase();
        if (diff === 'easy') newStats[q.category].easy++;
        else if (diff === 'medium') newStats[q.category].medium++;
        else if (diff === 'hard') newStats[q.category].hard++;
      }
    });
    setStats(newStats);
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

    setFilteredQuestions(filtered);
  }

  async function saveQuestionFromModal() {
    try {
      // Collect values from the modal by IDs we assign
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

      const payload = {
        question_text,
        options,
        correct_answer,
        category,
        difficulty,
        explanation: explanation || null,
        vedic_connection: vedic_connection || null,
        modern_application: modern_application || null,
        is_active: true,
        updated_at: new Date().toISOString()
      };

      let dbError = null;
      if (editingQuestion && editingQuestion.id) {
        const { error } = await supabase
          .from('question_banks')
          .update(payload)
          .eq('id', editingQuestion.id);
        dbError = error;
      } else {
        const { error } = await supabase
          .from('question_banks')
          .insert([payload]);
        dbError = error;
      }

      if (dbError) throw dbError;

      toast.success(editingQuestion ? 'Question updated' : 'Question added');
      setShowForm(false);
      setEditingQuestion(null);
      await loadQuestions();
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('Failed to save question');
    }
  }

  async function handleDeleteQuestion(question) {
    setDeleteConfirm(question);
  }

  async function confirmDelete() {
    if (!deleteConfirm) return;
    try {
      const { error } = await supabase
        .from('question_banks')
        .delete()
        .eq('id', deleteConfirm.id);
      if (error) throw error;
      toast.success('Question deleted');
      await loadQuestions();
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
          <p className="text-white/70">Manage questions for field-based assessments</p>
        </div>
        <button
          onClick={() => {
            setEditingQuestion(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(stats).map(([category, data]) => {
          const IconComponent = CATEGORY_ICONS[category] || BookOpen;
          return (
            <div key={category} className="rounded-xl border border-white/20 bg-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <IconComponent className="h-5 w-5 text-orange-400" />
                <span className="text-sm font-medium text-white">{category}</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{data.total}</div>
              <div className="text-xs text-white/60">
                Easy: {data.easy} | Medium: {data.medium} | Hard: {data.hard}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
            />
          </div>
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
        >
          <option value="" className="bg-gray-900">All Categories</option>
          {Object.values(ASSIGNMENT_CATEGORIES).map(category => (
            <option key={category} value={category} className="bg-gray-900">
              {category}
            </option>
          ))}
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
        >
          <option value="" className="bg-gray-900">All Difficulties</option>
          {Object.values(DIFFICULTY_LEVELS).map(difficulty => (
            <option key={difficulty} value={difficulty} className="bg-gray-900">
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Questions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredQuestions.map(question => (
          <QuestionCard
            key={question.id}
            question={question}
            onEdit={handleEditQuestion}
            onDelete={handleDeleteQuestion}
          />
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/70">No questions found matching your criteria.</p>
        </div>
      )}

      {/* Question Form Modal */}
      {showForm &&
        createPortal(
          <>
            {/* Backdrop */}
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
              {/* Modal */}
              <div 
                className="modal-container"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
                  backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '24px', padding: '2rem', width: '90vw', maxWidth: '800px',
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
                      {editingQuestion ? 'Modify the question details below' : 'Add a new question to your question bank'}
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
                      <option value="Coding">💻 Coding</option>
                      <option value="Logic">🧠 Logic</option>
                      <option value="Mathematics">🔢 Mathematics</option>
                      <option value="Language">📚 Language</option>
                      <option value="Culture">🌍 Culture</option>
                      <option value="Vedic Knowledge">📜 Vedic Knowledge</option>
                      <option value="Current Affairs">📰 Current Affairs</option>
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
            </div>

            {/* Animations */}
            <style>{`
              @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
              @media (max-width: 768px) {
                .modal-container { width: 95vw !important; padding: 1.25rem !important; max-height: 95vh !important; }
              }
              @media (max-height: 600px) {
                .modal-container { padding: 1rem !important; max-height: 98vh !important; }
              }
              /* Modal select styling for visibility */
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
          </>,
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
                This action cannot be undone. The question will be permanently removed from your question bank.
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
