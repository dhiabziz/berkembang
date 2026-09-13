import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// implements CN-06 (timestamps shown in Asia/Jakarta)
export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

export function formatPoints(points: number) {
  return points > 0 ? `+${points}` : `${points}`
}

function toWIBDateString(date: Date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(date)
}

// Converts a "YYYY-MM-DDTHH:mm" datetime-local value (entered by the admin, meant as WIB
// wall-clock time) into a UTC ISO string, so it stores/compares correctly regardless of the
// server's runtime timezone (Vercel serverless functions run in UTC).
export function wibLocalToIso(datetimeLocal: string): string {
  return new Date(`${datetimeLocal}:00+07:00`).toISOString()
}

// deadline is a TIMESTAMPTZ. Precise overdue check uses the exact instant; the day-count
// summary compares WIB calendar dates for a friendlier "N days left / overdue" label.
export function getDeadlineInfo(deadlineIso: string): {
  variant: 'overdue' | 'urgent' | 'normal'
  label: string
} {
  const deadline = new Date(deadlineIso)
  const now = new Date()
  const isOverdue = deadline.getTime() < now.getTime()

  const deadlineDateOnly = new Date(`${toWIBDateString(deadline)}T00:00:00Z`)
  const todayDateOnly = new Date(`${toWIBDateString(now)}T00:00:00Z`)
  const dayDiff = Math.round((deadlineDateOnly.getTime() - todayDateOnly.getTime()) / 86_400_000)

  if (isOverdue) {
    const days = Math.abs(dayDiff)
    return {
      variant: 'overdue',
      label: days === 0 ? 'Overdue today ⚠️' : `Overdue by ${days} day${days > 1 ? 's' : ''} ⚠️`,
    }
  }

  if (dayDiff === 0) return { variant: 'urgent', label: 'Due today!' }
  if (dayDiff === 1) return { variant: 'urgent', label: 'Due tomorrow!' }
  return { variant: 'normal', label: `${dayDiff} days left` }
}

// A task is archived automatically once its deadline has passed or every assignee has
// submitted — no manual "archive" action needed. `isArchivedFlag` is kept only so legacy
// rows that were manually archived before this change still show as archived.
export function isTaskArchived(isArchivedFlag: boolean, deadlineIso: string, assignmentStatuses: string[]): boolean {
  if (isArchivedFlag) return true
  if (new Date(deadlineIso).getTime() < Date.now()) return true
  if (assignmentStatuses.length > 0 && assignmentStatuses.every((status) => status === 'submitted')) return true
  return false
}
