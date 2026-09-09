'use server'

import { revalidatePath } from 'next/cache'

import { getSession } from '@/lib/auth/session'
import { createPointLogSchema } from '@/lib/schemas/point'
import { supabaseAdmin } from '@/lib/supabase/admin'

export interface PointLogActionState {
  error?: string
  success?: number // points delta on success
}

// UC-09: Admin Tambah Log Poin — implements FR-11, FR-13, FR-14
export async function addPointLog(
  menteeId: string,
  _prevState: PointLogActionState,
  formData: FormData
): Promise<PointLogActionState> {
  const session = await getSession()
  if (session.role !== 'admin') {
    return { error: 'Unauthorized.' }
  }

  const parsed = createPointLogSchema.safeParse({
    description: formData.get('description'),
    points: formData.get('points'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  const { description, points } = parsed.data

  const { error: insertError } = await supabaseAdmin.from('point_logs').insert({
    mentee_id: menteeId,
    description,
    points,
  })

  if (insertError) {
    return { error: 'Failed to add point log. Try again.' }
  }

  const { data: mentee } = await supabaseAdmin
    .from('users')
    .select('total_points')
    .eq('id', menteeId)
    .maybeSingle()

  if (mentee) {
    await supabaseAdmin
      .from('users')
      .update({ total_points: mentee.total_points + points })
      .eq('id', menteeId)
  }

  revalidatePath(`/admin/mentees/${menteeId}`)
  revalidatePath('/admin/mentees')
  revalidatePath('/mentee/leaderboard')
  revalidatePath('/mentee/my-points')
  return { success: points }
}

// UC-10: Admin Hapus Log Poin — implements FR-12, FR-13
export async function deletePointLog(logId: string): Promise<{ error?: string }> {
  const session = await getSession()
  if (session.role !== 'admin') {
    return { error: 'Unauthorized.' }
  }

  const { data: log } = await supabaseAdmin
    .from('point_logs')
    .select('mentee_id, points')
    .eq('id', logId)
    .maybeSingle()

  if (!log) {
    return { error: 'Log not found.' }
  }

  const { error: deleteError } = await supabaseAdmin.from('point_logs').delete().eq('id', logId)
  if (deleteError) {
    return { error: 'Failed to delete log. Try again.' }
  }

  const { data: mentee } = await supabaseAdmin
    .from('users')
    .select('total_points')
    .eq('id', log.mentee_id)
    .maybeSingle()

  if (mentee) {
    await supabaseAdmin
      .from('users')
      .update({ total_points: mentee.total_points - log.points })
      .eq('id', log.mentee_id)
  }

  revalidatePath(`/admin/mentees/${log.mentee_id}`)
  revalidatePath('/admin/mentees')
  revalidatePath('/mentee/leaderboard')
  revalidatePath('/mentee/my-points')
  return {}
}
