'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { BookPlus } from 'lucide-react'
import { toast } from 'sonner'

import { createBookLending, type BookActionState } from '@/app/admin/actions/books'
import { ImageUpload } from '@/components/shared/image-upload'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState: BookActionState = {}

interface Mentee {
  id: string
  username: string
}

// UC-18: Admin Catat Peminjaman Buku
export function BookForm({ mentees }: { mentees: Mentee[] }) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(createBookLending, initialState)
  const formRef = useRef<HTMLFormElement>(null)
  const wasPending = useRef(false)

  useEffect(() => {
    if (wasPending.current && !isPending && !state.error) {
      toast.success('Book lending recorded')
      formRef.current?.reset()
      setOpen(false)
    }
    wasPending.current = isPending
  }, [isPending, state.error])

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <BookPlus size={16} className="mr-1.5" />
        Log lending
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <h2 className="text-lg font-semibold">Log book lending</h2>
        <form ref={formRef} action={formAction} className="mt-4 max-h-[70vh] space-y-4 overflow-y-auto">
          <div className="space-y-1.5">
            <Label htmlFor="menteeId">Borrower</Label>
            <select
              id="menteeId"
              name="menteeId"
              required
              className="h-11 w-full rounded-lg border border-input bg-white px-3 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select a mentee</option>
              {mentees.map((mentee) => (
                <option key={mentee.id} value={mentee.id}>
                  {mentee.username}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">Book title</Label>
            <Input id="title" name="title" type="text" required />
          </div>

          <ImageUpload name="cover" label="Cover photo" required />

          <div className="space-y-1.5">
            <Label htmlFor="deadline">Return deadline</Label>
            <Input id="deadline" name="deadline" type="date" required />
          </div>

          {state.error && <p className="text-xs text-destructive">{state.error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : 'Log lending'}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  )
}
