import { cn } from '@/lib/utils'
import { getGrowthLevel, type GrowthLevel } from '@/lib/constants/growth-levels'

// Style scales by the level's relative rank among all configured levels (0 = lowest, 1 = highest),
// so it still looks right whether the admin defines 3 levels or 8.
function getLevelStyle(levels: GrowthLevel[], levelId: string): string {
  const index = levels.findIndex((l) => l.id === levelId)
  const ratio = levels.length <= 1 ? 1 : index / (levels.length - 1)

  if (ratio >= 1) return 'bg-gold/20 text-bronze shadow-[0_0_8px_hsl(var(--gold)/0.4)]'
  if (ratio >= 0.75) return 'bg-accent/15 text-accent-foreground'
  if (ratio >= 0.5) return 'bg-primary/15 text-primary'
  if (ratio >= 0.25) return 'bg-primary/10 text-primary/80'
  return 'bg-muted text-muted-foreground'
}

// implements FR-34
export function GrowthBadge({
  totalPoints,
  levels,
  className,
}: {
  totalPoints: number
  levels: GrowthLevel[]
  className?: string
}) {
  const growthLevel = getGrowthLevel(totalPoints, levels)

  if (!growthLevel) return null

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
        getLevelStyle(levels, growthLevel.id),
        className
      )}
    >
      <span aria-hidden>{growthLevel.emoji}</span>
      {growthLevel.label}
    </span>
  )
}
