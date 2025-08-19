import React, { useEffect, useMemo, useState } from 'react'
import { supabase, SUPABASE_TABLE } from '../lib/supabaseClient'

const EmptyState = ({ onAdd }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center text-white">
    <h2 className="text-2xl font-semibold">No records yet</h2>
    <p className="text-white/70 mt-2">Add your first student to get started.</p>
    <button
      onClick={onAdd}
      className="mt-6 inline-flex items-center rounded-md bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
    >
      Add Student
    </button>
  </div>
)

function AdminLogin({ onSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function submit(e) {
    e.preventDefault()
    setError('')
    if (username === 'admin' && password === 'admin123') {
      onSuccess()
    } else {
      setError('Invalid credentials')
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-white/20 bg-white/10 p-4 space-y-3">
      {error && (
        <div className="rounded-md border border-red-400/30 bg-red-500/15 p-2 text-red-200 text-sm">{error}</div>
      )}
      <div>
        <label className="block text-sm text-white/80">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
          placeholder="admin"
        />
      </div>
      <div>
        <label className="block text-sm text-white/80">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
          placeholder="admin123"
        />
      </div>
      <div className="flex items-center justify-end gap-2">
        <button type="submit" className="rounded-md bg-orange-500 px-4 py-2 text-sm text-white hover:bg-orange-600">Login</button>
      </div>
    </form>
  )
}

const initialForm = {
  id: '',
  user_id: '',
  name: '',
  email: '',
  student_id: '',
  grade: '',
  tier: '',
  // Responses fields
  age: '',
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

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('is_admin') === '1')
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(initialForm)
  const [isEditing, setIsEditing] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return students
    return students.filter((s) =>
      [s.name, s.grade, s.student_id, s.email]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    )
  }, [students, search])

  async function fetchStudents() {
    setLoading(true)
    setError('')
    const { data, error: err } = await supabase
      .from(SUPABASE_TABLE)
      .select('*')
      .order('created_at', { ascending: false })
    if (err) setError(err.message)
    setStudents(data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (isAdmin) {
      fetchStudents()
    }
  }, [isAdmin])

  function openAdd() {
    setForm(initialForm)
    setIsEditing(false)
    setDrawerOpen(true)
  }

  function openEdit(s) {
    const responses = s.responses || {}
    setForm({
      id: s.id,
      user_id: s.user_id || '',
      name: s.name || '',
      email: s.email || '',
      student_id: s.student_id || '',
      grade: s.grade || '',
      tier: s.tier || '',
      // Extract responses fields
      age: responses.age || '',
      phone: responses.phone || '',
      education_level: responses.education_level || '',
      field_of_study: responses.field_of_study || '',
      current_skills: responses.current_skills?.join(', ') || '',
      interests: responses.interests?.join(', ') || '',
      goals: responses.goals || '',
      preferred_learning_style: responses.preferred_learning_style || '',
      availability_per_week_hours: responses.availability_per_week_hours || '',
      experience_years: responses.experience_years || '',
    })
    setIsEditing(true)
    setDrawerOpen(true)
  }

  function onChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload = {
      user_id: form.user_id || null,
      name: form.name || null,
      email: form.email || null,
      student_id: form.student_id || null,
      grade: form.grade || null,
      tier: form.tier || null,
      responses: {
        age: form.age ? Number(form.age) : null,
        phone: form.phone || null,
        education_level: form.education_level || null,
        field_of_study: form.field_of_study || null,
        current_skills: form.current_skills?.split(',').map((s) => s.trim()).filter(Boolean) || [],
        interests: form.interests?.split(',').map((s) => s.trim()).filter(Boolean) || [],
        goals: form.goals || null,
        preferred_learning_style: form.preferred_learning_style || null,
        availability_per_week_hours: form.availability_per_week_hours ? Number(form.availability_per_week_hours) : null,
        experience_years: form.experience_years ? Number(form.experience_years) : null,
      },
      updated_at: new Date().toISOString()
    }

    const query = supabase.from(SUPABASE_TABLE)

    const { error: err } = isEditing
      ? await query.update(payload).eq('id', form.id)
      : await query.insert(payload)

    if (err) setError(err.message)
    setLoading(false)
    if (!err) {
      setDrawerOpen(false)
      setForm(initialForm)
      fetchStudents()
    }
  }

  async function onDelete(id) {
    if (!confirm('Delete this record?')) return
    setLoading(true)
    const { error: err } = await supabase.from(SUPABASE_TABLE).delete().eq('id', id)
    if (err) setError(err.message)
    setLoading(false)
    if (!err) fetchStudents()
  }

  if (!isAdmin) {
    return (
      <div className="max-w-sm mx-auto text-white">
        <h2 className="text-lg font-semibold mb-3">Admin Login</h2>
        <AdminLogin onSuccess={() => { sessionStorage.setItem('is_admin', '1'); setIsAdmin(true) }} />
      </div>
    )
  }

  return (
    <div>
      <div className="toolbar mb-2">
        <h2 className="text-xl font-semibold">Admin Panel</h2>
        <div className="flex items-center gap-2">
          <button onClick={fetchStudents} className="btn">Refresh</button>
          <button onClick={openAdd} className="btn btn-primary">Add</button>
        </div>
      </div>
      <div className="mb-2 text-sm text-white/70">View and manage student submissions stored in Supabase.</div>

      <div className="mb-4 flex items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, grade, id, email"
          aria-label="Search"
          className="input sm:w-72"
        />
        <button
          onClick={openAdd}
          className="inline-flex items-center rounded-md bg-orange-500 px-3 py-2 text-white text-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          Add
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-400/30 bg-red-500/15 p-3 text-red-200">
          {error}
        </div>
      )}

      {loading && students.length === 0 ? (
        <div className="py-10 text-white/70">Loading...</div>
      ) : students.length === 0 ? (
        <EmptyState onAdd={openAdd} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead className="bg-white/10">
              <tr>
                <th className="px-3 py-2 sm:px-4 sm:py-3 font-medium text-white/70">Name</th>
                <th className="hidden sm:table-cell px-3 py-2 sm:px-4 sm:py-3 font-medium text-white/70">Grade</th>
                <th className="hidden md:table-cell px-3 py-2 sm:px-4 sm:py-3 font-medium text-white/70">Student ID</th>
                <th className="hidden lg:table-cell px-3 py-2 sm:px-4 sm:py-3 font-medium text-white/70">Email</th>
                <th className="px-3 py-2 sm:px-4 sm:py-3 font-medium text-white/70">Tier</th>
                <th className="hidden lg:table-cell px-3 py-2 sm:px-4 sm:py-3 font-medium text-white/70">Created</th>
                <th className="px-3 py-2 sm:px-4 sm:py-3 font-medium text-white/70">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                  <td className="px-3 py-2 sm:px-4 sm:py-3">{s.name}</td>
                  <td className="hidden sm:table-cell px-3 py-2 sm:px-4 sm:py-3">{s.grade}</td>
                  <td className="hidden md:table-cell px-3 py-2 sm:px-4 sm:py-3">{s.student_id}</td>
                  <td className="hidden lg:table-cell px-3 py-2 sm:px-4 sm:py-3">{s.email}</td>
                  <td className="px-3 py-2 sm:px-4 sm:py-3">
                    {s.tier ? (
                      <span className={`rounded-md px-2 py-0.5 text-xs border ${s.tier === 'Seed' ? 'border-green-400/50 bg-green-500/10 text-green-200' : s.tier === 'Tree' ? 'border-yellow-400/50 bg-yellow-500/10 text-yellow-200' : s.tier === 'Sky' ? 'border-blue-400/50 bg-blue-500/10 text-blue-200' : 'border-white/30 bg-white/10 text-white/80'}`}>
                        {s.tier}
                      </span>
                    ) : (
                      <span className="text-white/50 text-xs">—</span>
                    )}
                  </td>
                  <td className="hidden lg:table-cell px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap">
                    {s.created_at ? new Date(s.created_at).toLocaleString() : ''}
                  </td>
                  <td className="px-3 py-2 sm:px-4 sm:py-3">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        onClick={() => openEdit(s)}
                        className="btn px-3 py-1 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(s.id)}
                        className="btn px-3 py-1 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto bg-white/10 backdrop-blur-xl border-l border-white/20 shadow-xl text-white">
            <div className="flex items-center justify-between border-b border-white/20 p-4">
              <h2 className="text-lg font-semibold">
                {isEditing ? 'Edit Student' : 'Add Student'}
              </h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="rounded-md border border-white/30 px-2 py-1 text-sm hover:bg-white/10"
              >
                Close
              </button>
            </div>
            <form onSubmit={onSubmit} className="p-4 space-y-4">
              {/* Basic Information Section */}
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-sm font-medium text-white/80 mb-3">Basic Information</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/80">Name *</label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={onChange}
                        required
                        className="input"
                        placeholder="Full Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/80">Email</label>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={onChange}
                        className="input"
                        placeholder="student@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/80">Student ID</label>
                      <input
                        name="student_id"
                        value={form.student_id}
                        onChange={onChange}
                        className="input"
                        placeholder="STU001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/80">User ID</label>
                      <input
                        name="user_id"
                        value={form.user_id}
                        onChange={onChange}
                        className="input"
                        placeholder="Clerk User ID"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/80">Grade</label>
                      <input
                        name="grade"
                        value={form.grade}
                        onChange={onChange}
                        className="input"
                        placeholder="10th, 11th, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/80">Tier</label>
                      <select
                        name="tier"
                        value={form.tier}
                        onChange={onChange}
                        className="input"
                      >
                        <option value="">Select Tier</option>
                        <option value="Seed">Seed</option>
                        <option value="Tree">Tree</option>
                        <option value="Sky">Sky</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Information Section */}
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-sm font-medium text-white/80 mb-3">Profile Information</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/80">Age</label>
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
                    <div>
                      <label className="block text-sm text-white/80">Phone</label>
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
                      <label className="block text-sm text-white/80">Education Level</label>
                      <input
                        name="education_level"
                        value={form.education_level}
                        onChange={onChange}
                        className="input"
                        placeholder="High school, Undergraduate, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/80">Field of Study</label>
                      <input
                        name="field_of_study"
                        value={form.field_of_study}
                        onChange={onChange}
                        className="input"
                        placeholder="CS, Math, Humanities, etc."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Learning Profile Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-white/80">Learning Profile</h3>
                
                <div>
                  <label className="block text-sm text-white/80">Current Skills</label>
                  <div className="text-xs text-white/60 mb-1">Comma separated list</div>
                  <input
                    name="current_skills"
                    value={form.current_skills}
                    onChange={onChange}
                    className="input"
                    placeholder="JavaScript, Algebra, Writing"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/80">Interests</label>
                  <div className="text-xs text-white/60 mb-1">Comma separated list</div>
                  <input
                    name="interests"
                    value={form.interests}
                    onChange={onChange}
                    className="input"
                    placeholder="AI, Web dev, Logic"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/80">Goals</label>
                  <textarea
                    name="goals"
                    rows={3}
                    value={form.goals}
                    onChange={onChange}
                    className="textarea"
                    placeholder="What the student wants to achieve"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/80">Preferred Learning Style</label>
                    <input
                      name="preferred_learning_style"
                      value={form.preferred_learning_style}
                      onChange={onChange}
                      className="input"
                      placeholder="Video, Text, Interactive"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/80">Availability (hours/week)</label>
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
                  <label className="block text-sm text-white/80">Experience (years)</label>
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
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {isEditing ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
