import { Suspense, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useSeo } from '@/hooks/useSeo'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Skeleton } from '@/components/common/Skeleton'
import { Wordmark } from '@/components/common/Wordmark'

export function AdminLayout() {
  const [open, setOpen] = useState(false)
  useSeo({ title: 'Admin', noIndex: true })

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[15rem_1fr]">
      <aside className="hidden border-r border-line md:block">
        <div className="sticky top-0 h-dvh">
          <AdminSidebar />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-bg px-4 md:hidden">
        <Wordmark suffix="/ admin" />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-9 items-center justify-center"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>
      {open ? (
        <div className="fixed inset-0 top-14 z-30 bg-bg md:hidden">
          <AdminSidebar onNavigate={() => setOpen(false)} />
        </div>
      ) : null}

      <main id="main" className="min-w-0 px-4 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <Suspense
            fallback={
              <div className="space-y-4" aria-busy="true">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-80" />
                <Skeleton className="mt-8 h-64 w-full" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
