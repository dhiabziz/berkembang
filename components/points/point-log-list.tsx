'use client'

import { useState } from 'react'
import { History, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { deletePointLog } from '@/app/admin/actions/points'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { cn, formatDateTime, formatPoints } from '@/lib/utils'

interface PointLog {
  id: string
  description: string
  points: number
  created_at: string
}

interface PointLogListProps {
  logs: PointLog[]
  canDelete?: boolean
}

// implements FR-14, UC-10
export function PointLogList({ logs, canDelete = false }: PointLogListProps) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    const result = await deletePointLog(id)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Point log deleted')
    setPendingDeleteId(null)
  }

  if (logs.length === 0) {
    return <EmptyState icon={History} heading="No point logs yet" />
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <div key={log.id} className="flex items-center gap-3 rounded-lg border border-border bg-white p-3 shadow-sm">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{log.description}</p>
            <p className="text-xs text-muted-foreground">{formatDateTime(log.created_at)}</p>
          </div>
          <p
            className={cn(
              'font-mono text-sm font-bold tabular-nums',
              log.points >= 0 ? 'text-success' : 'text-destructive'
            )}
          >
            {formatPoints(log.points)}
          </p>
          {canDelete && (
            <Button variant="ghost" size="icon" onClick={() => setPendingDeleteId(log.id)} aria-label="Delete log">
              <Trash2 size={16} className="text-destructive" />
            </Button>
          )}
        </div>
      ))}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId) return handleDelete(pendingDeleteId)
        }}
        title="Delete this log?"
        description="The mentee's total points will be adjusted accordingly."
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  )
}
