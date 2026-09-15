import { Link } from 'react-router-dom'
import { ArrowRight, Plus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useQuery } from '@/hooks/useQuery'
import { getContentCounts, listNotes, listProjects } from '@/services'
import { formatDate, labels } from '@/utils/format'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { ButtonLink } from '@/components/common/Button'
import { Skeleton } from '@/components/common/Skeleton'
import { ErrorState } from '@/components/common/States'

export default function DashboardPage() {
  const { profile } = useAuth()
  const counts = useQuery('admin:counts', getContentCounts, { staleTime: 0 })
  const projects = useQuery('admin:projects', () => listProjects({ includeDrafts: true }), { staleTime: 0 })
  const notes = useQuery('admin:notes', () => listNotes({ includeDrafts: true }), { staleTime: 0 })

  const drafts = [
    ...(projects.data ?? []).filter((p) => p.status === 'draft').map((p) => ({ id: p.id, kind: 'project' as const, title: p.title, href: `/admin/projects/${p.id}`, updatedAt: p.updatedAt })),
    ...(notes.data ?? []).filter((n) => n.status === 'draft').map((n) => ({ id: n.id, kind: 'note' as const, title: n.title, href: `/admin/notes/${n.id}`, updatedAt: n.updatedAt })),
  ].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  const stat = (label: string, value: number | undefined, sub?: string) => (
    <div className="border-t border-line pt-3">
      <p className="label-caps">{label}</p>
      {counts.isLoading ? <Skeleton className="mt-2 h-9 w-12" /> : <p className="mt-1 font-serif text-4xl tabular">{value ?? 0}</p>}
      {sub ? <p className="mt-1 text-xs text-fg-muted">{sub}</p> : null}
    </div>
  )

  return (
    <>
      <AdminPageHeader
        title={`Hello, ${profile?.fullName.split(' ')[0] ?? 'there'}.`}
        description="A quick look at what is published and what is still sitting in drafts."
        actions={
          <>
            <ButtonLink to="/admin/projects/new" size="sm">
              <Plus className="size-3.5" /> Project
            </ButtonLink>
            <ButtonLink to="/admin/notes/new" size="sm" variant="primary">
              <Plus className="size-3.5" /> Note
            </ButtonLink>
          </>
        }
      />

      {counts.status === 'error' ? (
        <ErrorState error={counts.error} onRetry={counts.refetch} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stat('Projects', counts.data?.projects, `${counts.data?.publishedProjects ?? 0} public`)}
          {stat('Notes', counts.data?.notes, `${counts.data?.publishedNotes ?? 0} published`)}
          {stat('Photos', counts.data?.photos, `${counts.data?.publishedPhotos ?? 0} published`)}
          {stat('Now items', counts.data?.nowItems, 'active')}
        </div>
      )}

      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium">Drafts</h2>
          <span className="text-xs text-fg-muted">{drafts.length} waiting</span>
        </div>
        {projects.isLoading || notes.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : drafts.length === 0 ? (
          <p className="border border-dashed border-line p-6 text-center text-sm text-fg-muted">No drafts. Everything is out in the open.</p>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {drafts.map((d) => (
              <li key={`${d.kind}-${d.id}`}>
                <Link to={d.href} className="group flex items-center justify-between gap-4 py-3 text-sm">
                  <span className="flex min-w-0 items-center gap-3">
                    <StatusBadge label={d.kind === 'project' ? 'Project' : 'Note'} tone="ink" />
                    <span className="truncate group-hover:underline group-hover:underline-offset-4">{d.title}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 text-xs text-fg-muted">
                    {formatDate(d.updatedAt)} <ArrowRight className="size-3" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-medium">Recent projects</h2>
          <ul className="divide-y divide-line border-y border-line text-sm">
            {(projects.data ?? []).slice(0, 5).map((p) => (
              <li key={p.id}>
                <Link to={`/admin/projects/${p.id}`} className="flex items-center justify-between gap-4 py-2.5 hover:underline hover:underline-offset-4">
                  <span className="truncate">{p.title}</span>
                  <StatusBadge label={labels.projectStatus[p.status]} tone={p.status === 'live' ? 'live' : p.status === 'draft' ? 'muted' : 'ink'} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-medium">Recent notes</h2>
          <ul className="divide-y divide-line border-y border-line text-sm">
            {(notes.data ?? []).slice(0, 5).map((n) => (
              <li key={n.id}>
                <Link to={`/admin/notes/${n.id}`} className="flex items-center justify-between gap-4 py-2.5 hover:underline hover:underline-offset-4">
                  <span className="truncate">{n.title}</span>
                  <StatusBadge label={labels.noteStatus[n.status]} tone={n.status === 'published' ? 'live' : 'muted'} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
