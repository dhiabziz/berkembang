// Run with: npx tsx scripts/recalculate-points.ts
// One-off (and safe to re-run) repair: sets every mentee's total_points to the actual
// SUM of their point_logs, undoing any drift caused by the old read-then-add update logic.
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

  const { supabaseAdmin } = await import('../lib/supabase/admin')

  const { data: mentees, error: menteeError } = await supabaseAdmin
    .from('users')
    .select('id, username, total_points')
    .eq('role', 'mentee')

  if (menteeError) throw menteeError
  if (!mentees || mentees.length === 0) {
    console.log('No mentees found.')
    return
  }

  for (const mentee of mentees) {
    const { data: logs, error: logsError } = await supabaseAdmin
      .from('point_logs')
      .select('points')
      .eq('mentee_id', mentee.id)

    if (logsError) throw logsError

    const correctTotal = (logs ?? []).reduce((sum, log) => sum + log.points, 0)

    if (correctTotal === mentee.total_points) {
      console.log(`${mentee.username}: already correct (${correctTotal} pts)`)
      continue
    }

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ total_points: correctTotal })
      .eq('id', mentee.id)

    if (updateError) throw updateError

    console.log(`${mentee.username}: ${mentee.total_points} -> ${correctTotal} pts (fixed)`)
  }

  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
