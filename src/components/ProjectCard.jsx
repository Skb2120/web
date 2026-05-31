import { ExternalLink, GitBranch } from 'lucide-react'
import { useState } from 'react'
import heroImage from '../assets/hero.png'

export default function ProjectCard({ project }) {
  const [flipped, setFlipped] = useState(false)
  const [failedImageURL, setFailedImageURL] = useState('')
  const techStack = Array.isArray(project.techStack) ? project.techStack : String(project.techStack ?? '').split(',').filter(Boolean)
  const projectImage = project.imageURL && failedImageURL !== project.imageURL ? project.imageURL : heroImage

  return (
    <article className={`flip-card h-[360px] ${flipped ? 'is-flipped' : ''}`} onClick={() => setFlipped((value) => !value)}>
      <div className="flip-card-inner relative h-full w-full">
        <div className="card-face glass-panel absolute inset-0 overflow-hidden rounded-lg">
          <img className="h-full w-full object-cover opacity-85" src={projectImage} alt={project.title} loading="lazy" onError={() => setFailedImageURL(project.imageURL)} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
          <div className="absolute bottom-0 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Project</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">{project.title}</h3>
          </div>
        </div>

        <div className="card-face card-back glass-panel absolute inset-0 flex flex-col rounded-lg p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">System Detail</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">{project.title}</h3>
          <p className="mt-3 flex-1 text-sm leading-7 text-cyan-50/75">{project.description}</p>
          <div className="mb-5 flex flex-wrap gap-2">
            {techStack.map((tech) => (
              <span key={tech} className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-xs text-cyan-100">
                {tech}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <a className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-300 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300" href={project.projectURL || '#contact'} onClick={(event) => event.stopPropagation()}>
              <ExternalLink size={16} />
              View
            </a>
            <a className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-300/30 px-3 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-300/10" href={project.githubURL || 'https://github.com/'} onClick={(event) => event.stopPropagation()}>
              <GitBranch size={16} />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}
