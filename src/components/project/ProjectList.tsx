import { useState } from 'react'
import type { Project } from '@/types/content'
import { useIsFinePointer } from '@/hooks/useMediaQuery'
import { HoverThumbnail } from './HoverThumbnail'
import { ProjectRow, type ProjectView } from './ProjectRow'

interface ProjectListProps {
  projects: Project[]
  view?: ProjectView
}

export function ProjectList({ projects, view = 'list' }: ProjectListProps) {
  const finePointer = useIsFinePointer()
  const [hovered, setHovered] = useState<Project | null>(null)
  // The list view already shows each cover inline, so the cursor preview is only for the compact index.
  const showHoverPreview = finePointer && view === 'index'

  return (
    <>
      <ul>
        {projects.map((project) => (
          <ProjectRow key={project.id} project={project} view={view} onHover={showHoverPreview ? setHovered : undefined} />
        ))}
      </ul>
      {showHoverPreview ? <HoverThumbnail project={hovered} /> : null}
    </>
  )
}
