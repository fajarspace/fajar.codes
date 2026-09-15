import { useState } from 'react'
import type { Project } from '@/types/content'
import { useIsFinePointer } from '@/hooks/useMediaQuery'
import { HoverThumbnail } from './HoverThumbnail'
import { ProjectRow, type ProjectView } from './ProjectRow'

interface ProjectListProps {
  projects: Project[]
  view?: ProjectView
  /** Start numbering from this index (1-based). */
  startIndex?: number
}

export function ProjectList({ projects, view = 'list', startIndex = 1 }: ProjectListProps) {
  const finePointer = useIsFinePointer()
  const [hovered, setHovered] = useState<Project | null>(null)

  return (
    <>
      <ul>
        {projects.map((project, i) => (
          <ProjectRow
            key={project.id}
            project={project}
            index={startIndex + i}
            view={view}
            finePointer={finePointer}
            onHover={setHovered}
          />
        ))}
      </ul>
      {finePointer ? <HoverThumbnail project={hovered} /> : null}
    </>
  )
}
