import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, Search } from 'lucide-react'
import { navigation } from '@/constants/site'
import { useCommandPalette } from '@/hooks/useCommandPalette'
import { cn } from '@/utils/cn'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Kbd } from '@/components/common/Kbd'
import { Wordmark } from '@/components/common/Wordmark'
import { MobileMenu } from './MobileMenu'

export function Navbar() {
  const { open } = useCommandPalette()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:bg-fg focus:px-3 focus:py-1 focus:text-bg"
      >
        Skip to content
      </a>
      <div className="container-editorial flex h-14 items-center justify-between">
        <Link to="/" aria-label="fajar.codes — home">
          <Wordmark />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {navigation.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'group relative py-1 text-sm transition-colors',
                  isActive ? 'text-fg' : 'text-fg-muted hover:text-fg',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  <span
                    aria-hidden
                    className={cn(
                      'absolute -bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-fg transition-opacity',
                      isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40',
                    )}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={open}
            className="hidden h-9 items-center gap-2 px-2 text-xs text-fg-muted transition-colors hover:text-fg sm:inline-flex"
            aria-label="Open command palette"
          >
            <Search className="size-3.5" />
            <span className="hidden lg:inline">Search</span>
            <span className="hidden items-center gap-0.5 lg:flex">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </span>
          </button>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="inline-flex size-9 items-center justify-center text-fg md:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <Menu className="size-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  )
}
