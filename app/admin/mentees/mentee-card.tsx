'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { deleteMentee } from '@/app/admin/actions/mentees'
import { GrowthBadge } from '@/components/leaderboard/growth-badge'
import { Avatar } from '@/components/shared/avatar'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'

interface MenteeCardProps {
  id: string
  username: string
  avatarUrl: string | null
  totalPoints: number
}

// UC-07: Admin Hapus Mentee
export function MenteeCard({ id, username, avatarUrl, totalPoints }: MenteeCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  async function handleDelete() {
    const result = await deleteMentee(id)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success(`Mentee ${username} deleted successfully`)
    setConfirmOpen(false)
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/admin/mentees/${id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar src={avatarUrl} name={username} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{username}</p>
          <GrowthBadge totalPoints={totalPoints} className="mt-1" />
        </div>
      </Link>
      <Button variant="ghost" size="icon" onClick={() => setConfirmOpen(true)} aria-label={`Delete ${username}`}>
        <Trash2 size={16} className="text-destructive" />
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${username}?`}
        description="All their data (points, tasks, books) will be deleted too."
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  )
}
