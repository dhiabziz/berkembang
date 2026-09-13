'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

import { createGrowthLevel, type GrowthLevelActionState } from '@/app/admin/actions/growth-levels'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState: GrowthLevelActionState = {}

export function AddLevelDialog() {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(createGrowthLevel, initialState)
  const formRef = useRef<HTMLFormElement>(null)
  const wasPending = useRef(false)

  useEffect(() => {
    if (wasPending.current && !isPending && !state.error && state.success) {
      toast.success('Growth level added')
      formRef.current?.reset()
      setOpen(false)
    }
    wasPending.current = isPending
  }, [isPending, state.error, state.success])

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus size={16} className="mr-1.5" />
        Add level
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <h2 className="text-lg font-semibold">Add growth level</h2>
        <form ref={formRef} action={formAction} className="mt-4 space-y-4">
          <div className="flex gap-3">
            <div className="w-20 space-y-1.5">
              <Label htmlFor="add-level-emoji">Emoji</Label>
              <Input id="add-level-emoji" name="emoji" type="text" required placeholder="🌱" />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="add-level-label">Name</Label>
              <Input id="add-level-label" name="label" type="text" required placeholder="Seed" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="add-level-minPoints">Points threshold</Label>
            <Input id="add-level-minPoints" name="minPoints" type="number" step={1} min={0} required placeholder="0" />
          </div>
          {state.error && <p className="text-xs text-destructive">{state.error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Adding…' : 'Add level'}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  )
}
