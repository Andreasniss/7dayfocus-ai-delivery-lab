import {
  createTaskId,
  parseLegacyWeekState,
  parseRuntimeWeekState,
  type IdFactory,
} from '../domain/weekState'
import type { WeekState } from '../types'

export const STORAGE_KEY = '7dayfocus-state'
export const LEGACY_STORAGE_KEY = '7dayfocus-v1'
export const STORAGE_SCHEMA_VERSION = 2

export interface StorageAdapter {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

export interface StorageHost {
  readonly localStorage: StorageAdapter
}

export interface LoadResult {
  state: WeekState | null
  source: 'current' | 'legacy' | 'empty' | 'error'
  issue: string | null
  needsPersistence: boolean
}

type StorageEnvelope = {
  version: number
  state: unknown
}

/** Defers browser-storage acquisition so a later retry can recover from a temporary policy failure. */
export function getBrowserStorage(host?: StorageHost): StorageAdapter {
  const resolve = () => (host ?? window).localStorage
  return {
    getItem: key => resolve().getItem(key),
    setItem: (key, value) => resolve().setItem(key, value),
    removeItem: key => resolve().removeItem(key),
  }
}

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown
  } catch {
    throw new Error('Saved planner data is not valid JSON.')
  }
}

function parseEnvelope(raw: string, createId: IdFactory): { state: WeekState; migrated: boolean } {
  const decoded = parseJson(raw)
  if (typeof decoded !== 'object' || decoded === null || Array.isArray(decoded)) {
    throw new Error('Saved planner data does not use a supported schema.')
  }

  const envelope = decoded as Partial<StorageEnvelope>
  if (envelope.version === STORAGE_SCHEMA_VERSION) {
    return { state: parseRuntimeWeekState(envelope.state), migrated: false }
  }
  if (envelope.version === 1) {
    return { state: parseLegacyWeekState(envelope.state, createId), migrated: true }
  }

  throw new Error('Saved planner data uses an unsupported schema version.')
}

export function loadWeekState(
  storage: StorageAdapter,
  createId: IdFactory = createTaskId,
): LoadResult {
  let currentRaw: string | null
  try {
    currentRaw = storage.getItem(STORAGE_KEY)
  } catch {
    return {
      state: null,
      source: 'error',
      issue: 'Local planner data could not be read. The stored value was left unchanged.',
      needsPersistence: false,
    }
  }

  if (currentRaw !== null) {
    try {
      const result = parseEnvelope(currentRaw, createId)
      return {
        state: result.state,
        source: 'current',
        issue: null,
        needsPersistence: result.migrated,
      }
    } catch (error) {
      return {
        state: null,
        source: 'error',
        issue: `${(error as Error).message} The stored value was left unchanged.`,
        needsPersistence: false,
      }
    }
  }

  let legacyRaw: string | null
  try {
    legacyRaw = storage.getItem(LEGACY_STORAGE_KEY)
  } catch {
    return {
      state: null,
      source: 'error',
      issue: 'Legacy planner data could not be read. The stored value was left unchanged.',
      needsPersistence: false,
    }
  }

  if (legacyRaw === null) {
    return { state: null, source: 'empty', issue: null, needsPersistence: false }
  }

  try {
    return {
      state: parseLegacyWeekState(parseJson(legacyRaw), createId),
      source: 'legacy',
      issue: null,
      needsPersistence: true,
    }
  } catch (error) {
    return {
      state: null,
      source: 'error',
      issue: `${(error as Error).message} Legacy data was left unchanged.`,
      needsPersistence: false,
    }
  }
}

export function persistWeekState(storage: StorageAdapter, state: WeekState): string | null {
  try {
    const validated = parseRuntimeWeekState(state)
    storage.setItem(STORAGE_KEY, JSON.stringify({
      version: STORAGE_SCHEMA_VERSION,
      state: validated,
    }))
    return null
  } catch {
    return 'Changes are in memory but could not be saved to local browser storage.'
  }
}

export function removeLegacyState(storage: StorageAdapter): void {
  try {
    storage.removeItem(LEGACY_STORAGE_KEY)
  } catch {
    // The current version has already been written; a stale legacy copy is harmless.
  }
}
