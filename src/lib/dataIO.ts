import {
  createTaskId,
  isStrictPortableWeekState,
  parseLegacyWeekState,
  parsePortableWeekState,
} from '../domain/weekState'
import type { WeekState } from '../types'

export const MAX_IMPORT_FILE_BYTES = 8 * 1024 * 1024

// ─── Export ──────────────────────────────────────────────────────────────────

export function downloadJsonFile(filename: string, payload: unknown): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  try {
    a.click()
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function createExportPayload(state: WeekState): Record<string, unknown> {
  return {
    // _meta documents the portable file format for people and compatible tooling.
    _meta: {
      app: '7DayFocus',
      version: isStrictPortableWeekState(state) ? '2' : '1',
      exported: new Date().toISOString().slice(0, 10),
      dayIndex: 'Offset from weekStart: 0=weekStart, 1=the following day, up to weekLength-1',
      fields: 'text (required), dayIndex (required integer within weekLength), completed (required bool), priority (bool), label (optional "Work" or "Life"), settings (optional object with maxPriority, maxTasksPerDay, weekStartDay, weekLength, homeView)',
    },
    weekStart: state.weekStart,
    tasks: state.tasks.map(({ id: _id, ...rest }) => rest), // id regenerated on import
    settings: state.settings,
  }
}

export function exportData(state: WeekState): void {
  downloadJsonFile(`7dayfocus-${state.weekStart}.json`, createExportPayload(state))
}

// ─── Import ──────────────────────────────────────────────────────────────────

export function parseImport(raw: unknown): WeekState {
  let hasMeta = false
  let version: unknown
  if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
    const meta = (raw as Record<string, unknown>)._meta
    if (meta !== undefined) {
      hasMeta = true
      if (typeof meta !== 'object' || meta === null || Array.isArray(meta)) {
        throw new Error('_meta must be an object when provided')
      }
      version = (meta as Record<string, unknown>).version
    }
  }

  if (!hasMeta || version === '1') {
    return parseLegacyWeekState(raw, createTaskId)
  }
  if (version === '2') {
    return parsePortableWeekState(raw, createTaskId)
  }
  throw new Error('Unsupported portable file version')
}

export function readJsonFile(file: File): Promise<unknown> {
  if (file.size > MAX_IMPORT_FILE_BYTES) {
    return Promise.reject(new Error('File must be 8 MiB or smaller'))
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      try { resolve(JSON.parse(e.target!.result as string)) }
      catch { reject(new Error('File is not valid JSON')) }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.onabort = () => reject(new Error('File read was cancelled'))
    reader.readAsText(file)
  })
}
