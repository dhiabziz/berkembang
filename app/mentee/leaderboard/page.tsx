import { Trophy } from 'lucide-react'

import { LeaderboardCard } from '@/components/leaderboard/leaderboard-card'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { getSession } from '@/lib/auth/session'
import { getGrowthLevels } from '@/lib/data/growth-levels'
import { supabaseAdmin } from '@/lib/supabase/admin'

// UC-11: Lihat Leaderboard — implements FR-15, FR-16, FR-17, FR-18, FR-32, FR-34
export default async function LeaderboardPage() {
  const session = await getSession()

  const [{ data: mentees }, levels] = await Promise.all([
    supabaseAdmin
      .from('users')
      .select('id, username, avatar_url, total_points')
      .eq('role', 'mentee')
      .order('total_points', { ascending: false }),
    getGrowthLevels(),
  ])

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <PageHeader title="Leaderboard" description="See how everyone is growing." />

      {!mentees || mentees.length === 0 ? (
        <EmptyState icon={Trophy} heading="No mentees yet" description="Check back once the program gets going!" />
      ) : (
        <div className="space-y-4">
          {mentees.map((mentee, index) => {
            // FR-17: mentee can only open their own detail. FR-18: admin can open anyone's.
            const href =
              session.role === 'admin'
                ? `/admin/mentees/${mentee.id}`
                : mentee.id === session.userId
                  ? '/mentee/my-points'
                  : undefined

            return (
              <LeaderboardCard
                key={mentee.id}
                rank={index + 1}
                name={mentee.username}
                avatarUrl={mentee.avatar_url}
                totalPoints={mentee.total_points}
                levels={levels}
                href={href}
              />
            )
          })}
        </div>
      )}
    </main>
  )
}
