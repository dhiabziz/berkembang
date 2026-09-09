'use server'

import { revalidatePath } from 'next/cache'

import { hashPassword, verifyPassword } from '@/lib/auth/password'
import { getSession } from '@/lib/auth/session'
import { changePasswordSchema } from '@/lib/schemas/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

export interface ChangePasswordState {
  error?: string
  success?: boolean
}

// UC-04: Mentee Ganti Password — implements FR-04
export async function changePassword(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const session = await getSession()
  if (!session.userId) {
    return { error: 'Unauthorized.' }
  }

  const parsed = changePasswordSchema.safeParse({
    oldPassword: formData.get('oldPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('password_hash')
    .eq('id', session.userId)
    .maybeSingle()

  if (!user) {
    return { error: 'User not found.' }
  }

  const oldPasswordMatches = await verifyPassword(parsed.data.oldPassword, user.password_hash)
  if (!oldPasswordMatches) {
    return { error: 'Old password is incorrect.' }
  }

  const newPasswordHash = await hashPassword(parsed.data.newPassword)
  const { error } = await supabaseAdmin
    .from('users')
    .update({ password_hash: newPasswordHash })
    .eq('id', session.userId)

  if (error) {
    return { error: 'Failed to change password. Try again.' }
  }

  return { success: true }
}

export interface AvatarUploadState {
  error?: string
  avatarUrl?: string
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// UC-08: Mentee Upload Foto Profil — implements FR-09, FR-10
export async function uploadAvatar(_prevState: AvatarUploadState, formData: FormData): Promise<AvatarUploadState> {
  const session = await getSession()
  if (!session.userId) {
    return { error: 'Unauthorized.' }
  }

  const file = formData.get('avatar')
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'No file selected.' }
  }
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return { error: 'File format must be JPEG, PNG, or WebP.' }
  }

  const ext = file.type.split('/')[1]
  const path = `${session.userId}.${ext}`

  const { error: uploadError } = await supabaseAdmin.storage.from('avatars').upload(path, file, {
    contentType: file.type,
    upsert: true,
  })

  if (uploadError) {
    return { error: 'Failed to upload photo. Try again.' }
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from('avatars').getPublicUrl(path)

  // Cache-bust so <img> picks up the new photo even though the storage path is unchanged.
  const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`

  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({ avatar_url: cacheBustedUrl })
    .eq('id', session.userId)

  if (updateError) {
    return { error: 'Failed to save photo. Try again.' }
  }

  revalidatePath('/mentee/profile')
  revalidatePath('/mentee/leaderboard')
  revalidatePath('/admin/mentees')
  return { avatarUrl: cacheBustedUrl }
}
