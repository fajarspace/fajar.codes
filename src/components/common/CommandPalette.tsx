import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, CornerDownLeft, FileText, Folder, Hash, Moon, Shuffle, Sun } from 'lucide-react'
import { useCommandPalette } from '@/hooks/useCommandPalette'
import { useHotkey } from '@/hooks/useHotkey'
import { useQuery } from '@/hooks/useQuery'
import { useTheme } from '@/hooks/useTheme'
import { useToast } from '@/hooks/useToast'
import { buildSearchIndex, filterSearchEntries, getRandomNote } from '@/services'
import type { SearchEntry } from '@/types/content'
import { cn } from '@/utils/cn'
import { Kbd } from './Kbd'

const kindIcon = {
  page: Hash,
  project: Folder,
  note: FileText,
  action: ArrowRight,
} as const

/** ⌘K / Ctrl+K palette. The panel mounts fresh on every open so its state starts clean. */
export function CommandPalette() {
  const { isOpen, open, close } = useCommandPalette()
  const reduced = useReducedMotion()

  useHotkey(
    'k',
    (event) => {
      event.preventDefault()
      if (isOpen) close()
      else open()
    },
    { meta: true },
  )

  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[110] flex items-start justify-center bg-fg/30 px-4 pt-[12vh]"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? undefined : { opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={close}
        >
          <Panel onClose={close} />
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function Panel({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { toast } = useToast()
  const reduced = useReducedMotion()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const { data: index } = useQuery('search-index', buildSearchIndex, { staleTime: 5 * 60_000 })

  const actions = useMemo<SearchEntry[]>(
    () => [
      {
        id: 'action:theme',
        kind: 'action',
        title: theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
        subtitle: 'Theme',
        href: '#theme',
        keywords: ['theme', 'dark', 'light', 'toggle'],
      },
      {
        id: 'action:random',
        kind: 'action',
        title: 'Open a random note',
        subtitle: 'Shuffle',
        href: '#random',
        keywords: ['random', 'note', 'shuffle', 'surprise'],
      },
    ],
    [theme],
  )

  const results = useMemo(() => filterSearchEntries([...(index ?? []), ...actions], query).slice(0, 12), [index, actions, query])
  const active = results[activeIndex] ?? results[0]

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const el = listRef.current?.children[activeIndex]
    if (el instanceof HTMLElement) el.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const run = async (entry: SearchEntry) => {
    onClose()
    if (entry.href === '#theme') {
      toggleTheme()
      return
    }
    if (entry.href === '#random') {
      const note = await getRandomNote()
      if (note) navigate(`/notes/${note.slug}`)
      else toast({ title: 'No notes yet.' })
      return
    }
    navigate(entry.href)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (active) void run(active)
    } else if (event.key === 'Escape') {
      onClose()
    }
  }

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="w-full max-w-xl border border-line bg-bg"
      initial={reduced ? false : { opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduced ? undefined : { opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={onKeyDown}
    >
      <div className="flex items-center gap-3 border-b border-line px-4">
        <span className="label-caps">Go to</span>
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setActiveIndex(0)
          }}
          placeholder="Search projects, notes, pages…"
          className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-fg-muted"
          role="combobox"
          aria-expanded="true"
          aria-controls="command-palette-results"
          aria-activedescendant={active ? `cp-${active.id}` : undefined}
          aria-autocomplete="list"
        />
        <Kbd>esc</Kbd>
      </div>

      <ul ref={listRef} id="command-palette-results" role="listbox" className="max-h-[50vh] overflow-y-auto py-2">
        {results.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-fg-muted">{index ? 'Nothing matches. Try a different word.' : 'Loading index…'}</li>
        ) : (
          results.map((entry, i) => {
            const Icon = entry.href === '#theme' ? (theme === 'dark' ? Sun : Moon) : entry.href === '#random' ? Shuffle : kindIcon[entry.kind]
            const isActive = entry.id === active?.id
            return (
              <li
                key={entry.id}
                id={`cp-${entry.id}`}
                role="option"
                aria-selected={isActive}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => void run(entry)}
                className={cn('flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm', isActive ? 'bg-bg-elevated' : 'hover:bg-bg-elevated')}
              >
                <span className={cn('size-1.5 shrink-0 rounded-full', isActive ? 'bg-accent' : 'bg-transparent')} aria-hidden />
                <Icon className="size-3.5 shrink-0 text-fg-muted" />
                <span className="min-w-0 flex-1 truncate">{entry.title}</span>
                {entry.subtitle ? <span className="hidden truncate text-xs text-fg-muted sm:inline">{entry.subtitle}</span> : null}
                {isActive ? <CornerDownLeft className="size-3 shrink-0 text-fg-muted" /> : null}
              </li>
            )
          })
        )}
      </ul>

      <div className="flex items-center justify-between border-t border-line px-4 py-2 text-2xs text-fg-muted">
        <span className="flex items-center gap-1.5">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd> navigate
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>↵</Kbd> open
        </span>
      </div>
    </motion.div>
  )
}
