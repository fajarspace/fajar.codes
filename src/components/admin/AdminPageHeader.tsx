import type { ReactNode } from 'react'

interface AdminPageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

export function AdminPageHeader({ title, description, actions }: AdminPageHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
      <div>
        <h1 className="font-serif text-3xl leading-none">{title}</h1>
        {description ? <p className="mt-2 text-sm text-fg-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}
