import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useSeo } from '@/hooks/useSeo'
import { site } from '@/constants/site'
import { Container } from '@/components/common/Container'
import { RandomNoteButton } from '@/components/notes/RandomNoteButton'

export default function NotFoundPage() {
  useSeo({ title: 'Not found', noIndex: true })
  return (
    <Container className="flex min-h-[70vh] flex-col justify-center py-20">
      <p className="label-caps tabular">404 — Uncharted</p>
      <h1 className="mt-6 max-w-3xl font-serif text-4xl leading-[1.05] tracking-tight sm:text-6xl">
        You’ve reached a part of the internet <mark>I haven’t built yet.</mark>
      </h1>
      <p className="mt-6 max-w-md text-sm text-fg-muted">
        The page might have moved, the link might be wrong, or this is a draft that isn’t ready. Last known location:{' '}
        {site.location}.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-6 text-sm">
        <Link to="/" className="inline-flex items-center gap-2 border-b border-fg pb-0.5">
          <ArrowLeft className="size-3.5" /> Back to the index
        </Link>
        <RandomNoteButton withIcon className="text-fg-muted hover:text-fg" label="Or read something random" />
      </div>
    </Container>
  )
}
