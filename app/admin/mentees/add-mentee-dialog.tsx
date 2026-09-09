'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

import { createMentee, type MenteeActionState } from '@/app/admin/actions/mentees'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState: MenteeActionState = {}

// UC-06: Admin Tambah Mentee
export function AddMenteeDialog() {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(createMentee, initialState)
  const formRef = useRef<HTMLFormElement>(null)
  const wasPending = useRef(false)

  useEffect(() => {
    if (wasPending.current && !isPending && !state.error && state.success) {
      toast.success(`Mentee ${state.success} added successfully`)
      formRef.current?.reset()
      setOpen(false)
    }
    wasPending.current = isPending
  }, [isPending, state.error, state.success])

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus size={16} className="mr-1.5" />
        Add mentee
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <h2 className="text-lg font-semibold">Add mentee</h2>
        <form ref={formRef} action={formAction} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="mentee-username">Username</Label>
            <Input id="mentee-username" name="username" type="text" required minLength={2} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mentee-password">Password</Label>
            <Input id="mentee-password" name="password" type="password" required minLength={4} />
          </div>
          {state.error && <p className="text-xs text-destructive">{state.error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Adding…' : 'Add mentee'}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  )
}
