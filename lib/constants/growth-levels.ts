// implements FR-34 — growth levels are now admin-configurable, stored in the `growth_levels` table
// (see lib/data/growth-levels.ts for the DB fetch). This file only keeps the shared type + pure logic.
export interface GrowthLevel {
  id: string
  minPoints: number
  label: string
  emoji: string
}

// Seed values used when the growth_levels table is first created — see the migration SQL.
export const DEFAULT_GROWTH_LEVELS: Omit<GrowthLevel, 'id'>[] = [
  { minPoints: 0, label: 'Seed', emoji: '🌱' },
  { minPoints: 100, label: 'Sprout', emoji: '🌿' },
  { minPoints: 300, label: 'Bud', emoji: '🌷' },
  { minPoints: 600, label: 'Bloom', emoji: '🌸' },
  { minPoints: 1000, label: 'Full Bloom', emoji: '🌺' },
]

// `levels` must be sorted by minPoints ascending (getGrowthLevels() already orders it this way).
export function getGrowthLevel(totalPoints: number, levels: GrowthLevel[]): GrowthLevel | null {
  if (levels.length === 0) return null

  let current = levels[0]
  for (const level of levels) {
    if (totalPoints >= level.minPoints) {
      current = level
    }
  }
  return current
}
