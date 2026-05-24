import { CircuitBoard, Code2, Cpu, Network } from 'lucide-react'

const domainIcons = {
  IoT: Network,
  'Embedded Systems': Cpu,
  'PCB Design': CircuitBoard,
  'Web Development': Code2,
}

export default function ServiceCard({ service }) {
  const Icon = domainIcons[service.domain] ?? Cpu
  const techStack = Array.isArray(service.techStack) ? service.techStack : String(service.techStack ?? '').split(',').filter(Boolean)

  return (
    <article className="glass-panel rounded-lg p-5 transition hover:-translate-y-1 hover:border-cyan-200/45">
      <div className="flex items-center justify-between gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-emerald-300/25 bg-emerald-300/10 text-emerald-200">
          <Icon size={22} />
        </div>
        <span className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-cyan-200">{service.domain}</span>
      </div>
      <h3 className="mt-5 text-xl font-semibold text-white">{service.title}</h3>
      <p className="mt-3 text-sm leading-7 text-cyan-50/72">{service.description}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {techStack.map((tech) => (
          <span key={tech} className="rounded-lg border border-cyan-300/20 px-2.5 py-1 text-xs text-cyan-100/85">
            {tech}
          </span>
        ))}
      </div>
    </article>
  )
}
