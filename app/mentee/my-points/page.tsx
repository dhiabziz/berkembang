import { GrowthBadge } from '@/components/leaderboard/growth-badge'
import { PointLogList } from '@/components/points/point-log-list'
import { PageHeader } from '@/components/shared/page-header'
import { getSession } from '@/lib/auth/session'
import { getGrowthLevels } from '@/lib/data/growth-levels'
import { supabaseAdmin } from '@/lib/supabase/admin'

// implements FR-17
export default async function MyPointsPage() {
  const session = await getSession()

  const [{ data: mentee }, { data: logs }, levels] = await Promise.all([
    supabaseAdmin.from('users').select('total_points').eq('id', session.userId).maybeSingle(),
    supabaseAdmin
      .from('point_logs')
      .select('id, description, points, created_at')
      .eq('mentee_id', session.userId)
      .order('created_at', { ascending: false }),
    getGrowthLevels(),
  ])

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <PageHeader title="My points" description={`Total: ${mentee?.total_points ?? 0} pts`} />
      <GrowthBadge totalPoints={mentee?.total_points ?? 0} levels={levels} className="mb-4" />
      <PointLogList logs={logs ?? []} />
    </main>
  )
}
