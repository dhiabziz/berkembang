import { z } from 'zod'

// implements FR-27
export const createBookLendingSchema = z
  .object({
    menteeId: z.string().min(1, 'Select a mentee.'),
    title: z.string().min(1, 'Title is required.'),
    deadline: z.string().min(1, 'Deadline is required.'),
  })
  .refine((data) => data.deadline >= new Date().toISOString().slice(0, 10), {
    message: 'Deadline must be in the future.',
    path: ['deadline'],
  })

export type CreateBookLendingInput = z.infer<typeof createBookLendingSchema>
