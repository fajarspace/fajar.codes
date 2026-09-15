import type { ReactNode } from 'react'
import { getErrorMessage } from '@/utils/errors'
import { Button } from './Button'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="border-y border-line py-16 text-center">
      <p className="font-serif text-2xl">{title}</p>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm text-fg-muted">{description}</p> : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  )
}

interface ErrorStateProps {
  error?: unknown
  title?: string
  onRetry?: () => void
}

export function ErrorState({ error, title = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="border-y border-line py-16 text-center">
      <p className="font-serif text-2xl">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-fg-muted">{getErrorMessage(error)}</p>
      {onRetry ? (
        <div className="mt-6 flex justify-center">
          <Button onClick={onRetry} size="sm">
            Try again
          </Button>
        </div>
      ) : null}
    </div>
  )
}
