import { PageHeader } from '@/components/shared/page-header'
import { getSession } from '@/lib/auth/session'
import { supabaseAdmin } from '@/lib/supabase/admin'

import { MenteeBookTabs } from './mentee-book-tabs'

function getUsername(users: unknown): string {
  const u = Array.isArray(users) ? users[0] : users
  return (u as { username?: string } | undefined)?.username ?? 'Unknown'
}

// UC-20: Mentee & Admin Lihat Daftar Peminjaman Buku, UC-21: Mentee Lihat Arsip Peminjaman Buku
// implements FR-29, FR-30
export default async function MenteeBooksPage() {
  const session = await getSession()

  const [{ data: activeLendings }, { data: myArchive }] = await Promise.all([
    supabaseAdmin
      .from('book_lendings')
      .select('id, title, cover_image_url, deadline, status, users(username)')
      .eq('status', 'active')
      .order('deadline', { ascending: true }),
    supabaseAdmin
      .from('book_lendings')
      .select('id, title, cover_image_url, deadline, status, returned_at')
      .eq('mentee_id', session.userId)
      .eq('status', 'returned')
      .order('returned_at', { ascending: false }),
  ])

  const active = (activeLendings ?? []).map((l) => ({
    id: l.id,
    title: l.title,
    coverImageUrl: l.cover_image_url,
    deadline: l.deadline,
    status: l.status as 'active' | 'returned',
    returnedAt: null as string | null,
    borrowerName: getUsername(l.users),
  }))

  const archived = (myArchive ?? []).map((l) => ({
    id: l.id,
    title: l.title,
    coverImageUrl: l.cover_image_url,
    deadline: l.deadline,
    status: l.status as 'active' | 'returned',
    returnedAt: l.returned_at,
    borrowerName: session.username ?? '',
  }))

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <PageHeader title="Books" />
      <MenteeBookTabs active={active} archived={archived} />
    </main>
  )
}
