-- AI Settings Table Setup Script
-- This script creates the ai_settings table for managing global AI enablement

-- Create the ai_settings table
CREATE TABLE IF NOT EXISTS ai_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  ai_enabled BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_ai_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_ai_settings_updated_at
    BEFORE UPDATE ON ai_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_settings_updated_at();

-- Insert default AI setting for question generation
INSERT INTO ai_settings (setting_key, ai_enabled, description)
VALUES ('global_question_generation', true, 'Global toggle for AI question generation in assignments')
ON CONFLICT (setting_key) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_settings table
-- Allow authenticated users to read settings
CREATE POLICY "Allow authenticated users to read AI settings" ON ai_settings
  FOR SELECT TO authenticated USING (true);

-- Allow service role to update settings
CREATE POLICY "Allow service role to update AI settings" ON ai_settings
  FOR ALL TO service_role USING (true);

-- Grant permissions
GRANT SELECT ON ai_settings TO anon;
GRANT SELECT ON ai_settings TO authenticated;
GRANT ALL ON ai_settings TO service_role;
GRANT USAGE, SELECT ON SEQUENCE ai_settings_id_seq TO service_role;

-- Comments for documentation
COMMENT ON TABLE ai_settings IS 'Stores AI-related settings for the application';
COMMENT ON COLUMN ai_settings.setting_key IS 'Unique identifier for the setting';
COMMENT ON COLUMN ai_settings.ai_enabled IS 'Whether the AI feature is enabled';
COMMENT ON COLUMN ai_settings.description IS 'Description of what this setting controls';

-- Display final results
SELECT 
  'AI Settings Table Setup Complete!' as status,
  setting_key,
  ai_enabled,
  description
FROM ai_settings;