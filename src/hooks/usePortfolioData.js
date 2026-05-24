import { useEffect, useState } from 'react'
import { listRows } from '../lib/portfolioApi'

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

    return () => {
      mounted = false
    }
  }, [])

  return state
}
