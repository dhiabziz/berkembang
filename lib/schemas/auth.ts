import { z } from 'zod'

// implements FR-01, FR-02
export const loginSchema = z.object({
  username: z.string().min(1, 'Required.'),
  password: z.string().min(1, 'Required.'),
})

export type LoginInput = z.infer<typeof loginSchema>
