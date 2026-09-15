import { useState } from 'react'
import { cn } from '@/utils/cn'
import { Markdown } from '@/components/common/Markdown'
import { Textarea } from './Field'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  error?: string
  id?: string
  minRows?: number
}

/** Plain textarea with a live markdown preview toggle. Markdown is stored as-is. */
export function MarkdownEditor({ value, onChange, error, id = 'content', minRows = 18 }: MarkdownEditorProps) {
  const [mode, setMode] = useState<'write' | 'preview'>('write')

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-medium">
          Content <span className="font-normal text-fg-muted">(Markdown)</span>
        </label>
        <div className="flex gap-1" role="tablist" aria-label="Editor mode">
          {(['write', 'preview'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={cn('px-2 py-1 text-xs capitalize', mode === m ? 'text-fg underline underline-offset-4' : 'text-fg-muted hover:text-fg')}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      {mode === 'write' ? (
        <Textarea
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={minRows}
          className="font-mono text-[13px]"
          spellCheck
          aria-invalid={error ? true : undefined}
        />
      ) : (
        <div className="min-h-64 border border-line p-6">
          {value.trim() ? <Markdown content={value} /> : <p className="text-sm text-fg-muted">Nothing to preview yet.</p>}
        </div>
      )}
      {error ? (
        <p className="text-xs" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
