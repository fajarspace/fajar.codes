import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { isSupabaseConfigured } from '@/lib/supabase'
import { Button } from '@/components/common/Button'
import { Container } from '@/components/common/Container'
import { Skeleton } from '@/components/common/Skeleton'

/**
 * UI-level route guard. Real authorisation happens in Postgres via RLS
 * (see supabase/migrations) — this only decides what to render.
 */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { session, isAdmin, isLoading, signOut } = useAuth()
  const location = useLocation()

  if (!isSupabaseConfigured) {
    return (
      <Container className="py-20">
        <p className="label-caps">Admin</p>
        <h1 className="mt-4 font-serif text-3xl">Supabase is not configured.</h1>
        <p className="mt-3 max-w-md text-sm text-fg-muted">
          The public site runs on sample content, but the admin needs a real database. Copy <code>.env.example</code> to{' '}
          <code>.env</code>, add your project URL and publishable key, then restart the dev server.
        </p>
      </Container>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-dvh p-8">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-6 h-8 w-64" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  if (!isAdmin) {
    return (
      <Container className="py-20">
        <p className="label-caps">Admin</p>
        <h1 className="mt-4 font-serif text-3xl">This account is not an admin.</h1>
        <p className="mt-3 max-w-md text-sm text-fg-muted">
          You are signed in as <strong>{session.user.email}</strong>, but the profile role is not <code>admin</code>. Promote it in the
          Supabase SQL editor (see README) and sign in again.
        </p>
        <Button className="mt-6" size="sm" onClick={() => void signOut()}>
          Sign out
        </Button>
      </Container>
    )
  }

  return <>{children}</>
}
