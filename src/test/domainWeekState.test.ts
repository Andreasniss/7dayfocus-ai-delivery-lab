import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SETTINGS,
  MAX_RECOVERABLE_TASK_TEXT_LENGTH,
  MAX_RECOVERABLE_TOTAL_TASKS,
  MAX_TASK_TEXT_LENGTH,
  parseLegacyWeekState,
  parsePortableWeekState,
  parseRuntimeWeekState,
  weekReducer,
  type IdFactory,
} from '../domain/weekState'
import type { AppSettings, Task, WeekState } from '../types'

const UUIDS = [
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000002',
  '00000000-0000-4000-8000-000000000003',
  '00000000-0000-4000-8000-000000000004',
  '00000000-0000-4000-8000-000000000005',
  '00000000-0000-4000-8000-000000000006',
] as const

const SETTINGS: AppSettings = { ...DEFAULT_SETTINGS }

function task(overrides: Partial<Task> = {}): Task {
  return {
    id: UUIDS[0],
    text: 'Review plan',
    completed: false,
    dayIndex: 0,
    priority: false,
    ...overrides,
  }
}

function state(tasks: Task[] = [], settings: AppSettings = SETTINGS): WeekState {
  return {
    weekStart: '2026-08-24',
    tasks,
    settings: { ...settings },
  }
}

function sequentialIds(...ids: string[]): IdFactory {
  let index = 0
  return () => {
    const id = ids[index]
    if (id === undefined) throw new Error('Test ID factory exhausted')
    index += 1
    return id
  }
}

function generatedIds(): IdFactory {
  let value = 0
  return () => {
    value += 1
    return `00000000-0000-4000-8000-${value.toString(16).padStart(12, '0')}`
  }
}

