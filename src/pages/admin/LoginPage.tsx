import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/hooks/useAuth'
import { useSeo } from '@/hooks/useSeo'
import { isSupabaseConfigured } from '@/lib/supabase'
import { getErrorMessage } from '@/utils/errors'
import { loginSchema, type LoginValues } from '@/utils/validation'
import { Button } from '@/components/common/Button'
import { Field, Input } from '@/components/admin/Field'
import { Wordmark } from '@/components/common/Wordmark'

export default function LoginPage() {
  useSeo({ title: 'Sign in', noIndex: true })
  const { session, isAdmin, isLoading, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const from = (location.state as { from?: string } | null)?.from ?? '/admin'

  if (!isLoading && session && isAdmin) return <Navigate to={from} replace />

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null)
    try {
      await signIn(values.email, values.password)
      navigate(from, { replace: true })
    } catch (error) {
      setServerError(getErrorMessage(error, 'Could not sign in.'))
    }
  })

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="inline-flex items-center gap-2" aria-label="Back to fajar.codes">
          <Wordmark />
        </Link>
        <h1 className="mt-6 font-serif text-4xl">Sign in</h1>
        <p className="mt-2 text-sm text-fg-muted">Admin only. Everything here is protected by Row Level Security, not just this form.</p>

        {!isSupabaseConfigured ? (
          <p className="mt-6 border border-line p-4 text-sm text-fg-muted">
            Supabase is not configured. Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> to <code>.env</code>.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
            <Field label="Email" htmlFor="email" error={form.formState.errors.email?.message}>
              <Input id="email" type="email" autoComplete="email" {...form.register('email')} aria-invalid={Boolean(form.formState.errors.email)} />
            </Field>
            <Field label="Password" htmlFor="password" error={form.formState.errors.password?.message}>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...form.register('password')}
                aria-invalid={Boolean(form.formState.errors.password)}
              />
            </Field>
            {serverError ? (
              <p role="alert" className="border border-fg px-3 py-2 text-sm">
                {serverError}
              </p>
            ) : null}
            <Button type="submit" variant="primary" className="w-full" loading={form.formState.isSubmitting}>
              Continue
            </Button>
          </form>
        )}
      </div>
    </main>
  )
}
