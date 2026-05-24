import { BarChart3, BriefcaseBusiness, ClipboardCheck, Cpu, FolderKanban, LogOut, Menu, MessageSquare, MessagesSquare, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import IconButton from '../../components/ui/IconButton'
import { useAuth } from '../../state/useAuth'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: BarChart3, end: true },
  { to: '/admin/skills', label: 'Skills', icon: Cpu },
  { to: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { to: '/admin/services', label: 'Services', icon: BriefcaseBusiness },
  { to: '/admin/duty-exams', label: 'Duty Exams', icon: ClipboardCheck },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { to: '/admin/chat-leads', label: 'Chat Leads', icon: MessagesSquare },
]

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { signOut, demoMode } = useAuth()
  const navigate = useNavigate()

  async function logout() {
    await signOut()
    navigate('/')
  }

  const sidebar = (
    <aside className="admin-sidebar glass-panel flex h-full w-72 flex-col rounded-none border-y-0 border-l-0 px-4 py-5">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Admin</p>
        <h1 className="mt-2 text-xl font-semibold text-white">Lead Operations</h1>
        {demoMode && <p className="mt-2 text-xs text-cyan-100/58">Demo data mode</p>}
      </div>
      <nav className="grid gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setDrawerOpen(false)}
              className={({ isActive }) =>
                `admin-nav-item flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${isActive ? 'bg-cyan-300 text-slate-950' : 'text-cyan-100/76 hover:bg-cyan-300/10 hover:text-white'}`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
      <button className="mt-auto flex items-center gap-3 rounded-lg border border-red-300/25 px-3 py-3 text-sm text-red-100 hover:bg-red-400/10" onClick={logout}>
        <LogOut size={18} />
        Sign Out
      </button>
    </aside>
  )

  return (
    <div className="min-h-screen bg-slate-950 text-cyan-50">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">{sidebar}</div>
      <header className="admin-topbar sticky top-0 z-20 flex h-16 items-center justify-between border-b border-cyan-300/10 bg-slate-950/85 px-4 backdrop-blur-xl lg:ml-72">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Portfolio Control Plane</p>
        <IconButton className="lg:hidden" icon={drawerOpen ? X : Menu} label="Toggle sidebar" onClick={() => setDrawerOpen((value) => !value)} />
      </header>
      {drawerOpen && <div className="fixed inset-y-0 left-0 z-40 lg:hidden">{sidebar}</div>}
      <main className="admin-main px-4 py-6 lg:ml-72 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
