import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase, SUPABASE_TABLE } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import DynamicForm from "../components/DynamicForm";
import { FormConfigService } from "../lib/formConfigService";

export default function Intake() {
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
        // Load form configuration
        const config = await FormConfigService.getActiveFormConfig();
        setFormConfig(config);

        // Get user's email for debugging and initialization
        const userEmail = user?.primaryEmailAddress?.emailAddress;
        console.log("User email from Clerk:", userEmail);

        // Initialize form with empty values based on config
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
        setForm(initialForm);

        // Load existing profile if user is logged in
        if (userEmail) {
          const { data } = await supabase
            .from(SUPABASE_TABLE)
            .select("*")
            .eq("email", userEmail)
            .single();

          if (data && data.responses) {
            setIsEditing(true);
            const existingForm = {
              ...data.responses,
              name: data.name || user?.fullName || "",
              email: userEmail, // Always use current user's email (override any stored null/empty email)
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
            setForm(existingForm);
          } else {
            // Initialize form with user's basic info for new profiles
            const newProfileForm = {
              name: user?.fullName || "",
              email: userEmail || "",
            };
            console.log("Setting new profile form data:", newProfileForm);
            setForm(newProfileForm);
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

    const payload = {
      name: form.name || null,
      email: form.email || null,
      student_id: null,
      grade: null,
      tier: null, // backend can update later
      responses,
      updated_at: new Date().toISOString(),
    };

    try {
      const { error: err } = await supabase
        .from(SUPABASE_TABLE)
        .upsert(payload, { onConflict: "email" });

      if (err) throw err;

      setSuccess(
        isEditing
          ? "Profile updated successfully!"
          : "Profile created successfully!"
      );
      setIsEditing(true);

      // Redirect to profile page after a brief delay
      setTimeout(() => {
        navigate("/profile");
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
