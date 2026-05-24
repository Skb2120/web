import { useState } from 'react'
import { CircuitBoard, Menu, Shield, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import IconButton from './ui/IconButton'

const links = [
  ['About', '#about'],
  ['Skills', '#skills'],
  ['Projects', '#projects'],
  ['Services', '#services'],
  ['Contact', '#contact'],
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="nav-motion fixed inset-x-0 top-0 z-50 border-b border-cyan-300/10 bg-slate-950/58 backdrop-blur-xl">
      <nav className="relative z-10 mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
        <a href="#hero" className="nav-brand flex items-center gap-3 text-sm font-semibold text-white">
          <span className="nav-logo grid h-10 w-10 place-items-center rounded-lg border border-emerald-300/30 bg-emerald-300/10 text-emerald-200">
            <CircuitBoard size={20} />
          </span>
          <span>Sarathkumar B</span>
        </a>

        <div className="hidden items-center gap-6 md:flex">
          {links.map(([label, href]) => (
            <a key={href} className="nav-link-3d text-sm text-cyan-100/72 transition hover:text-emerald-200" href={href}>
              {label}
            </a>
          ))}
          <Link
            to="/admin"
            className="nav-admin-3d inline-flex items-center gap-2 rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-emerald-300/50 hover:text-emerald-200"
          >
            <Shield size={16} />
            Admin
          </Link>
        </div>

        <IconButton className="md:hidden" icon={open ? X : Menu} label="Toggle navigation" onClick={() => setOpen((value) => !value)} />
      </nav>

      {open && (
        <div className="nav-mobile-panel border-t border-cyan-300/10 px-4 py-4 md:hidden">
          <div className="grid gap-3">
            {links.map(([label, href]) => (
              <a key={href} className="nav-mobile-link rounded-lg px-3 py-2 text-cyan-100/78 hover:bg-cyan-300/10" href={href} onClick={() => setOpen(false)}>
                {label}
              </a>
            ))}
            <Link className="nav-mobile-link rounded-lg px-3 py-2 text-emerald-200 hover:bg-emerald-300/10" to="/admin" onClick={() => setOpen(false)}>
              Admin Console
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
