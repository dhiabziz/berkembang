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
  { key: 'archived', label: 'Archived' },
] as const

export function BookListTabs({ lendings }: { lendings: Lending[] }) {
  const [tab, setTab] = useState<'active' | 'archived'>('active')
  const filtered = lendings.filter((l) => (tab === 'active' ? l.status === 'active' : l.status === 'returned'))

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

      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          heading={tab === 'active' ? 'No active lendings' : 'No archived lendings'}
          description={tab === 'active' ? 'Log a book lending to get started.' : 'Returned books will show up here.'}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((lending) => (
            <BookCard
              key={lending.id}
              lendingId={lending.id}
              coverImageUrl={lending.coverImageUrl}
              title={lending.title}
              borrowerName={lending.borrowerName}
              deadline={lending.deadline}
              status={lending.status}
              returnedAt={lending.returnedAt}
              showReturnButton
              showDeleteButton
            />
          ))}
        </div>
      )}
    </div>
  )
}
