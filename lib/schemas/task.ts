import { z } from 'zod'

import { wibLocalToIso } from '@/lib/utils'

// implements FR-19, FR-20, FR-21
export const createTaskSchema = z
  .object({
    title: z.string().min(1, 'Title is required.'),
    description: z.string().optional(),
    // "YYYY-MM-DDTHH:mm" from a <input type="datetime-local">, interpreted as WIB wall-clock time.
    deadline: z.string().min(1, 'Deadline is required.'),
    type: z.enum(['broadcast', 'special']),
    menteeIds: z.array(z.string()).optional(),
  })
  .refine((data) => new Date(wibLocalToIso(data.deadline)).getTime() > Date.now(), {
    message: 'Deadline must be in the future.',
    path: ['deadline'],
  })
  .refine((data) => data.type !== 'special' || (data.menteeIds && data.menteeIds.length > 0), {
    message: 'Select at least one mentee.',
    path: ['menteeIds'],
  })

export type CreateTaskInput = z.infer<typeof createTaskSchema>
