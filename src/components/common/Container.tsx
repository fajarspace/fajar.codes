import type { ElementType, ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface ContainerProps {
  as?: ElementType
  className?: string
  children: ReactNode
  id?: string
}

export function Container({ as: Tag = 'div', className, children, id }: ContainerProps) {
  return (
    <Tag id={id} className={cn('container-editorial', className)}>
      {children}
    </Tag>
  )
}
