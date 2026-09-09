'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ClipboardList, LogOut, Trophy, User } from 'lucide-react'

import { logout } from '@/app/admin/actions/auth'
import { cn } from '@/lib/utils'

const BASE_NAV_ITEMS = [{ href: '/mentee/leaderboard', label: 'Leaderboard', icon: Trophy }]
const MENTEE_ONLY_ITEMS = [
  { href: '/mentee/tasks', label: 'Tasks', icon: ClipboardList },
  { href: '/mentee/my-points', label: 'My points', icon: User },
]

export function MenteeDesktopNav({ role }: { role: 'admin' | 'mentee' }) {
  const pathname = usePathname()
  const navItems = role === 'mentee' ? [...BASE_NAV_ITEMS, ...MENTEE_ONLY_ITEMS] : BASE_NAV_ITEMS

  return (
    <header className="hidden h-16 items-center justify-between border-b border-border bg-white px-6 md:flex">
      <span className="text-lg font-bold text-primary">ber-kembang 🌱</span>
      <nav className="flex items-center gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <Icon size={20} />
              {label}
            </Link>
          )
        })}
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </form>
      </nav>
    </header>
  )
}
