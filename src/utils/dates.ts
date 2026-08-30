/** Returns the ISO date string (YYYY-MM-DD) for the starting day of the week containing the given date. */
export function getWeekStart(date: Date = new Date(), startDay: number = 1): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const currentDay = d.getDay() // 0=Sun … 6=Sat
  const diff = (currentDay - startDay + 7) % 7
  d.setDate(d.getDate() - diff)
  return toISO(d)
}

/** Returns Date object for a given ISO date string. */
export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y!, m! - 1, d!)
}

/** Returns YYYY-MM-DD for a Date. */
export function toISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Returns the Date for day at offset from the week start. */
export function dayDate(weekStart: string, dayIndex: number): Date {
  const d = fromISO(weekStart)
  d.setDate(d.getDate() + dayIndex)
  return d
}

/** Returns true if two dates are the same calendar day. */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** Human-readable day label, e.g. "Mon 7" */
export function formatDayLabel(date: Date): { name: string; num: string; month: string } {
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const dow = date.getDay()
  return {
    name: names[dow]!,
    num: String(date.getDate()),
    month: months[date.getMonth()]!,
  }
}

/** e.g. "Apr 7 – 13, 2025" */
export function formatWeekRange(weekStart: string, length: number = 7): string {
  const start = fromISO(weekStart)
  const end = new Date(start)
  end.setDate(end.getDate() + (length - 1))
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const sm = months[start.getMonth()]!
  const em = months[end.getMonth()]!
  const sameYear = start.getFullYear() === end.getFullYear()
  const sameMonth = sameYear && start.getMonth() === end.getMonth()
  if (sameMonth) {
    return `${sm} ${start.getDate()}–${end.getDate()}, ${end.getFullYear()}`
  }
  if (!sameYear) {
    return `${sm} ${start.getDate()}, ${start.getFullYear()} – ${em} ${end.getDate()}, ${end.getFullYear()}`
  }
  return `${sm} ${start.getDate()} – ${em} ${end.getDate()}, ${end.getFullYear()}`
}

/** Returns true if the configured planning period has ended. */
export function isWeekInPast(weekStart: string, length: number = 7): boolean {
  const end = fromISO(weekStart)
  end.setDate(end.getDate() + length) // start of the next planning period
  return new Date() >= end
}

/** Returns the dayIndex (0–length-1) for today within the given week, or -1 if today is outside this week. */
export function getTodayIndex(weekStart: string, length: number = 7): number {
  const today = new Date()
  for (let i = 0; i < length; i++) {
    if (isSameDay(dayDate(weekStart, i), today)) return i
  }
  return -1
}

/** Returns the ISO date string seven calendar days after the current weekStart. */
export function getNextWeekStart(currentWeekStart: string): string {
  const d = fromISO(currentWeekStart)
  d.setDate(d.getDate() + 7)
  return toISO(d)
}
