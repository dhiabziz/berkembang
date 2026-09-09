'use client'

import { useState } from 'react'
import { ClipboardList } from 'lucide-react'

import { EmptyState } from '@/components/shared/empty-state'
import { TaskCard } from '@/components/tasks/task-card'
import { cn } from '@/lib/utils'

interface TaskWithAssignments {
  id: string
  title: string
  description: string | null
  type: 'broadcast' | 'special'
  deadline: string
  assignments: { menteeName: string; status: 'pending' | 'submitted'; isCurrentUser: boolean }[]
}

const TABS = [
  { key: 'active', label: 'Active' },
  { key: 'archived', label: 'Archive' },
] as const

// UC-16: Mentee Lihat Daftar Tugas, UC-17: Mentee Lihat Arsip Tugas
export function MenteeTaskTabs({
  activeTasks,
  archivedTasks,
}: {
  activeTasks: TaskWithAssignments[]
  archivedTasks: TaskWithAssignments[]
}) {
  const [tab, setTab] = useState<'active' | 'archived'>('active')
  const tasks = tab === 'active' ? activeTasks : archivedTasks

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

      {tasks.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          heading={tab === 'active' ? 'No tasks yet' : 'No archived tasks'}
          description={tab === 'active' ? 'Relax for now 🌿' : 'Completed tasks will show up here.'}
        />
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              title={task.title}
              description={task.description}
              deadline={task.deadline}
              type={task.type}
              assignments={task.assignments}
            />
          ))}
        </div>
      )}
    </div>
  )
}
