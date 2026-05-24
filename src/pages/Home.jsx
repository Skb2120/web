import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import ContactForm from '../components/ContactForm'
import Hero from '../components/Hero'
import LeadChatbot from '../components/LeadChatbot'
import Navbar from '../components/Navbar'
import PCBTraceMotion from '../components/PCBTraceMotion'
import ProjectCard from '../components/ProjectCard'
import ServiceCard from '../components/ServiceCard'
import SkillCard from '../components/SkillCard'
import IconButton from '../components/ui/IconButton'
import usePortfolioData from '../hooks/usePortfolioData'

function getVisibleItems(items, startIndex, count) {
  if (items.length <= count) return items
  return Array.from({ length: count }, (_, index) => items[(startIndex + index) % items.length])
}

export default function Home() {
  const { skills, projects, services, loading } = usePortfolioData()
  const pageRef = useRef(null)
  const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)
  const [projectStart, setProjectStart] = useState(0)
  const [serviceStart, setServiceStart] = useState(0)

  const projectCardsPerView = viewportWidth >= 1280 ? 3 : viewportWidth >= 768 ? 2 : 1
  const serviceCardsPerView = viewportWidth >= 1280 ? 4 : viewportWidth >= 768 ? 2 : 1

  const visibleProjects = useMemo(
    () => getVisibleItems(projects, projectStart, projectCardsPerView),
    [projects, projectStart, projectCardsPerView],
  )
  const visibleServices = useMemo(
    () => getVisibleItems(services, serviceStart, serviceCardsPerView),
    [services, serviceStart, serviceCardsPerView],
  )

  useEffect(() => {
    const sections = pageRef.current?.querySelectorAll('[data-reveal]')
    if (!sections?.length) return

    gsap.fromTo(sections, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: 'power2.out' })
  }, [loading])

  useEffect(() => {
    function handleResize() {
      setViewportWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  function shiftProjectCards(step) {
    if (!projects.length) return
    setProjectStart((current) => (current + step + projects.length) % projects.length)
  }

  function shiftServiceCards(step) {
    if (!services.length) return
    setServiceStart((current) => (current + step + services.length) % services.length)
  }

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
                I build embedded and IoT systems from circuit architecture to firmware, cloud telemetry, dashboards, and deployment. The work blends practical hardware judgment with clean web systems so prototypes can become products without losing momentum.
              </p>
            </div>
          </div>
        </section>

        <section id="skills" data-reveal className="relative overflow-hidden px-4 py-20 md:px-8">
          <PCBTraceMotion variant="matrix" />
          <div className="relative z-10 mx-auto max-w-6xl">
            <h2 className="mb-10 text-3xl font-semibold text-white md:text-5xl">Skills</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {skills.map((skill) => <SkillCard key={skill.id} skill={skill} />)}
            </div>
          </div>
        </section>

        <section id="projects" data-reveal className="relative overflow-hidden px-4 py-20 md:px-8">
          <PCBTraceMotion variant="orbit" />
          <div className="relative z-10 mx-auto max-w-6xl">
            <div className="mb-10 flex items-center justify-between gap-4">
              <h2 className="text-3xl font-semibold text-white md:text-5xl">Project</h2>
              <div className="flex items-center gap-2">
                <IconButton
                  icon={ChevronLeft}
                  label="Previous project cards"
                  onClick={() => shiftProjectCards(-1)}
                  disabled={projects.length <= projectCardsPerView}
                  className={projects.length <= projectCardsPerView ? 'cursor-not-allowed opacity-40' : ''}
                />
                <IconButton
                  icon={ChevronRight}
                  label="Next project cards"
                  onClick={() => shiftProjectCards(1)}
                  disabled={projects.length <= projectCardsPerView}
                  className={projects.length <= projectCardsPerView ? 'cursor-not-allowed opacity-40' : ''}
                />
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleProjects.map((project) => <ProjectCard key={project.id} project={project} />)}
            </div>
          </div>
        </section>

        <section id="services" data-reveal className="relative overflow-hidden px-4 py-20 md:px-8">
          <PCBTraceMotion variant="wave" />
          <div className="relative z-10 mx-auto max-w-6xl">
            <div className="mb-10 flex items-center justify-between gap-4">
              <h2 className="text-3xl font-semibold text-white md:text-5xl">Freelancing Service</h2>
              <div className="flex items-center gap-2">
                <IconButton
                  icon={ChevronLeft}
                  label="Previous service cards"
                  onClick={() => shiftServiceCards(-1)}
                  disabled={services.length <= serviceCardsPerView}
                  className={services.length <= serviceCardsPerView ? 'cursor-not-allowed opacity-40' : ''}
                />
                <IconButton
                  icon={ChevronRight}
                  label="Next service cards"
                  onClick={() => shiftServiceCards(1)}
                  disabled={services.length <= serviceCardsPerView}
                  className={services.length <= serviceCardsPerView ? 'cursor-not-allowed opacity-40' : ''}
                />
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {visibleServices.map((service) => <ServiceCard key={service.id} service={service} />)}
            </div>
          </div>
        </section>

        <section id="contact" data-reveal className="relative overflow-hidden px-4 py-20 md:px-8">
          <PCBTraceMotion density="compact" variant="pulse" />
          <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-8">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">Contact</p>
              <h2 className="mt-3 text-3xl font-semibold text-white md:text-5xl">Get In Touch</h2>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>

      <footer className="border-t border-cyan-300/10 px-4 py-8 text-center text-sm text-cyan-100/58">
        Sarathkumar B Embedded, IoT, PCB, and full-stack engineering.
      </footer>
      <LeadChatbot />
    </div>
  )
}
