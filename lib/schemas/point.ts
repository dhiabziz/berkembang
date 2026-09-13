import { z } from 'zod'

// implements FR-11
export const createPointLogSchema = z.object({
  description: z.string().min(1, 'Description is required.'),
  points: z.coerce.number().int('Points must be a whole number.'),
})

export type CreatePointLogInput = z.infer<typeof createPointLogSchema>

// bulk point log — same description + points applied to multiple mentees at once
export const createBulkPointLogSchema = z.object({
  description: z.string().min(1, 'Description is required.'),
  points: z.coerce.number().int('Points must be a whole number.'),
  menteeIds: z.array(z.string().uuid()).min(1, 'Select at least one mentee.'),
})

export type CreateBulkPointLogInput = z.infer<typeof createBulkPointLogSchema>
