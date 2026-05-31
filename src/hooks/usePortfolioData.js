import { useEffect, useState } from 'react'
import { listRows, portfolioDataUpdatedEvent } from '../lib/portfolioApi'

export default function usePortfolioData() {
  const [state, setState] = useState({
    skills: [],
    projects: [],
    services: [],
    loading: true,
    error: '',
  })

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const [skills, projects, services] = await Promise.all([
          listRows('skills'),
          listRows('projects'),
          listRows('services'),
        ])

        if (mounted) setState({ skills, projects, services, loading: false, error: '' })
      } catch (error) {
        if (mounted) setState((current) => ({ ...current, loading: false, error: error.message }))
      }
    }

    load()
    const refresh = () => load()
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') load()
    }

    window.addEventListener(portfolioDataUpdatedEvent, refresh)
    window.addEventListener('focus', refresh)
    window.addEventListener('pageshow', refresh)
    document.addEventListener('visibilitychange', refreshWhenVisible)
    const refreshInterval = window.setInterval(refresh, 15000)
    return () => {
      mounted = false
      window.removeEventListener(portfolioDataUpdatedEvent, refresh)
      window.removeEventListener('focus', refresh)
      window.removeEventListener('pageshow', refresh)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
      window.clearInterval(refreshInterval)
    }
  }, [])

  return state
}
