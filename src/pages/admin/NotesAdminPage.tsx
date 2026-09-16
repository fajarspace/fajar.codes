import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react'
import { useQuery } from '@/hooks/useQuery'
import { useToast } from '@/hooks/useToast'
import { queryCache } from '@/lib/query-cache'
import { deleteNote, listNotes, setNoteStatus } from '@/services'
import type { Note } from '@/types/content'
import { getErrorMessage } from '@/utils/errors'
import { formatDate, labels } from '@/utils/format'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Button, ButtonLink } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { SkeletonRows } from '@/components/common/Skeleton'
import { EmptyState, ErrorState } from '@/components/common/States'

export function invalidateNotes() {
  queryCache.invalidate('notes')
  queryCache.invalidate('note:')
  queryCache.invalidate('tags')
  queryCache.invalidate('admin:')
  queryCache.invalidate('search-index')
}

export default function NotesAdminPage() {
  const notes = useQuery('admin:notes', () => listNotes({ includeDrafts: true }), { staleTime: 0 })
  const { toast } = useToast()
  const [pendingDelete, setPendingDelete] = useState<Note | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const toggleStatus = async (note: Note) => {
    setBusyId(note.id)
    try {
      const next = note.status === 'published' ? 'draft' : 'published'
      await setNoteStatus(note.id, next)
      toast({ title: next === 'published' ? 'Published' : 'Moved to drafts', description: note.title, tone: 'success' })
      invalidateNotes()
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
      await deleteNote(pendingDelete.id)
      toast({ title: 'Note deleted', description: pendingDelete.title })
      setPendingDelete(null)
      invalidateNotes()
    } catch (error) {
      toast({ title: 'Could not delete', description: getErrorMessage(error), tone: 'error' })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Notes"
        description="Publishing sets the date; unpublishing keeps the text but hides it."
        actions={
          <ButtonLink to="/admin/notes/new" size="sm" variant="primary">
            <Plus className="size-3.5" /> New note
          </ButtonLink>
        }
      />

      {notes.status === 'error' ? (
        <ErrorState error={notes.error} onRetry={notes.refetch} />
      ) : notes.isLoading ? (
        <SkeletonRows rows={5} />
      ) : notes.data && notes.data.length > 0 ? (
        <ul className="divide-y divide-line border-y border-line">
          {notes.data.map((n) => (
            <li key={n.id} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Link to={`/admin/notes/${n.id}`} className="font-medium hover:underline hover:underline-offset-4">
                    {n.title}
                  </Link>
                  <StatusBadge label={labels.noteStatus[n.status]} tone={n.status === 'published' ? 'live' : 'muted'} />
                </div>
                <p className="mt-1 truncate text-xs text-fg-muted">
                  {n.status === 'published' ? formatDate(n.publishedAt) : `edited ${formatDate(n.updatedAt)}`} · {n.readingTime} min ·{' '}
                  {n.tags.map((t) => `#${t.slug}`).join(' ') || 'no tags'}
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                {n.status === 'published' ? (
                  <ButtonLink to={`/${n.slug}`} size="sm" variant="ghost" external>
                    <Eye className="size-3.5" /> View
                  </ButtonLink>
                ) : null}
                <ButtonLink to={`/admin/notes/${n.id}`} size="sm" variant="ghost">
                  <Pencil className="size-3.5" /> Edit
                </ButtonLink>
                <Button size="sm" variant="ghost" onClick={() => void toggleStatus(n)} loading={busyId === n.id}>
                  {n.status === 'published' ? (
                    <>
                      <EyeOff className="size-3.5" /> Unpublish
                    </>
                  ) : (
                    <>
                      <Eye className="size-3.5" /> Publish
                    </>
                  )}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setPendingDelete(n)} aria-label={`Delete ${n.title}`}>
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No notes yet."
          action={
            <ButtonLink to="/admin/notes/new" size="sm">
              Write the first one
            </ButtonLink>
          }
        />
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete “${pendingDelete?.title ?? ''}”?`}
        description="This removes the note permanently. Tags stay for other notes."
        confirmLabel="Delete"
        destructive
        loading={busyId === pendingDelete?.id}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}
