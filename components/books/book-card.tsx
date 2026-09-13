'use client'

import { useState, useTransition } from 'react'
import { Check, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { deleteBookLending, markBookReturned } from '@/app/admin/actions/books'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

interface BookCardProps {
  coverImageUrl: string
  title: string
  borrowerName: string
  deadline: string
  status: 'active' | 'returned'
  returnedAt?: string | null
  showReturnButton?: boolean
  showDeleteButton?: boolean
  lendingId?: string
}

// implements FR-27, FR-29, FR-30, FR-31
export function BookCard({
  coverImageUrl,
  title,
  borrowerName,
  deadline,
  status,
  returnedAt,
  showReturnButton = false,
  showDeleteButton = false,
  lendingId,
}: BookCardProps) {
  const [isPending, startTransition] = useTransition()
  const [confirmOpen, setConfirmOpen] = useState(false)

  function handleMarkReturned() {
    if (!lendingId) return
    startTransition(async () => {
      const result = await markBookReturned(lendingId)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(`${title} marked as returned`)
    })
  }

  async function handleDelete() {
    if (!lendingId) return
    const result = await deleteBookLending(lendingId)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success(`${title} lending log deleted`)
    setConfirmOpen(false)
  }

  return (
    <div className="flex gap-3 rounded-xl border border-border bg-white p-3 shadow-sm">
      {/* Plain <img>: Supabase Storage public URL, not yet configured as a next/image remote pattern. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={coverImageUrl} alt={title} className="h-20 w-16 shrink-0 rounded-md object-cover" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{borrowerName}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {status === 'active' ? `Due ${formatDate(deadline)}` : `Returned ${formatDate(returnedAt ?? deadline)}`}
        </p>
      </div>
      <div className="flex shrink-0 items-start gap-1">
        {showReturnButton && status === 'active' && (
          <Button size="sm" variant="outline" disabled={isPending} onClick={handleMarkReturned}>
            <Check size={14} className="mr-1" />
            Returned
          </Button>
        )}
        {showDeleteButton && (
          <Button variant="ghost" size="icon" onClick={() => setConfirmOpen(true)} aria-label={`Delete ${title}`}>
            <Trash2 size={16} className="text-destructive" />
          </Button>
        )}
      </div>

      {showDeleteButton && (
        <ConfirmDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleDelete}
          title="Delete this lending log?"
          description="This will permanently remove the record. This cannot be undone."
          confirmLabel="Delete"
          variant="destructive"
        />
      )}
    </div>
  )
}
