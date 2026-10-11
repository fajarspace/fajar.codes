import { Link } from 'react-router-dom'
import type { Project } from '@/types/content'
import { labels } from '@/utils/format'
import { cn } from '@/utils/cn'
import { SmartImage } from '@/components/common/SmartImage'

export type ProjectView = 'list' | 'index'

interface ProjectRowProps {
  project: Project
  view: ProjectView
  /** Only wired up in the compact index view, where there is no inline cover. */
  onHover?: (project: Project | null) => void
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
 * One editorial row: text on the left, the project cover on the right.
 * The compact index view drops the cover and shows a preview that follows the cursor instead.
 */
export function ProjectRow({ project, view, onHover }: ProjectRowProps) {
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
          onMouseEnter={() => onHover?.(project)}
          onMouseLeave={() => onHover?.(null)}
          className="group grid grid-cols-[1fr_auto] items-baseline gap-3 py-3 sm:grid-cols-[1fr_4rem_6rem_7rem]"
        >
          <span className="flex min-w-0 items-baseline gap-3">
            <span className="truncate text-sm font-medium group-hover:underline group-hover:underline-offset-4 group-hover:decoration-1">
              {project.title}
            </span>
            <span className="hidden flex-1 border-b border-dotted border-line sm:block" aria-hidden />
          </span>
          {meta}
        </Link>
      </li>
    )
  }

  return (
    <li className="border-b border-line last:border-b-0">
      <Link to={href} className="group grid gap-5 py-6 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-10">
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
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">{meta}</div>
        </div>

        {project.coverUrl ? (
          <SmartImage
            src={project.coverUrl}
            alt=""
            ratio="16 / 10"
            wrapperClassName="w-full sm:w-48 lg:w-60"
            className="transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        ) : null}
      </Link>
    </li>
  )
}
