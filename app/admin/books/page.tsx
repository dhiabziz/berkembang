import { BookForm } from '@/components/books/book-form'
import { PageHeader } from '@/components/shared/page-header'
import { supabaseAdmin } from '@/lib/supabase/admin'

import { BookListTabs } from './book-list-tabs'

function getUsername(users: unknown): string {
  const u = Array.isArray(users) ? users[0] : users
  return (u as { username?: string } | undefined)?.username ?? 'Unknown'
}

// UC-18: Admin Catat Peminjaman Buku, UC-19: Admin Centang Buku Dikembalikan — implements FR-27, FR-28, FR-31
export default async function AdminBooksPage() {
  const [{ data: lendings }, { data: mentees }] = await Promise.all([
    supabaseAdmin
      .from('book_lendings')
      .select('id, title, cover_image_url, deadline, status, returned_at, users(username)')
      .order('deadline', { ascending: true }),
    supabaseAdmin.from('users').select('id, username').eq('role', 'mentee').order('username', { ascending: true }),
  ])

  const normalized = (lendings ?? []).map((l) => ({
    id: l.id,
    title: l.title,
    coverImageUrl: l.cover_image_url,
    deadline: l.deadline,
    status: l.status as 'active' | 'returned',
    returnedAt: l.returned_at,
    borrowerName: getUsername(l.users),
  }))

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <PageHeader
        title="Books"
        description="Track book lendings for your mentees."
        action={<BookForm mentees={mentees ?? []} />}
      />
      <BookListTabs lendings={normalized} />
    </main>
  )
}
