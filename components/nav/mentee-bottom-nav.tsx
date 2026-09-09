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

export function MenteeBottomNav({ role }: { role: 'admin' | 'mentee' }) {
  const pathname = usePathname()
  const navItems = role === 'mentee' ? [...BASE_NAV_ITEMS, ...MENTEE_ONLY_ITEMS] : BASE_NAV_ITEMS

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-border bg-white md:hidden">
      {navItems.map(({ href, label, icon: Icon }) => {
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
      <form action={logout} className="flex flex-1 flex-col items-center">
        <button type="submit" className="flex flex-col items-center gap-0.5 py-2 text-xs text-muted-foreground">
          <LogOut size={20} />
          Sign out
        </button>
      </form>
    </nav>
  )
}
