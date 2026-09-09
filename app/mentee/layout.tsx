import { redirect } from 'next/navigation'

import { MenteeBottomNav } from '@/components/nav/mentee-bottom-nav'
import { MenteeDesktopNav } from '@/components/nav/mentee-desktop-nav'
import { getSession } from '@/lib/auth/session'

export default async function MenteeLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  // UC-22: both mentee and admin may view mentee routes; only mentee is blocked from /admin/*.
  if (!session.userId || !session.role) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <MenteeDesktopNav role={session.role} />
      <div className="pb-20 md:pb-0">{children}</div>
      <MenteeBottomNav role={session.role} />
    </div>
  )
}
