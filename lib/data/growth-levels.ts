import type { GrowthLevel } from '@/lib/constants/growth-levels'
import { supabaseAdmin } from '@/lib/supabase/admin'

// Server-only fetch of admin-configured growth levels, ordered lowest to highest threshold.
export async function getGrowthLevels(): Promise<GrowthLevel[]> {
  const { data } = await supabaseAdmin
    .from('growth_levels')
    .select('id, label, emoji, min_points')
    .order('min_points', { ascending: true })

  return (data ?? []).map((row) => ({
    id: row.id,
    label: row.label,
    emoji: row.emoji,
    minPoints: row.min_points,
  }))
}
