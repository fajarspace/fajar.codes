import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

type Variant = 'primary' | 'outline' | 'ghost' | 'accent'
type Size = 'sm' | 'md'

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 select-none'

const variants: Record<Variant, string> = {
  primary: 'bg-fg text-bg hover:bg-fg/85',
  outline: 'border border-line text-fg hover:border-fg',
  ghost: 'text-fg hover:bg-bg-elevated',
  accent: 'bg-accent text-accent-fg hover:bg-accent/85',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'outline', size = 'md', loading = false, disabled, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className="size-3 animate-pulse rounded-full bg-current" aria-hidden /> : null}
      {children}
    </button>
  )
})

interface ButtonLinkProps {
  to: string
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
  external?: boolean
}

export function ButtonLink({ to, variant = 'outline', size = 'md', className, children, external }: ButtonLinkProps) {
  const classes = cn(base, variants[variant], sizes[size], className)
  if (external) {
    return (
      <a href={to} target="_blank" rel="noreferrer noopener" className={classes}>
        {children}
      </a>
    )
  }
  return (
    <Link to={to} className={classes}>
      {children}
    </Link>
  )
}
