'use client'

import { useState } from 'react'
import { ClipboardList } from 'lucide-react'

import { EmptyState } from '@/components/shared/empty-state'
import { cn, isTaskArchived } from '@/lib/utils'

import { AdminTaskRow } from './admin-task-row'

interface Task {
  id: string
  title: string
  type: 'broadcast' | 'special'
  deadline: string
  is_archived: boolean
  task_assignments: { status: string }[]
}

const TABS = [
  { key: 'active', label: 'Active' },
  { key: 'archived', label: 'Archived' },
] as const

export function TaskListTabs({ tasks }: { tasks: Task[] }) {
  const [tab, setTab] = useState<'active' | 'archived'>('active')
  const filtered = tasks.filter((task) => {
    const archived = isTaskArchived(
      task.is_archived,
      task.deadline,
      task.task_assignments.map((a) => a.status)
    )
    return tab === 'active' ? !archived : archived
  })

  return (
    <div>
      <div className="mb-4 flex gap-1 rounded-lg bg-muted p-1">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex-1 rounded-md py-1.5 text-sm font-medium transition-colors',
              tab === key ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          heading={tab === 'active' ? 'No active tasks' : 'No archived tasks'}
          description={tab === 'active' ? 'Create a task to get started.' : 'Archived tasks will show up here.'}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => (
            <AdminTaskRow key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  )
}
