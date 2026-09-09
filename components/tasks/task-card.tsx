import { Check, Clock, Sparkles } from 'lucide-react'

import { cn, formatDateTime, getDeadlineInfo } from '@/lib/utils'

interface TaskAssignment {
  menteeName: string
  status: 'pending' | 'submitted'
  isCurrentUser: boolean
}

interface TaskCardProps {
  title: string
  description: string | null
  deadline: string
  type: 'broadcast' | 'special'
  assignments: TaskAssignment[]
}

// implements FR-22, FR-25, FR-33
export function TaskCard({ title, description, deadline, type, assignments }: TaskCardProps) {
  const isRare = type === 'special'
  const me = assignments.find((a) => a.isCurrentUser)
  const others = assignments.filter((a) => !a.isCurrentUser)
  const isSubmittedByMe = me?.status === 'submitted'

  const deadlineInfo = getDeadlineInfo(deadline)
  const showOverdueAlert = deadlineInfo.variant === 'overdue' && !isSubmittedByMe

  return (
    <div
      className={cn(
        'relative rounded-xl p-4',
        isRare ? 'card-rare' : 'border border-border bg-white shadow-sm',
        showOverdueAlert && 'border-2 border-destructive',
        showOverdueAlert && !isRare && 'bg-destructive/5'
      )}
    >
      {isRare && (
        <span className="badge-rare">
          <Sparkles size={10} className="mr-1 inline" />
          RARE
        </span>
      )}

      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        <span className="flex items-center gap-1 text-muted-foreground">
          <Clock size={14} />
          {formatDateTime(deadline)}
        </span>
        {!isSubmittedByMe && (
          <span
            className={cn(
              'font-semibold',
              deadlineInfo.variant === 'overdue' && 'text-destructive',
              deadlineInfo.variant === 'urgent' && 'text-accent-foreground',
              deadlineInfo.variant === 'normal' && 'text-muted-foreground'
            )}
          >
            {deadlineInfo.label}
          </span>
        )}
      </div>

      {me && (
        <p className={cn('mt-3 text-sm font-semibold', me.status === 'submitted' ? 'text-success' : 'text-muted-foreground')}>
          {me.status === 'submitted' ? '✓ You submitted this' : 'Pending — not submitted yet'}
        </p>
      )}

      {others.length > 0 && (
        <div className="mt-3 space-y-1 border-t border-border pt-3">
          {others.map((assignment) => (
            <div key={assignment.menteeName} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {assignment.status === 'submitted' ? (
                <Check size={14} className="text-success" />
              ) : (
                <span className="h-3.5 w-3.5 rounded-full border border-border" />
              )}
              {assignment.menteeName}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
