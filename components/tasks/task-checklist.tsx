'use client'

import { useTransition } from 'react'
import { Check } from 'lucide-react'
import { toast } from 'sonner'

import { markTaskSubmitted } from '@/app/admin/actions/tasks'
import { Button } from '@/components/ui/button'

interface Assignment {
  menteeId: string
  menteeName: string
  status: 'pending' | 'submitted'
}

interface TaskChecklistProps {
  taskId: string
  assignments: Assignment[]
}

// UC-14: Admin Centang Tugas Mentee — implements FR-23
export function TaskChecklist({ taskId, assignments }: TaskChecklistProps) {
  const [isPending, startTransition] = useTransition()

  function handleMark(menteeId: string) {
    startTransition(async () => {
      const result = await markTaskSubmitted(taskId, menteeId)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Marked as submitted')
    })
  }

  return (
    <div className="space-y-2">
      {assignments.map((assignment) => (
        <div
          key={assignment.menteeId}
          className="flex items-center justify-between rounded-lg border border-border bg-white p-3 shadow-sm"
        >
          <span className="text-sm font-medium">{assignment.menteeName}</span>
          {assignment.status === 'submitted' ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-success">
              <Check size={14} />
              Submitted
            </span>
          ) : (
            <Button size="sm" variant="outline" disabled={isPending} onClick={() => handleMark(assignment.menteeId)}>
              Mark submitted
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}
