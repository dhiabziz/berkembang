import { PageHeader } from '@/components/shared/page-header'
import { getSession } from '@/lib/auth/session'
import { supabaseAdmin } from '@/lib/supabase/admin'

import { MenteeTaskTabs } from './mentee-task-tabs'

interface NormalizedTask {
  id: string
  title: string
  description: string | null
  type: 'broadcast' | 'special'
  deadline: string
  is_archived: boolean
}

function getTask(tasks: unknown): NormalizedTask | null {
  const t = Array.isArray(tasks) ? tasks[0] : tasks
  return (t as NormalizedTask | undefined) ?? null
}

function getUsername(users: unknown): string {
  const u = Array.isArray(users) ? users[0] : users
  return (u as { username?: string } | undefined)?.username ?? 'Unknown'
}

// UC-16: Mentee Lihat Daftar Tugas, UC-17: Mentee Lihat Arsip Tugas
// implements FR-22, FR-25, FR-26, FR-33
export default async function MenteeTasksPage() {
  const session = await getSession()

  const { data: myAssignments } = await supabaseAdmin
    .from('task_assignments')
    .select('status, tasks(id, title, description, type, deadline, is_archived)')
    .eq('mentee_id', session.userId)

  const normalized = (myAssignments ?? [])
    .map((a) => ({ status: a.status as 'pending' | 'submitted', task: getTask(a.tasks) }))
    .filter((a): a is { status: 'pending' | 'submitted'; task: NormalizedTask } => a.task !== null)

  const active = normalized.filter((a) => !a.task.is_archived)
  const archived = normalized.filter((a) => a.task.is_archived)
  const activeTaskIds = active.map((a) => a.task.id)

  const othersByTask: Record<string, { menteeName: string; status: 'pending' | 'submitted'; isCurrentUser: boolean }[]> = {}

  if (activeTaskIds.length > 0) {
    const { data: allAssignments } = await supabaseAdmin
      .from('task_assignments')
      .select('task_id, mentee_id, status, users(username)')
      .in('task_id', activeTaskIds)

    for (const a of allAssignments ?? []) {
      if (a.mentee_id === session.userId) continue
      othersByTask[a.task_id] = othersByTask[a.task_id] ?? []
      othersByTask[a.task_id].push({
        menteeName: getUsername(a.users),
        status: a.status as 'pending' | 'submitted',
        isCurrentUser: false,
      })
    }
  }

  const activeTasks = active.map((a) => ({
    ...a.task,
    assignments: [{ menteeName: 'You', status: a.status, isCurrentUser: true }, ...(othersByTask[a.task.id] ?? [])],
  }))

  const archivedTasks = archived.map((a) => ({
    ...a.task,
    assignments: [{ menteeName: 'You', status: a.status, isCurrentUser: true }],
  }))

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <PageHeader title="Tasks" />
      <MenteeTaskTabs activeTasks={activeTasks} archivedTasks={archivedTasks} />
    </main>
  )
}
