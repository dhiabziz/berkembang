'use client'

import { useTransition } from 'react'
import { Check } from 'lucide-react'
import { toast } from 'sonner'

import { markBookReturned } from '@/app/admin/actions/books'
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
  lendingId,
}: BookCardProps) {
  const [isPending, startTransition] = useTransition()

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
      {showReturnButton && status === 'active' && (
        <Button size="sm" variant="outline" disabled={isPending} onClick={handleMarkReturned}>
          <Check size={14} className="mr-1" />
          Returned
        </Button>
      )}
    </div>
  )
}
