import { Check, Clock, Sparkles } from 'lucide-react'

import { cn, formatDate, getDeadlineStatus } from '@/lib/utils'

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
  const deadlineStatus = getDeadlineStatus(deadline)
  const me = assignments.find((a) => a.isCurrentUser)
  const others = assignments.filter((a) => !a.isCurrentUser)

  return (
    <div className={cn('relative rounded-xl p-4', isRare ? 'card-rare' : 'border border-border bg-white shadow-sm')}>
      {isRare && (
        <span className="badge-rare">
          <Sparkles size={10} className="mr-1 inline" />
          RARE
        </span>
      )}

      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}

      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock size={14} />
        {formatDate(deadline)}
        {deadlineStatus === 'overdue' && <span className="font-semibold text-destructive">Overdue ⚠️</span>}
        {deadlineStatus === 'due-tomorrow' && <span className="font-semibold text-accent-foreground">Due tomorrow!</span>}
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
