import { useRef, useState } from 'react'
import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from 'lucide-react'
import { useQuery } from '@/hooks/useQuery'
import { useToast } from '@/hooks/useToast'
import { queryCache } from '@/lib/query-cache'
import { addProjectImage, deleteImageByUrl, deleteProjectImage, listProjectImages, updateProjectImage, uploadImage } from '@/services'
import type { ProjectImage } from '@/types/content'
import { getErrorMessage } from '@/utils/errors'
import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { SmartImage } from '@/components/common/SmartImage'
import { Skeleton } from '@/components/common/Skeleton'
import { Input } from './Field'

export function GalleryManager({ projectId }: { projectId: string }) {
  const key = `project-images:${projectId}`
  const images = useQuery(key, () => listProjectImages(projectId), { staleTime: 0 })
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<ProjectImage | null>(null)
  const [deleting, setDeleting] = useState(false)

  const refresh = () => {
    queryCache.invalidate(key)
    queryCache.invalidate('project:')
  }

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const existing = images.data ?? []
      let order = existing.length ? Math.max(...existing.map((i) => i.sortOrder)) + 1 : 1
      for (const file of Array.from(files)) {
        const url = await uploadImage(file, 'projectGallery')
        await addProjectImage({ projectId, imageUrl: url, caption: null, sortOrder: order++ })
      }
      toast({ title: `${files.length} image${files.length > 1 ? 's' : ''} added`, tone: 'success' })
      refresh()
    } catch (error) {
      toast({ title: 'Upload failed', description: getErrorMessage(error), tone: 'error' })
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const saveCaption = async (image: ProjectImage, caption: string) => {
    const next = caption.trim() || null
    if (next === image.caption) return
    try {
      await updateProjectImage(image.id, { caption: next })
      refresh()
    } catch (error) {
      toast({ title: 'Could not save caption', description: getErrorMessage(error), tone: 'error' })
    }
  }

  const move = async (index: number, direction: -1 | 1) => {
    const list = [...(images.data ?? [])]
    const target = index + direction
    const a = list[index]
    const b = list[target]
    if (!a || !b) return
    list[index] = b
    list[target] = a
    const updates = list.map((image, i) => ({ image, order: i + 1 })).filter(({ image, order }) => image.sortOrder !== order)
    try {
      await Promise.all(updates.map(({ image, order }) => updateProjectImage(image.id, { sortOrder: order })))
      refresh()
    } catch (error) {
      toast({ title: 'Could not reorder', description: getErrorMessage(error), tone: 'error' })
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await deleteProjectImage(pendingDelete.id)
      await deleteImageByUrl(pendingDelete.imageUrl).catch(() => undefined)
      toast({ title: 'Image removed' })
      setPendingDelete(null)
      refresh()
    } catch (error) {
      toast({ title: 'Could not delete', description: getErrorMessage(error), tone: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium">Gallery</p>
        <Button size="sm" onClick={() => inputRef.current?.click()} loading={uploading}>
          <ImagePlus className="size-3.5" /> Add images
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(event) => void onFiles(event.target.files)}
          aria-label="Add gallery images"
        />
      </div>

      {images.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="aspect-[16/10]" />
          <Skeleton className="aspect-[16/10]" />
        </div>
      ) : images.data && images.data.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {images.data.map((image, i) => (
            <li key={image.id} className="space-y-2">
              <SmartImage src={image.imageUrl} alt={image.caption ?? ''} />
              <Input
                defaultValue={image.caption ?? ''}
                placeholder="Caption"
                onBlur={(event) => void saveCaption(image, event.target.value)}
                aria-label="Caption"
              />
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => void move(i, -1)} disabled={i === 0} aria-label="Move up">
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => void move(i, 1)}
                  disabled={i === (images.data?.length ?? 0) - 1}
                  aria-label="Move down"
                >
                  <ArrowDown className="size-3.5" />
                </Button>
                <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setPendingDelete(image)}>
                  <Trash2 className="size-3.5" /> Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="border border-dashed border-line p-6 text-center text-sm text-fg-muted">No gallery images yet.</p>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Remove this image?"
        description="It will be deleted from storage as well. This cannot be undone."
        confirmLabel="Remove"
        destructive
        loading={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  )
}
