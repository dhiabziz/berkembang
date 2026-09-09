// Run with: npx tsx scripts/seed-admin.ts
// Reads ADMIN_DEFAULT_PASSWORD from .env.local and upserts the single admin user (BR-01).
import { readFileSync } from 'fs'
import { resolve } from 'path'

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), '.env.local')
  const content = readFileSync(envPath, 'utf-8')

  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) continue

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim()
    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

async function main() {
  loadEnvLocal()

  const password = process.env.ADMIN_DEFAULT_PASSWORD
  if (!password) {
    throw new Error('ADMIN_DEFAULT_PASSWORD is not set in .env.local')
  }

  const { hashPassword } = await import('../lib/auth/password')
  const { supabaseAdmin } = await import('../lib/supabase/admin')

  const passwordHash = await hashPassword(password)

  const { error } = await supabaseAdmin
    .from('users')
    .upsert({ username: 'admin', password_hash: passwordHash, role: 'admin' }, { onConflict: 'username' })

  if (error) {
    throw error
  }

  console.log('Admin user seeded successfully.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
