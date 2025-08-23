-- Complete study_fields table setup - handles all scenarios
-- Run this in your Supabase SQL Editor

-- Step 1: Drop and recreate the table if it has structural issues
DROP TABLE IF EXISTS study_fields CASCADE;

-- Step 2: Create the table with the correct structure
CREATE TABLE study_fields (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    field_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '📚',
    description TEXT,
    color TEXT NOT NULL DEFAULT 'text-gray-400 bg-gray-400/10 border-gray-400/20',
    is_active BOOLEAN DEFAULT TRUE,
    subcategories JSONB DEFAULT '[]'::jsonb,
    question_weights JSONB DEFAULT '{}'::jsonb,
    difficulty_distribution JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_study_fields_field_id ON study_fields(field_id);
CREATE INDEX IF NOT EXISTS idx_study_fields_active ON study_fields(is_active);
CREATE INDEX IF NOT EXISTS idx_study_fields_name ON study_fields(name);
CREATE INDEX IF NOT EXISTS idx_study_fields_created_at ON study_fields(created_at);

-- Step 4: Create GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_study_fields_subcategories ON study_fields USING GIN (subcategories);
CREATE INDEX IF NOT EXISTS idx_study_fields_question_weights ON study_fields USING GIN (question_weights);
CREATE INDEX IF NOT EXISTS idx_study_fields_difficulty_distribution ON study_fields USING GIN (difficulty_distribution);

-- Step 5: Enable Row Level Security
ALTER TABLE study_fields ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies (permissive for development)
DROP POLICY IF EXISTS "Allow all operations on study_fields for development" ON study_fields;
CREATE POLICY "Allow all operations on study_fields for development" ON study_fields
    FOR ALL TO PUBLIC USING (true);

-- Step 7: Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_study_fields_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 8: Create trigger
DROP TRIGGER IF EXISTS update_study_fields_updated_at ON study_fields;
CREATE TRIGGER update_study_fields_updated_at 
    BEFORE UPDATE ON study_fields 
    FOR EACH ROW EXECUTE FUNCTION update_study_fields_updated_at_column();

-- Step 9: Insert default study fields
INSERT INTO study_fields (
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
) VALUES 
(
    'stem', 
    'STEM', 
    'STEM', 
    '🔬', 
    'Science, Technology, Engineering, and Mathematics', 
    'text-blue-400 bg-blue-400/10 border-blue-400/20',
    true,
    '["Computer Science", "Engineering", "Mathematics", "Physics", "Chemistry", "Biology", "Data Science"]'::jsonb,
    '{"Coding": 35, "Logic": 25, "Mathematics": 25, "Language": 5, "Culture": 5, "Vedic Knowledge": 3, "Current Affairs": 2}'::jsonb,
    '{"easy": 25, "medium": 50, "hard": 25}'::jsonb,
    NOW(), 
    NOW()
),
(
    'business', 
    'Business', 
    'Business', 
    '💼', 
    'Business and Economics', 
    'text-green-400 bg-green-400/10 border-green-400/20',
    true,
    '["Business Administration", "Economics", "Finance", "Marketing", "Management", "Entrepreneurship"]'::jsonb,
    '{"Logic": 30, "Current Affairs": 25, "Language": 20, "Mathematics": 10, "Culture": 10, "Coding": 3, "Vedic Knowledge": 2}'::jsonb,
    '{"easy": 30, "medium": 50, "hard": 20}'::jsonb,
    NOW(), 
    NOW()
),
(
    'social_sciences', 
    'Social Sciences', 
    'Social Sciences', 
    '🏛️', 
    'Social Sciences and Humanities', 
    'text-purple-400 bg-purple-400/10 border-purple-400/20',
    true,
    '["Psychology", "Sociology", "Political Science", "Anthropology", "History", "Philosophy"]'::jsonb,
    '{"Language": 30, "Culture": 25, "Current Affairs": 20, "Logic": 15, "Vedic Knowledge": 5, "Mathematics": 3, "Coding": 2}'::jsonb,
    '{"easy": 35, "medium": 45, "hard": 20}'::jsonb,
    NOW(), 
    NOW()
),
(
    'health_medicine', 
    'Health & Medicine', 
    'Health & Medicine', 
    '⚕️', 
    'Healthcare and Medical Sciences', 
    'text-red-400 bg-red-400/10 border-red-400/20',
    true,
    '["Medicine", "Nursing", "Pharmacy", "Public Health", "Dentistry", "Health Administration"]'::jsonb,
    '{"Logic": 30, "Current Affairs": 20, "Language": 20, "Mathematics": 15, "Vedic Knowledge": 8, "Culture": 5, "Coding": 2}'::jsonb,
    '{"easy": 30, "medium": 50, "hard": 20}'::jsonb,
    NOW(), 
    NOW()
),
(
    'creative_arts', 
    'Creative Arts', 
    'Creative Arts', 
    '🎨', 
    'Arts, Design, and Creative Fields', 
    'text-pink-400 bg-pink-400/10 border-pink-400/20',
    true,
    '["Fine Arts", "Design", "Music", "Literature", "Theater", "Film", "Creative Writing"]'::jsonb,
    '{"Language": 35, "Culture": 25, "Vedic Knowledge": 15, "Current Affairs": 10, "Logic": 10, "Mathematics": 3, "Coding": 2}'::jsonb,
    '{"easy": 35, "medium": 45, "hard": 20}'::jsonb,
    NOW(), 
    NOW()
);

-- Step 10: Verify the setup
SELECT 
    'Setup complete!' as status,
    COUNT(*) as total_fields,
    array_agg(field_id ORDER BY created_at) as field_ids,
    array_agg(name ORDER BY created_at) as field_names
FROM study_fields;

-- Step 11: Show table structure
SELECT 
    'Table structure:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'study_fields' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 12: Test query that frontend will use
SELECT 
    'Frontend test query:' as info,
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
FROM study_fields 
WHERE is_active = true
ORDER BY created_at;

SELECT '✅ study_fields table is ready! You can now add custom fields through the UI.' as final_status;