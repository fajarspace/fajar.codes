import { Link } from 'react-router-dom'
import type { Note } from '@/types/content'
import { formatDate } from '@/utils/format'

export type NoteView = 'list' | 'index'

interface NoteListProps {
  notes: Note[]
  view?: NoteView
}

export function NoteList({ notes, view = 'list' }: NoteListProps) {
  return (
    <ul>
      {notes.map((note) => (
        <li key={note.id} className="border-b border-line last:border-b-0">
          <Link
            to={`/${note.slug}`}
            className={
              view === 'index'
                ? 'group grid grid-cols-[1fr_auto] items-baseline gap-3 py-3 sm:grid-cols-[1fr_7rem]'
                : 'group grid grid-cols-1 gap-3 py-6 sm:grid-cols-[1fr_9rem] sm:gap-6'
            }
          >
            {view === 'index' ? (
              <>
                <span className="flex min-w-0 items-baseline gap-3">
                  <span className="truncate text-sm font-medium group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                    {note.title}
                  </span>
                  <span className="hidden flex-1 border-b border-dotted border-line sm:block" aria-hidden />
                </span>
                <span className="tabular text-xs text-fg-muted">{formatDate(note.publishedAt, { day: undefined })}</span>
              </>
            ) : (
              <>
                <div className="min-w-0">
                  <h3 className="font-serif text-2xl leading-tight sm:text-3xl">
                    <span className="group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">{note.title}</span>
                  </h3>
                  <p className="mt-1.5 max-w-xl text-sm text-fg-muted">{note.excerpt}</p>
                  <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-fg-muted">
                    <span className="sm:hidden">{formatDate(note.publishedAt)}</span>
                    <span className="sm:hidden">·</span>
                    <span>{note.readingTime} min read</span>
                    {note.tags.length > 0 ? <span>·</span> : null}
                    {note.tags.map((tag) => (
                      <span key={tag.id}>#{tag.slug}</span>
                    ))}
                  </p>
                </div>
                <div className="hidden flex-col items-end gap-1 pt-1 text-xs text-fg-muted sm:flex">
                  <span className="tabular">{formatDate(note.publishedAt)}</span>
                </div>
              </>
            )}
          </Link>
        </li>
      ))}
    </ul>
  )
}
