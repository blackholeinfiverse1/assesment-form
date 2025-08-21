import React, { useState } from 'react';
import { X, GraduationCap, BookOpen, Target } from 'lucide-react';

const BackgroundSelectionModal = ({ isOpen, onSave, onClose }) => {
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [learningGoals, setLearningGoals] = useState('');
  const [loading, setLoading] = useState(false);

  const fieldOptions = [
    { value: 'stem', label: 'STEM (Science, Technology, Engineering, Math)' },
    { value: 'business', label: 'Business & Economics' },
    { value: 'social_sciences', label: 'Social Sciences & Humanities' },
    { value: 'health_medicine', label: 'Health & Medicine' },
    { value: 'creative_arts', label: 'Creative Arts & Design' },
    { value: 'other', label: 'Other' }
  ];

  const classLevelOptions = [
    { value: 'high_school', label: 'High School (9th-12th Grade)' },
    { value: 'undergraduate', label: 'Undergraduate (Bachelor\'s)' },
    { value: 'graduate', label: 'Graduate (Master\'s)' },
    { value: 'postgraduate', label: 'Postgraduate (PhD/Doctorate)' },
    { value: 'professional', label: 'Professional/Working' }
  ];

  const learningGoalOptions = [
    { value: 'skill_building', label: 'Build specific skills for career' },
    { value: 'academic_support', label: 'Academic support & exam prep' },
    { value: 'career_change', label: 'Career change or transition' },
    { value: 'personal_growth', label: 'Personal growth & learning' },
    { value: 'certification', label: 'Professional certification' },
    { value: 'exploration', label: 'Explore new interests' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fieldOfStudy || !classLevel || !learningGoals) {
      return;
    }

    setLoading(true);
    try {
      await onSave({
        fieldOfStudy,
        classLevel,
        learningGoals
      });
    } catch (error) {
      console.error('Error saving background selection:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <GraduationCap className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Welcome to Gurukul!</h2>
              <p className="text-white/70">Let's personalize your learning experience</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Field of Study */}
          <div>
            <label className="flex items-center gap-2 text-white font-medium mb-3">
              <BookOpen className="w-5 h-5 text-orange-400" />
              What field are you studying or working in?
              <span className="text-orange-300">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fieldOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                    fieldOfStudy === option.value
                      ? 'border-orange-400 bg-orange-500/20 text-white'
                      : 'border-white/20 bg-white/5 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="fieldOfStudy"
                    value={option.value}
                    checked={fieldOfStudy === option.value}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Class Level */}
          <div>
            <label className="flex items-center gap-2 text-white font-medium mb-3">
              <GraduationCap className="w-5 h-5 text-orange-400" />
              What's your current education level?
              <span className="text-orange-300">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {classLevelOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                    classLevel === option.value
                      ? 'border-orange-400 bg-orange-500/20 text-white'
                      : 'border-white/20 bg-white/5 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="classLevel"
                    value={option.value}
                    checked={classLevel === option.value}
                    onChange={(e) => setClassLevel(e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Learning Goals */}
          <div>
            <label className="flex items-center gap-2 text-white font-medium mb-3">
              <Target className="w-5 h-5 text-orange-400" />
              What's your main learning goal?
              <span className="text-orange-300">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {learningGoalOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                    learningGoals === option.value
                      ? 'border-orange-400 bg-orange-500/20 text-white'
                      : 'border-white/20 bg-white/5 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="learningGoals"
                    value={option.value}
                    checked={learningGoals === option.value}
                    onChange={(e) => setLearningGoals(e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-white/70 hover:text-white transition-colors"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={!fieldOfStudy || !classLevel || !learningGoals || loading}
              className="px-8 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {loading ? 'Saving...' : 'Continue to Assessment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BackgroundSelectionModal;