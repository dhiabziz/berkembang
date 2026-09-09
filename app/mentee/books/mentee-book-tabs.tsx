'use client'

import { useState } from 'react'
import { BookOpen } from 'lucide-react'

import { BookCard } from '@/components/books/book-card'
import { EmptyState } from '@/components/shared/empty-state'
import { cn } from '@/lib/utils'

interface Lending {
  id: string
  title: string
  coverImageUrl: string
  deadline: string
  status: 'active' | 'returned'
  returnedAt: string | null
  borrowerName: string
}

const TABS = [
  { key: 'active', label: 'Active' },
  { key: 'archive', label: 'My archive' },
] as const

// UC-20: Mentee & Admin Lihat Daftar Peminjaman Buku, UC-21: Mentee Lihat Arsip Peminjaman Buku
export function MenteeBookTabs({ active, archived }: { active: Lending[]; archived: Lending[] }) {
  const [tab, setTab] = useState<'active' | 'archive'>('active')
  const lendings = tab === 'active' ? active : archived

  return (
    <div>
      <div className="mb-4 flex gap-1 rounded-lg bg-muted p-1">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex-1 rounded-md py-1.5 text-sm font-medium transition-colors',
              tab === key ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {lendings.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          heading={tab === 'active' ? 'No active lendings' : 'No returned books yet'}
          description={tab === 'active' ? 'Nothing on loan right now.' : 'Books you return will show up here.'}
        />
      ) : (
        <div className="space-y-3">
          {lendings.map((lending) => (
            <BookCard
              key={lending.id}
              coverImageUrl={lending.coverImageUrl}
              title={lending.title}
              borrowerName={lending.borrowerName}
              deadline={lending.deadline}
              status={lending.status}
              returnedAt={lending.returnedAt}
            />
          ))}
        </div>
      )}
    </div>
  )
}
