import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { Project } from '@/types/content'

export function NextProject({ project }: { project: Project }) {
  return (
    <Link to={`/work/${project.slug}`} className="group block border-t border-line pt-6">
      <p className="label-caps">Next project</p>
      <p className="mt-3 flex items-center gap-4 font-serif text-4xl leading-none sm:text-6xl">
        <span className="group-hover:underline group-hover:decoration-1 group-hover:underline-offset-8">{project.title}</span>
        <ArrowRight className="size-6 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 motion-reduce:transition-none" />
      </p>
      <p className="mt-3 max-w-lg text-sm text-fg-muted">{project.shortDescription}</p>
    </Link>
  )
}
