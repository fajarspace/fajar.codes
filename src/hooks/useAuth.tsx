import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { getProfileById } from '@/services/profile.service'
import type { Profile } from '@/types/content'

interface AuthContextValue {
  session: Session | null
  profile: Profile | null
  isAdmin: boolean
  /** True until the initial session + profile lookup has settled. */
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(supabase))

  const loadProfile = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setProfile(null)
      return
    }
    try {
      setProfile(await getProfileById(userId))
    } catch {
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    if (!supabase) return
    const client = supabase
    let active = true

    void client.auth.getSession().then(async ({ data }) => {
      if (!active) return
      setSession(data.session)
      await loadProfile(data.session?.user.id)
      if (active) setIsLoading(false)
    })

    const { data: subscription } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return
      setSession(nextSession)
      // Defer Supabase calls out of the auth callback to avoid deadlocks on the auth lock.
      window.setTimeout(() => {
        void loadProfile(nextSession?.user.id)
      }, 0)
    })

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [loadProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase is not configured.')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    setSession(data.session)
    await loadProfile(data.session?.user.id)
  }, [loadProfile])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
  }, [])

  const refreshProfile = useCallback(() => loadProfile(session?.user.id), [loadProfile, session?.user.id])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      isAdmin: profile?.role === 'admin',
      isLoading,
      signIn,
      signOut,
      refreshProfile,
    }),
    [session, profile, isLoading, signIn, signOut, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
