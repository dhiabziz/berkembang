import { notFound } from 'next/navigation'

import { TaskChecklist } from '@/components/tasks/task-checklist'
import { PageHeader } from '@/components/shared/page-header'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { formatDateTime } from '@/lib/utils'

function getUsername(users: unknown): string {
  if (Array.isArray(users)) {
    return (users[0] as { username?: string } | undefined)?.username ?? 'Unknown'
  }
  return (users as { username?: string } | null)?.username ?? 'Unknown'
}

// UC-14: Admin Centang Tugas Mentee — implements FR-23
export default async function AdminTaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: task } = await supabaseAdmin
    .from('tasks')
    .select('id, title, description, type, deadline, is_archived')
    .eq('id', id)
    .maybeSingle()

  if (!task) {
    notFound()
  }

  const { data: assignments } = await supabaseAdmin
    .from('task_assignments')
    .select('mentee_id, status, users(username)')
    .eq('task_id', id)

  const checklistItems = (assignments ?? []).map((a) => ({
    menteeId: a.mentee_id,
    menteeName: getUsername(a.users),
    status: a.status as 'pending' | 'submitted',
  }))

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <PageHeader title={task.title} description={`Due ${formatDateTime(task.deadline)}`} />
      {task.description && <p className="mb-4 text-sm text-muted-foreground">{task.description}</p>}
      <TaskChecklist taskId={task.id} assignments={checklistItems} />
    </main>
  )
}
