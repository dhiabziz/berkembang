'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { uploadAvatar, type AvatarUploadState } from '@/app/mentee/actions/profile'
import { Avatar } from '@/components/shared/avatar'
import { ImageUpload } from '@/components/shared/image-upload'
import { Button } from '@/components/ui/button'

const initialState: AvatarUploadState = {}

// UC-08: Mentee Upload Foto Profil
export function AvatarUploadForm({
  currentAvatarUrl,
  username,
}: {
  currentAvatarUrl: string | null
  username: string
}) {
  const [state, formAction, isPending] = useActionState(uploadAvatar, initialState)
  const formRef = useRef<HTMLFormElement>(null)
  const wasPending = useRef(false)
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl)

  useEffect(() => {
    if (wasPending.current && !isPending) {
      if (state.error) {
        toast.error(state.error)
      } else if (state.avatarUrl) {
        toast.success('Profile photo updated')
        setAvatarUrl(state.avatarUrl)
        formRef.current?.reset()
      }
    }
    wasPending.current = isPending
  }, [isPending, state.error, state.avatarUrl])

  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold">Profile photo</h2>
      <div className="mb-4">
        <Avatar src={avatarUrl} name={username} size="lg" />
      </div>
      <form ref={formRef} action={formAction} className="space-y-3">
        <ImageUpload name="avatar" label="Choose a new photo" required />
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? 'Uploading…' : 'Save photo'}
        </Button>
      </form>
    </div>
  )
}
