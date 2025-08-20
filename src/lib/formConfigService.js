import { supabase, FORM_CONFIG_TABLE } from "./supabaseClient";

// Field types supported by the form builder
export const FIELD_TYPES = {
  TEXT: "text",
  EMAIL: "email",
  NUMBER: "number",
  TEXTAREA: "textarea",
  SELECT: "select",
  RADIO: "radio",
  CHECKBOX: "checkbox",
  MULTI_SELECT: "multi_select",
};

// Default form configuration that matches current intake form
export const DEFAULT_FORM_CONFIG = {
  id: "default",
  name: "Student Intake Form",
  description: "Default student intake form configuration",
  fields: [
    {
      id: "name",
      type: FIELD_TYPES.TEXT,
      label: "Full Name",
      placeholder: "e.g., Asha Gupta",
      required: true,
      order: 1,
      validation: {
        minLength: 2,
        maxLength: 100,
      },
    },
    {
      id: "age",
      type: FIELD_TYPES.NUMBER,
      label: "Age",
      placeholder: "17",
      required: false,
      order: 2,
      validation: {
        min: 5,
        max: 100,
      },
    },
    {
      id: "email",
      type: FIELD_TYPES.EMAIL,
      label: "Email",
      placeholder: "your.email@example.com",
      required: false,
      order: 3,
    },
    {
      id: "phone",
      type: FIELD_TYPES.TEXT,
      label: "Phone",
      placeholder: "999-000-1234",
      required: false,
      order: 4,
      validation: {
        pattern: "^[\\d\\s\\-\\+\\(\\)\\.]+$",
      },
    },
    {
      id: "education_level",
      type: FIELD_TYPES.SELECT,
      label: "Education Level",
      placeholder: "Select your education level",
      required: false,
      order: 5,
      options: [
        { value: "high_school", label: "High School" },
        { value: "undergraduate", label: "Undergraduate" },
        { value: "graduate", label: "Graduate" },
        { value: "postgraduate", label: "Postgraduate" },
        { value: "other", label: "Other" },
      ],
    },
    {
      id: "field_of_study",
      type: FIELD_TYPES.TEXT,
      label: "Field of Study",
      placeholder: "CS, Math, Humanities, ...",
      required: false,
      order: 6,
    },
    {
      id: "current_skills",
      type: FIELD_TYPES.TEXTAREA,
      label: "Current Skills (comma separated)",
      placeholder: "JavaScript, Algebra, Writing",
      required: false,
      order: 7,
      helpText: "Example: JavaScript, Algebra, Writing",
    },
    {
      id: "interests",
      type: FIELD_TYPES.TEXTAREA,
      label: "Interests (comma separated)",
      placeholder: "Programming, Mathematics, Art",
      required: false,
      order: 8,
      helpText: "Example: Programming, Mathematics, Art",
    },
    {
      id: "goals",
      type: FIELD_TYPES.TEXTAREA,
      label: "Goals",
      placeholder: "What do you want to achieve?",
      required: false,
      order: 9,
    },
    {
      id: "preferred_learning_style",
      type: FIELD_TYPES.RADIO,
      label: "Preferred Learning Style",
      required: false,
      order: 10,
      options: [
        { value: "video", label: "Video" },
        { value: "text", label: "Text" },
        { value: "interactive", label: "Interactive" },
        { value: "mixed", label: "Mixed" },
      ],
    },
    {
      id: "availability_per_week_hours",
      type: FIELD_TYPES.NUMBER,
      label: "Availability per week (hours)",
      placeholder: "6",
      required: false,
      order: 11,
      validation: {
        min: 0,
        max: 168,
      },
    },
    {
      id: "experience_years",
      type: FIELD_TYPES.NUMBER,
      label: "Prior experience (years)",
      placeholder: "0",
      required: false,
      order: 12,
      validation: {
        min: 0,
        max: 50,
      },
    },
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_active: true,
};

// Form configuration service
export class FormConfigService {
  // Get the active form configuration
  static async getActiveFormConfig() {
    try {
      const { data, error } = await supabase
        .from(FORM_CONFIG_TABLE)
        .select("*")
        .eq("is_active", true)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        throw error;
      }

      // If no active config found, return default
      if (!data) {
        return DEFAULT_FORM_CONFIG;
      }

      return data;
    } catch (error) {
      console.error("Error fetching form config:", error);
      return DEFAULT_FORM_CONFIG;
    }
  }

  // Save form configuration
  static async saveFormConfig(config) {
    try {
      // First, deactivate all existing configs
      await supabase
        .from(FORM_CONFIG_TABLE)
        .update({ is_active: false })
        .neq("id", "dummy"); // Update all rows

      // Then insert or update the new config
      const configToSave = {
        ...config,
        updated_at: new Date().toISOString(),
        is_active: true,
      };

      const { data, error } = await supabase
        .from(FORM_CONFIG_TABLE)
        .upsert(configToSave, { onConflict: "id" })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error saving form config:", error);
      throw error;
    }
  }

  // Get all form configurations
  static async getAllFormConfigs() {
    try {
      const { data, error } = await supabase
        .from(FORM_CONFIG_TABLE)
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching all form configs:", error);
      return [];
    }
  }

  // Delete form configuration
  static async deleteFormConfig(id) {
    try {
      const { error } = await supabase
        .from(FORM_CONFIG_TABLE)
        .delete()
        .eq("id", id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error("Error deleting form config:", error);
      throw error;
    }
  }

  // Save configuration as preset (without making it active)
  static async saveAsPreset(config, presetName, presetDescription = "") {
    try {
      const presetConfig = {
        ...config,
        id: `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: presetName,
        description: presetDescription,
        is_active: false,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from(FORM_CONFIG_TABLE)
        .insert(presetConfig)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error saving preset:", error);
      throw error;
    }
  }

  // Get all presets (non-active configurations)
  static async getAllPresets() {
    try {
      const { data, error } = await supabase
        .from(FORM_CONFIG_TABLE)
        .select("*")
        .eq("is_active", false)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching presets:", error);
      return [];
    }
  }

  // Load a specific preset by ID
  static async loadPreset(presetId) {
    try {
      const { data, error } = await supabase
        .from(FORM_CONFIG_TABLE)
        .select("*")
        .eq("id", presetId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error loading preset:", error);
      throw error;
    }
  }

  // Update preset metadata (name, description)
  static async updatePresetMetadata(presetId, name, description) {
    try {
      const { data, error } = await supabase
        .from(FORM_CONFIG_TABLE)
        .update({
          name,
          description,
          updated_at: new Date().toISOString(),
        })
        .eq("id", presetId)
        .eq("is_active", false) // Only allow updating presets, not active configs
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error updating preset metadata:", error);
      throw error;
    }
  }

  // Activate a preset (make it the active configuration)
  static async activatePreset(presetId) {
    try {
      // First, deactivate all existing configs
      await supabase
        .from(FORM_CONFIG_TABLE)
        .update({ is_active: false })
        .neq("id", "dummy"); // Update all rows

      // Then activate the selected preset
      const { data, error } = await supabase
        .from(FORM_CONFIG_TABLE)
        .update({
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", presetId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error activating preset:", error);
      throw error;
    }
  }

  // Initialize default configuration if none exists
  static async initializeDefaultConfig() {
    try {
      const activeConfig = await this.getActiveFormConfig();

      // If we got the default config back, it means no config exists in DB
      if (activeConfig.id === "default") {
        await this.saveFormConfig({
          ...DEFAULT_FORM_CONFIG,
          id: "initial_config",
        });
      }
    } catch (error) {
      console.error("Error initializing default config:", error);
    }
  }

  // Validate form configuration
  static validateFormConfig(config) {
    const errors = [];

    if (!config.name || config.name.trim().length === 0) {
      errors.push("Form name is required");
    }

    if (!config.fields || !Array.isArray(config.fields)) {
      errors.push("Fields array is required");
    } else {
      config.fields.forEach((field, index) => {
        if (!field.id || field.id.trim().length === 0) {
          errors.push(`Field ${index + 1}: ID is required`);
        }
        if (!field.type || !Object.values(FIELD_TYPES).includes(field.type)) {
          errors.push(`Field ${index + 1}: Valid field type is required`);
        }
        if (!field.label || field.label.trim().length === 0) {
          errors.push(`Field ${index + 1}: Label is required`);
        }
        if (
          (field.type === FIELD_TYPES.SELECT ||
            field.type === FIELD_TYPES.RADIO ||
            field.type === FIELD_TYPES.MULTI_SELECT) &&
          (!field.options ||
            !Array.isArray(field.options) ||
            field.options.length === 0)
        ) {
          errors.push(
            `Field ${
              index + 1
            }: Options are required for select/radio/multi-select fields`
          );
        }
      });
    }

    return errors;
  }
}
