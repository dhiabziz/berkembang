import Link from 'next/link'
import { Trophy } from 'lucide-react'

import { Avatar } from '@/components/shared/avatar'
import { cn } from '@/lib/utils'

import { GrowthBadge } from './growth-badge'

interface LeaderboardCardProps {
  rank: number
  name: string
  avatarUrl?: string | null
  totalPoints: number
  href?: string
}

const RANK_STYLES: Record<number, string> = {
  1: 'border-gold bg-gold/5',
  2: 'border-silver bg-silver/5',
  3: 'border-bronze bg-bronze/5',
}

const MEDAL_COLOR: Record<number, string> = {
  1: 'text-gold',
  2: 'text-silver',
  3: 'text-bronze',
}

// implements FR-16, FR-32
export function LeaderboardCard({ rank, name, avatarUrl, totalPoints, href }: LeaderboardCardProps) {
  const isTopThree = rank <= 3
  const avatarSize = rank === 1 ? 'xl' : isTopThree ? 'lg' : 'md'

  const content = (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-border bg-white p-4 shadow-sm transition-shadow',
        href && 'hover:shadow-md',
        isTopThree && RANK_STYLES[rank],
        rank === 1 && 'p-5'
      )}
    >
      <div className="flex w-6 shrink-0 items-center justify-center">
        {isTopThree ? (
          <Trophy size={20} className={MEDAL_COLOR[rank]} />
        ) : (
          <span className="text-sm font-semibold text-muted-foreground">{rank}</span>
        )}
      </div>
      <Avatar src={avatarUrl} name={name} size={avatarSize} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{name}</p>
        <GrowthBadge totalPoints={totalPoints} className="mt-1" />
      </div>
      <p className="font-mono text-xl font-bold tabular-nums text-primary">{totalPoints}</p>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
