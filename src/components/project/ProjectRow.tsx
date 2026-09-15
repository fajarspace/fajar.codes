import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import type { Project } from '@/types/content'
import { labels, padIndex } from '@/utils/format'
import { cn } from '@/utils/cn'
import { SmartImage } from '@/components/common/SmartImage'

export type ProjectView = 'list' | 'index'

interface ProjectRowProps {
  project: Project
  index: number
  view: ProjectView
  finePointer: boolean
  onHover: (project: Project | null) => void
}

function StatusDot({ status }: { status: Project['status'] }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-fg-muted">
      <span
        className={cn('size-1.5 rounded-full', {
          'bg-accent ring-1 ring-fg/20': status === 'live',
          'bg-fg': status === 'in_progress',
          'bg-line': status === 'archived' || status === 'draft',
        })}
        aria-hidden
      />
      {labels.projectStatus[status]}
    </span>
  )
}

/**
 * One editorial row. On fine-pointer devices the whole row is a link with a trailing thumbnail;
 * on touch devices the row expands to reveal the thumbnail and an explicit link.
 */
export function ProjectRow({ project, index, view, finePointer, onHover }: ProjectRowProps) {
  const [expanded, setExpanded] = useState(false)
  const href = `/work/${project.slug}`

  const meta = (
    <>
      <span className="tabular text-xs text-fg-muted">{project.year}</span>
      <span className="text-xs text-fg-muted">{labels.category[project.category]}</span>
      <StatusDot status={project.status} />
    </>
  )

  if (view === 'index') {
    return (
      <li className="border-b border-line last:border-b-0">
        <Link
          to={href}
          onMouseEnter={() => onHover(project)}
          onMouseLeave={() => onHover(null)}
          className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-3 py-3 sm:grid-cols-[3rem_1fr_4rem_6rem_7rem]"
        >
          <span className="tabular text-xs text-fg-muted">{padIndex(index)}</span>
          <span className="flex min-w-0 items-baseline gap-3">
            <span className="truncate text-sm font-medium group-hover:underline group-hover:underline-offset-4 group-hover:decoration-1">
              {project.title}
            </span>
            <span className="hidden flex-1 border-b border-dotted border-line sm:block" aria-hidden />
          </span>
          <span className="contents sm:contents">{meta}</span>
        </Link>
      </li>
    )
  }

  const body = (
    <>
      <span className="tabular pt-1 text-xs text-fg-muted">{padIndex(index)}</span>
      <div className="min-w-0">
        <h3 className="font-serif text-2xl leading-tight sm:text-3xl">
          <span className="group-hover:underline group-hover:underline-offset-4 group-hover:decoration-1">{project.title}</span>
        </h3>
        <p className="mt-1.5 max-w-xl text-sm text-fg-muted">{project.shortDescription}</p>
        <p className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-2xs text-fg-muted">
          {project.techStack.map((tech, i) => (
            <span key={tech}>
              {tech}
              {i < project.techStack.length - 1 ? <span className="ml-2 text-line">·</span> : null}
            </span>
          ))}
        </p>
        <div className="mt-3 flex items-center gap-4 sm:hidden">{meta}</div>
      </div>
      <div className="hidden items-start justify-end gap-6 pt-1 sm:flex">{meta}</div>
    </>
  )

  const rowClass = 'group grid w-full grid-cols-[2.5rem_1fr] gap-3 py-6 text-left sm:grid-cols-[3rem_1fr_auto] sm:gap-6'

  if (finePointer) {
    return (
      <li className="border-b border-line last:border-b-0">
        <Link to={href} className={rowClass} onMouseEnter={() => onHover(project)} onMouseLeave={() => onHover(null)}>
          {body}
        </Link>
      </li>
    )
  }

  return (
    <li className="border-b border-line last:border-b-0">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={`project-preview-${project.id}`}
        className={rowClass}
      >
        {body}
      </button>
      <div id={`project-preview-${project.id}`} hidden={!expanded} className="pb-6 pl-[3.25rem]">
        <SmartImage src={project.coverUrl} alt={`${project.title} cover`} ratio="16 / 10" />
        <Link to={href} className="mt-3 inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4">
          Open case study <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </li>
  )
}
