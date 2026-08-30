import { describe, it, expect } from 'vitest'
import {
  MAX_IMPORT_FILE_BYTES,
  createExportPayload,
  parseImport,
  readJsonFile,
} from '../lib/dataIO'
import {
  MAX_RECOVERABLE_TASK_TEXT_LENGTH,
  MAX_RECOVERABLE_TOTAL_TASKS,
} from '../domain/weekState'

const validSettings = {
  maxPriority: 2,
  maxTasksPerDay: 5,
  weekStartDay: 1,
  weekLength: 7,
  homeView: 'day' as const,
}

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

  it('regenerates imported IDs instead of trusting portable-file IDs', () => {
    const state = parseImport({
      weekStart: '2026-04-14',
      tasks: [{ id: 'untrusted-id', text: 'Portable task', dayIndex: 0 }],
      settings: validSettings,
    })

    expect(state.tasks[0]?.id).not.toBe('untrusted-id')
    expect(state.tasks[0]?.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  })

  it('accepts the current portable format version', () => {
    expect(parseImport({
      _meta: { app: '7DayFocus', version: '2' },
      weekStart: '2026-04-14',
      tasks: [],
      settings: validSettings,
    }).tasks).toEqual([])
  })

  it.each([
    ['a future version', { version: '3' }],
    ['a numeric version', { version: 1 }],
    ['no version', { app: '7DayFocus' }],
  ])('rejects _meta with %s', (_description, meta) => {
    expect(() => parseImport({
      _meta: meta,
      weekStart: '2026-04-14',
      tasks: [],
      settings: validSettings,
    })).toThrow('Unsupported portable file version')
  })

  it.each([
    ['numeric strings', { ...validSettings, maxPriority: '2' }],
    ['invalid homeView', { ...validSettings, homeView: 'agenda' }],
    ['priority above daily capacity', { ...validSettings, maxPriority: 5, maxTasksPerDay: 2 }],
  ])('rejects settings with %s', (_description, settings) => {
    expect(() => parseImport({
      _meta: { version: '2' },
      weekStart: '2026-04-14',
      tasks: [],
      settings,
    })).toThrow()
  })

  it.each([
    ['an impossible date', { weekStart: '2026-02-30', tasks: [], settings: validSettings }],
    ['a numeric-string day index', { weekStart: '2026-04-14', tasks: [{ text: 'Task', dayIndex: '0' }], settings: validSettings }],
    ['a non-boolean completed value', { weekStart: '2026-04-14', tasks: [{ text: 'Task', dayIndex: 0, completed: 'false' }], settings: validSettings }],
    ['an unknown label', { weekStart: '2026-04-14', tasks: [{ text: 'Task', dayIndex: 0, label: 'Personal' }], settings: validSettings }],
    ['overlong task text', { weekStart: '2026-04-14', tasks: [{ text: 'x'.repeat(201), dayIndex: 0 }], settings: validSettings }],
    ['a task outside the configured period', { weekStart: '2026-04-14', tasks: [{ text: 'Task', dayIndex: 5 }], settings: { ...validSettings, weekLength: 5 } }],
  ])('rejects portable data with %s', (_description, raw) => {
    expect(() => parseImport({ ...raw, _meta: { version: '2' } })).toThrow()
  })

  it('rejects imports that exceed configured task capacity', () => {
    const tasks = Array.from({ length: 6 }, (_, index) => ({ text: `Task ${index}`, dayIndex: 0 }))
    expect(() => parseImport({
      _meta: { version: '2' },
      weekStart: '2026-04-14',
      tasks,
      settings: validSettings,
    }))
      .toThrow(/task count exceeds/i)
  })

  it('migrates a version-one portable file without discarding reachable P01 data', () => {
    const state = parseImport({
      _meta: { version: '1' },
      weekStart: '2026-04-14',
      tasks: [{ text: 'x'.repeat(201), dayIndex: 6 }],
      settings: {
        ...validSettings,
        maxPriority: 5,
        maxTasksPerDay: 2,
        weekLength: 5,
      },
    })

    expect(state.tasks[0]?.text).toHaveLength(201)
    expect(state.settings.maxTasksPerDay).toBe(5)
    expect(state.settings.weekLength).toBe(7)
  })

  it('enforces the documented recovery bounds for portable version one', () => {
    const atTextBound = parseImport({
      _meta: { version: '1' },
      weekStart: '2026-04-14',
      tasks: [{ text: 'x'.repeat(MAX_RECOVERABLE_TASK_TEXT_LENGTH), dayIndex: 0 }],
      settings: validSettings,
    })
    expect(atTextBound.tasks[0]?.text).toHaveLength(MAX_RECOVERABLE_TASK_TEXT_LENGTH)

    expect(() => parseImport({
      _meta: { version: '1' },
      weekStart: '2026-04-14',
      tasks: [{ text: 'x'.repeat(MAX_RECOVERABLE_TASK_TEXT_LENGTH + 1), dayIndex: 0 }],
      settings: validSettings,
    })).toThrow(`${MAX_RECOVERABLE_TASK_TEXT_LENGTH} characters`)

    expect(() => parseImport({
      _meta: { version: '1' },
      weekStart: '2026-04-14',
      tasks: Array.from({ length: MAX_RECOVERABLE_TOTAL_TASKS + 1 }, (_, index) => ({
        text: `Legacy ${index}`,
        dayIndex: index % 7,
      })),
      settings: validSettings,
    })).toThrow(`${MAX_RECOVERABLE_TOTAL_TASKS} entries`)
  })

  it('rejects files larger than 8 MiB before parsing', async () => {
    const oversized = new File(['x'.repeat(MAX_IMPORT_FILE_BYTES + 1)], 'oversized.json', {
      type: 'application/json',
    })

    await expect(readJsonFile(oversized)).rejects.toThrow('8 MiB or smaller')
  })

  it('reports malformed JSON files', async () => {
    const malformed = new File(['{not-json'], 'malformed.json', { type: 'application/json' })
    await expect(readJsonFile(malformed)).rejects.toThrow('File is not valid JSON')
  })

  it('exports strict state as version two', () => {
    const strictState = parseImport({
      _meta: { version: '2' },
      weekStart: '2026-04-14',
      tasks: [{ text: 'Strict task', dayIndex: 0 }],
      settings: validSettings,
    })

    expect(createExportPayload(strictState)).toMatchObject({
      _meta: { version: '2' },
    })
  })

  it('round-trips migrated recovery data through portable version one', () => {
    const migrated = parseImport({
      _meta: { version: '1' },
      weekStart: '2026-04-14',
      tasks: [{ text: 'x'.repeat(201), dayIndex: 0 }],
      settings: validSettings,
    })
    const exported = createExportPayload(migrated)

    expect(exported).toMatchObject({ _meta: { version: '1' } })
    expect(parseImport(exported).tasks[0]?.text).toHaveLength(201)
  })
})
