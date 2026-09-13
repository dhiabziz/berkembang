import { getGrowthLevel, type GrowthLevel } from '@/lib/constants/growth-levels'
import { cn } from '@/lib/utils'

// shows every configured growth level and how many points each needs, so mentees can see
// the full path ahead instead of just their current badge
export function GrowthPath({ totalPoints, levels }: { totalPoints: number; levels: GrowthLevel[] }) {
  if (levels.length === 0) return null

  const current = getGrowthLevel(totalPoints, levels)

  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold">Growth path</h2>
      <div className="space-y-2">
        {levels.map((level) => {
          const reached = totalPoints >= level.minPoints
          const isCurrent = level.id === current?.id
          const pointsToGo = level.minPoints - totalPoints

          return (
            <div
              key={level.id}
              className={cn(
                'flex items-center gap-3 rounded-lg border p-3 transition-opacity',
                isCurrent ? 'border-primary bg-primary/5' : 'border-border',
                !reached && 'opacity-60'
              )}
            >
              <span className="text-2xl" aria-hidden>
                {level.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{level.label}</p>
                <p className="text-xs text-muted-foreground">{level.minPoints}+ pts</p>
              </div>
              {isCurrent ? (
                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                  Current
                </span>
              ) : (
                !reached && (
                  <span className="shrink-0 text-xs font-medium text-muted-foreground">{pointsToGo} pts to go</span>
                )
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
