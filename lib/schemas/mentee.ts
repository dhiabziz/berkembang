import { z } from 'zod'

// implements FR-07
export const createMenteeSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters.'),
  password: z.string().min(4, 'Password must be at least 4 characters.'),
})

export type CreateMenteeInput = z.infer<typeof createMenteeSchema>

// implements FR-05
export const resetPasswordSchema = z.object({
  password: z.string().min(4, 'Password must be at least 4 characters.'),
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
