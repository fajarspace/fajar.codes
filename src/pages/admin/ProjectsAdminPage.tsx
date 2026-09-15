import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react'
import { useQuery } from '@/hooks/useQuery'
import { useToast } from '@/hooks/useToast'
import { queryCache } from '@/lib/query-cache'
import { deleteProject, listProjects, setProjectStatus } from '@/services'
import type { Project } from '@/types/content'
import { getErrorMessage } from '@/utils/errors'
import { labels } from '@/utils/format'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Button, ButtonLink } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { SkeletonRows } from '@/components/common/Skeleton'
import { EmptyState, ErrorState } from '@/components/common/States'

function invalidateProjects() {
  queryCache.invalidate('projects')
  queryCache.invalidate('project:')
  queryCache.invalidate('admin:')
  queryCache.invalidate('search-index')
}

export default function ProjectsAdminPage() {
  const projects = useQuery('admin:projects', () => listProjects({ includeDrafts: true }), { staleTime: 0 })
  const { toast } = useToast()
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const toggleStatus = async (project: Project) => {
    setBusyId(project.id)
    try {
      const next = project.status === 'draft' ? 'live' : 'draft'
      await setProjectStatus(project.id, next)
      toast({ title: next === 'draft' ? 'Unpublished' : 'Published', description: project.title, tone: 'success' })
      invalidateProjects()
    } catch (error) {
      toast({ title: 'Could not update', description: getErrorMessage(error), tone: 'error' })
    } finally {
      setBusyId(null)
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setBusyId(pendingDelete.id)
    try {
      await deleteProject(pendingDelete.id)
      toast({ title: 'Project deleted', description: pendingDelete.title })
      setPendingDelete(null)
      invalidateProjects()
    } catch (error) {
      toast({ title: 'Could not delete', description: getErrorMessage(error), tone: 'error' })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Projects"
        description="Drafts are only visible here. Everything else is public."
        actions={
          <ButtonLink to="/admin/projects/new" size="sm" variant="primary">
            <Plus className="size-3.5" /> New project
          </ButtonLink>
        }
      />

      {projects.status === 'error' ? (
        <ErrorState error={projects.error} onRetry={projects.refetch} />
      ) : projects.isLoading ? (
        <SkeletonRows rows={5} />
      ) : projects.data && projects.data.length > 0 ? (
        <ul className="divide-y divide-line border-y border-line">
          {projects.data.map((p) => (
            <li key={p.id} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Link to={`/admin/projects/${p.id}`} className="font-medium hover:underline hover:underline-offset-4">
                    {p.title}
                  </Link>
                  <StatusBadge
                    label={labels.projectStatus[p.status]}
                    tone={p.status === 'live' ? 'live' : p.status === 'draft' ? 'muted' : 'ink'}
                  />
                  {p.featured ? <span className="text-2xs uppercase tracking-wider text-fg-muted">Featured</span> : null}
                </div>
                <p className="mt-1 truncate text-xs text-fg-muted">
                  {p.year} · {labels.category[p.category]} · /work/{p.slug} · order {p.sortOrder}
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                <ButtonLink to={`/work/${p.slug}`} size="sm" variant="ghost" external>
                  <Eye className="size-3.5" /> View
                </ButtonLink>
                <ButtonLink to={`/admin/projects/${p.id}`} size="sm" variant="ghost">
                  <Pencil className="size-3.5" /> Edit
                </ButtonLink>
                <Button size="sm" variant="ghost" onClick={() => void toggleStatus(p)} loading={busyId === p.id}>
                  {p.status === 'draft' ? (
                    <>
                      <Eye className="size-3.5" /> Publish
                    </>
                  ) : (
                    <>
                      <EyeOff className="size-3.5" /> Unpublish
                    </>
                  )}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setPendingDelete(p)} aria-label={`Delete ${p.title}`}>
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No projects yet."
          action={
            <ButtonLink to="/admin/projects/new" size="sm">
              Create the first one
            </ButtonLink>
          }
        />
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete “${pendingDelete?.title ?? ''}”?`}
        description="The project and its gallery entries will be removed. Uploaded files stay in storage."
        confirmLabel="Delete"
        destructive
        loading={busyId === pendingDelete?.id}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}
