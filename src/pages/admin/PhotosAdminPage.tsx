import { useEffect, useRef, useState, type DragEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowDown, ArrowUp, Eye, EyeOff, ImagePlus, Pencil, Trash2, Upload } from 'lucide-react'
import { useQuery } from '@/hooks/useQuery'
import { useToast } from '@/hooks/useToast'
import { queryCache } from '@/lib/query-cache'
import { createPhoto, deleteImageByUrl, deletePhoto, listPhotos, updatePhoto, uploadImage } from '@/services'
import type { GalleryPhoto } from '@/types/content'
import { getErrorMessage } from '@/utils/errors'
import { formatDate } from '@/utils/format'
import { readImageDimensions } from '@/utils/image'
import { emptyToNull, photoSchema, type PhotoFormValues } from '@/utils/validation'
import { cn } from '@/utils/cn'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Checkbox, Field, Input, Textarea } from '@/components/admin/Field'
import { FormDialog } from '@/components/admin/FormDialog'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { SmartImage } from '@/components/common/SmartImage'
import { Skeleton } from '@/components/common/Skeleton'
import { EmptyState, ErrorState } from '@/components/common/States'

const KEY = 'admin:gallery'

function invalidate() {
  queryCache.invalidate('gallery')
  queryCache.invalidate(KEY)
  queryCache.invalidate('admin:counts')
}

function titleFromFile(file: File): string {
  return file.name
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .trim()
}

