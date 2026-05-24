import * as Icons from 'lucide-react'

export default function SkillCard({ skill }) {
  const Icon = Icons[skill.icon] ?? Icons.Cpu

  return (
    <article className="glass-panel group rounded-lg p-5 transition duration-300 hover:-translate-y-1 hover:border-emerald-300/45 hover:shadow-[0_0_42px_rgba(16,185,129,.18)]">
      <div className="flex items-center justify-between">
        <div className="grid h-12 w-12 place-items-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-200 transition group-hover:rotate-6 group-hover:text-emerald-200">
          <Icon size={22} />
        </div>
        <span className="text-sm font-semibold text-emerald-200">{skill.level}%</span>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-white">{skill.name}</h3>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 shadow-[0_0_18px_rgba(45,212,191,.5)]" style={{ width: `${skill.level}%` }} />
      </div>
    </article>
  )
}
