import { NavLink } from 'react-router-dom'
import { Activity, ExternalLink, FileText, Folder, Images, LayoutDashboard, LogOut, UserRound } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Wordmark } from '@/components/common/Wordmark'

const items = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/projects', label: 'Projects', icon: Folder },
  { to: '/admin/notes', label: 'Notes', icon: FileText },
  { to: '/admin/photos', label: 'Photos', icon: Images },
  { to: '/admin/now', label: 'Now', icon: Activity },
  { to: '/admin/profile', label: 'Profile', icon: UserRound },
]

interface AdminSidebarProps {
  onNavigate?: () => void
  className?: string
}

export function AdminSidebar({ onNavigate, className }: AdminSidebarProps) {
  const { profile, signOut } = useAuth()
  return (
    <div className={cn('flex h-full flex-col', className)}>
      <div className="flex h-14 items-center justify-between border-b border-line px-5">
        <Wordmark suffix="/ admin" />
        <ThemeToggle />
      </div>

      <nav aria-label="Admin" className="flex-1 px-3 py-4">
        <ul className="space-y-0.5">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-2 py-2 text-sm transition-colors',
                    isActive ? 'text-fg' : 'text-fg-muted hover:text-fg',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={cn('size-1.5 rounded-full', isActive ? 'bg-accent ring-1 ring-fg/20' : 'bg-transparent')} aria-hidden />
                    <item.icon className="size-4" />
                    {item.label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-2 border-t border-line px-5 py-4 text-xs">
        <p className="truncate text-fg-muted">{profile?.email ?? profile?.fullName}</p>
        <div className="flex items-center justify-between">
          <a href="/" target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 hover:underline">
            View site <ExternalLink className="size-3" />
          </a>
          <button type="button" onClick={() => void signOut()} className="inline-flex items-center gap-1 text-fg-muted hover:text-fg">
            <LogOut className="size-3" /> Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
