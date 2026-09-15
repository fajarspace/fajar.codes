import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Eye, PencilLine } from 'lucide-react'
import { useQuery } from '@/hooks/useQuery'
import { useToast } from '@/hooks/useToast'
import { queryCache } from '@/lib/query-cache'
import { createProject, getProjectById, updateProject, type ProjectInput } from '@/services'
import type { ProjectWithImages } from '@/types/content'
import { getErrorMessage } from '@/utils/errors'
import { labels, slugify } from '@/utils/format'
import { emptyToNull, projectSchema, splitList, type ProjectFormValues } from '@/utils/validation'
import { projectCategories } from '@/constants/site'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Checkbox, Field, Input, Select, Textarea } from '@/components/admin/Field'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { MarkdownEditor } from '@/components/admin/MarkdownEditor'
import { GalleryManager } from '@/components/admin/GalleryManager'
import { Button, ButtonLink } from '@/components/common/Button'
import { Markdown } from '@/components/common/Markdown'
import { SmartImage } from '@/components/common/SmartImage'
import { Skeleton } from '@/components/common/Skeleton'
import { ErrorState } from '@/components/common/States'

const emptyValues: ProjectFormValues = {
  title: '',
  slug: '',
  shortDescription: '',
  content: '## Background\n\n\n## The problem\n\n\n## Process\n\n\n## Result\n',
  category: 'web',
  year: new Date().getFullYear(),
  role: '',
  techStack: '',
  coverUrl: '',
  liveUrl: '',
  repositoryUrl: '',
  status: 'draft',
  featured: false,
  sortOrder: 0,
}

function toFormValues(p: ProjectWithImages): ProjectFormValues {
  return {
    title: p.title,
    slug: p.slug,
    shortDescription: p.shortDescription,
    content: p.content,
    category: p.category,
    year: p.year,
    role: p.role ?? '',
    techStack: p.techStack.join(', '),
    coverUrl: p.coverUrl ?? '',
    liveUrl: p.liveUrl ?? '',
    repositoryUrl: p.repositoryUrl ?? '',
    status: p.status,
    featured: p.featured,
    sortOrder: p.sortOrder,
  }
}

function toInput(values: ProjectFormValues): ProjectInput {
  return {
    title: values.title,
    slug: values.slug,
    shortDescription: values.shortDescription,
    content: values.content,
    category: values.category,
    year: values.year,
    role: emptyToNull(values.role),
    techStack: splitList(values.techStack),
    coverUrl: emptyToNull(values.coverUrl),
    liveUrl: emptyToNull(values.liveUrl),
    repositoryUrl: emptyToNull(values.repositoryUrl),
    status: values.status,
    featured: values.featured,
    sortOrder: values.sortOrder,
  }
}

