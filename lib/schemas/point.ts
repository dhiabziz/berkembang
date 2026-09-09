import { z } from 'zod'

// implements FR-11
export const createPointLogSchema = z.object({
  description: z.string().min(1, 'Description is required.'),
  points: z.coerce.number().int('Points must be a whole number.'),
})

export type CreatePointLogInput = z.infer<typeof createPointLogSchema>
