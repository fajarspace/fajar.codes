import { useMemo, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@/hooks/useQuery'
import { useSeo } from '@/hooks/useSeo'
import { getNoteBySlug, getRelatedNotes } from '@/services'
import { isNotFoundError } from '@/utils/errors'
import { formatDate } from '@/utils/format'
import { extractHeadings } from '@/utils/markdown'
import { site } from '@/constants/site'
import { Container } from '@/components/common/Container'
import { Markdown } from '@/components/common/Markdown'
import { SmartImage } from '@/components/common/SmartImage'
import { Skeleton, SkeletonText } from '@/components/common/Skeleton'
import { ErrorState } from '@/components/common/States'
import { ReadingProgress } from '@/components/notes/ReadingProgress'
import { TableOfContents } from '@/components/notes/TableOfContents'
import { ShareButton } from '@/components/notes/ShareButton'
import { RelatedNotes } from '@/components/notes/RelatedNotes'
import { RandomNoteButton } from '@/components/notes/RandomNoteButton'
import NotFoundPage from './NotFoundPage'

export default function NoteDetailPage() {
  const { slug = '' } = useParams()
  const articleRef = useRef<HTMLElement>(null)
  const note = useQuery(slug ? `note:${slug}` : null, () => getNoteBySlug(slug))
  const related = useQuery(note.data ? `note:${slug}:related` : null, () => getRelatedNotes(note.data!), {
    enabled: Boolean(note.data),
  })
  const headings = useMemo(() => (note.data ? extractHeadings(note.data.content) : []), [note.data])

  useSeo({
    title: note.data?.title ?? 'Note',
    description: note.data?.excerpt,
    image: note.data?.coverUrl ?? site.ogImage,
    type: 'article',
    canonicalPath: `/notes/${slug}`,
    publishedTime: note.data?.publishedAt ?? null,
    modifiedTime: note.data?.updatedAt ?? null,
    jsonLd: note.data
      ? {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: note.data.title,
          description: note.data.excerpt,
          datePublished: note.data.publishedAt,
          dateModified: note.data.updatedAt,
          url: `${site.url}/notes/${note.data.slug}`,
          image: note.data.coverUrl
            ? note.data.coverUrl.startsWith('/')
              ? `${site.url}${note.data.coverUrl}`
              : note.data.coverUrl
            : null,
          keywords: note.data.tags.map((t) => t.name).join(', '),
          author: { '@type': 'Person', name: site.author.name, url: site.url },
          publisher: { '@type': 'Person', name: site.author.name },
          mainEntityOfPage: `${site.url}/notes/${note.data.slug}`,
        }
      : undefined,
  })

  if (note.status === 'error') {
    if (isNotFoundError(note.error)) return <NotFoundPage />
    return (
      <Container className="py-20">
        <ErrorState error={note.error} onRetry={note.refetch} />
      </Container>
    )
  }

  if (note.isLoading || !note.data) {
    return (
      <Container className="pb-16 pt-14 sm:pt-20">
        <div className="mx-auto max-w-2xl">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-6 h-12 w-full" />
          <Skeleton className="mt-2 h-12 w-3/4" />
          <Skeleton className="mt-6 h-4 w-1/2" />
          <div className="mt-12 space-y-6">
            <SkeletonText lines={5} />
            <SkeletonText lines={4} />
            <SkeletonText lines={6} />
          </div>
        </div>
      </Container>
    )
  }

  const n = note.data

  return (
    <>
      <ReadingProgress target={articleRef} />

      <article ref={articleRef}>
        <Container as="header" id="note-top" className="pb-10 pt-14 sm:pt-20">
          <div className="mx-auto max-w-2xl">
            <p className="label-caps">
              <Link to="/notes" className="hover:text-fg">
                Notes
              </Link>
            </p>
            <h1 className="mt-6 font-serif text-4xl leading-[1.08] tracking-tight sm:text-5xl">{n.title}</h1>
            <p className="mt-5 text-lg text-fg-muted">{n.excerpt}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4 text-xs text-fg-muted">
              <time dateTime={n.publishedAt ?? undefined} className="tabular">
                {formatDate(n.publishedAt)}
              </time>
              <span>·</span>
              <span>{n.readingTime} min read</span>
              {n.tags.length > 0 ? <span>·</span> : null}
              {n.tags.map((tag) => (
                <Link key={tag.id} to={`/notes?tag=${tag.slug}`} className="hover:text-fg">
                  #{tag.slug}
                </Link>
              ))}
              <span className="ml-auto flex items-center gap-4">
                <ShareButton title={n.title} text={n.excerpt} />
              </span>
            </div>
          </div>
        </Container>

        {n.coverUrl ? (
          <Container className="pb-10">
            <div className="mx-auto max-w-2xl">
              <SmartImage src={n.coverUrl} alt="" ratio="auto" priority wrapperClassName="mx-auto max-w-xl" />
            </div>
          </Container>
        ) : null}

        <Container className="pb-20">
          <div className="relative mx-auto max-w-2xl">
            <aside className="mb-10 lg:absolute lg:bottom-0 lg:left-full lg:top-0 lg:mb-0 lg:ml-12 lg:w-56">
              <div className="lg:sticky lg:top-24">
                <TableOfContents headings={headings} />
              </div>
            </aside>
            <Markdown content={n.content} />

            <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-xs text-fg-muted">
              <span>
                Last updated <time dateTime={n.updatedAt}>{formatDate(n.updatedAt)}</time>
              </span>
              <span className="flex items-center gap-4">
                <RandomNoteButton withIcon className="hover:text-fg" />
                <ShareButton title={n.title} text={n.excerpt} />
              </span>
            </footer>
          </div>
        </Container>

        {related.data && related.data.length > 0 ? (
          <Container className="pb-8">
            <div className="mx-auto max-w-2xl">
              <RelatedNotes notes={related.data} />
            </div>
          </Container>
        ) : null}
      </article>
    </>
  )
}
