import { Link } from 'react-router-dom'
import type { Note } from '@/types/content'
import { formatDate } from '@/utils/format'

export function RelatedNotes({ notes }: { notes: Note[] }) {
  if (notes.length === 0) return null
  return (
    <section aria-labelledby="related-heading" className="border-t border-line pt-6">
      <p id="related-heading" className="label-caps">
        Keep reading
      </p>
      <ul className="mt-4 divide-y divide-line">
        {notes.map((note) => (
          <li key={note.id}>
            <Link to={`/${note.slug}`} className="group flex items-baseline justify-between gap-4 py-3">
              <span className="font-serif text-xl leading-snug group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                {note.title}
              </span>
              <span className="shrink-0 tabular text-xs text-fg-muted">{formatDate(note.publishedAt, { day: undefined })}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