describe('weekReducer invariants', () => {
  it.each([
    ['blank text', { type: 'ADD_TASK', id: UUIDS[0], dayIndex: 0, text: '   ' }],
    ['negative day', { type: 'ADD_TASK', id: UUIDS[0], dayIndex: -1, text: 'Task' }],
    ['day outside the configured week', { type: 'ADD_TASK', id: UUIDS[0], dayIndex: 7, text: 'Task' }],
    ['overlong text', { type: 'ADD_TASK', id: UUIDS[0], dayIndex: 0, text: 'x'.repeat(MAX_TASK_TEXT_LENGTH + 1) }],
    ['non-UUID id', { type: 'ADD_TASK', id: 'predictable-id', dayIndex: 0, text: 'Task' }],
  ] as const)('rejects an add with %s', (_name, action) => {
    const original = state()

    expect(weekReducer(original, action)).toBe(original)
  })

  it('rejects a same-day move without resetting completion or priority', () => {
    const original = state([task({ completed: true, priority: true })])

    expect(weekReducer(original, {
      type: 'MOVE_TASK',
      id: UUIDS[0],
      toDayIndex: 0,
    })).toBe(original)
  })

  it('rejects a move for an unknown task or an out-of-range day', () => {
    const original = state([task()])

    expect(weekReducer(original, {
      type: 'MOVE_TASK',
      id: UUIDS[1],
      toDayIndex: 1,
    })).toBe(original)
    expect(weekReducer(original, {
      type: 'MOVE_TASK',
      id: UUIDS[0],
      toDayIndex: 7,
    })).toBe(original)
  })

  it('rejects moving into a full day', () => {
    const constrained = { ...SETTINGS, maxPriority: 1, maxTasksPerDay: 2 }
    const original = state([
      task({ id: UUIDS[0], dayIndex: 0 }),
      task({ id: UUIDS[1], dayIndex: 1 }),
      task({ id: UUIDS[2], dayIndex: 1 }),
    ], constrained)

    expect(weekReducer(original, {
      type: 'MOVE_TASK',
      id: UUIDS[0],
      toDayIndex: 1,
    })).toBe(original)
  })

  it('counts completed tasks toward daily capacity', () => {
    const constrained = { ...SETTINGS, maxPriority: 1, maxTasksPerDay: 1 }
    const original = state([task({ completed: true })], constrained)

    expect(weekReducer(original, {
      type: 'ADD_TASK',
      id: UUIDS[1],
      dayIndex: 0,
      text: 'Another task',
    })).toBe(original)
  })

  it.each(['   ', 'x'.repeat(MAX_TASK_TEXT_LENGTH + 1)])(
    'rejects an invalid edit without changing the task: %s',
    text => {
      const original = state([task()])
      expect(weekReducer(original, {
        type: 'EDIT_TASK',
        id: UUIDS[0],
        text,
      })).toBe(original)
    },
  )

  it('rejects an edit for an unknown task', () => {
    const original = state([task()])
    expect(weekReducer(original, {
      type: 'EDIT_TASK',
      id: UUIDS[1],
      text: 'Changed',
    })).toBe(original)
  })

  it.each([
    ['unknown source', [{ sourceId: UUIDS[5], newId: UUIDS[3] }]],
    ['duplicate source', [
      { sourceId: UUIDS[0], newId: UUIDS[3] },
      { sourceId: UUIDS[0], newId: UUIDS[4] },
    ]],
    ['duplicate new id', [
      { sourceId: UUIDS[0], newId: UUIDS[3] },
      { sourceId: UUIDS[1], newId: UUIDS[3] },
    ]],
    ['non-UUID new id', [{ sourceId: UUIDS[0], newId: 'predictable-id' }]],
  ] as const)('rejects the entire rollover for an %s', (_name, carryOvers) => {
    const original = state([
      task({ id: UUIDS[0] }),
      task({ id: UUIDS[1], dayIndex: 1 }),
    ])

    expect(weekReducer(original, {
      type: 'START_NEW_WEEK',
      carryOvers: [...carryOvers],
      newWeekStart: '2026-08-31',
    })).toBe(original)
  })

  it('rejects the entire rollover when a selected task is already completed', () => {
    const original = state([
      task({ id: UUIDS[0], completed: true }),
      task({ id: UUIDS[1], dayIndex: 1 }),
    ])

    expect(weekReducer(original, {
      type: 'START_NEW_WEEK',
      carryOvers: [{ sourceId: UUIDS[0], newId: UUIDS[3] }],
      newWeekStart: '2026-08-31',
    })).toBe(original)
  })

  it('carries valid incomplete tasks atomically and clears priority', () => {
    const original = state([
      task({ id: UUIDS[0], priority: true }),
      task({ id: UUIDS[1], dayIndex: 1 }),
    ])

    const next = weekReducer(original, {
      type: 'START_NEW_WEEK',
      carryOvers: [
        { sourceId: UUIDS[0], newId: UUIDS[3] },
        { sourceId: UUIDS[1], newId: UUIDS[4] },
      ],
      newWeekStart: '2026-08-31',
    })

    expect(next).not.toBe(original)
    expect(next.weekStart).toBe('2026-08-31')
    expect(next.tasks.map(candidate => candidate.id)).toEqual([UUIDS[3], UUIDS[4]])
    expect(next.tasks.every(candidate => !candidate.completed && !candidate.priority)).toBe(true)
  })

  it('advances from the stored week without reading the wall clock', () => {
    const original = state([task()])

    const next = weekReducer(original, {
      type: 'START_NEW_WEEK',
      carryOvers: [{ sourceId: UUIDS[0], newId: UUIDS[3] }],
    })

    expect(next.weekStart).toBe('2026-08-31')
  })

  it('rejects settings that shrink below current task usage', () => {
    const original = state([
      task({ id: UUIDS[0] }),
      task({ id: UUIDS[1] }),
      task({ id: UUIDS[2] }),
    ])

    expect(weekReducer(original, {
      type: 'UPDATE_SETTINGS',
      settings: { ...SETTINGS, maxPriority: 1, maxTasksPerDay: 2 },
    })).toBe(original)
  })

  it('rejects settings that shrink below current priority usage', () => {
    const original = state([
      task({ id: UUIDS[0], priority: true }),
      task({ id: UUIDS[1], priority: true }),
    ])

    expect(weekReducer(original, {
      type: 'UPDATE_SETTINGS',
      settings: { ...SETTINGS, maxPriority: 1 },
    })).toBe(original)
  })

  it('allows non-worsening settings changes on preserved over-capacity data', () => {
    const overCapacity = state([
      task({ id: UUIDS[0] }),
      task({ id: UUIDS[1] }),
      task({ id: UUIDS[2] }),
    ], { ...SETTINGS, maxPriority: 1, maxTasksPerDay: 2, homeView: 'day' })

    const changedView = weekReducer(overCapacity, {
      type: 'UPDATE_SETTINGS',
      settings: { ...overCapacity.settings, homeView: 'week' },
    })
    expect(changedView.settings.homeView).toBe('week')

    const resolved = weekReducer(overCapacity, {
      type: 'UPDATE_SETTINGS',
      settings: { ...overCapacity.settings, maxTasksPerDay: 3 },
    })
    expect(resolved.settings.maxTasksPerDay).toBe(3)

    expect(weekReducer(overCapacity, {
      type: 'UPDATE_SETTINGS',
      settings: { ...overCapacity.settings, maxTasksPerDay: 1 },
    })).toBe(overCapacity)
  })
})

