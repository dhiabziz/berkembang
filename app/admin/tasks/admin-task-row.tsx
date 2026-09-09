'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { Archive, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import { archiveTask } from '@/app/admin/actions/tasks'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

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

// UC-15: Admin Archive Tugas
export function AdminTaskRow({ task }: AdminTaskRowProps) {
  const [isPending, startTransition] = useTransition()
  const submittedCount = task.task_assignments.filter((a) => a.status === 'submitted').length
  const totalCount = task.task_assignments.length

  function handleArchive() {
    startTransition(async () => {
      const result = await archiveTask(task.id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Task archived')
    })
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 shadow-sm">
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
        <p className="text-xs text-muted-foreground">
          Due {formatDate(task.deadline)} · {submittedCount}/{totalCount} submitted
        </p>
      </Link>
      {!task.is_archived && (
        <Button variant="ghost" size="icon" disabled={isPending} onClick={handleArchive} aria-label="Archive task">
          <Archive size={16} />
        </Button>
      )}
    </div>
  )
}
