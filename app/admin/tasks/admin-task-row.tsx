'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { deleteTask } from '@/app/admin/actions/tasks'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { cn, formatDateTime, getDeadlineInfo } from '@/lib/utils'

interface AdminTaskRowProps {
  task: {
    id: string
    title: string
    type: 'broadcast' | 'special'
    deadline: string
    is_archived: boolean
    task_assignments: { status: string }[]
  }
}

export function AdminTaskRow({ task }: AdminTaskRowProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const submittedCount = task.task_assignments.filter((a) => a.status === 'submitted').length
  const totalCount = task.task_assignments.length
  const deadlineInfo = getDeadlineInfo(task.deadline)
  const hasOverdueMentees = deadlineInfo.variant === 'overdue' && submittedCount < totalCount

  async function handleDelete() {
    const result = await deleteTask(task.id)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Task deleted')
    setConfirmOpen(false)
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm',
        hasOverdueMentees ? 'border-2 border-destructive bg-destructive/5' : 'border-border'
      )}
    >
      <Link href={`/admin/tasks/${task.id}`} className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold">{task.title}</p>
          {task.type === 'special' && (
            <span className="flex items-center gap-1 rounded-full bg-rare/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rare">
              <Sparkles size={10} />
              Rare
            </span>
          )}
        </div>
        <p className={cn('text-xs', hasOverdueMentees ? 'font-semibold text-destructive' : 'text-muted-foreground')}>
          Due {formatDateTime(task.deadline)} · {submittedCount}/{totalCount} submitted
          {hasOverdueMentees && ` · ${deadlineInfo.label}`}
        </p>
      </Link>
      <Button variant="ghost" size="icon" onClick={() => setConfirmOpen(true)} aria-label={`Delete ${task.title}`}>
        <Trash2 size={16} className="text-destructive" />
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete this task?"
        description="This will permanently remove the task and everyone's submission status. This cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  )
}
