import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Eye, PencilLine } from 'lucide-react'
import { useQuery } from '@/hooks/useQuery'
import { useToast } from '@/hooks/useToast'
import { createNote, getNoteById, listTags, updateNote, type NoteInput } from '@/services'
import type { Note } from '@/types/content'
import { getErrorMessage } from '@/utils/errors'
import { estimateReadingTime, formatDate, slugify } from '@/utils/format'
import { emptyToNull, noteSchema, splitList, type NoteFormValues } from '@/utils/validation'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Field, Input, Select, Textarea } from '@/components/admin/Field'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { MarkdownEditor } from '@/components/admin/MarkdownEditor'
import { Button, ButtonLink } from '@/components/common/Button'
import { Markdown } from '@/components/common/Markdown'
import { SmartImage } from '@/components/common/SmartImage'
import { Skeleton } from '@/components/common/Skeleton'
import { ErrorState } from '@/components/common/States'
import { invalidateNotes } from './NotesAdminPage'

const emptyValues: NoteFormValues = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverUrl: '',
  tags: '',
  status: 'draft',
  publishedAt: '',
}

/** ISO → yyyy-mm-dd for <input type="date"> */
function toDateInput(iso: string | null): string {
  return iso ? iso.slice(0, 10) : ''
}

function toFormValues(n: Note): NoteFormValues {
  return {
    title: n.title,
    slug: n.slug,
    excerpt: n.excerpt,
    content: n.content,
    coverUrl: n.coverUrl ?? '',
    tags: n.tags.map((t) => t.name).join(', '),
    status: n.status,
    publishedAt: toDateInput(n.publishedAt),
  }
}

function toInput(values: NoteFormValues): NoteInput {
  const publishedAt =
    values.status === 'published'
      ? values.publishedAt
        ? new Date(`${values.publishedAt}T09:00:00+07:00`).toISOString()
        : new Date().toISOString()
      : null
  return {
    title: values.title,
    slug: values.slug,
    excerpt: values.excerpt,
    content: values.content,
    coverUrl: emptyToNull(values.coverUrl),
    readingTime: estimateReadingTime(values.content),
    status: values.status,
    publishedAt,
    tagNames: splitList(values.tags),
  }
}

