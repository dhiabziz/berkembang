import { Users } from 'lucide-react'

import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { supabaseAdmin } from '@/lib/supabase/admin'

import { AddMenteeDialog } from './add-mentee-dialog'
import { MenteeCard } from './mentee-card'

// UC-06: Admin Tambah Mentee, UC-07: Admin Hapus Mentee
export default async function AdminMenteesPage() {
  const { data: mentees } = await supabaseAdmin
    .from('users')
    .select('id, username, avatar_url, total_points')
    .eq('role', 'mentee')
    .order('username', { ascending: true })

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <PageHeader title="Mentees" description="Manage the mentees in your program." action={<AddMenteeDialog />} />

      {!mentees || mentees.length === 0 ? (
        <EmptyState icon={Users} heading="No mentees yet" description="Add your first mentee to get started!" />
      ) : (
        <div className="space-y-3">
          {mentees.map((mentee) => (
            <MenteeCard
              key={mentee.id}
              id={mentee.id}
              username={mentee.username}
              avatarUrl={mentee.avatar_url}
              totalPoints={mentee.total_points}
            />
          ))}
        </div>
      )}
    </main>
  )
}
