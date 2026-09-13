import { z } from 'zod'

export const growthLevelSchema = z.object({
  label: z.string().min(1, 'Name is required.').max(30, 'Name must be 30 characters or fewer.'),
  emoji: z.string().min(1, 'Emoji is required.').max(8, 'Use a single emoji.'),
  minPoints: z.coerce.number().int('Points must be a whole number.').min(0, 'Points cannot be negative.'),
})

export type GrowthLevelInput = z.infer<typeof growthLevelSchema>
