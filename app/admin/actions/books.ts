'use server'

import { revalidatePath } from 'next/cache'

import { getSession } from '@/lib/auth/session'
import { createBookLendingSchema } from '@/lib/schemas/book'
import { supabaseAdmin } from '@/lib/supabase/admin'

export interface BookActionState {
  error?: string
  success?: boolean
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// UC-18: Admin Catat Peminjaman Buku — implements FR-27
export async function createBookLending(_prevState: BookActionState, formData: FormData): Promise<BookActionState> {
  const session = await getSession()
  if (session.role !== 'admin') {
    return { error: 'Unauthorized.' }
  }

  const parsed = createBookLendingSchema.safeParse({
    menteeId: formData.get('menteeId'),
    title: formData.get('title'),
    deadline: formData.get('deadline'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  const cover = formData.get('cover')
  if (!(cover instanceof File) || cover.size === 0) {
    return { error: 'Cover photo is required.' }
  }
  if (!ACCEPTED_TYPES.includes(cover.type)) {
    return { error: 'Cover photo must be JPEG, PNG, or WebP.' }
  }

  const { menteeId, title, deadline } = parsed.data
  const lendingId = crypto.randomUUID()
  const ext = cover.type.split('/')[1]
  const path = `${lendingId}.${ext}`

  const { error: uploadError } = await supabaseAdmin.storage.from('book-covers').upload(path, cover, {
    contentType: cover.type,
    upsert: true,
  })

  if (uploadError) {
    return { error: 'Failed to upload cover photo. Try again.' }
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from('book-covers').getPublicUrl(path)

  const { error: insertError } = await supabaseAdmin.from('book_lendings').insert({
    id: lendingId,
    mentee_id: menteeId,
    title,
    cover_image_url: publicUrl,
    deadline,
    status: 'active',
  })

  if (insertError) {
    return { error: 'Failed to save book lending. Try again.' }
  }

  revalidatePath('/admin/books')
  revalidatePath('/mentee/books')
  return { success: true }
}

// admin delete of a book lending log — mirrors UC-10 (Admin Hapus Log Poin) for books
export async function deleteBookLending(lendingId: string): Promise<{ error?: string }> {
  const session = await getSession()
  if (session.role !== 'admin') {
    return { error: 'Unauthorized.' }
  }

  const { error } = await supabaseAdmin.from('book_lendings').delete().eq('id', lendingId)

  if (error) {
    return { error: 'Failed to delete lending. Try again.' }
  }

  revalidatePath('/admin/books')
  revalidatePath('/mentee/books')
  return {}
}

// UC-19: Admin Centang Buku Dikembalikan — implements FR-28
export async function markBookReturned(lendingId: string): Promise<{ error?: string }> {
  const session = await getSession()
  if (session.role !== 'admin') {
    return { error: 'Unauthorized.' }
  }

  const { error } = await supabaseAdmin
    .from('book_lendings')
    .update({ status: 'returned', returned_at: new Date().toISOString() })
    .eq('id', lendingId)

  if (error) {
    return { error: 'Failed to update. Try again.' }
  }

  revalidatePath('/admin/books')
  revalidatePath('/mentee/books')
  return {}
}
