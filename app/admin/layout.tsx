import { redirect } from 'next/navigation'

import { AdminMobileNav } from '@/components/nav/admin-mobile-nav'
import { AdminSidebar } from '@/components/nav/admin-sidebar'
import { getSession } from '@/lib/auth/session'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session.userId || session.role !== 'admin') {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 pb-20 md:pb-0">{children}</div>
      <AdminMobileNav />
    </div>
  )
}
