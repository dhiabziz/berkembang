'use server'

import { revalidatePath } from 'next/cache'

import { hashPassword } from '@/lib/auth/password'
import { getSession } from '@/lib/auth/session'
import { createMenteeSchema, resetPasswordSchema } from '@/lib/schemas/mentee'
import { supabaseAdmin } from '@/lib/supabase/admin'

export interface MenteeActionState {
  error?: string
  success?: string
}

// UC-06: Admin Tambah Mentee — implements FR-07
export async function createMentee(_prevState: MenteeActionState, formData: FormData): Promise<MenteeActionState> {
  const session = await getSession()
  if (session.role !== 'admin') {
    return { error: 'Unauthorized.' }
  }

  const parsed = createMenteeSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  const { username, password } = parsed.data

  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('id')
    .ilike('username', username)
    .maybeSingle()

  if (existing) {
    return { error: 'Username is already taken.' }
  }

  const passwordHash = await hashPassword(password)

  const { error } = await supabaseAdmin.from('users').insert({
    username,
    password_hash: passwordHash,
    role: 'mentee',
  })

  if (error) {
    return { error: 'Failed to add mentee. Try again.' }
  }

  revalidatePath('/admin/mentees')
  return { success: username }
}

// UC-07: Admin Hapus Mentee — implements FR-08, BR-04
export async function deleteMentee(menteeId: string): Promise<{ error?: string }> {
  const session = await getSession()
  if (session.role !== 'admin') {
    return { error: 'Unauthorized.' }
  }

  const { error } = await supabaseAdmin.from('users').delete().eq('id', menteeId)

  if (error) {
    return { error: 'Failed to delete mentee. Try again.' }
  }

  revalidatePath('/admin/mentees')
  return {}
}

// UC-05: Admin Reset Password Mentee — implements FR-05
export async function resetMenteePassword(
  menteeId: string,
  _prevState: MenteeActionState,
  formData: FormData
): Promise<MenteeActionState> {
  const session = await getSession()
  if (session.role !== 'admin') {
    return { error: 'Unauthorized.' }
  }

  const parsed = resetPasswordSchema.safeParse({ password: formData.get('password') })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  const passwordHash = await hashPassword(parsed.data.password)

  const { error } = await supabaseAdmin.from('users').update({ password_hash: passwordHash }).eq('id', menteeId)

  if (error) {
    return { error: 'Failed to reset password. Try again.' }
  }

  return { success: 'reset' }
}
