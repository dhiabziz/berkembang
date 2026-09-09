'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { KeyRound } from 'lucide-react'
import { toast } from 'sonner'

import { resetMenteePassword, type MenteeActionState } from '@/app/admin/actions/mentees'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState: MenteeActionState = {}

// UC-05: Admin Reset Password Mentee
export function ResetPasswordDialog({ menteeId, menteeName }: { menteeId: string; menteeName: string }) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(resetMenteePassword.bind(null, menteeId), initialState)
  const formRef = useRef<HTMLFormElement>(null)
  const wasPending = useRef(false)

  useEffect(() => {
    if (wasPending.current && !isPending && !state.error) {
      toast.success(`Password for ${menteeName} reset successfully`)
      formRef.current?.reset()
      setOpen(false)
    }
    wasPending.current = isPending
  }, [isPending, state.error, menteeName])

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <KeyRound size={16} className="mr-1.5" />
        Reset password
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <h2 className="text-lg font-semibold">Reset password for {menteeName}</h2>
        <form ref={formRef} action={formAction} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-password">New password</Label>
            <Input id="new-password" name="password" type="password" required minLength={4} />
          </div>
          {state.error && <p className="text-xs text-destructive">{state.error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Resetting…' : 'Reset password'}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  )
}
