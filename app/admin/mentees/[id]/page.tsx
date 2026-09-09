import { notFound } from 'next/navigation'

import { GrowthBadge } from '@/components/leaderboard/growth-badge'
import { PointLogForm } from '@/components/points/point-log-form'
import { PointLogList } from '@/components/points/point-log-list'
import { Avatar } from '@/components/shared/avatar'
import { PageHeader } from '@/components/shared/page-header'
import { supabaseAdmin } from '@/lib/supabase/admin'

import { ResetPasswordDialog } from './reset-password-dialog'

// UC-05: Admin Reset Password Mentee, UC-09: Admin Tambah Log Poin, UC-10: Admin Hapus Log Poin
export default async function MenteeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: mentee } = await supabaseAdmin
    .from('users')
    .select('id, username, avatar_url, total_points, role')
    .eq('id', id)
    .maybeSingle()

  if (!mentee || mentee.role !== 'mentee') {
    notFound()
  }

  const { data: logs } = await supabaseAdmin
    .from('point_logs')
    .select('id, description, points, created_at')
    .eq('mentee_id', id)
    .order('created_at', { ascending: false })

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <PageHeader
        title={mentee.username}
        action={<ResetPasswordDialog menteeId={mentee.id} menteeName={mentee.username} />}
      />

      <div className="mb-6 flex items-center gap-4 rounded-xl border border-border bg-white p-4 shadow-sm">
        <Avatar src={mentee.avatar_url} name={mentee.username} size="lg" />
        <div>
          <p className="font-mono text-2xl font-bold tabular-nums text-primary">{mentee.total_points} pts</p>
          <GrowthBadge totalPoints={mentee.total_points} className="mt-1" />
        </div>
      </div>

      <PointLogForm menteeId={mentee.id} menteeName={mentee.username} />

      <div className="mt-4">
        <PointLogList logs={logs ?? []} canDelete />
      </div>
    </main>
  )
}
