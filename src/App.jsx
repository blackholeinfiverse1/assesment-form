import React, { useEffect, useMemo, useState } from 'react'
import { supabase, SUPABASE_TABLE } from './lib/supabaseClient'

const EmptyState = ({ onAdd }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <h2 className="text-xl font-semibold text-gray-800">No records yet</h2>
    <p className="text-gray-500 mt-1">Add your first student to get started.</p>
    <button
      onClick={onAdd}
      className="mt-6 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      Add Student
    </button>
  </div>
)

const initialForm = {
  id: '',
  name: '',
  grade: '',
  student_id: '',
  email: '',
  responses: '{}',
}

export default function App() {
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
    fetchStudents()
  }, [])

  function openAdd() {
    setForm(initialForm)
    setIsEditing(false)
    setDrawerOpen(true)
  }

  function openEdit(s) {
    setForm({
      id: s.id,
      name: s.name ?? '',
      grade: s.grade ?? '',
      student_id: s.student_id ?? '',
      email: s.email ?? '',
      responses: JSON.stringify(s.responses ?? {}, null, 2),
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
    let parsedResponses = null
    if (form.responses && form.responses.trim()) {
      try {
        parsedResponses = JSON.parse(form.responses)
      } catch {
        setLoading(false)
        setError('Responses must be valid JSON')
        return
      }
    }

    const payload = {
      name: form.name || null,
      grade: form.grade || null,
      student_id: form.student_id || null,
      email: form.email || null,
      responses: parsedResponses,
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold">Supabase Students</h1>
          <div className="flex items-center gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, grade, id, email"
              className="w-64 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={openAdd}
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-white text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Add
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
            {error}
          </div>
        )}

        {loading && students.length === 0 ? (
          <div className="py-10 text-gray-500">Loading...</div>
        ) : students.length === 0 ? (
          <EmptyState onAdd={openAdd} />
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">Name</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Grade</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Student ID</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Email</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Created</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="px-4 py-3">{s.name}</td>
                    <td className="px-4 py-3">{s.grade}</td>
                    <td className="px-4 py-3">{s.student_id}</td>
                    <td className="px-4 py-3">{s.email}</td>
                    <td className="px-4 py-3">
                      {s.created_at ? new Date(s.created_at).toLocaleString() : ''}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(s)}
                          className="rounded-md border px-3 py-1 text-xs hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(s.id)}
                          className="rounded-md border border-red-300 bg-red-50 px-3 py-1 text-xs text-red-700 hover:bg-red-100"
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
      </main>

      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-semibold">
                {isEditing ? 'Edit Student' : 'Add Student'}
              </h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="rounded-md border px-2 py-1 text-sm"
              >
                Close
              </button>
            </div>
            <form onSubmit={onSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-600">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600">Grade</label>
                  <input
                    name="grade"
                    value={form.grade}
                    onChange={onChange}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Student ID</label>
                  <input
                    name="student_id"
                    value={form.student_id}
                    onChange={onChange}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm text-gray-600">Responses (JSON)</label>
                  <span className="text-xs text-gray-400">Optional</span>
                </div>
                <textarea
                  name="responses"
                  rows={6}
                  spellCheck={false}
                  value={form.responses}
                  onChange={onChange}
                  className="mt-1 w-full rounded-md border px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
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
