'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ClipboardList, LayoutDashboard, LogOut, Users } from 'lucide-react'

import { logout } from '@/app/admin/actions/auth'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/mentees', label: 'Mentees', icon: Users },
  { href: '/admin/tasks', label: 'Tasks', icon: ClipboardList },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-white md:flex md:flex-col">
      <div className="px-5 py-6">
        <span className="text-lg font-bold text-primary">ber-kembang 🌱</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <Icon size={20} />
              {label}
            </Link>
          )
        })}
      </nav>
      <form action={logout} className="px-3 pb-6">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </form>
    </aside>
  )
}
