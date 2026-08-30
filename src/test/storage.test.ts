import { describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_SETTINGS,
  MAX_RECOVERABLE_TASK_TEXT_LENGTH,
  MAX_RECOVERABLE_TOTAL_TASKS,
  type IdFactory,
} from '../domain/weekState'
import {
  LEGACY_STORAGE_KEY,
  STORAGE_KEY,
  STORAGE_SCHEMA_VERSION,
  getBrowserStorage,
  loadWeekState,
  persistWeekState,
  type StorageAdapter,
  type StorageHost,
} from '../lib/storage'
import type { WeekState } from '../types'

const UUIDS = [
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000003',
] as const

function validState(): WeekState {
  return {
    weekStart: '2026-08-24',
    tasks: [{
      id: UUIDS[0],
      text: 'Review plan',
      completed: false,
      dayIndex: 0,
      priority: true,
      label: 'Work',
    }],
    settings: { ...DEFAULT_SETTINGS },
  }
}

function generatedIds(): IdFactory {
  let value = 0
  return () => {
    value += 1
    return `00000000-0000-4000-8000-${value.toString(16).padStart(12, '0')}`
  }
}

function memoryStorage(initial: Record<string, string> = {}): {
  adapter: StorageAdapter
  values: Map<string, string>
  getItem: ReturnType<typeof vi.fn>
  setItem: ReturnType<typeof vi.fn>
  removeItem: ReturnType<typeof vi.fn>
} {
  const values = new Map(Object.entries(initial))
  const getItem = vi.fn((key: string) => values.get(key) ?? null)
  const setItem = vi.fn((key: string, value: string) => { values.set(key, value) })
  const removeItem = vi.fn((key: string) => { values.delete(key) })

  return {
    adapter: { getItem, setItem, removeItem },
    values,
    getItem,
    setItem,
    removeItem,
  }
}

