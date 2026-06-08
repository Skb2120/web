import { BriefcaseBusiness, Cpu, Edit3, FolderKanban, IndianRupee, MessageSquare, MessagesSquare, Target, Trash2, TrendingUp } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import IconButton from '../../components/ui/IconButton'
import { deleteRow, listRows, upsertRow } from '../../lib/portfolioApi'

const conversionStatuses = ['pending', 'working', 'completed']

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ skills: 0, projects: 0, services: 0, messages: 0, chat_leads: 0 })
  const [conversions, setConversions] = useState([])
  const [editingConversion, setEditingConversion] = useState(null)
  const [conversion, setConversion] = useState({ leadName: '', projectTitle: '', value: '', status: 'pending' })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const tables = ['skills', 'projects', 'services', 'messages', 'chat_leads', 'lead_conversions']
      const rows = await Promise.all(tables.map((table) => listRows(table)))
      setCounts(Object.fromEntries(tables.slice(0, 5).map((table, index) => [table, rows[index].length])))
      setConversions(rows[5])
    }
    load()
  }, [])

  async function saveConversion(event) {
    event.preventDefault()
    const savedConversion = await upsertRow('lead_conversions', {
      id: editingConversion?.id,
      lead_name: conversion.leadName,
      project_title: conversion.projectTitle,
      value: Number(conversion.value || 0),
      status: conversion.status,
    })
    await upsertRow('projects', {
      id: editingConversion?.project_id,
      title: conversion.projectTitle,
      description: `Converted from lead: ${conversion.leadName}`,
      techStack: ['Lead Conversion'],
      imageURL: '',
      projectURL: '#contact',
      githubURL: '',
      status: conversion.status,
    })
    setConversions((current) => {
      const exists = current.some((item) => item.id === savedConversion.id)
      return exists ? current.map((item) => (item.id === savedConversion.id ? savedConversion : item)) : [savedConversion, ...current]
    })
    if (!editingConversion) setCounts((current) => ({ ...current, projects: current.projects + 1 }))
    setSaved(true)
    setEditingConversion(null)
    setConversion({ leadName: '', projectTitle: '', value: '', status: 'pending' })
  }

  function editConversion(item) {
    setSaved(false)
    setEditingConversion(item)
    setConversion({
      leadName: item.lead_name || '',
      projectTitle: item.project_title || '',
      value: String(item.value ?? ''),
      status: item.status || 'pending',
    })
  }

  async function removeConversion(item) {
    await deleteRow('lead_conversions', item.id)
    setConversions((current) => current.filter((entry) => entry.id !== item.id))
  }

  function resetConversionForm() {
    setEditingConversion(null)
    setConversion({ leadName: '', projectTitle: '', value: '', status: 'pending' })
    setSaved(false)
  }

  const stats = [
    ['Skills', counts.skills, Cpu],
    ['Projects', counts.projects, FolderKanban],
    ['Services', counts.services, BriefcaseBusiness],
    ['Messages', counts.messages, MessageSquare],
    ['Chat Leads', counts.chat_leads, MessagesSquare],
  ]
  const totalLeads = counts.messages + counts.chat_leads
  const convertedCount = conversions.filter((item) => item.status === 'completed').length
  const activeConversionCount = conversions.length
  const conversionRate = totalLeads ? Math.round((convertedCount / totalLeads) * 100) : 0
  const totalValue = conversions.reduce((sum, item) => sum + Number(item.value || 0), 0)
  const maxStat = Math.max(...stats.map(([, value]) => value), 1)
  const chartRows = stats.map(([label, value, Icon]) => ({ label, value, Icon, width: `${Math.max(8, (value / maxStat) * 100)}%` }))
  const funnel = [
    { label: 'Total leads', value: totalLeads, width: '100%' },
    { label: 'Completed', value: convertedCount, width: `${Math.max(8, conversionRate)}%` },
    { label: 'Projects', value: counts.projects, width: `${Math.max(8, Math.min(100, (counts.projects / Math.max(totalLeads, 1)) * 100))}%` },
  ]

  const recentConversions = useMemo(() => conversions.slice(0, 8), [conversions])

  return (
    <div className="admin-page-motion">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Operations Overview</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Dashboard</h2>
        </div>
        <div className="rounded-lg border border-cyan-300/18 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
          Conversion rate <span className="font-semibold text-white">{conversionRate}%</span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(([label, value, Icon]) => (
          <article key={label} className="admin-animated-card glass-panel rounded-lg p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-cyan-100/68">{label}</p>
              <Icon className="text-emerald-200" size={20} />
            </div>
            <p className="mt-4 text-4xl font-semibold text-white">{value}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="admin-animated-card glass-panel rounded-lg p-5">
          <div className="flex items-center gap-3">
            <Target className="text-cyan-200" />
            <h3 className="text-xl font-semibold text-white">Pipeline Chart</h3>
          </div>
          <div className="mt-5 grid gap-4">
            {chartRows.map(({ label, value, Icon, width }) => (
              <div key={label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-2 text-cyan-100/76"><Icon size={16} />{label}</span>
                  <span className="font-semibold text-white">{value}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-900/85">
                  <div className="admin-chart-bar h-full rounded-full" style={{ width }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-animated-card glass-panel rounded-lg p-5">
          <div className="flex items-center gap-3">
            <IndianRupee className="text-emerald-200" />
            <h3 className="text-xl font-semibold text-white">Conversion Value</h3>
          </div>
          <p className="mt-5 text-4xl font-semibold text-white">₹{totalValue.toLocaleString('en-IN')}</p>
          <p className="mt-2 text-sm text-cyan-100/62">{activeConversionCount} tracked conversion{activeConversionCount === 1 ? '' : 's'}, {convertedCount} completed</p>
          <div className="mt-6 grid gap-3">
            {funnel.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex justify-between text-xs text-cyan-100/68">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-900">
                  <div className="admin-funnel-bar h-full rounded-full" style={{ width: item.width }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="admin-animated-card glass-panel mt-6 rounded-lg p-5">
        <div className="flex items-center gap-3">
          <TrendingUp className="text-emerald-200" />
          <h3 className="text-xl font-semibold text-white">{editingConversion ? 'Edit Project Conversion' : 'Lead to Project Conversion'}</h3>
        </div>
        <form className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5" onSubmit={saveConversion}>
          <input required placeholder="Lead name" value={conversion.leadName} onChange={(event) => setConversion((current) => ({ ...current, leadName: event.target.value }))} className="rounded-lg border border-cyan-300/18 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-emerald-300/70" />
          <input required placeholder="Project title" value={conversion.projectTitle} onChange={(event) => setConversion((current) => ({ ...current, projectTitle: event.target.value }))} className="rounded-lg border border-cyan-300/18 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-emerald-300/70" />
          <input type="number" placeholder="Value" value={conversion.value} onChange={(event) => setConversion((current) => ({ ...current, value: event.target.value }))} className="rounded-lg border border-cyan-300/18 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-emerald-300/70" />
          <select value={conversion.status} onChange={(event) => setConversion((current) => ({ ...current, status: event.target.value }))} className="rounded-lg border border-cyan-300/18 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-emerald-300/70">
            {conversionStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <button className="rounded-lg bg-emerald-300 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-300">{editingConversion ? 'Update' : 'Track'}</button>
        </form>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {editingConversion && <button type="button" className="rounded-lg border border-cyan-300/25 px-4 py-2 text-sm text-cyan-100 hover:bg-cyan-300/10" onClick={resetConversionForm}>Cancel edit</button>}
          {saved && <p className="text-sm text-emerald-200">Conversion saved.</p>}
        </div>
      </section>

      <section className="admin-animated-card mt-6 overflow-hidden rounded-lg border border-cyan-300/12">
        <div className="flex flex-col gap-2 border-b border-cyan-300/10 bg-slate-900/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <h3 className="text-lg font-semibold text-white">Converted Projects</h3>
          <span className="text-sm text-cyan-100/62">{activeConversionCount} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead className="bg-slate-950/70 text-cyan-100/72">
              <tr>
                {['Lead', 'Project', 'Value', 'Status', 'Date', 'Actions'].map((head) => <th key={head} className="px-5 py-3 font-medium">{head}</th>)}
              </tr>
            </thead>
            <tbody>
              {recentConversions.map((item) => (
                <tr key={item.id} className="admin-table-row border-t border-cyan-300/10">
                  <td className="px-5 py-4 text-white">{item.lead_name}</td>
                  <td className="px-5 py-4 text-cyan-50/78">{item.project_title}</td>
                  <td className="px-5 py-4 text-emerald-200">₹{Number(item.value || 0).toLocaleString('en-IN')}</td>
                  <td className="px-5 py-4"><span className={`conversion-status conversion-status-${item.status || 'pending'}`}>{item.status || 'pending'}</span></td>
                  <td className="px-5 py-4 text-cyan-100/58">{item.created_at ? new Date(item.created_at).toLocaleString() : 'Just now'}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <IconButton icon={Edit3} label="Edit conversion" onClick={() => editConversion(item)} />
                      <IconButton icon={Trash2} label="Delete conversion" onClick={() => removeConversion(item)} />
                    </div>
                  </td>
                </tr>
              ))}
              {!recentConversions.length && (
                <tr>
                  <td className="px-5 py-8 text-cyan-100/58" colSpan="6">No converted projects yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