describe('week-state parsers', () => {
  const validRuntimeState = state([
    task({ id: UUIDS[0], label: 'Work' }),
    task({ id: UUIDS[1], dayIndex: 1, label: 'Life' }),
  ])

  it('accepts a valid runtime state', () => {
    expect(parseRuntimeWeekState(validRuntimeState)).toEqual(validRuntimeState)
  })

  it.each([
    ['an impossible ISO date', { ...validRuntimeState, weekStart: '2026-02-30' }],
    ['a numeric string setting', { ...validRuntimeState, settings: { ...SETTINGS, weekLength: '7' } }],
    ['a non-boolean completed value', { ...validRuntimeState, tasks: [{ ...validRuntimeState.tasks[0], completed: 1 }] }],
    ['an unsupported label', { ...validRuntimeState, tasks: [{ ...validRuntimeState.tasks[0], label: 'Personal' }] }],
    ['a task beyond the configured week', {
      ...validRuntimeState,
      settings: { ...SETTINGS, weekLength: 5 },
      tasks: [{ ...validRuntimeState.tasks[0], dayIndex: 5 }],
    }],
    ['a non-UUID task id', { ...validRuntimeState, tasks: [{ ...validRuntimeState.tasks[0], id: 'legacy-id' }] }],
  ] as const)('rejects %s', (_name, candidate) => {
    expect(() => parseRuntimeWeekState(candidate)).toThrow()
  })

  it('migrates legacy state by defaulting settings and regenerating every id', () => {
    const migrated = parseLegacyWeekState({
      weekStart: '2026-08-24',
      tasks: [
        { id: 'legacy-one', text: 'First', completed: false, dayIndex: 0 },
        { id: 'legacy-two', text: 'Second', completed: true, dayIndex: 1 },
      ],
    }, sequentialIds(UUIDS[0], UUIDS[1]))

    expect(migrated.settings).toEqual(DEFAULT_SETTINGS)
    expect(migrated.settings).not.toBe(DEFAULT_SETTINGS)
    expect(migrated.tasks.map(candidate => candidate.id)).toEqual([UUIDS[0], UUIDS[1]])
  })

  it('preserves a P01-reachable task count above the new planning limit', () => {
    const migrated = parseLegacyWeekState({
      weekStart: '2026-08-24',
      tasks: Array.from({ length: 106 }, (_, index) => ({
        id: `legacy-${index}`,
        text: `Legacy ${index}`,
        completed: false,
        dayIndex: index % 7,
      })),
    }, generatedIds())

    expect(migrated.tasks).toHaveLength(106)
    expect(parseRuntimeWeekState(migrated).tasks).toHaveLength(106)
  })

  it('accepts legacy data exactly at both recovery bounds', () => {
    const migrated = parseLegacyWeekState({
      weekStart: '2026-08-24',
      tasks: Array.from({ length: MAX_RECOVERABLE_TOTAL_TASKS }, (_, index) => ({
        id: `legacy-${index}`,
        text: index === 0
          ? 'x'.repeat(MAX_RECOVERABLE_TASK_TEXT_LENGTH)
          : `Legacy ${index}`,
        completed: false,
        dayIndex: index % 7,
      })),
    }, generatedIds())

    expect(migrated.tasks).toHaveLength(MAX_RECOVERABLE_TOTAL_TASKS)
    expect(migrated.tasks[0]?.text).toHaveLength(MAX_RECOVERABLE_TASK_TEXT_LENGTH)
  })

  it('rejects legacy data beyond either recovery bound', () => {
    expect(() => parseLegacyWeekState({
      weekStart: '2026-08-24',
      tasks: [{
        id: 'legacy-long',
        text: 'x'.repeat(MAX_RECOVERABLE_TASK_TEXT_LENGTH + 1),
        completed: false,
        dayIndex: 0,
      }],
    }, generatedIds())).toThrow(`${MAX_RECOVERABLE_TASK_TEXT_LENGTH} characters`)

    expect(() => parseLegacyWeekState({
      weekStart: '2026-08-24',
      tasks: Array.from({ length: MAX_RECOVERABLE_TOTAL_TASKS + 1 }, (_, index) => ({
        id: `legacy-${index}`,
        text: `Legacy ${index}`,
        completed: false,
        dayIndex: index % 7,
      })),
    }, generatedIds())).toThrow(`${MAX_RECOVERABLE_TOTAL_TASKS} entries`)
  })

  it('preserves structurally valid legacy over-capacity data but blocks worsening it', () => {
    const migrated = parseLegacyWeekState({
      weekStart: '2026-08-24',
      tasks: UUIDS.map((id, index) => ({
        id,
        text: `Legacy ${index}`,
        completed: index === 0,
        dayIndex: 0,
      })),
      settings: { ...SETTINGS, maxTasksPerDay: 5 },
    }, sequentialIds(...UUIDS))

    expect(migrated.tasks).toHaveLength(6)
    expect(parseRuntimeWeekState(migrated).tasks).toHaveLength(6)
    expect(weekReducer(migrated, {
      type: 'ADD_TASK',
      id: '00000000-0000-4000-8000-000000000007',
      dayIndex: 0,
      text: 'Would worsen the violation',
    })).toBe(migrated)
  })

  it('rejects an ID factory that produces an invalid or duplicate UUID', () => {
    const portable = {
      weekStart: '2026-08-24',
      tasks: [
        { text: 'First', dayIndex: 0 },
        { text: 'Second', dayIndex: 1 },
      ],
    }

    expect(() => parseLegacyWeekState(portable, sequentialIds('not-a-uuid', UUIDS[1]))).toThrow()
    expect(() => parseLegacyWeekState(portable, sequentialIds(UUIDS[0], UUIDS[0]))).toThrow()
  })

  it('rejects portable data that exceeds configured task capacity', () => {
    const raw = {
      weekStart: '2026-08-24',
      settings: { ...SETTINGS, maxPriority: 1, maxTasksPerDay: 2 },
      tasks: [
        { text: 'One', dayIndex: 0 },
        { text: 'Two', dayIndex: 0 },
        { text: 'Three', dayIndex: 0 },
      ],
    }

    expect(() => parsePortableWeekState(
      raw,
      sequentialIds(UUIDS[0], UUIDS[1], UUIDS[2]),
    )).toThrow(/maxTasksPerDay|capacity/i)
  })

  it('rejects portable data that exceeds configured priority capacity', () => {
    const raw = {
      weekStart: '2026-08-24',
      settings: { ...SETTINGS, maxPriority: 1 },
      tasks: [
        { text: 'One', dayIndex: 0, priority: true },
        { text: 'Two', dayIndex: 0, priority: true },
      ],
    }

    expect(() => parsePortableWeekState(
      raw,
      sequentialIds(UUIDS[0], UUIDS[1]),
    )).toThrow(/priority/i)
  })

  it('strictly validates portable types, labels, and configured week bounds', () => {
    const base = {
      weekStart: '2026-08-24',
      settings: { ...SETTINGS, weekLength: 5 },
    }

    expect(() => parsePortableWeekState({
      ...base,
      tasks: [{ text: 'Wrong boolean', dayIndex: 0, completed: 'false' }],
    }, sequentialIds(UUIDS[0]))).toThrow(/boolean/i)

    expect(() => parsePortableWeekState({
      ...base,
      tasks: [{ text: 'Wrong label', dayIndex: 0, label: 'Personal' }],
    }, sequentialIds(UUIDS[0]))).toThrow(/label/i)

    expect(() => parsePortableWeekState({
      ...base,
      tasks: [{ text: 'Outside week', dayIndex: 5 }],
    }, sequentialIds(UUIDS[0]))).toThrow(/configured week/i)
  })
})
