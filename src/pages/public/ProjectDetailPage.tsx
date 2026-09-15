import { useParams } from 'react-router-dom'
import { ArrowUpRight, Code2 } from 'lucide-react'
import { useQuery } from '@/hooks/useQuery'
import { useSeo } from '@/hooks/useSeo'
import { getNextProject, getProjectBySlug } from '@/services'
import { isNotFoundError } from '@/utils/errors'
import { labels } from '@/utils/format'
import { extractHeadings } from '@/utils/markdown'
import { site } from '@/constants/site'
import { Container } from '@/components/common/Container'
import { Markdown } from '@/components/common/Markdown'
import { SmartImage } from '@/components/common/SmartImage'
import { Skeleton, SkeletonText } from '@/components/common/Skeleton'
import { ErrorState } from '@/components/common/States'
import { ProjectGallery } from '@/components/project/ProjectGallery'
import { NextProject } from '@/components/project/NextProject'
import { TableOfContents } from '@/components/notes/TableOfContents'
import NotFoundPage from './NotFoundPage'

export default function ProjectDetailPage() {
  const { slug = '' } = useParams()
  const project = useQuery(slug ? `project:${slug}` : null, () => getProjectBySlug(slug))
  const next = useQuery(project.data ? `project:${slug}:next` : null, () => getNextProject(project.data!), {
    enabled: Boolean(project.data),
  })

  useSeo({
    title: project.data?.title ?? 'Project',
    description: project.data ? project.data.shortDescription : undefined,
    image: project.data?.coverUrl ?? site.ogImage,
    canonicalPath: `/work/${slug}`,
    jsonLd: project.data
      ? {
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          name: project.data.title,
          description: project.data.shortDescription,
          url: `${site.url}/work/${project.data.slug}`,
          dateCreated: String(project.data.year),
          author: { '@type': 'Person', name: site.author.name },
          keywords: project.data.techStack.join(', '),
        }
      : undefined,
  })

  if (project.status === 'error') {
    if (isNotFoundError(project.error)) return <NotFoundPage />
    return (
      <Container className="py-20">
        <ErrorState error={project.error} onRetry={project.refetch} />
      </Container>
    )
  }

  if (project.isLoading || !project.data) {
    return (
      <Container className="pb-16 pt-14 sm:pt-20">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-6 h-14 w-2/3" />
        <Skeleton className="mt-4 h-5 w-1/2" />
        <div className="mt-12 grid gap-6 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonText key={i} lines={2} />
          ))}
        </div>
        <Skeleton className="mt-12 w-full" />
        <div className="mt-12 h-[60vh] skeleton" />
      </Container>
    )
  }

  const p = project.data
  const headings = extractHeadings(p.content)

  return (
    <>
      <article>
        <Container as="header" id="project-top" className="pb-10 pt-14 sm:pt-20">
          <p className="label-caps">Work / {labels.category[p.category]}</p>
          <h1 className="mt-6 max-w-4xl font-serif text-5xl leading-[1.02] tracking-tight sm:text-7xl">{p.title}</h1>
          <p className="mt-6 max-w-2xl text-lg text-fg-muted">{p.shortDescription}</p>

          <dl className="mt-10 grid gap-x-8 gap-y-6 border-t border-line pt-6 text-sm sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <dt className="label-caps">Year</dt>
              <dd className="mt-2 tabular">{p.year}</dd>
            </div>
            <div>
              <dt className="label-caps">Role</dt>
              <dd className="mt-2">{p.role ?? '—'}</dd>
            </div>
            <div>
              <dt className="label-caps">Status</dt>
              <dd className="mt-2">{labels.projectStatus[p.status]}</dd>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <dt className="label-caps">Stack</dt>
              <dd className="mt-2">{p.techStack.join(', ')}</dd>
            </div>
            <div>
              <dt className="label-caps">Links</dt>
              <dd className="mt-2 flex flex-col gap-1">
                {p.liveUrl ? (
                  <a href={p.liveUrl} target="_blank" rel="noreferrer noopener" className="link-underline inline-flex items-center gap-1">
                    Live site <ArrowUpRight className="size-3" />
                  </a>
                ) : null}
                {p.repositoryUrl ? (
                  <a href={p.repositoryUrl} target="_blank" rel="noreferrer noopener" className="link-underline inline-flex items-center gap-1">
                    <Code2 className="size-3" /> Source
                  </a>
                ) : null}
                {!p.liveUrl && !p.repositoryUrl ? <span className="text-fg-muted">Not public</span> : null}
              </dd>
            </div>
          </dl>
        </Container>

        {p.coverUrl ? (
          <Container className="pb-16">
            <SmartImage src={p.coverUrl} alt={`${p.title} cover`} ratio="auto" priority />
          </Container>
        ) : null}

        <Container className="pb-20">
          <div className="grid gap-12 lg:grid-cols-12">
            <aside className="hidden lg:col-span-3 lg:block">
              <div className="sticky top-24 space-y-6 text-sm">
                <TableOfContents headings={headings} />
                <div className="border-t border-line pt-4 text-xs text-fg-muted">
                  Written as it happened: background, problem, process, result.
                </div>
              </div>
            </aside>
            <div className="lg:col-span-8 lg:col-start-4">
              <Markdown content={p.content} />
            </div>
          </div>
        </Container>

        {p.images.length > 0 ? (
          <Container as="section" className="pb-20" aria-label="Gallery">
            <div className="mb-8 border-t border-line pt-4">
              <p className="label-caps">Gallery</p>
            </div>
            <ProjectGallery images={p.images} />
          </Container>
        ) : null}

        {next.data ? (
          <Container className="pb-8">
            <NextProject project={next.data} />
          </Container>
        ) : null}
      </article>
    </>
  )
}
