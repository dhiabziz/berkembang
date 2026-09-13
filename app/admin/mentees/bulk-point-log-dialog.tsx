'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { Users } from 'lucide-react'
import { toast } from 'sonner'

import { addBulkPointLog, type BulkPointLogActionState } from '@/app/admin/actions/points'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState: BulkPointLogActionState = {}

interface Mentee {
  id: string
  username: string
}

// implements the "bulk point log" request — add the same description + points to many mentees at once
export function BulkPointLogDialog({ mentees }: { mentees: Mentee[] }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set(mentees.map((m) => m.id)))
  const [state, formAction, isPending] = useActionState(addBulkPointLog, initialState)
  const formRef = useRef<HTMLFormElement>(null)
  const wasPending = useRef(false)

  useEffect(() => {
    if (wasPending.current && !isPending && !state.error && state.success) {
      const { count, points } = state.success
      toast.success(`${points > 0 ? '+' : ''}${points} points added for ${count} mentee${count === 1 ? '' : 's'}`)
      formRef.current?.reset()
      setSelected(new Set(mentees.map((m) => m.id)))
      setOpen(false)
    }
    wasPending.current = isPending
  }, [isPending, state.error, state.success, mentees])

  function toggleMentee(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const allSelected = selected.size === mentees.length
  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(mentees.map((m) => m.id)))
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" variant="outline">
        <Users size={16} className="mr-1.5" />
        Bulk log
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <h2 className="text-lg font-semibold">Add point log to multiple mentees</h2>
        <form ref={formRef} action={formAction} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="bulk-description">Description</Label>
            <Input
              id="bulk-description"
              name="description"
              type="text"
              required
              placeholder="e.g. Attended weekly sharing session"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bulk-points">Points</Label>
            <Input id="bulk-points" name="points" type="number" step={1} required placeholder="10" />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Mentees ({selected.size}/{mentees.length})</Label>
              <button type="button" onClick={toggleAll} className="text-xs font-medium text-primary hover:underline">
                {allSelected ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
              {mentees.map((mentee) => (
                <label
                  key={mentee.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                >
                  <Checkbox
                    name="menteeIds"
                    value={mentee.id}
                    checked={selected.has(mentee.id)}
                    onChange={() => toggleMentee(mentee.id)}
                  />
                  {mentee.username}
                </label>
              ))}
            </div>
          </div>

          {state.error && <p className="text-xs text-destructive">{state.error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={isPending || selected.size === 0}>
              {isPending ? 'Adding…' : `Add to ${selected.size} mentee${selected.size === 1 ? '' : 's'}`}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  )
}
