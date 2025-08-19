import React, { useState } from 'react'

// Intake form posts to your backend. Configure the base URL via VITE_API_BASE_URL
const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

const initial = {
  name: '',
  age: '',
  email: '',
  phone: '',
  education_level: '',
  field_of_study: '',
  current_skills: '',
  interests: '',
  goals: '',
  preferred_learning_style: '',
  availability_per_week_hours: '',
  experience_years: '',
}

export default function Intake() {
  const [form, setForm] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function onChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Construct payload to match backend expectations
    const payload = {
      name: form.name,
      age: form.age ? Number(form.age) : null,
      email: form.email || null,
      phone: form.phone || null,
      education_level: form.education_level || null,
      field_of_study: form.field_of_study || null,
      current_skills: form.current_skills?.split(',').map((s) => s.trim()).filter(Boolean) || [],
      interests: form.interests?.split(',').map((s) => s.trim()).filter(Boolean) || [],
      goals: form.goals || null,
      preferred_learning_style: form.preferred_learning_style || null,
      availability_per_week_hours: form.availability_per_week_hours ? Number(form.availability_per_week_hours) : null,
      experience_years: form.experience_years ? Number(form.experience_years) : null,
    }

    try {
      const res = await fetch(`${API_BASE}/intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Request failed with ${res.status}`)
      }
      const data = await res.json().catch(() => ({}))
      setSuccess('Submitted successfully!')
      // If backend returns derived values (tier/seed-tree-sky), show a hint
      if (data?.tier) {
        setSuccess(`Submitted successfully! Assigned tier: ${data.tier}`)
      }
      setForm(initial)
    } catch (err) {
      setError(err?.message || 'Failed to submit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="text-white">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Student Intake</h2>
        <p className="text-white/70 text-sm">Tell us about yourself so we can assess your Seed → Tree → Sky tier.</p>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-400/30 bg-red-500/15 p-3 text-red-200">{error}</div>
      )}
      {success && (
        <div className="mb-4 rounded-md border border-green-400/30 bg-green-500/15 p-3 text-green-200">{success}</div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/80">Full Name</label>
            <input name="name" value={form.name} onChange={onChange} required className="mt-1 w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 text-sm placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400" />
          </div>
          <div>
            <label className="block text-sm text-white/80">Age</label>
            <input name="age" type="number" min="5" max="100" value={form.age} onChange={onChange} className="mt-1 w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 text-sm placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/80">Email</label>
            <input name="email" type="email" value={form.email} onChange={onChange} className="mt-1 w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 text-sm placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400" />
          </div>
          <div>
            <label className="block text-sm text-white/80">Phone</label>
            <input name="phone" value={form.phone} onChange={onChange} className="mt-1 w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 text-sm placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/80">Education level</label>
            <input name="education_level" placeholder="High school, Undergraduate, ..." value={form.education_level} onChange={onChange} className="mt-1 w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 text-sm placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400" />
          </div>
          <div>
            <label className="block text-sm text-white/80">Field of study</label>
            <input name="field_of_study" placeholder="CS, Math, Humanities, ..." value={form.field_of_study} onChange={onChange} className="mt-1 w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 text-sm placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-white/80">Current skills (comma separated)</label>
          <input name="current_skills" placeholder="JavaScript, Algebra, Writing" value={form.current_skills} onChange={onChange} className="mt-1 w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 text-sm placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400" />
        </div>

        <div>
          <label className="block text-sm text-white/80">Interests (comma separated)</label>
          <input name="interests" placeholder="AI, Web dev, Logic" value={form.interests} onChange={onChange} className="mt-1 w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 text-sm placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400" />
        </div>

        <div>
          <label className="block text-sm text-white/80">Goals</label>
          <textarea name="goals" rows={3} placeholder="What do you want to achieve?" value={form.goals} onChange={onChange} className="mt-1 w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 text-sm placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/80">Preferred learning style</label>
            <input name="preferred_learning_style" placeholder="Video, Text, Interactive" value={form.preferred_learning_style} onChange={onChange} className="mt-1 w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 text-sm placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400" />
          </div>
          <div>
            <label className="block text-sm text-white/80">Availability per week (hours)</label>
            <input name="availability_per_week_hours" type="number" min="0" value={form.availability_per_week_hours} onChange={onChange} className="mt-1 w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 text-sm placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-white/80">Prior experience (years)</label>
          <input name="experience_years" type="number" min="0" value={form.experience_years} onChange={onChange} className="mt-1 w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 text-sm placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400" />
        </div>

        <div className="flex items-center justify-end gap-2">
          <button type="reset" onClick={() => setForm(initial)} className="rounded-md border border-white/30 px-4 py-2 text-sm hover:bg-white/10">Reset</button>
          <button type="submit" disabled={loading} className="inline-flex items-center rounded-md bg-orange-500 px-4 py-2 text-white text-sm hover:bg-orange-600 disabled:opacity-60">
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  )
}

