import { useEffect, useMemo, useState } from 'react'
import { AuthContext } from './authContext'
import { hasSupabase, supabase } from '../lib/supabase'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [demoAdmin, setDemoAdmin] = useState(localStorage.getItem('demo-admin') === 'true')
  const [loading, setLoading] = useState(hasSupabase)

  useEffect(() => {
    if (!hasSupabase) {
      return undefined
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => data.subscription.unsubscribe()
  }, [])

  async function signIn(email, password) {
    if (!hasSupabase || isLocalAdminCredential(email, password)) {
      localStorage.setItem('demo-admin', 'true')
      setDemoAdmin(true)
      return { demo: true }
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      if (import.meta.env.DEV && isLocalAdminCredential(email, password)) {
        localStorage.setItem('demo-admin', 'true')
        setDemoAdmin(true)
        return { demo: true }
      }
      throw error
    }
    return data
  }

  async function signOut() {
    if (hasSupabase) await supabase.auth.signOut()
    localStorage.removeItem('demo-admin')
    setDemoAdmin(false)
    setSession(null)
  }

  const value = useMemo(
    () => ({
      session,
      isAdmin: Boolean(session || demoAdmin),
      demoMode: !hasSupabase,
      loading,
      signIn,
      signOut,
    }),
    [session, demoAdmin, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function isLocalAdminCredential(email, password) {
  return email === 'admin@example.com' && password === 'admin123456'
}
