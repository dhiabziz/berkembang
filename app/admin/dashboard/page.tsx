import Link from 'next/link'
import { ClipboardList, Trophy, Users } from 'lucide-react'

import { LeaderboardCard } from '@/components/leaderboard/leaderboard-card'
import { getSession } from '@/lib/auth/session'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { cn } from '@/lib/utils'

// UC-01: Admin Login (redirect target) — quick overview per 04-architecture.md
export default async function AdminDashboardPage() {
  const session = await getSession()
  const nowIso = new Date().toISOString()

  const [{ count: menteeCount }, { count: activeTaskCount }, { count: overdueTaskCount }, { data: topMentees }] =
    await Promise.all([
      supabaseAdmin.from('users').select('id', { count: 'exact', head: true }).eq('role', 'mentee'),
      supabaseAdmin.from('tasks').select('id', { count: 'exact', head: true }).eq('is_archived', false),
      supabaseAdmin
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('is_archived', false)
        .lt('deadline', nowIso),
      supabaseAdmin
        .from('users')
        .select('id, username, avatar_url, total_points')
        .eq('role', 'mentee')
        .order('total_points', { ascending: false })
        .limit(3),
    ])

  const stats = [
    { label: 'Mentees', value: menteeCount ?? 0, icon: Users, href: '/admin/mentees', danger: false },
    { label: 'Active tasks', value: activeTaskCount ?? 0, icon: ClipboardList, href: '/admin/tasks', danger: false },
    {
      label: 'Overdue tasks',
      value: overdueTaskCount ?? 0,
      icon: ClipboardList,
      href: '/admin/tasks',
      danger: true,
    },
  ]

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Welcome, {session.username} 🌱</h1>
      <p className="mt-1 text-sm text-muted-foreground">Here&apos;s what&apos;s happening in your program.</p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, href, danger }) => {
          const isAlert = danger && value > 0
          return (
            <Link
              key={label}
              href={href}
              className="rounded-xl border border-border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <Icon size={20} className={isAlert ? 'text-destructive' : 'text-primary'} />
              <p className={cn('mt-2 font-mono text-3xl font-bold tabular-nums', isAlert && 'text-destructive')}>
                {value}
              </p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </Link>
          )
        })}
      </div>

      {topMentees && topMentees.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Trophy size={18} className="text-gold" />
              Top mentees
            </h2>
            <Link href="/mentee/leaderboard" className="text-sm font-medium text-primary hover:underline">
              View leaderboard
            </Link>
          </div>
          <div className="space-y-4">
            {topMentees.map((mentee, index) => (
              <LeaderboardCard
                key={mentee.id}
                rank={index + 1}
                name={mentee.username}
                avatarUrl={mentee.avatar_url}
                totalPoints={mentee.total_points}
              />
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
