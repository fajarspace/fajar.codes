import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useQuery } from '@/hooks/useQuery'
import { useToast } from '@/hooks/useToast'
import { queryCache } from '@/lib/query-cache'
import { createNowItem, deleteNowItem, listNowItems, updateNowItem, type NowItemInput } from '@/services'
import type { NowItem } from '@/types/content'
import { getErrorMessage } from '@/utils/errors'
import { formatDate, labels } from '@/utils/format'
import { emptyToNull, nowItemSchema, type NowItemFormValues } from '@/utils/validation'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Checkbox, Field, Input, Select, Textarea } from '@/components/admin/Field'
import { FormDialog } from '@/components/admin/FormDialog'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { SkeletonRows } from '@/components/common/Skeleton'
import { EmptyState, ErrorState } from '@/components/common/States'

const emptyItem: NowItemFormValues = { type: 'building', title: '', description: '', url: '', isActive: true }

function toInput(v: NowItemFormValues): NowItemInput {
  return { type: v.type, title: v.title, description: emptyToNull(v.description), url: emptyToNull(v.url), isActive: v.isActive }
}

export default function NowAdminPage() {
  return (
    <>
      <AdminPageHeader title="Now" description="The “Now” block on the home page: what is being built, learned, read and thought about." />
      <NowItems />
    </>
  )
}

function NowItems() {
  const items = useQuery('admin:now', () => listNowItems({ activeOnly: false }), { staleTime: 0 })
  const { toast } = useToast()
  const [editing, setEditing] = useState<NowItem | 'new' | null>(null)
  const [pendingDelete, setPendingDelete] = useState<NowItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const form = useForm<NowItemFormValues>({ resolver: zodResolver(nowItemSchema), defaultValues: emptyItem })
  const { register, handleSubmit, reset, formState } = form

  useEffect(() => {
    if (editing === 'new') reset(emptyItem)
    else if (editing)
      reset({
        type: editing.type,
        title: editing.title,
        description: editing.description ?? '',
        url: editing.url ?? '',
        isActive: editing.isActive,
      })
  }, [editing, reset])

  const invalidate = () => {
    queryCache.invalidate('now')
    queryCache.invalidate('admin:')
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (editing === 'new') await createNowItem(toInput(values))
      else if (editing) await updateNowItem(editing.id, toInput(values))
      toast({ title: 'Saved', tone: 'success' })
      setEditing(null)
      invalidate()
    } catch (error) {
      toast({ title: 'Could not save', description: getErrorMessage(error), tone: 'error' })
    }
  })

  const toggleActive = async (item: NowItem) => {
    try {
      await updateNowItem(item.id, { isActive: !item.isActive })
      invalidate()
    } catch (error) {
      toast({ title: 'Could not update', description: getErrorMessage(error), tone: 'error' })
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await deleteNowItem(pendingDelete.id)
      toast({ title: 'Item deleted' })
      setPendingDelete(null)
      invalidate()
    } catch (error) {
      toast({ title: 'Could not delete', description: getErrorMessage(error), tone: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium">Now items</h2>
        <Button size="sm" onClick={() => setEditing('new')}>
          <Plus className="size-3.5" /> Add item
        </Button>
      </div>

      {items.status === 'error' ? (
        <ErrorState error={items.error} onRetry={items.refetch} />
      ) : items.isLoading ? (
        <SkeletonRows rows={4} />
      ) : items.data && items.data.length > 0 ? (
        <ul className="divide-y divide-line border-y border-line">
          {items.data.map((item) => (
            <li key={item.id} className="grid gap-3 py-4 sm:grid-cols-[7rem_1fr_auto] sm:items-start">
              <p className="label-caps pt-1">{labels.nowType[item.type]}</p>
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-3 text-sm font-medium">
                  {item.title}
                  <StatusBadge label={item.isActive ? 'Active' : 'Hidden'} tone={item.isActive ? 'live' : 'muted'} />
                </p>
                {item.description ? <p className="mt-1 text-xs text-fg-muted">{item.description}</p> : null}
                <p className="mt-1 text-2xs text-fg-muted">
                  {item.url ? `${item.url} · ` : ''}updated {formatDate(item.updatedAt)}
                </p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => void toggleActive(item)}>
                  {item.isActive ? 'Hide' : 'Show'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(item)}>
                  <Pencil className="size-3.5" /> Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setPendingDelete(item)} aria-label={`Delete ${item.title}`}>
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="Nothing on the desk." action={<Button size="sm" onClick={() => setEditing('new')}>Add something</Button>} />
      )}

      <FormDialog open={editing !== null} title={editing === 'new' ? 'New item' : 'Edit item'} onClose={() => setEditing(null)}>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Field label="Type" htmlFor="now-type">
            <Select id="now-type" {...register('type')}>
              {(Object.keys(labels.nowType) as Array<keyof typeof labels.nowType>).map((k) => (
                <option key={k} value={k}>
                  {labels.nowType[k]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Title" htmlFor="now-title" error={formState.errors.title?.message}>
            <Input id="now-title" {...register('title')} />
          </Field>
          <Field label="Description" htmlFor="now-desc">
            <Textarea id="now-desc" rows={3} {...register('description')} />
          </Field>
          <Field label="Link" htmlFor="now-url" error={formState.errors.url?.message} hint="Optional. A path (/work/ambient) or a full URL.">
            <Input id="now-url" {...register('url')} />
          </Field>
          <Checkbox label="Visible on the home page" {...register('isActive')} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={formState.isSubmitting}>
              Save
            </Button>
          </div>
        </form>
      </FormDialog>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete “${pendingDelete?.title ?? ''}”?`}
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  )
}
