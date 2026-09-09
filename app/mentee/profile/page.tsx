import { PageHeader } from '@/components/shared/page-header'
import { getSession } from '@/lib/auth/session'
import { supabaseAdmin } from '@/lib/supabase/admin'

import { AvatarUploadForm } from './avatar-upload-form'
import { ChangePasswordForm } from './change-password-form'

// UC-04: Mentee Ganti Password, UC-08: Mentee Upload Foto Profil
export default async function ProfilePage() {
  const session = await getSession()

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('username, avatar_url')
    .eq('id', session.userId)
    .maybeSingle()

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <PageHeader title="Profile" description="Manage your photo and password." />

      <div className="space-y-4">
        <AvatarUploadForm currentAvatarUrl={user?.avatar_url ?? null} username={user?.username ?? ''} />
        <ChangePasswordForm />
      </div>
    </main>
  )
}
