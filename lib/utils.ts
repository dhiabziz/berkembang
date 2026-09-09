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

function getTodayWIB() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())
}

// deadline is a plain DATE (YYYY-MM-DD); compare calendar dates as strings against "today" in WIB.
export function getDeadlineStatus(deadline: string): 'overdue' | 'due-tomorrow' | null {
  const today = getTodayWIB()
  if (deadline < today) return 'overdue'

  const tomorrow = new Date(`${today}T00:00:00Z`)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  const tomorrowStr = tomorrow.toISOString().slice(0, 10)

  if (deadline === tomorrowStr) return 'due-tomorrow'
  return null
}
