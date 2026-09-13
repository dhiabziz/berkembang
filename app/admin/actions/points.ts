'use server'

import { revalidatePath } from 'next/cache'

import { getSession } from '@/lib/auth/session'
import { recalculateMenteeTotalPoints } from '@/lib/points'
import { createBulkPointLogSchema, createPointLogSchema } from '@/lib/schemas/point'
import { supabaseAdmin } from '@/lib/supabase/admin'

export interface PointLogActionState {
  error?: string
  success?: number // points delta on success
}

function revalidatePointPaths(menteeId: string) {
  revalidatePath(`/admin/mentees/${menteeId}`)
  revalidatePath('/admin/mentees')
  revalidatePath('/mentee/leaderboard')
  revalidatePath('/mentee/my-points')
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

  await recalculateMenteeTotalPoints(menteeId)

  revalidatePointPaths(menteeId)
  return { success: points }
}

// bulk version of UC-09 — same description + points applied to multiple mentees at once
export interface BulkPointLogActionState {
  error?: string
  success?: { count: number; points: number }
}

export async function addBulkPointLog(
  _prevState: BulkPointLogActionState,
  formData: FormData
): Promise<BulkPointLogActionState> {
  const session = await getSession()
  if (session.role !== 'admin') {
    return { error: 'Unauthorized.' }
  }

  const parsed = createBulkPointLogSchema.safeParse({
    description: formData.get('description'),
    points: formData.get('points'),
    menteeIds: formData.getAll('menteeIds'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  const { description, points, menteeIds } = parsed.data

  const { error: insertError } = await supabaseAdmin.from('point_logs').insert(
    menteeIds.map((menteeId) => ({
      mentee_id: menteeId,
      description,
      points,
    }))
  )

  if (insertError) {
    return { error: 'Failed to add point logs. Try again.' }
  }

  await Promise.all(menteeIds.map((menteeId) => recalculateMenteeTotalPoints(menteeId)))

  for (const menteeId of menteeIds) {
    revalidatePointPaths(menteeId)
  }

  return { success: { count: menteeIds.length, points } }
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

  await recalculateMenteeTotalPoints(log.mentee_id)

  revalidatePointPaths(log.mentee_id)
  return {}
}
