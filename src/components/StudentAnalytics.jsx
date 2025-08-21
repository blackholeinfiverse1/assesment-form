import {
    Eye,
    Search,
    Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

export default function StudentAnalytics() {
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadStudentData();
  }, []);

  useEffect(() => {
    filterData();
  }, [attempts, searchTerm]);

  const loadStudentData = async () => {
    try {
      setLoading(true);

      // Load assignment attempts with student info
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('assignment_attempts')
        .select(`
          *,
          students!assignment_attempts_student_id_fkey (
            name,
            email,
            student_id
          )
        `)
        .order('completed_at', { ascending: false });

      if (attemptsError) {
        console.error('Error loading attempts:', attemptsError);
        toast.error('Failed to load student data');
        return;
      }

      setAttempts(attemptsData || []);

    } catch (error) {
      console.error('Error loading student data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = [...attempts];

    // Simple search filter
    if (searchTerm) {
      filtered = filtered.filter(attempt =>
        attempt.students?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attempt.students?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attempt.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredData(filtered);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeedLevel = (grade) => {
    switch (grade) {
      case 'A': return { level: 'Sky', icon: '☁️', color: 'text-blue-400' };
      case 'B': return { level: 'Tree', icon: '🌳', color: 'text-green-400' };
      case 'C': return { level: 'Seed', icon: '🌱', color: 'text-yellow-400' };
      case 'D': return { level: 'Seed', icon: '🌱', color: 'text-yellow-400' };
      case 'F': return { level: 'Seed', icon: '🌱', color: 'text-yellow-400' };
      default: return { level: 'Seed', icon: '🌱', color: 'text-yellow-400' };
    }
  };

  const viewStudentDetails = (attempt) => {
    setSelectedStudent(attempt);
    setShowDetails(true);
  };

  if (loading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <div className="text-white/60">Loading student analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-orange-400" />
        <h2 className="text-xl font-semibold text-white">Student Details</h2>
      </div>

      {/* Simple Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Simple Student List */}
      <div className="space-y-3">
        {filteredData.map((attempt) => (
          <div key={attempt.id} className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-white font-medium">
                      {attempt.students?.name || 'Unknown Student'}
                    </div>
                    <div className="text-white/60 text-sm">
                      {attempt.students?.email || attempt.user_email}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium flex items-center justify-end gap-2">
                      <span>{attempt.percentage.toFixed(1)}%</span>
                      <span className={`flex items-center gap-1 ${getSeedLevel(attempt.grade).color}`}>
                        {getSeedLevel(attempt.grade).icon} {getSeedLevel(attempt.grade).level}
                      </span>
                    </div>
                    <div className="text-white/60 text-sm">
                      {formatDate(attempt.completed_at)}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => viewStudentDetails(attempt)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Eye className="h-4 w-4" />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="text-center p-8 text-white/60">
          No assignment attempts found matching your filters.
        </div>
      )}

      {/* Student Details Modal */}
      {showDetails && selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          onClose={() => setShowDetails(false)}
          getSeedLevel={getSeedLevel}
        />
      )}
    </div>
  );
}

// Student Details Modal Component
function StudentDetailsModal({ student, onClose, getSeedLevel }) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentResponses();
  }, [student.id]);

  const loadStudentResponses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('assignment_responses')
        .select('*')
        .eq('attempt_id', student.id)
        .order('question_id');

      if (error) {
        console.error('Error loading responses:', error);
        toast.error('Failed to load detailed responses');
        return;
      }

      setResponses(data || []);
    } catch (error) {
      console.error('Error loading student responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border-2 border-orange-500/50 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b-2 border-orange-500/50 bg-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">
                {student.students?.name || 'Unknown Student'}
              </h3>
              <div className="text-orange-300 text-sm mt-1">
                {student.students?.email || student.user_email} •
                Completed: {formatDate(student.completed_at)}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-orange-500/20 rounded-lg transition-colors group"
            >
              <span className="text-white group-hover:text-orange-300 text-2xl font-light">×</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] custom-scrollbar bg-slate-900">
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <div className="p-4 rounded-lg bg-slate-800 border-2 border-orange-500/30">
              <div className="text-orange-400 text-sm font-medium">Overall Score</div>
              <div className="text-3xl font-bold text-white">
                {student.percentage.toFixed(1)}%
              </div>
            </div>
            <div className="p-4 rounded-lg bg-slate-800 border-2 border-purple-500/30">
              <div className="text-purple-400 text-sm font-medium">Level</div>
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                <span className={getSeedLevel(student.grade).color}>
                  {getSeedLevel(student.grade).icon}
                </span>
                <span className={getSeedLevel(student.grade).color}>
                  {getSeedLevel(student.grade).level}
                </span>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-slate-800 border-2 border-blue-500/30">
              <div className="text-blue-400 text-sm font-medium">Time Taken</div>
              <div className="text-3xl font-bold text-white">
                {Math.floor(student.time_taken_seconds / 60)}m
              </div>
            </div>
            <div className="p-4 rounded-lg bg-slate-800 border-2 border-green-500/30">
              <div className="text-green-400 text-sm font-medium">Questions</div>
              <div className="text-3xl font-bold text-white">{responses.length}</div>
            </div>
          </div>

          {/* Overall Feedback */}
          {student.overall_feedback && (
            <div className="mb-6 p-6 rounded-xl bg-slate-800 border-2 border-orange-500/50">
              <h4 className="text-orange-400 font-semibold mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-orange-400 rounded-full"></span>
                Overall Feedback
              </h4>
              <p className="text-white leading-relaxed">{student.overall_feedback}</p>
            </div>
          )}

          {/* Question-by-Question Breakdown */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-lg flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
              Question-by-Question Analysis
            </h4>

            {loading ? (
              <div className="text-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-3"></div>
                <div className="text-white/60">Loading responses...</div>
              </div>
            ) : (
              <div className="space-y-4 custom-scrollbar">
                {responses.map((response, index) => (
                  <div key={response.id} className="p-5 rounded-xl bg-slate-800 border-2 border-slate-700 hover:border-orange-500/50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-orange-500/20 text-orange-300 text-sm font-medium rounded-full">Q{index + 1}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          response.is_correct
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {response.is_correct ? '✓ Correct' : '✗ Incorrect'}
                        </span>
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">{response.question_category}</span>
                      </div>
                      <div className="text-white font-bold text-lg">
                        {response.total_score.toFixed(1)}/{response.max_score}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-slate-700 border-l-4 border-blue-500">
                        <span className="text-blue-400 font-medium text-sm">Student Answer: </span>
                        <span className="text-white">{response.user_answer}</span>
                      </div>
                      {response.user_explanation && (
                        <div className="p-3 rounded-lg bg-slate-700 border-l-4 border-purple-500">
                          <span className="text-purple-400 font-medium text-sm">Explanation: </span>
                          <span className="text-white">{response.user_explanation}</span>
                        </div>
                      )}
                      <div className="p-3 rounded-lg bg-slate-700 border-l-4 border-green-500">
                        <span className="text-green-400 font-medium text-sm">Correct Answer: </span>
                        <span className="text-green-400 font-medium">{response.correct_answer}</span>
                      </div>
                      {response.ai_feedback && (
                        <div className="mt-3 p-4 rounded-lg bg-slate-700 border-2 border-orange-500/50">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-3 h-3 bg-orange-400 rounded-full"></span>
                            <span className="text-orange-400 font-medium text-sm">AI Feedback</span>
                          </div>
                          <span className="text-white leading-relaxed">{response.ai_feedback}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
