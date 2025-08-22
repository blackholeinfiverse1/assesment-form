import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Brain, Calculator, Code, Globe, Newspaper, Scroll, Plus, Edit2, Trash2, Search, Filter, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { ASSIGNMENT_CATEGORIES, DIFFICULTY_LEVELS } from '../data/assignment.js';
import { QUESTION_BANKS, getAllQuestions } from '../data/questionBanks.js';
import { STUDY_FIELDS } from '../data/studyFields.js';

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
          {question.options.map((option, index) => (
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

        <div className="text-sm text-white/60">
          <strong>Explanation:</strong> {question.explanation}
        </div>

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
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadQuestions();
    calculateStats();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchTerm, selectedCategory, selectedDifficulty]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      // Load from hardcoded question banks for now
      // TODO: Load from database once admin adds questions there
      const allQuestions = getAllQuestions();
      setQuestions(allQuestions);
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const allQuestions = getAllQuestions();
    const newStats = {};

    // Calculate by category
    Object.values(ASSIGNMENT_CATEGORIES).forEach(category => {
      newStats[category] = {
        total: 0,
        easy: 0,
        medium: 0,
        hard: 0
      };
    });

    allQuestions.forEach(q => {
      if (newStats[q.category]) {
        newStats[q.category].total++;
        newStats[q.category][q.difficulty]++;
      }
    });

    setStats(newStats);
  };

  const filterQuestions = () => {
    let filtered = [...questions];

    if (searchTerm) {
      filtered = filtered.filter(q =>
        q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.explanation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(q => q.category === selectedCategory);
    }

    if (selectedDifficulty) {
      filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
    }

    setFilteredQuestions(filtered);
  };

  const handleSaveQuestion = async (questionData) => {
    try {
      // Generate unique ID for new questions
      if (!editingQuestion) {
        questionData.id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      // TODO: Save to database
      // For now, just update local state
      const newQuestions = editingQuestion
        ? questions.map(q => q.id === editingQuestion.id ? { ...questionData, id: editingQuestion.id } : q)
        : [...questions, questionData];

      setQuestions(newQuestions);
      setShowForm(false);
      setEditingQuestion(null);
      calculateStats();

      toast.success(editingQuestion ? 'Question updated successfully' : 'Question added successfully');
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('Failed to save question');
    }
  };

  const handleDeleteQuestion = async (question) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      // TODO: Delete from database
      const newQuestions = questions.filter(q => q.id !== question.id);
      setQuestions(newQuestions);
      calculateStats();
      toast.success('Question deleted successfully');
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setShowForm(true);
  };

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
          <p className="text-white/70">Manage hardcoded questions for field-based assessments</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
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

      {/* Premium Question Form Modal */}
      {showForm &&
        createPortal(
          <>
            {/* Enhanced backdrop overlay */}
            <div 
              style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              background: 'radial-gradient(circle at center, rgba(234, 88, 12, 0.15) 0%, rgba(0, 0, 0, 0.8) 70%)',
              backdropFilter: 'blur(12px)',
              zIndex: 9999999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0',
              margin: '0',
              animation: 'fadeIn 0.3s ease-out'
            }}
            onClick={() => setShowForm(false)}
          >
            {/* Premium modal container with enhanced glass morphism */}
            <div 
              className="modal-container"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '24px',
                padding: '2.5rem',
                width: '90vw',
                maxWidth: '800px',
                maxHeight: '90vh',
                overflow: 'auto',
                zIndex: 10000000,
                boxShadow: '0 32px 64px rgba(0, 0, 0, 0.4), 0 8px 32px rgba(234, 88, 12, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                position: 'relative',
                animation: 'modalSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Subtle gradient overlay */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '100px',
                background: 'linear-gradient(180deg, rgba(234, 88, 12, 0.1) 0%, transparent 100%)',
                borderRadius: '24px 24px 0 0',
                pointerEvents: 'none'
              }} />
              {/* Premium header with enhanced styling */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '2rem',
                position: 'relative',
                zIndex: 1
              }}>
                <div>
                  <h2 style={{ 
                    fontSize: '1.75rem', 
                    fontWeight: '700', 
                    color: 'white',
                    margin: 0,
                    marginBottom: '0.25rem',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                  }}>
                    {editingQuestion ? 'Edit Question' : 'Create New Question'}
                  </h2>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.875rem',
                    margin: 0
                  }}>
                    {editingQuestion ? 'Modify the question details below' : 'Add a new question to your question bank'}
                  </p>
                </div>
                <button 
                  onClick={() => setShowForm(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.8)',
                    cursor: 'pointer',
                    fontSize: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '44px',
                    height: '44px',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(8px)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.25)';
                    e.target.style.color = 'white';
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                    e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                    e.target.style.transform = 'scale(1)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                >
                  ×
                </button>
              </div>
              
              {/* Premium Question Text Field */}
              <div style={{ marginBottom: '1.75rem', position: 'relative', zIndex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.75rem', 
                  fontWeight: '600',
                  color: 'white',
                  fontSize: '0.9rem',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                }}>
                  Question Text <span style={{ color: '#f97316' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <textarea 
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.05) 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      minHeight: '100px',
                      color: 'white',
                      fontSize: '0.9rem',
                      resize: 'vertical',
                      outline: 'none',
                      fontFamily: 'inherit',
                      lineHeight: '1.6',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(8px)',
                      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}
                    placeholder="Enter your question here... Be clear and specific."
                    onFocus={(e) => {
                      e.target.style.borderColor = '#f97316';
                      e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.1)';
                      e.target.style.background = 'linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.1)';
                      e.target.style.background = 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.05) 100%)';
                    }}
                  />
                  {/* Subtle glow effect */}
                  <div style={{
                    position: 'absolute',
                    top: '-2px',
                    left: '-2px',
                    right: '-2px',
                    bottom: '-2px',
                    background: 'linear-gradient(45deg, rgba(249, 115, 22, 0.1), rgba(234, 88, 12, 0.1))',
                    borderRadius: '14px',
                    zIndex: -1,
                    opacity: 0,
                    transition: 'opacity 0.3s ease'
                  }} />
                </div>
              </div>
              
              {/* Premium Category and Difficulty Selection */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '1.5rem', 
                marginBottom: '1.75rem',
                position: 'relative',
                zIndex: 1
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.75rem', 
                    fontWeight: '600',
                    color: 'white',
                    fontSize: '0.9rem',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  }}>
                    Category <span style={{ color: '#f97316' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select style={{
                      width: '100%',
                      padding: '1rem',
                      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.05) 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none',
                      appearance: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(8px)',
                      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#f97316';
                      e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.1)';
                      e.target.style.background = 'linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.1)';
                      e.target.style.background = 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.05) 100%)';
                    }}>
                      <option style={{ background: '#1f2937', color: 'white' }} value="">Select a category...</option>
                      <option style={{ background: '#1f2937', color: 'white' }} value="Coding">💻 Coding</option>
                      <option style={{ background: '#1f2937', color: 'white' }} value="Logic">🧠 Logic</option>
                      <option style={{ background: '#1f2937', color: 'white' }} value="Mathematics">🔢 Mathematics</option>
                      <option style={{ background: '#1f2937', color: 'white' }} value="Language">📚 Language</option>
                      <option style={{ background: '#1f2937', color: 'white' }} value="Culture">🌍 Culture</option>
                      <option style={{ background: '#1f2937', color: 'white' }} value="Vedic Knowledge">📜 Vedic Knowledge</option>
                      <option style={{ background: '#1f2937', color: 'white' }} value="Current Affairs">📰 Current Affairs</option>
                    </select>
                    {/* Custom dropdown arrow */}
                    <div style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      color: 'rgba(255, 255, 255, 0.5)'
                    }}>
                      ▼
                    </div>
                  </div>
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.75rem', 
                    fontWeight: '600',
                    color: 'white',
                    fontSize: '0.9rem',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  }}>
                    Difficulty <span style={{ color: '#f97316' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select style={{
                      width: '100%',
                      padding: '1rem',
                      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.05) 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none',
                      appearance: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(8px)',
                      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#f97316';
                      e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.1)';
                      e.target.style.background = 'linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.1)';
                      e.target.style.background = 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.05) 100%)';
                    }}>
                      <option style={{ background: '#1f2937', color: 'white' }} value="">Select difficulty...</option>
                      <option style={{ background: '#1f2937', color: 'white' }} value="Easy">🟢 Easy</option>
                      <option style={{ background: '#1f2937', color: 'white' }} value="Medium">🟡 Medium</option>
                      <option style={{ background: '#1f2937', color: 'white' }} value="Hard">🔴 Hard</option>
                    </select>
                    {/* Custom dropdown arrow */}
                    <div style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      color: 'rgba(255, 255, 255, 0.5)'
                    }}>
                      ▼
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Premium Answer Options */}
              <div style={{ marginBottom: '1.75rem', position: 'relative', zIndex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '1rem', 
                  fontWeight: '600',
                  color: 'white',
                  fontSize: '0.9rem',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                }}>
                  Answer Options <span style={{ color: '#f97316' }}>*</span>
                </label>
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  {['A', 'B', 'C', 'D'].map((letter, index) => (
                    <div key={letter} style={{ 
                      marginBottom: index === 3 ? '0' : '1rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '1rem' 
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        color: 'white',
                        fontSize: '0.875rem',
                        boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                      }}>
                        {letter}
                      </div>
                      <input 
                        type="text"
                        style={{
                          flex: 1,
                          padding: '1rem',
                          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.05) 100%)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '12px',
                          color: 'white',
                          fontSize: '0.9rem',
                          outline: 'none',
                          transition: 'all 0.3s ease',
                          backdropFilter: 'blur(8px)',
                          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                        }}
                        placeholder={`Enter option ${letter}...`}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#f97316';
                          e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.1)';
                          e.target.style.background = 'linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                          e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.1)';
                          e.target.style.background = 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.05) 100%)';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Premium Correct Answer Selection */}
              <div style={{ marginBottom: '1.75rem', position: 'relative', zIndex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.75rem', 
                  fontWeight: '600',
                  color: 'white',
                  fontSize: '0.9rem',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                }}>
                  Correct Answer <span style={{ color: '#f97316' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <select style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'linear-gradient(145deg, rgba(34, 197, 94, 0.1) 0%, rgba(21, 128, 61, 0.05) 100%)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '0.9rem',
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(8px)',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 0 rgba(34, 197, 94, 0.1)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#22c55e';
                    e.target.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 0 rgba(34, 197, 94, 0.1)';
                    e.target.style.background = 'linear-gradient(145deg, rgba(34, 197, 94, 0.15) 0%, rgba(21, 128, 61, 0.08) 100%)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(34, 197, 94, 0.3)';
                    e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 0 rgba(34, 197, 94, 0.1)';
                    e.target.style.background = 'linear-gradient(145deg, rgba(34, 197, 94, 0.1) 0%, rgba(21, 128, 61, 0.05) 100%)';
                  }}>
                    <option style={{ background: '#1f2937', color: 'white' }} value="">Select the correct answer...</option>
                    <option style={{ background: '#1f2937', color: '#22c55e' }} value="A">✓ Option A</option>
                    <option style={{ background: '#1f2937', color: '#22c55e' }} value="B">✓ Option B</option>
                    <option style={{ background: '#1f2937', color: '#22c55e' }} value="C">✓ Option C</option>
                    <option style={{ background: '#1f2937', color: '#22c55e' }} value="D">✓ Option D</option>
                  </select>
                  {/* Custom dropdown arrow with green accent */}
                  <div style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: 'rgba(34, 197, 94, 0.7)'
                  }}>
                    ▼
                  </div>
                </div>
              </div>
              
              {/* Premium Explanation Field */}
              <div style={{ marginBottom: '1.75rem', position: 'relative', zIndex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.75rem', 
                  fontWeight: '600',
                  color: 'white',
                  fontSize: '0.9rem',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                }}>
                  Explanation <span style={{ color: '#f97316' }}>*</span>
                </label>
                <textarea 
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.05) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    minHeight: '80px',
                    color: 'white',
                    fontSize: '0.9rem',
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'inherit',
                    lineHeight: '1.6',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(8px)',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                  placeholder="Explain why this is the correct answer. Provide clear reasoning..."
                  onFocus={(e) => {
                    e.target.style.borderColor = '#f97316';
                    e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.1)';
                    e.target.style.background = 'linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.1)';
                    e.target.style.background = 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.05) 100%)';
                  }}
                />
              </div>
              
              {/* Premium Vedic Connection Field */}
              <div style={{ marginBottom: '1.75rem', position: 'relative', zIndex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.75rem', 
                  fontWeight: '600',
                  color: 'white',
                  fontSize: '0.9rem',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{ color: '#fbbf24' }}>🕉️</span>
                  Vedic Connection
                  <span style={{ 
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontWeight: '400'
                  }}>
                    (Optional)
                  </span>
                </label>
                <textarea 
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'linear-gradient(145deg, rgba(251, 191, 36, 0.08) 0%, rgba(245, 158, 11, 0.05) 100%)',
                    border: '1px solid rgba(251, 191, 36, 0.2)',
                    borderRadius: '12px',
                    minHeight: '70px',
                    color: 'white',
                    fontSize: '0.9rem',
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'inherit',
                    lineHeight: '1.6',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(8px)',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 0 rgba(251, 191, 36, 0.1)'
                  }}
                  placeholder="Connect this question to ancient Vedic knowledge, traditions, or principles..."
                  onFocus={(e) => {
                    e.target.style.borderColor = '#fbbf24';
                    e.target.style.boxShadow = '0 0 0 3px rgba(251, 191, 36, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 0 rgba(251, 191, 36, 0.1)';
                    e.target.style.background = 'linear-gradient(145deg, rgba(251, 191, 36, 0.12) 0%, rgba(245, 158, 11, 0.08) 100%)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(251, 191, 36, 0.2)';
                    e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 0 rgba(251, 191, 36, 0.1)';
                    e.target.style.background = 'linear-gradient(145deg, rgba(251, 191, 36, 0.08) 0%, rgba(245, 158, 11, 0.05) 100%)';
                  }}
                />
              </div>
              
              {/* Premium Modern Application Field */}
              <div style={{ marginBottom: '2.5rem', position: 'relative', zIndex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.75rem', 
                  fontWeight: '600',
                  color: 'white',
                  fontSize: '0.9rem',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{ color: '#06b6d4' }}>🌐</span>
                  Modern Application
                  <span style={{ 
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontWeight: '400'
                  }}>
                    (Optional)
                  </span>
                </label>
                <textarea 
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'linear-gradient(145deg, rgba(6, 182, 212, 0.08) 0%, rgba(8, 145, 178, 0.05) 100%)',
                    border: '1px solid rgba(6, 182, 212, 0.2)',
                    borderRadius: '12px',
                    minHeight: '70px',
                    color: 'white',
                    fontSize: '0.9rem',
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'inherit',
                    lineHeight: '1.6',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(8px)',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 0 rgba(6, 182, 212, 0.1)'
                  }}
                  placeholder="Explain how this knowledge applies in modern contexts, technology, or daily life..."
                  onFocus={(e) => {
                    e.target.style.borderColor = '#06b6d4';
                    e.target.style.boxShadow = '0 0 0 3px rgba(6, 182, 212, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 0 rgba(6, 182, 212, 0.1)';
                    e.target.style.background = 'linear-gradient(145deg, rgba(6, 182, 212, 0.12) 0%, rgba(8, 145, 178, 0.08) 100%)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(6, 182, 212, 0.2)';
                    e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 0 rgba(6, 182, 212, 0.1)';
                    e.target.style.background = 'linear-gradient(145deg, rgba(6, 182, 212, 0.08) 0%, rgba(8, 145, 178, 0.05) 100%)';
                  }}
                />
              </div>
              
              {/* Premium Action Buttons */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: '1rem',
                position: 'relative',
                zIndex: 1
              }}>
                <button 
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: '1rem 2rem',
                    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)',
                    color: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = 'linear-gradient(145deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)';
                    e.target.style.color = 'white';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.2)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)';
                    e.target.style.color = 'rgba(255, 255, 255, 0.9)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    alert('Question would be saved here!');
                    setShowForm(false);
                  }}
                  style={{
                    padding: '1rem 2rem',
                    background: 'linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 8px 24px rgba(234, 88, 12, 0.4), 0 4px 12px rgba(249, 115, 22, 0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                    backgroundSize: '200% 200%',
                    animation: 'gradientShift 3s ease infinite'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, #c2410c 0%, #ea580c 50%, #f97316 100%)';
                    e.target.style.transform = 'translateY(-3px) scale(1.02)';
                    e.target.style.boxShadow = '0 12px 32px rgba(234, 88, 12, 0.5), 0 6px 16px rgba(249, 115, 22, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%)';
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 8px 24px rgba(234, 88, 12, 0.4), 0 4px 12px rgba(249, 115, 22, 0.3)';
                  }}
                >
                  ✨ {editingQuestion ? 'Update Question' : 'Save Question'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Add CSS animations */}
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            
            @keyframes modalSlideIn {
              from { 
                opacity: 0; 
                transform: scale(0.9) translateY(-30px); 
              }
              to { 
                opacity: 1; 
                transform: scale(1) translateY(0); 
              }
            }
            
            @keyframes gradientShift {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
            
            /* Responsive modal adjustments */
            @media (max-width: 768px) {
              .modal-container {
                width: 95vw !important;
                padding: 1.5rem !important;
                max-height: 95vh !important;
              }
            }
            
            @media (max-height: 600px) {
              .modal-container {
                padding: 1rem !important;
                max-height: 98vh !important;
              }
            }
          `}</style>
          </>,
          document.body
        )}
    </div>
  );
}