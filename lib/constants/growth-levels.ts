// implements FR-34
export interface GrowthLevel {
  level: 1 | 2 | 3 | 4 | 5
  minPoints: number
  label: string
  emoji: string
}

export const GROWTH_LEVELS: GrowthLevel[] = [
  { level: 1, minPoints: 0, label: 'Seed', emoji: '🌱' },
  { level: 2, minPoints: 100, label: 'Sprout', emoji: '🌿' },
  { level: 3, minPoints: 300, label: 'Bud', emoji: '🌷' },
  { level: 4, minPoints: 600, label: 'Bloom', emoji: '🌸' },
  { level: 5, minPoints: 1000, label: 'Full Bloom', emoji: '🌺' },
]

export function getGrowthLevel(totalPoints: number): GrowthLevel {
  let current = GROWTH_LEVELS[0]
  for (const level of GROWTH_LEVELS) {
    if (totalPoints >= level.minPoints) {
      current = level
    }
  }
  return current
}
