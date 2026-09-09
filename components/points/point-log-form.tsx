'use client'

import { useActionState, useEffect, useRef } from 'react'
import { toast } from 'sonner'

import { addPointLog, type PointLogActionState } from '@/app/admin/actions/points'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState: PointLogActionState = {}

// UC-09: Admin Tambah Log Poin
export function PointLogForm({ menteeId, menteeName }: { menteeId: string; menteeName: string }) {
  const [state, formAction, isPending] = useActionState(addPointLog.bind(null, menteeId), initialState)
  const formRef = useRef<HTMLFormElement>(null)
  const wasPending = useRef(false)

  useEffect(() => {
    if (wasPending.current && !isPending && !state.error && state.success !== undefined) {
      const points = state.success
      toast.success(`${points > 0 ? '+' : ''}${points} points for ${menteeName}`)
      formRef.current?.reset()
    }
    wasPending.current = isPending
  }, [isPending, state.error, state.success, menteeName])

  return (
    <form ref={formRef} action={formAction} className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold">Add point log</h2>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Input id="description" name="description" type="text" required placeholder="e.g. Helped organize the book club" />
        </div>
        <div className="w-full space-y-1.5 sm:w-28">
          <Label htmlFor="points">Points</Label>
          <Input id="points" name="points" type="number" step={1} required placeholder="10" />
        </div>
        <Button type="submit" variant="accent" disabled={isPending}>
          {isPending ? 'Adding…' : 'Add'}
        </Button>
      </div>
      {state.error && <p className="mt-2 text-xs text-destructive">{state.error}</p>}
    </form>
  )
}
