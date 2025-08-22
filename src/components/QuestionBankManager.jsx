import { useEffect, useState } from 'react';
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

function QuestionForm({ question, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    question_text: '',
    category: ASSIGNMENT_CATEGORIES.CODING,
    difficulty: DIFFICULTY_LEVELS.EASY,
    options: ['', '', '', ''],
    correct_answer: '',
    explanation: '',
    vedic_connection: '',
    modern_application: '',
    tags: [],
    ...question
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.question_text.trim()) {
      newErrors.question_text = 'Question text is required';
    }

    const nonEmptyOptions = formData.options.filter(opt => opt.trim());
    if (nonEmptyOptions.length < 4) {
      newErrors.options = 'All 4 options are required';
    }

    if (!formData.correct_answer.trim()) {
      newErrors.correct_answer = 'Correct answer is required';
    } else if (!formData.options.includes(formData.correct_answer)) {
      newErrors.correct_answer = 'Correct answer must be one of the options';
    }

    if (!formData.explanation.trim()) {
      newErrors.explanation = 'Explanation is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">
            {question ? 'Edit Question' : 'Add New Question'}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Question Text *
            </label>
            <textarea
              value={formData.question_text}
              onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
              className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
              rows={3}
              placeholder="Enter the question text..."
            />
            {errors.question_text && (
              <p className="text-red-400 text-sm mt-1">{errors.question_text}</p>
            )}
          </div>

          {/* Category and Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
              >
                {Object.values(ASSIGNMENT_CATEGORIES).map(category => (
                  <option key={category} value={category} className="bg-gray-900">
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Difficulty *</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
              >
                {Object.values(DIFFICULTY_LEVELS).map(difficulty => (
                  <option key={difficulty} value={difficulty} className="bg-gray-900">
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Answer Options *</label>
            <div className="space-y-2">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-white/70 font-medium">
                    {String.fromCharCode(65 + index)})
                  </span>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1 p-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  />
                </div>
              ))}
            </div>
            {errors.options && (
              <p className="text-red-400 text-sm mt-1">{errors.options}</p>
            )}
          </div>

          {/* Correct Answer */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Correct Answer *</label>
            <select
              value={formData.correct_answer}
              onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
              className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
            >
              <option value="" className="bg-gray-900">Select correct answer</option>
              {formData.options.filter(opt => opt.trim()).map((option, index) => (
                <option key={index} value={option} className="bg-gray-900">
                  {option}
                </option>
              ))}
            </select>
            {errors.correct_answer && (
              <p className="text-red-400 text-sm mt-1">{errors.correct_answer}</p>
            )}
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Explanation *</label>
            <textarea
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
              rows={3}
              placeholder="Explain why this is the correct answer..."
            />
            {errors.explanation && (
              <p className="text-red-400 text-sm mt-1">{errors.explanation}</p>
            )}
          </div>

          {/* Vedic Connection */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Vedic Connection (Optional)</label>
            <textarea
              value={formData.vedic_connection}
              onChange={(e) => setFormData({ ...formData, vedic_connection: e.target.value })}
              className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
              rows={2}
              placeholder="Connection to Vedic knowledge or traditions..."
            />
          </div>

          {/* Modern Application */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Modern Application (Optional)</label>
            <textarea
              value={formData.modern_application}
              onChange={(e) => setFormData({ ...formData, modern_application: e.target.value })}
              className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
              rows={2}
              placeholder="How this knowledge applies in modern contexts..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
            >
              <Save className="w-4 h-4" />
              {question ? 'Update Question' : 'Save Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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

      {/* Question Form Modal */}
      {showForm && (
        <QuestionForm
          question={editingQuestion}
          onSave={handleSaveQuestion}
          onCancel={() => {
            setShowForm(false);
            setEditingQuestion(null);
          }}
        />
      )}
    </div>
  );
}