describe('loadWeekState', () => {
  it('turns a throwing localStorage property getter into a visible load issue', () => {
    const host = Object.defineProperty({}, 'localStorage', {
      get: () => { throw new Error('SecurityError') },
    }) as StorageHost
    const storage = getBrowserStorage(host)

    expect(loadWeekState(storage)).toMatchObject({
      source: 'error',
      state: null,
      needsPersistence: false,
    })
  })

  it('can reacquire browser storage when a later retry becomes available', () => {
    const memory = memoryStorage()
    let blocked = true
    const host = Object.defineProperty({}, 'localStorage', {
      get: () => {
        if (blocked) throw new Error('SecurityError')
        return memory.adapter
      },
    }) as StorageHost
    const storage = getBrowserStorage(host)

    expect(loadWeekState(storage).source).toBe('error')
    blocked = false
    expect(persistWeekState(storage, validState())).toBeNull()
    expect(memory.values.has(STORAGE_KEY)).toBe(true)
  })

  it('loads a current versioned envelope without migration', () => {
    const expected = validState()
    const storage = memoryStorage({
      [STORAGE_KEY]: JSON.stringify({ version: STORAGE_SCHEMA_VERSION, state: expected }),
    })

    expect(loadWeekState(storage.adapter)).toEqual({
      state: expected,
      source: 'current',
      issue: null,
      needsPersistence: false,
    })
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  it('migrates a version-one envelope and regenerates task ids', () => {
    const legacy = {
      weekStart: '2026-08-24',
      tasks: [{ id: 'legacy-id', text: 'Legacy', completed: false, dayIndex: 0 }],
      settings: { ...DEFAULT_SETTINGS },
    }
    const storage = memoryStorage({
      [STORAGE_KEY]: JSON.stringify({ version: 1, state: legacy }),
    })

    const result = loadWeekState(storage.adapter, () => UUIDS[1])

    expect(result.source).toBe('current')
    expect(result.needsPersistence).toBe(true)
    expect(result.issue).toBeNull()
    expect(result.state?.tasks[0]?.id).toBe(UUIDS[1])
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  it('migrates the legacy key only when the current key is absent', () => {
    const storage = memoryStorage({
      [LEGACY_STORAGE_KEY]: JSON.stringify({
        weekStart: '2026-08-24',
        tasks: [{ id: 'old-id', text: 'Legacy', dayIndex: 0, completed: true }],
      }),
    })

    const result = loadWeekState(storage.adapter, () => UUIDS[2])

    expect(storage.getItem).toHaveBeenNthCalledWith(1, STORAGE_KEY)
    expect(storage.getItem).toHaveBeenNthCalledWith(2, LEGACY_STORAGE_KEY)
    expect(result).toMatchObject({ source: 'legacy', issue: null, needsPersistence: true })
    expect(result.state?.tasks[0]?.id).toBe(UUIDS[2])
    expect(result.state?.settings).toEqual(DEFAULT_SETTINGS)
  })

  it('loads legacy-key data exactly at the documented recovery bounds', () => {
    const storage = memoryStorage({
      [LEGACY_STORAGE_KEY]: JSON.stringify({
        weekStart: '2026-08-24',
        tasks: Array.from({ length: MAX_RECOVERABLE_TOTAL_TASKS }, (_, index) => ({
          id: `legacy-${index}`,
          text: index === 0
            ? 'x'.repeat(MAX_RECOVERABLE_TASK_TEXT_LENGTH)
            : `Legacy ${index}`,
          completed: false,
          dayIndex: index % 7,
        })),
      }),
    })

    const result = loadWeekState(storage.adapter, generatedIds())

    expect(result).toMatchObject({ source: 'legacy', issue: null, needsPersistence: true })
    expect(result.state?.tasks).toHaveLength(MAX_RECOVERABLE_TOTAL_TASKS)
    expect(result.state?.tasks[0]?.text).toHaveLength(MAX_RECOVERABLE_TASK_TEXT_LENGTH)
  })

  it('preserves legacy-key data that exceeds a documented recovery bound', () => {
    const raw = JSON.stringify({
      weekStart: '2026-08-24',
      tasks: [{
        id: 'legacy-long',
        text: 'x'.repeat(MAX_RECOVERABLE_TASK_TEXT_LENGTH + 1),
        completed: false,
        dayIndex: 0,
      }],
    })
    const storage = memoryStorage({ [LEGACY_STORAGE_KEY]: raw })

    const result = loadWeekState(storage.adapter, generatedIds())

    expect(result).toMatchObject({ source: 'error', state: null, needsPersistence: false })
    expect(result.issue).toContain(`${MAX_RECOVERABLE_TASK_TEXT_LENGTH} characters`)
    expect(storage.values.get(LEGACY_STORAGE_KEY)).toBe(raw)
    expect(storage.setItem).not.toHaveBeenCalled()
    expect(storage.removeItem).not.toHaveBeenCalled()
  })

  it('rejects an unsupported schema version without changing storage', () => {
    const raw = JSON.stringify({ version: 999, state: validState() })
    const storage = memoryStorage({ [STORAGE_KEY]: raw })

    const result = loadWeekState(storage.adapter)

    expect(result).toMatchObject({ source: 'error', state: null, needsPersistence: false })
    expect(result.issue).toMatch(/unsupported schema version/i)
    expect(storage.values.get(STORAGE_KEY)).toBe(raw)
    expect(storage.setItem).not.toHaveBeenCalled()
    expect(storage.removeItem).not.toHaveBeenCalled()
  })

  it('leaves a schema-invalid current payload untouched', () => {
    const raw = JSON.stringify({
      version: STORAGE_SCHEMA_VERSION,
      state: {
        ...validState(),
        tasks: [{ ...validState().tasks[0], completed: 'false' }],
      },
    })
    const storage = memoryStorage({ [STORAGE_KEY]: raw })

    const result = loadWeekState(storage.adapter)

    expect(result).toMatchObject({ source: 'error', state: null, needsPersistence: false })
    expect(storage.values.get(STORAGE_KEY)).toBe(raw)
    expect(storage.setItem).not.toHaveBeenCalled()
    expect(storage.removeItem).not.toHaveBeenCalled()
  })

  it('leaves corrupt current data untouched and does not fall back to legacy data', () => {
    const corrupt = '{ definitely not json'
    const storage = memoryStorage({
      [STORAGE_KEY]: corrupt,
      [LEGACY_STORAGE_KEY]: JSON.stringify({
        weekStart: '2026-08-24',
        tasks: [],
      }),
    })

    const result = loadWeekState(storage.adapter)

    expect(result).toMatchObject({ source: 'error', state: null, needsPersistence: false })
    expect(result.issue).toMatch(/not valid JSON/i)
    expect(storage.getItem).toHaveBeenCalledTimes(1)
    expect(storage.values.get(STORAGE_KEY)).toBe(corrupt)
    expect(storage.setItem).not.toHaveBeenCalled()
    expect(storage.removeItem).not.toHaveBeenCalled()
  })

  it('reports a storage read failure without attempting a write', () => {
    const setItem = vi.fn()
    const storage: StorageAdapter = {
      getItem: vi.fn(() => { throw new Error('denied') }),
      setItem,
      removeItem: vi.fn(),
    }

    const result = loadWeekState(storage)

    expect(result).toMatchObject({ source: 'error', state: null, needsPersistence: false })
    expect(result.issue).toMatch(/could not be read/i)
    expect(setItem).not.toHaveBeenCalled()
  })
})

describe('persistWeekState', () => {
  it('writes a validated version-two envelope', () => {
    const expected = validState()
    const storage = memoryStorage()

    expect(persistWeekState(storage.adapter, expected)).toBeNull()

    const stored = storage.values.get(STORAGE_KEY)
    expect(stored).toBeDefined()
    expect(JSON.parse(stored ?? '')).toEqual({
      version: STORAGE_SCHEMA_VERSION,
      state: expected,
    })
  })

  it('does not write an invalid runtime state', () => {
    const storage = memoryStorage()
    const invalid = {
      ...validState(),
      tasks: [{ ...validState().tasks[0], id: 'not-a-uuid' }],
    }

    expect(persistWeekState(storage.adapter, invalid)).toMatch(/could not be saved/i)
    expect(storage.setItem).not.toHaveBeenCalled()
    expect(storage.values.has(STORAGE_KEY)).toBe(false)
  })

  it('returns a visible issue when the storage write fails', () => {
    const storage: StorageAdapter = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(() => { throw new Error('quota exceeded') }),
      removeItem: vi.fn(),
    }

    expect(persistWeekState(storage, validState())).toMatch(/in memory.*could not be saved/i)
  })
})
