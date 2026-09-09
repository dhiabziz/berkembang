'use server'

import { redirect } from 'next/navigation'

import { verifyPassword } from '@/lib/auth/password'
import { getSession } from '@/lib/auth/session'
import { loginSchema } from '@/lib/schemas/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

export interface LoginState {
  error?: string
}

// UC-01: Admin Login, UC-02: Mentee Login — implements FR-01, FR-02, FR-06
export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: 'Username and password are required.' }
  }

  const { username, password } = parsed.data

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id, username, password_hash, role')
    .ilike('username', username)
    .maybeSingle()

  if (!user) {
    return { error: 'Incorrect username or password.' }
  }

  const passwordMatches = await verifyPassword(password, user.password_hash)
  if (!passwordMatches) {
    return { error: 'Incorrect username or password.' }
  }

  const session = await getSession()
  session.userId = user.id
  session.username = user.username
  session.role = user.role as 'admin' | 'mentee'
  await session.save()

  redirect(user.role === 'admin' ? '/admin/dashboard' : '/mentee/leaderboard')
}

// UC-03: Logout — implements FR-03
export async function logout(): Promise<void> {
  const session = await getSession()
  session.destroy()
  redirect('/login')
}
