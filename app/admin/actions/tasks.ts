'use server'

import { revalidatePath } from 'next/cache'

import { getSession } from '@/lib/auth/session'
import { createTaskSchema } from '@/lib/schemas/task'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { wibLocalToIso } from '@/lib/utils'

export interface TaskActionState {
  error?: string
  success?: boolean
}

// UC-12: Admin Buat Tugas Baru (Broadcast), UC-13: Admin Buat Special Task
// implements FR-19, FR-20, FR-21, FR-22, FR-33
export async function createTask(_prevState: TaskActionState, formData: FormData): Promise<TaskActionState> {
  const session = await getSession()
  if (session.role !== 'admin') {
    return { error: 'Unauthorized.' }
  }

  const parsed = createTaskSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    deadline: formData.get('deadline'),
    type: formData.get('type'),
    menteeIds: formData.getAll('menteeIds').map(String),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }

  const { title, description, deadline, type, menteeIds } = parsed.data
  const deadlineIso = wibLocalToIso(deadline)

  const { data: task, error: insertError } = await supabaseAdmin
    .from('tasks')
    .insert({ title, description: description || null, deadline: deadlineIso, type })
    .select('id')
    .single()

  if (insertError || !task) {
    return { error: 'Failed to create task. Try again.' }
  }

  let assigneeIds: string[] = []

  if (type === 'broadcast') {
    const { data: mentees } = await supabaseAdmin.from('users').select('id').eq('role', 'mentee')
    assigneeIds = (mentees ?? []).map((m) => m.id)
  } else {
    assigneeIds = menteeIds ?? []
  }

  if (assigneeIds.length > 0) {
    const { error: assignError } = await supabaseAdmin
      .from('task_assignments')
      .insert(assigneeIds.map((menteeId) => ({ task_id: task.id, mentee_id: menteeId, status: 'pending' })))

    if (assignError) {
      return { error: 'Task created, but failed to assign mentees.' }
    }
  }

  revalidatePath('/admin/tasks')
  revalidatePath('/mentee/tasks')
  return { success: true }
}

// UC-14: Admin Centang Tugas Mentee — implements FR-23
export async function markTaskSubmitted(taskId: string, menteeId: string): Promise<{ error?: string }> {
  const session = await getSession()
  if (session.role !== 'admin') {
    return { error: 'Unauthorized.' }
  }

  const { error } = await supabaseAdmin
    .from('task_assignments')
    .update({ status: 'submitted', submitted_at: new Date().toISOString() })
    .eq('task_id', taskId)
    .eq('mentee_id', menteeId)

  if (error) {
    return { error: 'Failed to update. Try again.' }
  }

  revalidatePath(`/admin/tasks/${taskId}`)
  revalidatePath('/mentee/tasks')
  return {}
}

// UC-15: Admin Archive Tugas — implements FR-24
export async function archiveTask(taskId: string): Promise<{ error?: string }> {
  const session = await getSession()
  if (session.role !== 'admin') {
    return { error: 'Unauthorized.' }
  }

  const { error } = await supabaseAdmin.from('tasks').update({ is_archived: true }).eq('id', taskId)

  if (error) {
    return { error: 'Failed to archive task. Try again.' }
  }

  revalidatePath('/admin/tasks')
  revalidatePath('/mentee/tasks')
  return {}
}
