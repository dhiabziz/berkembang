import { PageHeader } from '@/components/shared/page-header'
import { supabaseAdmin } from '@/lib/supabase/admin'

import { CreateTaskDialog } from './create-task-dialog'
import { TaskListTabs } from './task-list-tabs'

// UC-12: Admin Buat Tugas Baru (Broadcast), UC-13: Admin Buat Special Task, UC-15: Admin Archive Tugas
export default async function AdminTasksPage() {
  const [{ data: tasks }, { data: mentees }] = await Promise.all([
    supabaseAdmin
      .from('tasks')
      .select('id, title, description, type, deadline, is_archived, created_at, task_assignments(status)')
      .order('deadline', { ascending: true }),
    supabaseAdmin.from('users').select('id, username').eq('role', 'mentee').order('username', { ascending: true }),
  ])

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <PageHeader
        title="Tasks"
        description="Manage tasks for your mentees."
        action={<CreateTaskDialog mentees={mentees ?? []} />}
      />
      <TaskListTabs tasks={tasks ?? []} />
    </main>
  )
}