export default function NoteEditorPage() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const { toast } = useToast()
  const [preview, setPreview] = useState(false)

  const existing = useQuery(id ? `admin:note:${id}` : null, () => getNoteById(id ?? ''), { staleTime: 0 })
  const tags = useQuery('tags', listTags)

  const form = useForm<NoteFormValues>({ resolver: zodResolver(noteSchema), defaultValues: emptyValues })
  const { register, handleSubmit, control, watch, setValue, reset, formState } = form

  useEffect(() => {
    if (existing.data) reset(toFormValues(existing.data))
  }, [existing.data, reset])

  const title = watch('title')
  useEffect(() => {
    if (isNew && !formState.dirtyFields.slug) setValue('slug', slugify(title))
  }, [title, isNew, formState.dirtyFields.slug, setValue])

  const content = watch('content')
  const readingTime = useMemo(() => estimateReadingTime(content), [content])

  const onSubmit = handleSubmit(async (values) => {
    try {
      const input = toInput(values)
      if (isNew) {
        const created = await createNote(input)
        toast({ title: 'Note created', description: created.title, tone: 'success' })
        invalidateNotes()
        navigate(`/admin/notes/${created.id}`, { replace: true })
      } else if (id) {
        const saved = await updateNote(id, input)
        toast({ title: 'Saved', description: saved.title, tone: 'success' })
        invalidateNotes()
        reset(toFormValues(saved))
      }
    } catch (error) {
      toast({ title: 'Could not save', description: getErrorMessage(error), tone: 'error' })
    }
  })

  if (!isNew && existing.status === 'error') return <ErrorState error={existing.error} onRetry={existing.refetch} />
  if (!isNew && existing.isLoading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const values = watch()

  return (
    <>
      <AdminPageHeader
        title={isNew ? 'New note' : (existing.data?.title ?? 'Edit note')}
        description={isNew ? 'Drafts are private until you flip the status.' : `/notes/${existing.data?.slug ?? ''} · ${readingTime} min read`}
        actions={
          <>
            <ButtonLink to="/admin/notes" size="sm" variant="ghost">
              <ArrowLeft className="size-3.5" /> Back
            </ButtonLink>
            <Button size="sm" onClick={() => setPreview((v) => !v)} aria-pressed={preview}>
              {preview ? (
                <>
                  <PencilLine className="size-3.5" /> Edit
                </>
              ) : (
                <>
                  <Eye className="size-3.5" /> Preview
                </>
              )}
            </Button>
            <Button size="sm" variant="primary" onClick={() => void onSubmit()} loading={formState.isSubmitting} disabled={!formState.isDirty && !isNew}>
              {isNew ? 'Create draft' : 'Save'}
            </Button>
          </>
        }
      />

      {preview ? (
        <NotePreview values={values} readingTime={readingTime} />
      ) : (
        <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-12" noValidate>
          <div className="space-y-6 lg:col-span-8">
            <Field label="Title" htmlFor="title" error={formState.errors.title?.message}>
              <Input id="title" {...register('title')} aria-invalid={Boolean(formState.errors.title)} />
            </Field>
            <Field label="Slug" htmlFor="slug" error={formState.errors.slug?.message} hint="Public URL: /notes/<slug>">
              <Input id="slug" {...register('slug')} aria-invalid={Boolean(formState.errors.slug)} />
            </Field>
            <Field label="Excerpt" htmlFor="excerpt" error={formState.errors.excerpt?.message} hint="Shown in lists and as the meta description.">
              <Textarea id="excerpt" rows={2} {...register('excerpt')} />
            </Field>
            <Controller
              control={control}
              name="content"
              render={({ field }) => (
                <MarkdownEditor value={field.value} onChange={field.onChange} error={formState.errors.content?.message} minRows={24} />
              )}
            />
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Status" htmlFor="status">
                <Select id="status" {...register('status')}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </Select>
              </Field>
              <Field label="Published on" htmlFor="publishedAt" hint="Blank = today">
                <Input id="publishedAt" type="date" {...register('publishedAt')} />
              </Field>
            </div>
            <Field
              label="Tags"
              htmlFor="tags"
              hint={tags.data?.length ? `Existing: ${tags.data.map((t) => t.name).join(', ')}` : 'Comma separated; new tags are created automatically.'}
            >
              <Input id="tags" placeholder="Engineering, Product" {...register('tags')} />
            </Field>
            <Controller
              control={control}
              name="coverUrl"
              render={({ field }) => <ImageUpload label="Cover (optional)" folder="noteCover" value={field.value} onChange={field.onChange} />}
            />
            <p className="border-t border-line pt-4 text-xs text-fg-muted">
              Reading time is calculated on save: <span className="tabular text-fg">{readingTime} min</span>.
            </p>
          </aside>
        </form>
      )}
    </>
  )
}

function NotePreview({ values, readingTime }: { values: NoteFormValues; readingTime: number }) {
  const tags = splitList(values.tags)
  return (
    <article className="border border-line p-6 sm:p-10">
      <div className="mx-auto max-w-2xl">
        <p className="label-caps tabular">Preview — Notes</p>
        <h1 className="mt-6 font-serif text-4xl leading-[1.08] tracking-tight sm:text-5xl">{values.title || 'Untitled note'}</h1>
        <p className="mt-5 text-lg text-fg-muted">{values.excerpt}</p>
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4 text-xs text-fg-muted">
          <span className="tabular">{values.publishedAt ? formatDate(values.publishedAt) : formatDate(new Date().toISOString())}</span>
          <span>·</span>
          <span>{readingTime} min read</span>
          {tags.map((t) => (
            <span key={t}>#{slugify(t)}</span>
          ))}
        </div>
        {values.coverUrl ? (
          <div className="mt-8">
            <SmartImage src={values.coverUrl} alt="" ratio="16 / 9" />
          </div>
        ) : null}
        <div className="mt-10">
          <Markdown content={values.content} />
        </div>
      </div>
    </article>
  )
}
