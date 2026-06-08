import { Edit3, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import IconButton from '../../components/ui/IconButton'
import { deleteRow, listRows, uploadProjectImage, upsertRow } from '../../lib/portfolioApi'

const dutyRoleOptions = ['Invigilator', 'IT Manager', 'MAF', 'MOE', 'Lians Officers', 'Network Admin']
const paymentStatusOptions = ['pending', 'received']
const fieldLabels = {
  techStack: 'Tech Stack',
  projectURL: 'Project URL',
  githubURL: 'GitHub URL',
  exam_name: 'Name of Exam',
  college_name: 'College Name',
  payment_status: 'Payment Status',
}

function formatDateDDMMYYYY(value) {
  if (!value) return '-'
  const [year, month, day] = String(value).split('-')
  if (year && month && day) return `${day}/${month}/${year}`

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return String(value)
  return parsed.toLocaleDateString('en-GB')
}

function normalizeDutyRole(role) {
  return role === 'invigilator' ? 'Invigilator' : role
}

const configs = {
  skills: {
    title: 'Skills',
    empty: { name: '', level: 80, icon: 'Cpu' },
    fields: ['name', 'level', 'icon'],
  },
  projects: {
    title: 'Projects',
    empty: { title: '', description: '', techStack: '', imageURL: '', projectURL: '', githubURL: '', status: 'pending' },
    fields: ['title', 'description', 'techStack', 'status', 'projectURL', 'githubURL'],
  },
  services: {
    title: 'Services',
    empty: { title: '', description: '', techStack: '', domain: 'IoT' },
    fields: ['title', 'description', 'techStack', 'domain'],
  },
  duty_exams: {
    title: 'Duty Exams',
    empty: { date: '', exam_name: '', college_name: '', role: 'Invigilator', payment_status: 'pending' },
    fields: ['date', 'exam_name', 'college_name', 'role', 'payment_status'],
  },
}

export default function AdminResourcePage({ resource }) {
  const config = configs[resource]
  const [rows, setRows] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(config.empty)
  const [saving, setSaving] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [actionStatus, setActionStatus] = useState('')
  const [dutyExamFilters, setDutyExamFilters] = useState({ month: 'all', role: 'all' })
  const tableFields = resource === 'duty_exams' ? config.fields : config.fields.slice(0, 4)

  const normalizedRows = useMemo(
    () => rows.map((row) => ({
      ...row,
      role: resource === 'duty_exams' ? normalizeDutyRole(row.role) : row.role,
      techStack: Array.isArray(row.techStack) ? row.techStack.join(', ') : row.techStack,
    })),
    [resource, rows],
  )
  const dutyExamMonthOptions = useMemo(() => {
    if (resource !== 'duty_exams') return []

    return [...new Set(rows.map((row) => String(row.date || '').slice(0, 7)).filter(Boolean))].sort((a, b) => b.localeCompare(a))
  }, [resource, rows])
  const filteredRows = useMemo(() => {
    if (resource !== 'duty_exams') return normalizedRows

    return normalizedRows.filter((row) => {
      const monthMatch = dutyExamFilters.month === 'all' || String(row.date || '').startsWith(dutyExamFilters.month)
      const roleMatch = dutyExamFilters.role === 'all' || row.role === dutyExamFilters.role
      return monthMatch && roleMatch
    })
  }, [resource, normalizedRows, dutyExamFilters])
  const monthFilteredDutyExamRows = useMemo(() => {
    if (resource !== 'duty_exams') return []

    return normalizedRows.filter((row) => dutyExamFilters.month === 'all' || String(row.date || '').startsWith(dutyExamFilters.month))
  }, [resource, normalizedRows, dutyExamFilters.month])
  const dutyExamStats = useMemo(() => {
    if (resource !== 'duty_exams') return null

    const pending = filteredRows.filter((row) => row.payment_status === 'pending').length
    const received = filteredRows.filter((row) => row.payment_status === 'received').length
    const byRole = dutyRoleOptions.map((role) => ({
      role,
      count: monthFilteredDutyExamRows.filter((row) => row.role === role).length,
    }))

    return {
      total: filteredRows.length,
      allRecords: rows.length,
      monthTotal: monthFilteredDutyExamRows.length,
      pending,
      received,
      byRole,
    }
  }, [resource, filteredRows, monthFilteredDutyExamRows, rows.length])

  useEffect(() => {
    listRows(resource).then(setRows)
  }, [resource])

  function startEdit(row = null) {
    setEditing(row)
    setForm(row ? { ...config.empty, ...row, techStack: Array.isArray(row.techStack) ? row.techStack.join(', ') : row.techStack } : config.empty)
    setActionStatus('')
  }

  async function save(event) {
    event.preventDefault()
    setSaving(true)
    setActionStatus('')
    const payload = Object.fromEntries(config.fields.map((field) => [field, form[field]]))
    if (resource === 'projects') payload.imageURL = form.imageURL
    if (editing?.id) payload.id = editing.id
    if ('level' in payload) payload.level = Number(payload.level)
    if ('techStack' in payload) payload.techStack = String(payload.techStack).split(',').map((item) => item.trim()).filter(Boolean)
    if (resource === 'projects' && !payload.imageURL) {
      setSaving(false)
      setUploadStatus('Upload a project image before saving.')
      return
    }

    try {
      const saved = await upsertRow(resource, payload)
      setRows((current) => {
        const exists = current.some((row) => row.id === saved.id)
        return exists ? current.map((row) => (row.id === saved.id ? saved : row)) : [saved, ...current]
      })
      startEdit(null)
      setUploadStatus('')
      setActionStatus(editing ? 'Updated without refreshing the page.' : 'Created without refreshing the page.')
    } catch (error) {
      setActionStatus(error.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id) {
    setActionStatus('')
    try {
      await deleteRow(resource, id)
      setRows((current) => current.filter((row) => row.id !== id))
      setActionStatus('Deleted without refreshing the page.')
    } catch (error) {
      setActionStatus(error.message || 'Delete failed.')
    }
  }

  async function handleUpload(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setUploadStatus('Uploading image...')
    try {
      const publicUrl = await uploadProjectImage(file)
      if (publicUrl) {
        setForm((current) => ({ ...current, imageURL: publicUrl }))
        setUploadStatus('Image uploaded to Supabase Storage. Save the project to publish it.')
        return
      }
      setUploadStatus('Image upload failed. Check storage settings.')
    } catch (error) {
      setUploadStatus(error.message || 'Image upload failed. Check storage settings.')
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl sm:text-3xl font-semibold text-white">{config.title}</h2>
        <button type="button" className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-3 font-semibold text-slate-950 hover:bg-emerald-300" onClick={() => startEdit(null)}>
          <Plus size={18} />
          Add
        </button>
      </div>

      <form className="glass-panel mt-6 grid gap-4 rounded-lg p-4 sm:p-5 sm:grid-cols-2 lg:grid-cols-3" onSubmit={save}>
        {config.fields.map((field) => {
          const label = fieldLabels[field] ?? field
          const value = form[field] ?? ''
          const updateField = (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

          return (
            <label key={field} className="grid gap-2 text-sm text-cyan-100/76">
              {label}
              {field === 'description' ? (
                <textarea value={value} onChange={updateField} className="min-h-28 resize-none rounded-lg border border-cyan-300/18 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-emerald-300/70" />
              ) : field === 'date' ? (
                <input type="date" required value={value} onChange={updateField} className="rounded-lg border border-cyan-300/18 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-emerald-300/70" />
              ) : field === 'role' ? (
                <select required value={value} onChange={updateField} className="rounded-lg border border-cyan-300/18 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-emerald-300/70">
                  {dutyRoleOptions.map((option) => <option key={option}>{option}</option>)}
                </select>
              ) : field === 'payment_status' ? (
                <select required value={value} onChange={updateField} className="rounded-lg border border-cyan-300/18 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-emerald-300/70">
                  {paymentStatusOptions.map((option) => <option key={option}>{option}</option>)}
                </select>
              ) : (
                <input required={field === 'college_name'} value={value} onChange={updateField} className="rounded-lg border border-cyan-300/18 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-emerald-300/70" />
              )}
            </label>
          )
        })}
        {resource === 'projects' && (
          <div className="grid gap-2 text-sm text-cyan-100/76">
            <label className="grid gap-2">
              Upload image
              <input type="file" accept="image/*" onChange={handleUpload} className="rounded-lg border border-cyan-300/18 bg-slate-950/70 px-3 py-3 text-sm text-white" />
            </label>
            {uploadStatus && <p className="text-xs text-cyan-100/68">{uploadStatus}</p>}
            {form.imageURL && <img className="h-28 w-full rounded-lg object-cover" src={form.imageURL} alt="Project upload preview" />}
          </div>
        )}
        <div className="flex items-end gap-3">
          <button disabled={saving} className="rounded-lg bg-emerald-300 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
          {editing && <button type="button" className="rounded-lg border border-cyan-300/25 px-5 py-3 text-cyan-100 hover:bg-cyan-300/10" onClick={() => startEdit(null)}>Cancel</button>}
        </div>
      </form>
      {actionStatus && <p className="mt-3 text-sm text-emerald-200">{actionStatus}</p>}

      {resource === 'duty_exams' && dutyExamStats && (
        <section className="glass-panel mt-6 rounded-lg p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h3 className="text-lg font-semibold text-white">Overall Details</h3>
            <p className="text-xs text-cyan-100/65">Showing {dutyExamStats.total} of {dutyExamStats.allRecords} records</p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <label className="grid gap-2 text-sm text-cyan-100/76">
              Month
              <select
                value={dutyExamFilters.month}
                onChange={(event) => setDutyExamFilters((current) => ({ ...current, month: event.target.value }))}
                className="rounded-lg border border-cyan-300/18 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-emerald-300/70"
              >
                <option value="all">All Months</option>
                {dutyExamMonthOptions.map((month) => <option key={month} value={month}>{month}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm text-cyan-100/76">
              Role
              <select
                value={dutyExamFilters.role}
                onChange={(event) => setDutyExamFilters((current) => ({ ...current, role: event.target.value }))}
                className="rounded-lg border border-cyan-300/18 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-emerald-300/70"
              >
                <option value="all">All Roles</option>
                {dutyRoleOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <button
              type="button"
              onClick={() => setDutyExamFilters({ month: 'all', role: 'all' })}
              className="self-end rounded-lg border border-cyan-300/25 px-4 py-3 text-sm text-cyan-100 hover:bg-cyan-300/10"
            >
              Clear Filters
            </button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <article className="rounded-lg border border-cyan-300/18 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/62">Total Duties</p>
              <p className="mt-2 text-3xl font-semibold text-white">{dutyExamStats.total}</p>
            </article>
            <article className="rounded-lg border border-amber-300/25 bg-amber-300/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-amber-100/72">Payment Pending</p>
              <p className="mt-2 text-3xl font-semibold text-amber-100">{dutyExamStats.pending}</p>
            </article>
            <article className="rounded-lg border border-emerald-300/25 bg-emerald-300/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/72">Payment Received</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-100">{dutyExamStats.received}</p>
            </article>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            <button
              type="button"
              onClick={() => setDutyExamFilters((current) => ({ ...current, role: 'all' }))}
              className={dutyExamFilters.role === 'all'
                ? 'rounded-lg border border-emerald-300/45 bg-emerald-300/15 px-3 py-2 text-left text-sm text-emerald-100'
                : 'rounded-lg border border-cyan-300/15 bg-slate-950/65 px-3 py-2 text-left text-sm text-cyan-100/82 hover:bg-cyan-300/10'}
            >
              All Roles: <span className="font-semibold text-white">{dutyExamStats.monthTotal}</span>
            </button>
            {dutyExamStats.byRole.map((item) => (
              <button
                type="button"
                key={item.role}
                onClick={() => setDutyExamFilters((current) => ({ ...current, role: item.role }))}
                className={dutyExamFilters.role === item.role
                  ? 'rounded-lg border border-emerald-300/45 bg-emerald-300/15 px-3 py-2 text-left text-sm text-emerald-100'
                  : 'rounded-lg border border-cyan-300/15 bg-slate-950/65 px-3 py-2 text-left text-sm text-cyan-100/82 hover:bg-cyan-300/10'}
              >
                {item.role}: <span className="font-semibold text-white">{item.count}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="mt-6 hidden overflow-hidden rounded-lg border border-cyan-300/12 md:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-900 text-cyan-100/72">
            <tr>
              {tableFields.map((field) => <th key={field} className="px-4 py-3 font-medium">{fieldLabels[field] ?? field}</th>)}
              {resource === 'duty_exams' && <th className="px-4 py-3 font-medium">Created At</th>}
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id} className="border-t border-cyan-300/10">
                {tableFields.map((field) => (
                  <td key={field} className="max-w-xs px-4 py-3 text-cyan-50/78">
                    {field === 'payment_status' ? (
                      <span className={row[field] === 'received' ? 'rounded-lg border border-emerald-300/30 bg-emerald-300/10 px-2.5 py-1 text-emerald-100' : 'rounded-lg border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 text-amber-100'}>
                        {row[field] || 'pending'}
                      </span>
                    ) : field === 'date' ? (
                      formatDateDDMMYYYY(row[field])
                    ) : String(row[field] ?? '').slice(0, 90)}
                  </td>
                ))}
                {resource === 'duty_exams' && <td className="px-4 py-3 text-cyan-100/62">{row.created_at ? new Date(row.created_at).toLocaleString() : 'Just now'}</td>}
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <IconButton icon={Edit3} label="Edit row" onClick={() => startEdit(row)} />
                    <IconButton icon={Trash2} label="Delete row" onClick={() => remove(row.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-4 md:hidden">
        {filteredRows.map((row) => (
          <article key={row.id} className="glass-panel rounded-lg p-4">
            <h3 className="font-semibold text-white">{row.title || row.name || row.exam_name}</h3>
            <p className="mt-2 text-sm text-cyan-100/68">{row.description || row.techStack || row.domain || `${row.role || ''} ${row.payment_status || ''}`.trim()}</p>
            {resource === 'duty_exams' && (
              <div className="mt-3 grid gap-1 text-xs text-cyan-100/72">
                <p>Date: <span className="text-white">{formatDateDDMMYYYY(row.date)}</span></p>
                <p>College: <span className="text-white">{row.college_name || '-'}</span></p>
                <p>Role: <span className="text-white">{row.role || '-'}</span></p>
                <p>Payment: <span className="text-white">{row.payment_status || 'pending'}</span></p>
              </div>
            )}
            <div className="mt-4 flex gap-2">
              <IconButton icon={Edit3} label="Edit row" onClick={() => startEdit(row)} />
              <IconButton icon={Trash2} label="Delete row" onClick={() => remove(row.id)} />
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
