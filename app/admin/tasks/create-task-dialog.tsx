'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

import { createTask, type TaskActionState } from '@/app/admin/actions/tasks'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState: TaskActionState = {}

interface Mentee {
  id: string
  username: string
}

// UC-12: Admin Buat Tugas Baru (Broadcast), UC-13: Admin Buat Special Task
export function CreateTaskDialog({ mentees }: { mentees: Mentee[] }) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<'broadcast' | 'special'>('broadcast')
  const [state, formAction, isPending] = useActionState(createTask, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) {
      toast.success('Task created successfully')
      formRef.current?.reset()
      setType('broadcast')
      setOpen(false)
    }
  }, [state.success])

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus size={16} className="mr-1.5" />
        New task
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <h2 className="text-lg font-semibold">New task</h2>
        <form ref={formRef} action={formAction} className="mt-4 max-h-[70vh] space-y-4 overflow-y-auto">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" type="text" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description (optional)</Label>
            <Input id="description" name="description" type="text" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="deadline">Deadline</Label>
            <Input id="deadline" name="deadline" type="date" required />
          </div>

          <div className="space-y-1.5">
            <Label>Type</Label>
            <div className="flex gap-2">
              <label className="flex flex-1 items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input
                  type="radio"
                  name="type"
                  value="broadcast"
                  checked={type === 'broadcast'}
                  onChange={() => setType('broadcast')}
                />
                Broadcast
              </label>
              <label className="flex flex-1 items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm has-[:checked]:border-rare has-[:checked]:bg-rare/5">
                <input
                  type="radio"
                  name="type"
                  value="special"
                  checked={type === 'special'}
                  onChange={() => setType('special')}
                />
                Special (rare)
              </label>
            </div>
          </div>

          {type === 'special' && (
            <div className="space-y-1.5">
              <Label>Assign to</Label>
              <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-input p-2">
                {mentees.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No mentees yet.</p>
                ) : (
                  mentees.map((mentee) => (
                    <label key={mentee.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="menteeIds" value={mentee.id} />
                      {mentee.username}
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          {state.error && <p className="text-xs text-destructive">{state.error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating…' : 'Create task'}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  )
}
