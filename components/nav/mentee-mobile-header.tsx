import Link from 'next/link'

import { Avatar } from '@/components/shared/avatar'

// Profile access on mobile — kept out of the bottom nav to stay within the 3-4 tab guidance.
export function MenteeMobileHeader({ username }: { username: string }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-white px-4 md:hidden">
      <span className="text-base font-bold text-primary">ber-kembang 🌱</span>
      <Link href="/mentee/profile" aria-label="Profile">
        <Avatar src={null} name={username} size="sm" />
      </Link>
    </header>
  )
}
