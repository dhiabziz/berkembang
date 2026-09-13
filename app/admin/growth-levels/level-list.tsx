'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { Pencil, Sprout, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import {
  deleteGrowthLevel,
  updateGrowthLevel,
  type GrowthLevelActionState,
} from '@/app/admin/actions/growth-levels'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { GrowthLevel } from '@/lib/constants/growth-levels'

const initialState: GrowthLevelActionState = {}

function EditLevelDialog({ level, open, onClose }: { level: GrowthLevel; open: boolean; onClose: () => void }) {
  const [state, formAction, isPending] = useActionState(updateGrowthLevel.bind(null, level.id), initialState)
  const wasPending = useRef(false)

  useEffect(() => {
    if (wasPending.current && !isPending && !state.error && state.success) {
      toast.success('Growth level updated')
      onClose()
    }
    wasPending.current = isPending
  }, [isPending, state.error, state.success, onClose])

  return (
    <Dialog open={open} onClose={onClose}>
      <h2 className="text-lg font-semibold">Edit growth level</h2>
      <form action={formAction} className="mt-4 space-y-4">
        <div className="flex gap-3">
          <div className="w-20 space-y-1.5">
            <Label htmlFor={`edit-emoji-${level.id}`}>Emoji</Label>
            <Input id={`edit-emoji-${level.id}`} name="emoji" type="text" required defaultValue={level.emoji} />
          </div>
          <div className="flex-1 space-y-1.5">
            <Label htmlFor={`edit-label-${level.id}`}>Name</Label>
            <Input id={`edit-label-${level.id}`} name="label" type="text" required defaultValue={level.label} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`edit-minPoints-${level.id}`}>Points threshold</Label>
          <Input
            id={`edit-minPoints-${level.id}`}
            name="minPoints"
            type="number"
            step={1}
            min={0}
            required
            defaultValue={level.minPoints}
          />
        </div>
        {state.error && <p className="text-xs text-destructive">{state.error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export function LevelList({ levels }: { levels: GrowthLevel[] }) {
  const [editingLevel, setEditingLevel] = useState<GrowthLevel | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    const result = await deleteGrowthLevel(id)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Growth level deleted')
    setPendingDeleteId(null)
  }

  if (levels.length === 0) {
    return <EmptyState icon={Sprout} heading="No growth levels yet" description="Add your first level to get started." />
  }

  return (
    <div className="space-y-2">
      {levels.map((level) => (
        <div key={level.id} className="flex items-center gap-3 rounded-lg border border-border bg-white p-3 shadow-sm">
          <span className="text-2xl" aria-hidden>
            {level.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{level.label}</p>
            <p className="text-xs text-muted-foreground">{level.minPoints}+ pts</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setEditingLevel(level)} aria-label={`Edit ${level.label}`}>
            <Pencil size={16} className="text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPendingDeleteId(level.id)}
            aria-label={`Delete ${level.label}`}
          >
            <Trash2 size={16} className="text-destructive" />
          </Button>
        </div>
      ))}

      {editingLevel && (
        <EditLevelDialog level={editingLevel} open={editingLevel !== null} onClose={() => setEditingLevel(null)} />
      )}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId) return handleDelete(pendingDeleteId)
        }}
        title="Delete this level?"
        description="Mentees who were at this level will show the next level down instead."
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  )
}
