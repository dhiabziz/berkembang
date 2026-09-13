'use server'

import { revalidatePath } from 'next/cache'

import { getSession } from '@/lib/auth/session'
import { growthLevelSchema } from '@/lib/schemas/growth-level'
import { supabaseAdmin } from '@/lib/supabase/admin'

export interface GrowthLevelActionState {
  error?: string
  success?: boolean
}

function revalidateGrowthLevelPaths() {
  revalidatePath('/admin/growth-levels')
  revalidatePath('/admin/mentees')
  revalidatePath('/admin/dashboard')
  revalidatePath('/mentee/leaderboard')
  revalidatePath('/mentee/my-points')
}

// custom growth level rules — admin defines their own levels (name, emoji, points threshold)
export async function createGrowthLevel(
  _prevState: GrowthLevelActionState,
  formData: FormData
): Promise<GrowthLevelActionState> {
  const session = await getSession()
  if (session.role !== 'admin') {
    return { error: 'Unauthorized.' }
  }

  const parsed = growthLevelSchema.safeParse({
    label: formData.get('label'),
    emoji: formData.get('emoji'),
    minPoints: formData.get('minPoints'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  const { data: existing } = await supabaseAdmin
    .from('growth_levels')
    .select('id')
    .eq('min_points', parsed.data.minPoints)
    .maybeSingle()

  if (existing) {
    return { error: 'A level with this point threshold already exists.' }
  }

  const { error } = await supabaseAdmin.from('growth_levels').insert({
    label: parsed.data.label,
    emoji: parsed.data.emoji,
    min_points: parsed.data.minPoints,
  })

  if (error) {
    return { error: 'Failed to add level. Try again.' }
  }

  revalidateGrowthLevelPaths()
  return { success: true }
}

export async function updateGrowthLevel(
  levelId: string,
  _prevState: GrowthLevelActionState,
  formData: FormData
): Promise<GrowthLevelActionState> {
  const session = await getSession()
  if (session.role !== 'admin') {
    return { error: 'Unauthorized.' }
  }

  const parsed = growthLevelSchema.safeParse({
    label: formData.get('label'),
    emoji: formData.get('emoji'),
    minPoints: formData.get('minPoints'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  const { data: existing } = await supabaseAdmin
    .from('growth_levels')
    .select('id')
    .eq('min_points', parsed.data.minPoints)
    .neq('id', levelId)
    .maybeSingle()

  if (existing) {
    return { error: 'A level with this point threshold already exists.' }
  }

  const { error } = await supabaseAdmin
    .from('growth_levels')
    .update({
      label: parsed.data.label,
      emoji: parsed.data.emoji,
      min_points: parsed.data.minPoints,
    })
    .eq('id', levelId)

  if (error) {
    return { error: 'Failed to update level. Try again.' }
  }

  revalidateGrowthLevelPaths()
  return { success: true }
}

export async function deleteGrowthLevel(levelId: string): Promise<{ error?: string }> {
  const session = await getSession()
  if (session.role !== 'admin') {
    return { error: 'Unauthorized.' }
  }

  const { count } = await supabaseAdmin.from('growth_levels').select('id', { count: 'exact', head: true })

  if ((count ?? 0) <= 1) {
    return { error: 'At least one growth level must remain.' }
  }

  const { error } = await supabaseAdmin.from('growth_levels').delete().eq('id', levelId)

  if (error) {
    return { error: 'Failed to delete level. Try again.' }
  }

  revalidateGrowthLevelPaths()
  return {}
}
