export interface User {
  id: string
  username: string
  password_hash: string
  role: 'admin' | 'mentee'
  avatar_url: string | null
  total_points: number
  created_at: string
}
