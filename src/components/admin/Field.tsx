import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface FieldProps {
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  children: ReactNode
  className?: string
}

export function Field({ label, htmlFor, hint, error, children, className }: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="block text-xs font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-fg" role="alert">
          <span className="mr-1 inline-block size-1.5 rounded-full bg-fg align-middle" aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-fg-muted">{hint}</p>
      ) : null}
    </div>
  )
}

const control =
  'w-full border border-line bg-bg px-3 text-sm outline-none transition-colors placeholder:text-fg-muted focus:border-fg disabled:opacity-60 aria-[invalid=true]:border-fg'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...rest }, ref) {
  return <input ref={ref} className={cn(control, 'h-10', className)} {...rest} />
})

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, ...rest },
  ref,
) {
  return <textarea ref={ref} className={cn(control, 'min-h-24 py-2 leading-relaxed', className)} {...rest} />
})

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, children, ...rest }, ref) {
  return (
    <select ref={ref} className={cn(control, 'h-10 appearance-none pr-8', className)} {...rest}>
      {children}
    </select>
  )
})

export const Checkbox = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label: string }>(function Checkbox(
  { label, className, ...rest },
  ref,
) {
  return (
    <label className={cn('inline-flex cursor-pointer select-none items-center gap-2 text-sm', className)}>
      <input ref={ref} type="checkbox" className="size-4 accent-[var(--fg)]" {...rest} />
      {label}
    </label>
  )
})
