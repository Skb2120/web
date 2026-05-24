import { LockKeyhole } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/useAuth'

export default function AdminLogin() {
  const { isAdmin, signIn, demoMode } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: 'admin@example.com', password: 'admin123456' })
  const [error, setError] = useState('')

  if (isAdmin) return <Navigate to="/admin" replace />

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    try {
      await signIn(form.email, form.password)
      navigate('/admin')
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <main className="signal-grid grid min-h-screen place-items-center bg-slate-950 px-4 text-cyan-50">
      <form className="glass-panel w-full max-w-md rounded-lg p-6" onSubmit={handleSubmit}>
        <div className="grid h-12 w-12 place-items-center rounded-lg bg-cyan-300/10 text-cyan-200">
          <LockKeyhole />
        </div>
        <h1 className="mt-5 text-3xl font-semibold text-white">Admin Console</h1>
        <p className="mt-2 text-sm leading-6 text-cyan-100/68">
          {demoMode ? 'Demo mode is active until Supabase env vars are configured.' : 'Sign in with Supabase Auth admin credentials.'}
        </p>
        <label className="mt-6 grid gap-2 text-sm text-cyan-100/78">
          Email
          <input className="rounded-lg border border-cyan-300/18 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-emerald-300/70" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
        </label>
        <label className="mt-4 grid gap-2 text-sm text-cyan-100/78">
          Password
          <input type="password" className="rounded-lg border border-cyan-300/18 bg-slate-950/70 px-3 py-3 text-white outline-none focus:border-emerald-300/70" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
        </label>
        {error && <p className="mt-4 rounded-lg border border-red-300/30 bg-red-400/10 px-3 py-2 text-sm text-red-100">{error}</p>}
        <button className="mt-6 w-full rounded-lg bg-cyan-300 px-4 py-3 font-semibold text-slate-950 hover:bg-emerald-300">Enter Dashboard</button>
      </form>
    </main>
  )
}
