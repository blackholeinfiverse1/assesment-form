import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase, SUPABASE_TABLE } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import DynamicForm from "../components/DynamicForm";
import { FormConfigService } from "../lib/formConfigService";
import { backgroundSelectionService } from "../lib/backgroundSelectionService";
import BackgroundSelectionWrapper from "../components/BackgroundSelectionWrapper";

function Intake() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [formConfig, setFormConfig] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function loadFormConfigAndProfile() {
      try {
        // First try to get user-specific form configuration based on background
        let config = await backgroundSelectionService.getFormConfigForUser(user.id);

        // If no background-specific config, fall back to default
        if (!config) {
          config = await FormConfigService.getActiveFormConfig();
        }

        console.log("Form config loaded:", config);

        setFormConfig(config);

        // Get user's email for debugging and initialization
        const userEmail = user?.primaryEmailAddress?.emailAddress;
        console.log("User email from Clerk:", userEmail);

        // Check email field validation specifically
        const emailField = config.fields?.find((f) => f.id === "email");
        console.log("Email field config:", emailField);

        // Test the email pattern if it exists
        if (emailField?.validation?.pattern && userEmail) {
          const pattern = new RegExp(emailField.validation.pattern);
          const isValid = pattern.test(userEmail);
          console.log("Email pattern test:", {
            pattern: emailField.validation.pattern,
            email: userEmail,
            isValid: isValid,
          });

          // If the pattern is broken (double-escaped), remove it
          if (!isValid && emailField.validation.pattern.includes("\\\\")) {
            console.log("Removing broken email validation pattern");
            delete emailField.validation.pattern;
          }
        }

        // Check and fix phone field validation pattern
        const phoneField = config.fields?.find((f) => f.id === "phone");
        if (phoneField?.validation?.pattern) {
          console.log("Phone field pattern:", phoneField.validation.pattern);

          // If the pattern has double-escaped backslashes, fix it
          if (phoneField.validation.pattern.includes("\\\\")) {
            console.log("Fixing broken phone validation pattern");
            // Remove the pattern entirely since HTML5 tel input provides basic validation
            delete phoneField.validation.pattern;
          }
        }

        // Initialize form with empty values based on config (only if form is completely empty)
        setForm((prevForm) => {
          if (Object.keys(prevForm).length === 0) {
            const initialForm = {};
            config.fields?.forEach((field) => {
              if (field.id === "email") {
                // Pre-populate email with user's logged-in email
                initialForm[field.id] = userEmail || "";
              } else if (field.id === "name") {
                // Pre-populate name with user's full name
                initialForm[field.id] = user?.fullName || "";
              } else {
                initialForm[field.id] = "";
              }
            });
            console.log("Initial form data:", initialForm);
            console.log("Setting initial form...");
            return initialForm;
          }
          console.log("Form already has data, preserving:", prevForm);
          return prevForm;
        });

        // Load existing profile if user is logged in
        if (user?.id) {
          console.log("Loading profile for user_id:", user.id);

          // First try to find by user_id
          let { data, error: profileError } = await supabase
            .from(SUPABASE_TABLE)
            .select("*")
            .eq("user_id", user.id)
            .single();

          // If not found by user_id, try by email (for legacy records)
          if (profileError && profileError.code === "PGRST116" && userEmail) {
            console.log(
              "No record found by user_id, trying by email:",
              userEmail
            );
            const emailResult = await supabase
              .from(SUPABASE_TABLE)
              .select("*")
              .eq("email", userEmail)
              .single();

            data = emailResult.data;
            profileError = emailResult.error;

            // If found by email, update it to include user_id for future queries
            if (data && !profileError) {
              console.log(
                "Found legacy record by email, updating with user_id"
              );
              await supabase
                .from(SUPABASE_TABLE)
                .update({ user_id: user.id })
                .eq("email", userEmail);
            }
          }

          console.log("Profile query result:", { data, error: profileError });

          if (data && data.responses) {
            setIsEditing(true);
            const existingForm = {
              ...data.responses,
              name: data.name || user?.fullName || "",
              email: data.email || userEmail, // Use stored email, fallback to Clerk email
            };

            // Convert arrays back to comma-separated strings for certain fields
            if (
              existingForm.current_skills &&
              Array.isArray(existingForm.current_skills)
            ) {
              existingForm.current_skills =
                existingForm.current_skills.join(", ");
            }
            if (
              existingForm.interests &&
              Array.isArray(existingForm.interests)
            ) {
              existingForm.interests = existingForm.interests.join(", ");
            }

            console.log("Setting existing form data:", existingForm);

            // Only set form data if current form is empty or only has basic info
            setForm((prevForm) => {
              const hasUserData = Object.keys(prevForm).some(
                (key) =>
                  key !== "name" &&
                  key !== "email" &&
                  prevForm[key] &&
                  prevForm[key] !== ""
              );

              if (hasUserData) {
                console.log(
                  "Preserving current form data, not overriding with database data"
                );
                return prevForm;
              } else {
                console.log("Loading database data into form");
                return existingForm;
              }
            });
          } else {
            // Initialize form with user's basic info for new profiles (only if form is empty)
            setForm((prevForm) => {
              if (Object.keys(prevForm).length === 0) {
                const newProfileForm = {
                  name: user?.fullName || "",
                  email: userEmail || "",
                };
                console.log("Setting new profile form data:", newProfileForm);
                return newProfileForm;
              }
              return prevForm;
            });
          }
        }
      } catch (err) {
        console.error("Error loading form config or profile:", err);
        setError("Failed to load form configuration");
      } finally {
        setLoadingProfile(false);
      }
    }

    // Only run when user is loaded
    if (user) {
      loadFormConfigAndProfile();
    }
  }, [user]);

  const handleFormChange = (newFormData) => {
    console.log("Form data changed:", newFormData);
    setForm(newFormData);
  };

  // Debug: Log form state changes
  useEffect(() => {
    console.log("Current form state:", form);
  }, [form]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!user?.id) {
      setError("You must be signed in to submit the intake form");
      setLoading(false);
      return;
    }

    // Process form data based on field types
    const responses = {};

    if (formConfig?.fields) {
      formConfig.fields.forEach((field) => {
        const value = form[field.id];

        if (value !== undefined && value !== null && value !== "") {
          switch (field.type) {
            case "number":
              responses[field.id] = Number(value);
              break;
            case "checkbox":
            case "multi_select":
              responses[field.id] = Array.isArray(value) ? value : [];
              break;
            case "textarea":
              // Handle comma-separated values for skills and interests
              if (field.id === "current_skills" || field.id === "interests") {
                responses[field.id] = value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);
              } else {
                responses[field.id] = value;
              }
              break;
            default:
              responses[field.id] = value;
          }
        } else {
          responses[field.id] = null;
        }
      });
    }

    // Generate student ID if this is a new student
    const generateStudentId = () => {
      const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
      const random = Math.floor(Math.random() * 100)
        .toString()
        .padStart(2, "0");
      return `STU${timestamp}${random}`;
    };

    const payload = {
      user_id: user.id,
      name: form.name || null,
      email: form.email || null,
      student_id: isEditing ? undefined : generateStudentId(), // Only set for new students
      grade: form.education_level || null, // Map education_level to grade
      tier: null, // Will be assigned by admin later
      responses,
      updated_at: new Date().toISOString(),
    };

    try {
      console.log("Submitting payload:", payload);
      console.log("Is editing:", isEditing);

      let result;
      if (isEditing) {
        // Update existing record
        console.log("Updating record for user_id:", user.id);
        result = await supabase
          .from(SUPABASE_TABLE)
          .update(payload)
          .eq("user_id", user.id);
        console.log("Update result:", result);
      } else {
        // Insert new record
        console.log("Inserting new record");
        result = await supabase.from(SUPABASE_TABLE).insert(payload);
        console.log("Insert result:", result);
      }

      if (result.error) {
        console.error("Database operation error:", result.error);
        throw result.error;
      }

      console.log("Database operation successful");

      setSuccess(
        isEditing
          ? "Profile updated successfully!"
          : "Profile created successfully!"
      );
      setIsEditing(true);

      // Redirect to assignment page after a brief delay for new users
      // or stay on profile page for existing users who are editing
      setTimeout(() => {
        if (isEditing) {
          navigate("/profile");
        } else {
          navigate("/assignment");
        }
      }, 1500);
    } catch (err) {
      setError(err?.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (formConfig?.fields) {
      const resetForm = {};
      formConfig.fields.forEach((field) => {
        resetForm[field.id] = "";
      });
      setForm(resetForm);
    }
  };

  if (loadingProfile) {
    return (
      <div className="text-white">
        <div className="card">
          <p className="text-white/70">Loading intake form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          {isEditing ? "Edit Profile" : "Student Intake"}
        </h2>
        <p className="text-white/70 text-sm">
          {isEditing
            ? "Update your profile information below."
            : "Tell us about yourself so we can assess your Seed → Tree → Sky tier."}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-400/30 bg-red-500/15 p-3 text-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-md border border-green-400/30 bg-green-500/15 p-3 text-green-200">
          {success}
        </div>
      )}

      <div className="card">
        <div className="toolbar mb-4">
          <div>
            <h3 className="text-lg font-semibold">
              {formConfig?.name ||
                (isEditing ? "Update Your Information" : "Profile Intake")}
            </h3>
          </div>
          {formConfig?.description && (
            <div className="text-sm text-white/70 mt-1">
              {formConfig.description}
            </div>
          )}
        </div>

        <DynamicForm
          config={formConfig}
          formData={form}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          onReset={handleReset}
          loading={loading}
          submitButtonText={isEditing ? "Update Profile" : "Submit"}
          resetButtonText="Reset"
        />
      </div>
    </div>
  );
}

// Wrap the Intake component with BackgroundSelectionWrapper
const IntakeWithBackground = () => {
  return (
    <BackgroundSelectionWrapper>
      <Intake />
    </BackgroundSelectionWrapper>
  );
};

export default IntakeWithBackground;
