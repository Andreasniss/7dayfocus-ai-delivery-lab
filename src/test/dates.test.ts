import { afterEach, describe, it, expect, vi } from 'vitest'
import {
  getWeekStart,
  fromISO,
  toISO,
  dayDate,
  isSameDay,
  formatDayLabel,
  formatWeekRange,
  isWeekInPast,
} from '../utils/dates'

describe('getWeekStart', () => {
  it('returns the Monday of the current week for a Wednesday', () => {
    // Wednesday 2025-04-09 → Monday 2025-04-07
    const result = getWeekStart(new Date(2025, 3, 9))
    expect(result).toBe('2025-04-07')
  })

  it('returns the same Monday when given a Monday', () => {
    const result = getWeekStart(new Date(2025, 3, 7))
    expect(result).toBe('2025-04-07')
  })

  it('returns the previous Monday when given a Sunday', () => {
    // Sunday 2025-04-13 → Monday 2025-04-07
    const result = getWeekStart(new Date(2025, 3, 13))
    expect(result).toBe('2025-04-07')
  })

  it('returns the previous Monday when given a Saturday', () => {
    const result = getWeekStart(new Date(2025, 3, 12))
    expect(result).toBe('2025-04-07')
  })
})

describe('fromISO / toISO', () => {
  it('round-trips an ISO date string', () => {
    const iso = '2025-04-07'
    expect(toISO(fromISO(iso))).toBe(iso)
  })

  it('fromISO parses year, month, day correctly', () => {
    const d = fromISO('2025-12-31')
    expect(d.getFullYear()).toBe(2025)
    expect(d.getMonth()).toBe(11) // 0-indexed
    expect(d.getDate()).toBe(31)
  })

  it('toISO zero-pads month and day', () => {
    const d = new Date(2025, 0, 5) // Jan 5
    expect(toISO(d)).toBe('2025-01-05')
  })
})

describe('dayDate', () => {
  it('returns Monday for dayIndex 0', () => {
    const d = dayDate('2025-04-07', 0)
    expect(toISO(d)).toBe('2025-04-07')
  })

  it('returns Sunday for dayIndex 6', () => {
    const d = dayDate('2025-04-07', 6)
    expect(toISO(d)).toBe('2025-04-13')
  })

  it('returns Wednesday for dayIndex 2', () => {
    const d = dayDate('2025-04-07', 2)
    expect(toISO(d)).toBe('2025-04-09')
  })
})

describe('isSameDay', () => {
  it('returns true for two dates on the same calendar day', () => {
    const a = new Date(2025, 3, 7, 9, 0)
    const b = new Date(2025, 3, 7, 23, 59)
    expect(isSameDay(a, b)).toBe(true)
  })

  it('returns false for dates on different days', () => {
    const a = new Date(2025, 3, 7)
    const b = new Date(2025, 3, 8)
    expect(isSameDay(a, b)).toBe(false)
  })
})

describe('formatDayLabel', () => {
  it('labels Monday correctly', () => {
    const label = formatDayLabel(new Date(2025, 3, 7)) // Mon Apr 7
    expect(label.name).toBe('Mon')
    expect(label.num).toBe('7')
    expect(label.month).toBe('Apr')
  })

  it('labels Sunday correctly', () => {
    const label = formatDayLabel(new Date(2025, 3, 13)) // Sun Apr 13
    expect(label.name).toBe('Sun')
    expect(label.num).toBe('13')
  })
})

describe('formatWeekRange', () => {
  it('formats same-month range correctly', () => {
    expect(formatWeekRange('2025-04-07')).toBe('Apr 7–13, 2025')
  })

  it('formats cross-month range correctly', () => {
    // Apr 28 – May 4
    expect(formatWeekRange('2025-04-28')).toBe('Apr 28 – May 4, 2025')
  })

  it('includes both years when the period crosses New Year', () => {
    expect(formatWeekRange('2025-12-29')).toBe('Dec 29, 2025 – Jan 4, 2026')
  })
})

describe('isWeekInPast', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns true for a week that ended long ago', () => {
    expect(isWeekInPast('2020-01-06')).toBe(true)
  })

  it('returns false for a week starting in the future', () => {
    // Far future week
    expect(isWeekInPast('2099-01-01')).toBe(false)
  })

  it('uses the configured planning-period length', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 3, 12, 0, 0))

    expect(isWeekInPast('2025-04-07', 5)).toBe(true)
    expect(isWeekInPast('2025-04-07', 7)).toBe(false)
  })
})
