import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ContactForm from '../components/ContactForm'
import Hero from '../components/Hero'
import LeadChatbot from '../components/LeadChatbot'
import Navbar from '../components/Navbar'
import PCBTraceMotion from '../components/PCBTraceMotion'
import ProjectCard from '../components/ProjectCard'
import ServiceCard from '../components/ServiceCard'
import SkillCard from '../components/SkillCard'
import SectionHeader from '../components/ui/SectionHeader'
import usePortfolioData from '../hooks/usePortfolioData'

export default function Home() {
  const { skills, projects, services, loading } = usePortfolioData()
  const pageRef = useRef(null)

  useEffect(() => {
    const sections = pageRef.current?.querySelectorAll('[data-reveal]')
    if (!sections?.length) return

    gsap.fromTo(sections, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: 'power2.out' })
  }, [loading])

  return (
    <div ref={pageRef} className="min-h-screen bg-slate-950 text-cyan-50">
      <Navbar />
      <Hero />

      <main>
        <section id="about" data-reveal className="relative overflow-hidden px-4 py-20 md:px-8">
          <PCBTraceMotion density="compact" variant="scan" />
          <div className="relative z-10 mx-auto grid max-w-6xl gap-6 md:grid-cols-[1fr_1.3fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">About</p>
              <h2 className="mt-3 text-3xl font-semibold text-white md:text-5xl">Hardware thinking with full-stack delivery.</h2>
            </div>
            <div className="glass-panel rounded-lg p-6 text-base leading-8 text-cyan-50/76 md:p-8">
              <p>
              </p>
            </div>
          </div>
        </section>

        <section id="skills" data-reveal className="relative overflow-hidden px-4 py-20 md:px-8">
          <PCBTraceMotion variant="matrix" />
          <div className="relative z-10 mx-auto max-w-6xl">
            <SectionHeader eyebrow="Skill Matrix" title="Microchip-style capability cards" description="Dynamic skills are loaded from Supabase when credentials are configured, with local demo data for development." />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map((skill) => <SkillCard key={skill.id} skill={skill} />)}
            </div>
          </div>
        </section>

        <section id="projects" data-reveal className="relative overflow-hidden px-4 py-20 md:px-8">
          <PCBTraceMotion variant="orbit" />
          <div className="relative z-10 mx-auto max-w-6xl">
            <SectionHeader eyebrow="Project Archive" title="3D flip-card engineering work" description="Hover on desktop or tap on mobile to reveal architecture notes, stack details, and links." />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
            </div>
          </div>
        </section>

        <section id="services" data-reveal className="relative overflow-hidden px-4 py-20 md:px-8">
          <PCBTraceMotion variant="wave" />
          <div className="relative z-10 mx-auto max-w-6xl">
            <SectionHeader eyebrow="Freelancing Services" title="From sensor idea to shipped interface" />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {services.map((service) => <ServiceCard key={service.id} service={service} />)}
            </div>
          </div>
        </section>

        <section id="contact" data-reveal className="relative overflow-hidden px-4 py-20 md:px-8">
          <PCBTraceMotion density="compact" variant="pulse" />
          <div className="relative z-10 mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_0.9fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">Contact</p>
              <h2 className="mt-3 text-3xl font-semibold text-white md:text-5xl">Get In Touch</h2>
              <p className="mt-5 text-base leading-8 text-cyan-50/72">
                             </p>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>

      <footer className="border-t border-cyan-300/10 px-4 py-8 text-center text-sm text-cyan-100/58">
        Sarathkumar B. Embedded, IoT, PCB, and full-stack engineering.
      </footer>
      <LeadChatbot />
    </div>
  )
}
