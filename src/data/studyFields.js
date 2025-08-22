// Study fields configuration for field-based assessment system

export const STUDY_FIELDS = {
  STEM: {
    id: 'stem',
    name: 'STEM (Science, Technology, Engineering, Mathematics)',
    shortName: 'STEM',
    description: 'Science, Technology, Engineering, and Mathematics fields including Computer Science, Physics, Chemistry, Biology, Engineering, and Mathematical Sciences',
    subcategories: [
      'Computer Science',
      'Software Engineering',
      'Data Science',
      'Cybersecurity',
      'Artificial Intelligence',
      'Physics',
      'Chemistry',
      'Biology',
      'Mathematics',
      'Engineering',
      'Information Technology'
    ]
  },
  BUSINESS: {
    id: 'business',
    name: 'Business & Economics',
    shortName: 'Business',
    description: 'Business administration, economics, finance, marketing, entrepreneurship, and related commercial fields',
    subcategories: [
      'Business Administration',
      'Economics',
      'Finance',
      'Marketing',
      'Accounting',
      'Entrepreneurship',
      'Management',
      'International Business',
      'Supply Chain Management',
      'Human Resources'
    ]
  },
  SOCIAL_SCIENCES: {
    id: 'social_sciences',
    name: 'Social Sciences',
    shortName: 'Social Sciences',
    description: 'Psychology, sociology, political science, anthropology, and other social science disciplines',
    subcategories: [
      'Psychology',
      'Sociology',
      'Political Science',
      'Anthropology',
      'International Relations',
      'Social Work',
      'Criminology',
      'Geography',
      'History',
      'Philosophy'
    ]
  },
  HEALTH_MEDICINE: {
    id: 'health_medicine',
    name: 'Health & Medicine',
    shortName: 'Health & Medicine',
    description: 'Medicine, nursing, pharmacy, public health, and other healthcare-related fields',
    subcategories: [
      'Medicine',
      'Nursing',
      'Pharmacy',
      'Public Health',
      'Dentistry',
      'Veterinary Medicine',
      'Physical Therapy',
      'Occupational Therapy',
      'Medical Technology',
      'Health Administration'
    ]
  },
  CREATIVE_ARTS: {
    id: 'creative_arts',
    name: 'Creative Arts & Humanities',
    shortName: 'Creative Arts',
    description: 'Fine arts, literature, languages, music, theater, design, and other creative and humanities disciplines',
    subcategories: [
      'Fine Arts',
      'Literature',
      'Languages',
      'Music',
      'Theater',
      'Film Studies',
      'Graphic Design',
      'Creative Writing',
      'Art History',
      'Linguistics'
    ]
  },
  OTHER: {
    id: 'other',
    name: 'Other Fields',
    shortName: 'Other',
    description: 'Agriculture, environmental studies, sports science, and other specialized fields',
    subcategories: [
      'Agriculture',
      'Environmental Studies',
      'Sports Science',
      'Hospitality Management',
      'Tourism',
      'Architecture',
      'Urban Planning',
      'Library Science',
      'Education',
      'Law'
    ]
  }
};

// Mapping study fields to question categories with weights
export const FIELD_QUESTION_MAPPING = {
  [STUDY_FIELDS.STEM.id]: {
    // STEM fields get more coding, logic, and mathematics questions
    primary: ['Coding', 'Logic', 'Mathematics'],
    secondary: ['Current Affairs', 'Vedic Knowledge'],
    weights: {
      'Coding': 35,
      'Logic': 25,
      'Mathematics': 25,
      'Language': 5,
      'Culture': 5,
      'Vedic Knowledge': 3,
      'Current Affairs': 2
    }
  },
  [STUDY_FIELDS.BUSINESS.id]: {
    // Business gets more logic, current affairs, and language
    primary: ['Logic', 'Current Affairs', 'Language'],
    secondary: ['Mathematics', 'Culture'],
    weights: {
      'Logic': 30,
      'Current Affairs': 25,
      'Language': 20,
      'Mathematics': 10,
      'Culture': 10,
      'Coding': 3,
      'Vedic Knowledge': 2
    }
  },
  [STUDY_FIELDS.SOCIAL_SCIENCES.id]: {
    // Social sciences get more language, culture, and current affairs
    primary: ['Language', 'Culture', 'Current Affairs'],
    secondary: ['Logic', 'Vedic Knowledge'],
    weights: {
      'Language': 30,
      'Culture': 25,
      'Current Affairs': 20,
      'Logic': 15,
      'Vedic Knowledge': 5,
      'Mathematics': 3,
      'Coding': 2
    }
  },
  [STUDY_FIELDS.HEALTH_MEDICINE.id]: {
    // Health/Medicine gets balanced questions with focus on logic and current affairs
    primary: ['Logic', 'Current Affairs', 'Language'],
    secondary: ['Mathematics', 'Vedic Knowledge'],
    weights: {
      'Logic': 30,
      'Current Affairs': 20,
      'Language': 20,
      'Mathematics': 15,
      'Vedic Knowledge': 8,
      'Culture': 5,
      'Coding': 2
    }
  },
  [STUDY_FIELDS.CREATIVE_ARTS.id]: {
    // Creative arts get more language, culture, and vedic knowledge
    primary: ['Language', 'Culture', 'Vedic Knowledge'],
    secondary: ['Current Affairs', 'Logic'],
    weights: {
      'Language': 35,
      'Culture': 25,
      'Vedic Knowledge': 15,
      'Current Affairs': 10,
      'Logic': 10,
      'Mathematics': 3,
      'Coding': 2
    }
  },
  [STUDY_FIELDS.OTHER.id]: {
    // Other fields get balanced distribution
    primary: ['Language', 'Logic', 'Current Affairs'],
    secondary: ['Culture', 'Mathematics'],
    weights: {
      'Language': 20,
      'Logic': 20,
      'Current Affairs': 20,
      'Culture': 15,
      'Mathematics': 10,
      'Vedic Knowledge': 10,
      'Coding': 5
    }
  }
};

