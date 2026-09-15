import { LayoutList, Rows3, Search, X } from 'lucide-react'
import type { Tag } from '@/types/content'
import { cn } from '@/utils/cn'
import type { NoteView } from './NoteList'

interface NoteFiltersProps {
  query: string
  onQueryChange: (query: string) => void
  tags: Tag[]
  activeTag: string | null
  onTagChange: (slug: string | null) => void
  view: NoteView
  onViewChange: (view: NoteView) => void
}

export function NoteFilters({ query, onQueryChange, tags, activeTag, onTagChange, view, onViewChange }: NoteFiltersProps) {
  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center gap-3">
        <label className="relative flex-1">
          <span className="sr-only">Search notes</span>
          <Search className="pointer-events-none absolute left-0 top-1/2 size-4 -translate-y-1/2 text-fg-muted" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search notes…"
            className="h-10 w-full border-b border-line bg-transparent pl-7 pr-8 text-sm outline-none transition-colors placeholder:text-fg-muted focus:border-fg"
          />
          {query ? (
            <button
              type="button"
              onClick={() => onQueryChange('')}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-fg-muted hover:text-fg"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </label>

        <div className="flex items-center gap-1" role="group" aria-label="View">
          <button
            type="button"
            onClick={() => onViewChange('list')}
            aria-pressed={view === 'list'}
            className={cn('inline-flex h-8 items-center gap-1.5 px-2 text-xs', view === 'list' ? 'text-fg' : 'text-fg-muted hover:text-fg')}
          >
            <LayoutList className="size-3.5" /> <span className="hidden sm:inline">List</span>
          </button>
          <button
            type="button"
            onClick={() => onViewChange('index')}
            aria-pressed={view === 'index'}
            className={cn('inline-flex h-8 items-center gap-1.5 px-2 text-xs', view === 'index' ? 'text-fg' : 'text-fg-muted hover:text-fg')}
          >
            <Rows3 className="size-3.5" /> <span className="hidden sm:inline">Index</span>
          </button>
        </div>
      </div>

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5" role="group" aria-label="Filter by tag">
          <button
            type="button"
            onClick={() => onTagChange(null)}
            aria-pressed={activeTag === null}
            className={cn('text-xs transition-colors', activeTag === null ? 'text-fg underline underline-offset-4' : 'text-fg-muted hover:text-fg')}
          >
            All
          </button>
          {tags.map((tag) => {
            const active = tag.slug === activeTag
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => onTagChange(active ? null : tag.slug)}
                aria-pressed={active}
                className={cn('text-xs transition-colors', active ? 'text-fg underline underline-offset-4' : 'text-fg-muted hover:text-fg')}
              >
                #{tag.slug}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
