import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase, SUPABASE_TABLE } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

const initial = {
  name: "",
  age: "",
  email: "",
  phone: "",
  education_level: "",
  field_of_study: "",
  current_skills: "",
  interests: "",
  goals: "",
  preferred_learning_style: "",
  availability_per_week_hours: "",
  experience_years: "",
};

export default function Intake() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Load existing profile data if available
  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) {
        setLoadingProfile(false);
        return;
      }

      try {
        const { data, error: err } = await supabase
          .from(SUPABASE_TABLE)
          .select("*")
          .eq("email", user.primaryEmailAddress?.emailAddress)
          .single();

        if (data && data.responses) {
          setIsEditing(true);
          setForm({
            name: data.name || "",
            age: data.responses.age || "",
            email: data.email || "",
            phone: data.responses.phone || "",
            education_level: data.responses.education_level || "",
            field_of_study: data.responses.field_of_study || "",
            current_skills: data.responses.current_skills?.join(", ") || "",
            interests: data.responses.interests?.join(", ") || "",
            goals: data.responses.goals || "",
            preferred_learning_style:
              data.responses.preferred_learning_style || "",
            availability_per_week_hours:
              data.responses.availability_per_week_hours || "",
            experience_years: data.responses.experience_years || "",
          });
        }
      } catch (err) {
        // No existing profile is fine
      } finally {
        setLoadingProfile(false);
      }
    }

    loadProfile();
  }, [user]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!user?.id) {
      setError("You must be signed in to submit the intake form");
      setLoading(false);
      return;
    }

    const payload = {
      name: form.name || null,
      email: form.email || user.primaryEmailAddress?.emailAddress || null,
      student_id: null,
      grade: null,
      tier: null, // backend can update later
      responses: {
        age: form.age ? Number(form.age) : null,
        phone: form.phone || null,
        education_level: form.education_level || null,
        field_of_study: form.field_of_study || null,
        current_skills:
          form.current_skills
            ?.split(",")
            .map((s) => s.trim())
            .filter(Boolean) || [],
        interests:
          form.interests
            ?.split(",")
            .map((s) => s.trim())
            .filter(Boolean) || [],
        goals: form.goals || null,
        preferred_learning_style: form.preferred_learning_style || null,
        availability_per_week_hours: form.availability_per_week_hours
          ? Number(form.availability_per_week_hours)
          : null,
        experience_years: form.experience_years
          ? Number(form.experience_years)
          : null,
      },
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
  }

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
              {isEditing ? "Update Your Information" : "Profile Intake"}
            </h3>
          </div>
          <div className="text-sm text-white/70">
            Fields marked with <span className="text-orange-300">*</span> are
            required
          </div>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">
                Full Name <span className="text-orange-300">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                required
                className="input"
                placeholder="e.g., Asha Gupta"
              />
            </div>
            <div>
              <label className="label">Age</label>

              <input
                name="age"
                type="number"
                min="5"
                max="100"
                value={form.age}
                onChange={onChange}
                className="input"
                placeholder="17"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                className="input"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="label">Phone</label>

              <input
                name="phone"
                value={form.phone}
                onChange={onChange}
                className="input"
                placeholder="999-000-1234"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Education level</label>
              <input
                name="education_level"
                placeholder="High school, Undergraduate, ..."
                value={form.education_level}
                onChange={onChange}
                className="input"
              />
            </div>
            <div>
              <label className="label">Field of study</label>
              <input
                name="field_of_study"
                placeholder="CS, Math, Humanities, ..."
                value={form.field_of_study}
                onChange={onChange}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Current skills (comma separated)</label>
            <div className="help">Example: JavaScript, Algebra, Writing</div>
            <input
              name="current_skills"
              placeholder="JavaScript, Algebra, Writing"
              value={form.current_skills}
              onChange={onChange}
              className="input"
            />
          </div>

          <div>
            <label className="label">Interests (comma separated)</label>
            <input
              name="interests"
              placeholder="AI, Web dev, Logic"
              value={form.interests}
              onChange={onChange}
              className="input"
            />
          </div>

          <div>
            <label className="label">Goals</label>
            <textarea
              name="goals"
              rows={3}
              placeholder="What do you want to achieve?"
              value={form.goals}
              onChange={onChange}
              className="textarea"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Preferred learning style</label>
              <input
                name="preferred_learning_style"
                placeholder="Video, Text, Interactive"
                value={form.preferred_learning_style}
                onChange={onChange}
                className="input"
              />
            </div>
            <div>
              <label className="label">Availability per week (hours)</label>
              <input
                name="availability_per_week_hours"
                type="number"
                min="0"
                value={form.availability_per_week_hours}
                onChange={onChange}
                className="input"
                placeholder="6"
              />
            </div>
          </div>

          <div>
            <label className="label">Prior experience (years)</label>
            <input
              name="experience_years"
              type="number"
              min="0"
              value={form.experience_years}
              onChange={onChange}
              className="input"
              placeholder="0"
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="reset"
              onClick={() => setForm(initial)}
              className="btn"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading
                ? isEditing
                  ? "Updating..."
                  : "Submitting..."
                : isEditing
                ? "Update Profile"
                : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