export default function PhotosAdminPage() {
  const photos = useQuery(KEY, () => listPhotos({ includeUnpublished: true }), { staleTime: 0 })
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [editing, setEditing] = useState<GalleryPhoto | null>(null)
  const [pendingDelete, setPendingDelete] = useState<GalleryPhoto | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const upload = async (files: FileList | File[] | null) => {
    const list = Array.from(files ?? []).filter((f) => f.type.startsWith('image/'))
    if (list.length === 0) return
    setUploading({ done: 0, total: list.length })
    let order = (photos.data ?? []).reduce((max, p) => Math.max(max, p.sortOrder), 0)
    let failed = 0
    for (const file of list) {
      try {
        const [url, size] = await Promise.all([uploadImage(file, 'gallery'), readImageDimensions(file)])
        await createPhoto({
          title: titleFromFile(file),
          caption: null,
          imageUrl: url,
          width: size?.width ?? null,
          height: size?.height ?? null,
          location: null,
          takenAt: file.lastModified ? new Date(file.lastModified).toISOString().slice(0, 10) : null,
          isPublished: true,
          sortOrder: ++order,
        })
      } catch (error) {
        failed += 1
        toast({ title: `Could not upload ${file.name}`, description: getErrorMessage(error), tone: 'error' })
      }
      setUploading((u) => (u ? { ...u, done: u.done + 1 } : u))
    }
    setUploading(null)
    if (inputRef.current) inputRef.current.value = ''
    invalidate()
    const ok = list.length - failed
    if (ok > 0) toast({ title: `${ok} photo${ok > 1 ? 's' : ''} added`, description: 'Published right away — edit to add a caption.', tone: 'success' })
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    void upload(event.dataTransfer.files)
  }

  const togglePublished = async (photo: GalleryPhoto) => {
    setBusyId(photo.id)
    try {
      await updatePhoto(photo.id, { isPublished: !photo.isPublished })
      invalidate()
    } catch (error) {
      toast({ title: 'Could not update', description: getErrorMessage(error), tone: 'error' })
    } finally {
      setBusyId(null)
    }
  }

  const move = async (index: number, direction: -1 | 1) => {
    const list = [...(photos.data ?? [])]
    const target = index + direction
    const a = list[index]
    const b = list[target]
    if (!a || !b) return
    list[index] = b
    list[target] = a
    // Renumber 1..n so the order is unambiguous even when photos shared a sort value.
    const updates = list.map((photo, i) => ({ photo, order: i + 1 })).filter(({ photo, order }) => photo.sortOrder !== order)
    try {
      await Promise.all(updates.map(({ photo, order }) => updatePhoto(photo.id, { sortOrder: order })))
      invalidate()
    } catch (error) {
      toast({ title: 'Could not reorder', description: getErrorMessage(error), tone: 'error' })
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setBusyId(pendingDelete.id)
    try {
      await deletePhoto(pendingDelete.id)
      await deleteImageByUrl(pendingDelete.imageUrl).catch(() => undefined)
      toast({ title: 'Photo deleted' })
      setPendingDelete(null)
      invalidate()
    } catch (error) {
      toast({ title: 'Could not delete', description: getErrorMessage(error), tone: 'error' })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Photos"
        description="Drop photos below. They are resized to 1800px and converted to WebP before upload."
        actions={
          <Button size="sm" variant="primary" onClick={() => inputRef.current?.click()} loading={uploading !== null}>
            <ImagePlus className="size-3.5" /> {uploading ? `Uploading ${uploading.done}/${uploading.total}` : 'Upload photos'}
          </Button>
        }
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(event) => void upload(event.target.files)}
        aria-label="Upload photos"
      />

      <div
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'mb-8 flex flex-col items-center justify-center gap-2 border border-dashed px-6 py-10 text-center text-sm transition-colors',
          dragging ? 'border-fg bg-bg-elevated' : 'border-line text-fg-muted',
        )}
      >
        <Upload className="size-4" />
        <p>
          Drag photos here, or{' '}
          <button type="button" onClick={() => inputRef.current?.click()} className="underline underline-offset-4 hover:text-fg">
            choose files
          </button>
          .
        </p>
      </div>

      {photos.status === 'error' ? (
        <ErrorState error={photos.error} onRetry={photos.refetch} />
      ) : photos.isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5]" />
          ))}
        </div>
      ) : photos.data && photos.data.length > 0 ? (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {photos.data.map((photo, i) => (
            <li key={photo.id} className="flex flex-col gap-3">
              <SmartImage src={photo.imageUrl} alt={photo.title} ratio={photo.width && photo.height ? `${photo.width} / ${photo.height}` : '4 / 5'} />
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium">
                  <span className="truncate">{photo.title || 'Untitled'}</span>
                  <StatusBadge label={photo.isPublished ? 'Published' : 'Hidden'} tone={photo.isPublished ? 'live' : 'muted'} />
                </p>
                <p className="mt-0.5 truncate text-xs text-fg-muted">
                  {[photo.location, photo.takenAt ? formatDate(photo.takenAt) : null, `order ${photo.sortOrder}`].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => void move(i, -1)} disabled={i === 0} aria-label="Move up">
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => void move(i, 1)} disabled={i === (photos.data?.length ?? 0) - 1} aria-label="Move down">
                  <ArrowDown className="size-3.5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => void togglePublished(photo)} loading={busyId === photo.id}>
                  {photo.isPublished ? (
                    <>
                      <EyeOff className="size-3.5" /> Hide
                    </>
                  ) : (
                    <>
                      <Eye className="size-3.5" /> Publish
                    </>
                  )}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(photo)}>
                  <Pencil className="size-3.5" /> Edit
                </Button>
                <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setPendingDelete(photo)} aria-label={`Delete ${photo.title || 'photo'}`}>
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="No photos yet." description="Upload a few and they will show up on /photos immediately." />
      )}

      <PhotoDialog photo={editing} onClose={() => setEditing(null)} onSaved={invalidate} />

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete “${pendingDelete?.title || 'this photo'}”?`}
        description="The file is removed from storage as well. This cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={busyId === pendingDelete?.id}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}

function PhotoDialog({ photo, onClose, onSaved }: { photo: GalleryPhoto | null; onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast()
  const form = useForm<PhotoFormValues>({
    resolver: zodResolver(photoSchema),
    defaultValues: { title: '', caption: '', location: '', takenAt: '', isPublished: true, sortOrder: 0 },
  })
  const { register, handleSubmit, reset, formState } = form

  useEffect(() => {
    if (!photo) return
    reset({
      title: photo.title,
      caption: photo.caption ?? '',
      location: photo.location ?? '',
      takenAt: photo.takenAt ?? '',
      isPublished: photo.isPublished,
      sortOrder: photo.sortOrder,
    })
  }, [photo, reset])

  const onSubmit = handleSubmit(async (values) => {
    if (!photo) return
    try {
      await updatePhoto(photo.id, {
        title: values.title,
        caption: emptyToNull(values.caption),
        location: emptyToNull(values.location),
        takenAt: emptyToNull(values.takenAt),
        isPublished: values.isPublished,
        sortOrder: values.sortOrder,
      })
      toast({ title: 'Photo saved', tone: 'success' })
      onSaved()
      onClose()
    } catch (error) {
      toast({ title: 'Could not save', description: getErrorMessage(error), tone: 'error' })
    }
  })

  return (
    <FormDialog open={photo !== null} title="Edit photo" onClose={onClose}>
      {photo ? (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <SmartImage src={photo.imageUrl} alt="" ratio={photo.width && photo.height ? `${photo.width} / ${photo.height}` : '4 / 5'} wrapperClassName="max-h-64" />
          <Field label="Title" htmlFor="ph-title" error={formState.errors.title?.message}>
            <Input id="ph-title" {...register('title')} />
          </Field>
          <Field label="Caption" htmlFor="ph-caption" error={formState.errors.caption?.message}>
            <Textarea id="ph-caption" rows={3} {...register('caption')} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Location" htmlFor="ph-location">
              <Input id="ph-location" placeholder="Jakarta" {...register('location')} />
            </Field>
            <Field label="Taken on" htmlFor="ph-date">
              <Input id="ph-date" type="date" {...register('takenAt')} />
            </Field>
          </div>
          <div className="flex items-center justify-between gap-4">
            <Checkbox label="Published" {...register('isPublished')} />
            <Field label="Order" htmlFor="ph-order" error={formState.errors.sortOrder?.message} className="w-24">
              <Input id="ph-order" type="number" {...register('sortOrder', { valueAsNumber: true })} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={formState.isSubmitting}>
              Save
            </Button>
          </div>
        </form>
      ) : null}
    </FormDialog>
  )
}
