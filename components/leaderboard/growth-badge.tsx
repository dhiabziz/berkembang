import { cn } from '@/lib/utils'
import { getGrowthLevel } from '@/lib/constants/growth-levels'

const LEVEL_STYLES: Record<number, string> = {
  1: 'bg-muted text-muted-foreground',
  2: 'bg-primary/10 text-primary/80',
  3: 'bg-primary/15 text-primary',
  4: 'bg-accent/15 text-accent-foreground',
  5: 'bg-gold/20 text-bronze shadow-[0_0_8px_hsl(var(--gold)/0.4)]',
}

// implements FR-34
export function GrowthBadge({ totalPoints, className }: { totalPoints: number; className?: string }) {
  const growthLevel = getGrowthLevel(totalPoints)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
        LEVEL_STYLES[growthLevel.level],
        className
      )}
    >
      <span aria-hidden>{growthLevel.emoji}</span>
      {growthLevel.label}
    </span>
  )
}
