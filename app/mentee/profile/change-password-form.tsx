'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { changePassword, type ChangePasswordState } from '@/app/mentee/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState: ChangePasswordState = {}

// UC-04: Mentee Ganti Password — implements FR-04
export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changePassword, initialState)
  const formRef = useRef<HTMLFormElement>(null)
  const wasPending = useRef(false)
  const [confirmError, setConfirmError] = useState<string | null>(null)

  useEffect(() => {
    if (wasPending.current && !isPending && !state.error && state.success) {
      toast.success('Password changed successfully')
      formRef.current?.reset()
    }
    wasPending.current = isPending
  }, [isPending, state.error, state.success])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget
    const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement).value
    const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value

    if (newPassword !== confirmPassword) {
      e.preventDefault()
      setConfirmError('New password does not match.')
      return
    }
    setConfirmError(null)
  }

  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold">Change password</h2>
      <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="oldPassword">Current password</Label>
          <Input id="oldPassword" name="oldPassword" type="password" required autoComplete="current-password" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="newPassword">New password</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            minLength={4}
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={4}
            autoComplete="new-password"
          />
          {confirmError && <p className="text-xs text-destructive">{confirmError}</p>}
        </div>
        {state.error && <p className="text-xs text-destructive">{state.error}</p>}
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? 'Changing…' : 'Change password'}
        </Button>
      </form>
    </div>
  )
}