// Question difficulty distribution by field
export const FIELD_DIFFICULTY_DISTRIBUTION = {
  [STUDY_FIELDS.STEM.id]: {
    easy: 25,
    medium: 50,
    hard: 25
  },
  [STUDY_FIELDS.BUSINESS.id]: {
    easy: 30,
    medium: 50,
    hard: 20
  },
  [STUDY_FIELDS.SOCIAL_SCIENCES.id]: {
    easy: 35,
    medium: 45,
    hard: 20
  },
  [STUDY_FIELDS.HEALTH_MEDICINE.id]: {
    easy: 30,
    medium: 50,
    hard: 20
  },
  [STUDY_FIELDS.CREATIVE_ARTS.id]: {
    easy: 35,
    medium: 45,
    hard: 20
  },
  [STUDY_FIELDS.OTHER.id]: {
    easy: 30,
    medium: 50,
    hard: 20
  }
};

// Helper functions
export function getStudyFieldById(fieldId) {
  return Object.values(STUDY_FIELDS).find(field => field.id === fieldId);
}

export function getStudyFieldByName(fieldName) {
  return Object.values(STUDY_FIELDS).find(
    field => field.name.toLowerCase().includes(fieldName.toLowerCase()) ||
             field.subcategories.some(sub => sub.toLowerCase().includes(fieldName.toLowerCase()))
  );
}

export function getQuestionWeightsForField(fieldId) {
  return FIELD_QUESTION_MAPPING[fieldId]?.weights || FIELD_QUESTION_MAPPING[STUDY_FIELDS.OTHER.id].weights;
}

export function getDifficultyDistributionForField(fieldId) {
  return FIELD_DIFFICULTY_DISTRIBUTION[fieldId] || FIELD_DIFFICULTY_DISTRIBUTION[STUDY_FIELDS.OTHER.id];
}

export function detectStudyFieldFromBackground(studentData) {
  const {
    field_of_study = '',
    current_skills = '',
    interests = '',
    goals = '',
    education_level = ''
  } = studentData;

  const combinedText = `${field_of_study} ${current_skills} ${interests} ${goals} ${education_level}`.toLowerCase();

  // Check for STEM keywords
  const stemKeywords = ['computer', 'software', 'programming', 'data science', 'engineering', 'physics', 'chemistry', 'biology', 'mathematics', 'math', 'science', 'technology', 'ai', 'machine learning', 'cybersecurity'];
  if (stemKeywords.some(keyword => combinedText.includes(keyword))) {
    return STUDY_FIELDS.STEM.id;
  }

  // Check for Business keywords
  const businessKeywords = ['business', 'finance', 'marketing', 'economics', 'management', 'entrepreneurship', 'accounting', 'mba'];
  if (businessKeywords.some(keyword => combinedText.includes(keyword))) {
    return STUDY_FIELDS.BUSINESS.id;
  }

  // Check for Social Sciences keywords
  const socialKeywords = ['psychology', 'sociology', 'political', 'social work', 'anthropology', 'history', 'philosophy'];
  if (socialKeywords.some(keyword => combinedText.includes(keyword))) {
    return STUDY_FIELDS.SOCIAL_SCIENCES.id;
  }

  // Check for Health/Medicine keywords
  const healthKeywords = ['medicine', 'medical', 'nursing', 'pharmacy', 'health', 'doctor', 'physician', 'therapy'];
  if (healthKeywords.some(keyword => combinedText.includes(keyword))) {
    return STUDY_FIELDS.HEALTH_MEDICINE.id;
  }

  // Check for Creative Arts keywords
  const artsKeywords = ['art', 'design', 'music', 'literature', 'creative', 'writing', 'theater', 'film', 'languages'];
  if (artsKeywords.some(keyword => combinedText.includes(keyword))) {
    return STUDY_FIELDS.CREATIVE_ARTS.id;
  }

  // Default to OTHER
  return STUDY_FIELDS.OTHER.id;
}

export default STUDY_FIELDS;