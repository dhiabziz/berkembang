import { getSession } from '@/lib/auth/session'

// UC-01: Admin Login (redirect target)
export default async function AdminDashboardPage() {
  const session = await getSession()

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Welcome, {session.username} 🌱</h1>
      <p className="mt-1 text-sm text-muted-foreground">This is your admin dashboard.</p>
    </main>
  )
}
