import { describe, it, expect } from 'vitest'
import { parseImport } from '../lib/dataIO'

describe('dataIO import/export', () => {
  it('parses imported state with settings', () => {
    const raw = {
      weekStart: '2026-04-14',
      tasks: [
        { text: 'Sample task', dayIndex: 0, completed: false, priority: true },
      ],
      settings: {
        maxPriority: 3,
        maxTasksPerDay: 8,
        weekStartDay: 1,
        weekLength: 5,
      },
    }

    const state = parseImport(raw)

    expect(state.weekStart).toBe('2026-04-14')
    expect(state.tasks).toHaveLength(1)
    expect(state.settings).toEqual({
      maxPriority: 3,
      maxTasksPerDay: 8,
      weekStartDay: 1,
      weekLength: 5,
      homeView: 'day',
    })
  })

  it('falls back to default settings when missing', () => {
    const raw = {
      weekStart: '2026-04-14',
      tasks: [
        { text: 'Legacy task', dayIndex: 2, completed: true },
      ],
    }

    const state = parseImport(raw)

    expect(state.settings).toEqual({
      maxPriority: 2,
      maxTasksPerDay: 5,
      weekStartDay: 1,
      weekLength: 7,
      homeView: 'day',
    })
  })
})

