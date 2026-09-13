import { supabaseAdmin } from '@/lib/supabase/admin'

// Recomputes total_points from the actual point_logs rows (source of truth per FR-13)
// instead of read-current-then-add, which is a non-atomic operation prone to lost updates
// when two point mutations happen close together.
export async function recalculateMenteeTotalPoints(menteeId: string): Promise<number | null> {
  const { data: logs, error: fetchError } = await supabaseAdmin
    .from('point_logs')
    .select('points')
    .eq('mentee_id', menteeId)

  if (fetchError) {
    return null
  }

  const total = (logs ?? []).reduce((sum, log) => sum + log.points, 0)

  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({ total_points: total })
    .eq('id', menteeId)

  if (updateError) {
    return null
  }

  return total
}
