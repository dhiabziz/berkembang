import { z } from 'zod'

// implements FR-01, FR-02
export const loginSchema = z.object({
  username: z.string().min(1, 'Required.'),
  password: z.string().min(1, 'Required.'),
})

export type LoginInput = z.infer<typeof loginSchema>

// implements FR-04
export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Required.'),
    newPassword: z.string().min(4, 'Password must be at least 4 characters.'),
    confirmPassword: z.string().min(1, 'Required.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New password does not match.',
    path: ['confirmPassword'],
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
