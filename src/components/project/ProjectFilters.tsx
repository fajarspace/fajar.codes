import { LayoutList, Rows3 } from 'lucide-react'
import { projectCategories } from '@/constants/site'
import type { ProjectCategory } from '@/types/content'
import { cn } from '@/utils/cn'
import type { ProjectView } from './ProjectRow'

export type CategoryFilter = ProjectCategory | 'all'

interface ProjectFiltersProps {
  category: CategoryFilter
  onCategoryChange: (category: CategoryFilter) => void
  view: ProjectView
  onViewChange: (view: ProjectView) => void
  counts: Record<CategoryFilter, number>
}

export function ProjectFilters({ category, onCategoryChange, view, onViewChange, counts }: ProjectFiltersProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
      <div role="tablist" aria-label="Filter by category" className="flex flex-wrap gap-x-5 gap-y-2">
        {projectCategories.map((item) => {
          const active = item.value === category
          return (
            <button
              key={item.value}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => onCategoryChange(item.value)}
              className={cn(
                'relative py-1 text-sm transition-colors',
                active ? 'text-fg' : 'text-fg-muted hover:text-fg',
              )}
            >
              {item.label}
              <sup className="ml-1 text-2xs tabular text-fg-muted">{counts[item.value]}</sup>
              <span
                aria-hidden
                className={cn('absolute -bottom-0.5 left-0 h-px w-full bg-fg transition-opacity', active ? 'opacity-100' : 'opacity-0')}
              />
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-1" role="group" aria-label="View">
        <button
          type="button"
          onClick={() => onViewChange('list')}
          aria-pressed={view === 'list'}
          className={cn('inline-flex h-8 items-center gap-1.5 px-2 text-xs', view === 'list' ? 'text-fg' : 'text-fg-muted hover:text-fg')}
        >
          <LayoutList className="size-3.5" /> List
        </button>
        <button
          type="button"
          onClick={() => onViewChange('index')}
          aria-pressed={view === 'index'}
          className={cn('inline-flex h-8 items-center gap-1.5 px-2 text-xs', view === 'index' ? 'text-fg' : 'text-fg-muted hover:text-fg')}
        >
          <Rows3 className="size-3.5" /> Index
        </button>
      </div>
    </div>
  )
}