export default function ProjectEditorPage() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const { toast } = useToast()
  const [preview, setPreview] = useState(false)

  const existing = useQuery(id ? `admin:project:${id}` : null, () => getProjectById(id ?? ''), { staleTime: 0 })

  const form = useForm<ProjectFormValues>({ resolver: zodResolver(projectSchema), defaultValues: emptyValues })
  const { register, handleSubmit, control, watch, setValue, reset, formState } = form

  useEffect(() => {
    if (existing.data) reset(toFormValues(existing.data))
  }, [existing.data, reset])

  // Auto-slug while the slug has not been touched.
  const title = watch('title')
  useEffect(() => {
    if (isNew && !formState.dirtyFields.slug) setValue('slug', slugify(title))
  }, [title, isNew, formState.dirtyFields.slug, setValue])

  const onSubmit = handleSubmit(async (values) => {
    try {
      const input = toInput(values)
      if (isNew) {
        const created = await createProject(input)
        toast({ title: 'Project created', description: created.title, tone: 'success' })
        invalidate()
        navigate(`/admin/projects/${created.id}`, { replace: true })
      } else if (id) {
        await updateProject(id, input)
        toast({ title: 'Saved', description: values.title, tone: 'success' })
        invalidate()
        reset(values)
      }
    } catch (error) {
      toast({ title: 'Could not save', description: getErrorMessage(error), tone: 'error' })
    }
  })

  if (!isNew && existing.status === 'error') {
    return <ErrorState error={existing.error} onRetry={existing.refetch} />
  }
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
        title={isNew ? 'New project' : (existing.data?.title ?? 'Edit project')}
        description={isNew ? 'Save as draft first; publish when the case study reads well.' : `/work/${existing.data?.slug ?? ''}`}
        actions={
          <>
            <ButtonLink to="/admin/projects" size="sm" variant="ghost">
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
        <ProjectPreview values={values} />
      ) : (
        <form onSubmit={onSubmit} className="space-y-10" noValidate>
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-8">
              <Field label="Title" htmlFor="title" error={formState.errors.title?.message}>
                <Input id="title" {...register('title')} aria-invalid={Boolean(formState.errors.title)} />
              </Field>
              <Field label="Slug" htmlFor="slug" error={formState.errors.slug?.message} hint="Public URL: /work/<slug>">
                <Input id="slug" {...register('slug')} aria-invalid={Boolean(formState.errors.slug)} />
              </Field>
              <Field label="One-line description" htmlFor="shortDescription" error={formState.errors.shortDescription?.message}>
                <Textarea id="shortDescription" rows={2} {...register('shortDescription')} />
              </Field>
              <Controller
                control={control}
                name="content"
                render={({ field }) => <MarkdownEditor value={field.value} onChange={field.onChange} error={formState.errors.content?.message} />}
              />
            </div>

            <aside className="space-y-6 lg:col-span-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Status" htmlFor="status">
                  <Select id="status" {...register('status')}>
                    {(Object.keys(labels.projectStatus) as Array<keyof typeof labels.projectStatus>).map((s) => (
                      <option key={s} value={s}>
                        {labels.projectStatus[s]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Category" htmlFor="category">
                  <Select id="category" {...register('category')}>
                    {projectCategories
                      .filter((c) => c.value !== 'all')
                      .map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                  </Select>
                </Field>
                <Field label="Year" htmlFor="year" error={formState.errors.year?.message}>
                  <Input id="year" type="number" {...register('year', { valueAsNumber: true })} />
                </Field>
                <Field label="Sort order" htmlFor="sortOrder" error={formState.errors.sortOrder?.message} hint="Lower shows first">
                  <Input id="sortOrder" type="number" {...register('sortOrder', { valueAsNumber: true })} />
                </Field>
              </div>
              <Checkbox label="Featured on the home page" {...register('featured')} />
              <Field label="Role" htmlFor="role">
                <Input id="role" placeholder="Design, engineering" {...register('role')} />
              </Field>
              <Field label="Tech stack" htmlFor="techStack" hint="Comma separated">
                <Input id="techStack" placeholder="React, TypeScript, Supabase" {...register('techStack')} />
              </Field>
              <Field label="Live URL" htmlFor="liveUrl" error={formState.errors.liveUrl?.message}>
                <Input id="liveUrl" type="url" placeholder="https://" {...register('liveUrl')} />
              </Field>
              <Field label="Repository URL" htmlFor="repositoryUrl" error={formState.errors.repositoryUrl?.message}>
                <Input id="repositoryUrl" type="url" placeholder="https://github.com/…" {...register('repositoryUrl')} />
              </Field>
              <Controller
                control={control}
                name="coverUrl"
                render={({ field }) => <ImageUpload label="Cover" folder="projectCover" value={field.value} onChange={field.onChange} />}
              />
            </aside>
          </div>

          {!isNew && id ? (
            <div className="border-t border-line pt-8">
              <GalleryManager projectId={id} />
            </div>
          ) : (
            <p className="border-t border-line pt-6 text-xs text-fg-muted">Save the project first to add gallery images.</p>
          )}
        </form>
      )}
    </>
  )
}

function invalidate() {
  queryCache.invalidate('projects')
  queryCache.invalidate('project:')
  queryCache.invalidate('admin:')
  queryCache.invalidate('search-index')
}

function ProjectPreview({ values }: { values: ProjectFormValues }) {
  const stack = splitList(values.techStack)
  return (
    <article className="border border-line p-6 sm:p-10">
      <p className="label-caps tabular">Preview — {labels.category[values.category]}</p>
      <h1 className="mt-6 font-serif text-4xl leading-[1.02] tracking-tight sm:text-6xl">{values.title || 'Untitled project'}</h1>
      <p className="mt-4 max-w-2xl text-lg text-fg-muted">{values.shortDescription}</p>
      <dl className="mt-8 grid gap-6 border-t border-line pt-6 text-sm sm:grid-cols-4">
        <div>
          <dt className="label-caps">Year</dt>
          <dd className="mt-2 tabular">{values.year}</dd>
        </div>
        <div>
          <dt className="label-caps">Role</dt>
          <dd className="mt-2">{values.role || '—'}</dd>
        </div>
        <div>
          <dt className="label-caps">Status</dt>
          <dd className="mt-2">{labels.projectStatus[values.status]}</dd>
        </div>
        <div>
          <dt className="label-caps">Stack</dt>
          <dd className="mt-2">{stack.join(', ') || '—'}</dd>
        </div>
      </dl>
      {values.coverUrl ? (
        <div className="mt-10">
          <SmartImage src={values.coverUrl} alt="" ratio="16 / 9" />
        </div>
      ) : null}
      <div className="mx-auto mt-12 max-w-2xl">
        <Markdown content={values.content} />
      </div>
    </article>
  )
}
