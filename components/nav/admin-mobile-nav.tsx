'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, ClipboardList, LayoutDashboard, LogOut, Sprout, Users } from 'lucide-react'

import { logout } from '@/app/admin/actions/auth'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/mentees', label: 'Mentees', icon: Users },
  { href: '/admin/tasks', label: 'Tasks', icon: ClipboardList },
  { href: '/admin/books', label: 'Books', icon: BookOpen },
  { href: '/admin/growth-levels', label: 'Levels', icon: Sprout },
]

export function AdminMobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center border-t border-border bg-white md:hidden">
      <div className="flex flex-1 items-center justify-around">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2 text-xs',
                isActive ? 'font-semibold text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon size={20} />
              {label}
            </Link>
          )
        })}
      </div>
      <form action={logout} className="shrink-0 border-l border-border px-4">
        <button
          type="submit"
          aria-label="Sign out"
          className="flex flex-col items-center gap-0.5 py-2 text-xs text-muted-foreground"
        >
          <LogOut size={20} />
        </button>
      </form>
    </nav>
  )
}
