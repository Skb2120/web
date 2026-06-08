import { ArrowRight, RadioTower, Zap } from 'lucide-react'
import PCBTraceMotion from './PCBTraceMotion'

export default function Hero() {
  return (
    <section id="hero" className="signal-grid relative min-h-[92vh] overflow-hidden pt-16">
      <div className="hero-trace-field">
        <PCBTraceMotion />
        <span className="hero-chip hero-chip-one" />
        <span className="hero-chip hero-chip-two" />
        <span className="hero-chip hero-chip-three" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_38%,rgba(34,211,238,.24),transparent_34%),linear-gradient(180deg,rgba(2,6,23,.18),rgba(2,6,23,.7)_64%,#020617)]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(92vh-4rem)] max-w-6xl flex-col justify-center px-4 pb-20 pt-10 md:px-8">
        <div className="max-w-4xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
            <RadioTower size={15} />
            Embedded Systems | IoT | PCB | Full Stack | Freelancer
          </div>
          <h2 className="neon-text max-w-4xl text-5xl font-bold leading-tight text-white md:text-7xl lg:text-8xl">
            Mr. B. Sarathkumar B.E 
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-8 text-cyan-50/78 md:text-xl">
            I design connected hardware, Embedded System, Real-Time IoT Dashboards , and intelligent lead systems for makers.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#projects" className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-300 px-5 py-3 font-semibold text-slate-950 shadow-[0_0_36px_rgba(34,211,238,.36)] transition hover:bg-emerald-300">
              View Projects
              <ArrowRight size={18} />
            </a>
            <a href="#contact" className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-300/35 bg-slate-950/50 px-5 py-3 font-semibold text-emerald-100 transition hover:bg-emerald-300/10">
              Contact Me
              <Zap size={18} />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
