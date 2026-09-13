import { PageHeader } from '@/components/shared/page-header'
import { getSession } from '@/lib/auth/session'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isTaskArchived } from '@/lib/utils'

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
// A task is archived automatically once its deadline passes or every assignee has submitted
// (see lib/utils.ts isTaskArchived) — so all assignments for all of this mentee's tasks are
// fetched up front to compute that, instead of trusting the stored is_archived flag alone.
export default async function MenteeTasksPage() {
  const session = await getSession()

  const { data: myAssignments } = await supabaseAdmin
    .from('task_assignments')
    .select('status, tasks(id, title, description, type, deadline, is_archived)')
    .eq('mentee_id', session.userId)

  const normalized = (myAssignments ?? [])
    .map((a) => ({ status: a.status as 'pending' | 'submitted', task: getTask(a.tasks) }))
    .filter((a): a is { status: 'pending' | 'submitted'; task: NormalizedTask } => a.task !== null)

  const allTaskIds = normalized.map((a) => a.task.id)

  const othersByTask: Record<string, { menteeName: string; status: 'pending' | 'submitted'; isCurrentUser: boolean }[]> = {}
  const statusesByTask: Record<string, string[]> = {}

  if (allTaskIds.length > 0) {
    const { data: allAssignments } = await supabaseAdmin
      .from('task_assignments')
      .select('task_id, mentee_id, status, users(username)')
      .in('task_id', allTaskIds)

    for (const a of allAssignments ?? []) {
      statusesByTask[a.task_id] = statusesByTask[a.task_id] ?? []
      statusesByTask[a.task_id].push(a.status)

      if (a.mentee_id === session.userId) continue
      othersByTask[a.task_id] = othersByTask[a.task_id] ?? []
      othersByTask[a.task_id].push({
        menteeName: getUsername(a.users),
        status: a.status as 'pending' | 'submitted',
        isCurrentUser: false,
      })
    }
  }

  const active = normalized.filter(
    (a) => !isTaskArchived(a.task.is_archived, a.task.deadline, statusesByTask[a.task.id] ?? [])
  )
  const archived = normalized.filter((a) =>
    isTaskArchived(a.task.is_archived, a.task.deadline, statusesByTask[a.task.id] ?? [])
  )

  const toCard = (a: { status: 'pending' | 'submitted'; task: NormalizedTask }) => ({
    ...a.task,
    assignments: [
      { menteeName: 'You', status: a.status, isCurrentUser: true },
      ...(othersByTask[a.task.id] ?? []),
    ],
  })

  const activeTasks = active.map(toCard)
  const archivedTasks = archived.map(toCard)

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <PageHeader title="Tasks" />
      <MenteeTaskTabs activeTasks={activeTasks} archivedTasks={archivedTasks} />
    </main>
  )
}
