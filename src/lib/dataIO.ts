import type { WeekState, Task, AppSettings, TaskLabel } from '../types'

const LABEL_OPTIONS: TaskLabel[] = ['Work', 'Life']

// ─── Export ──────────────────────────────────────────────────────────────────

export function downloadJsonFile(filename: string, payload: unknown): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportData(state: WeekState): void {
  downloadJsonFile(`7dayfocus-${state.weekStart}.json`, {
    // _meta documents the portable file format for people and compatible tooling.
    _meta: {
      app: '7DayFocus',
      version: '1',
      exported: new Date().toISOString().slice(0, 10),
      dayIndex: '0=Mon 1=Tue 2=Wed 3=Thu 4=Fri 5=Sat 6=Sun',
      fields: 'text (required), dayIndex (required 0-6), completed (bool), priority (bool), settings (optional object with maxPriority, maxTasksPerDay, weekStartDay, weekLength, homeView)',
    },
    weekStart: state.weekStart,
    tasks: state.tasks.map(({ id: _id, ...rest }) => rest), // id regenerated on import
    settings: state.settings,
  })
}

function validateSettings(raw: unknown): AppSettings {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('settings must be an object')
  }

  const settings = raw as Record<string, unknown>
  const maxPriority = Number(settings.maxPriority)
  const maxTasksPerDay = Number(settings.maxTasksPerDay)
  const weekStartDay = Number(settings.weekStartDay)
  const weekLength = Number(settings.weekLength)
  const homeView = String(settings.homeView) === 'week' ? 'week' : 'day'

  if (!Number.isInteger(maxPriority) || maxPriority < 1 || maxPriority > 5) {
    throw new Error('settings.maxPriority must be an integer between 1 and 5')
  }
  if (!Number.isInteger(maxTasksPerDay) || maxTasksPerDay < 1 || maxTasksPerDay > 15) {
    throw new Error('settings.maxTasksPerDay must be an integer between 1 and 15')
  }
  if (!Number.isInteger(weekStartDay) || weekStartDay < 0 || weekStartDay > 6) {
    throw new Error('settings.weekStartDay must be an integer between 0 and 6')
  }
  if (!Number.isInteger(weekLength) || weekLength < 1 || weekLength > 7) {
    throw new Error('settings.weekLength must be an integer between 1 and 7')
  }
  if (homeView !== 'day' && homeView !== 'week') {
    throw new Error('settings.homeView must be "day" or "week"')
  }

  return {
    maxPriority,
    maxTasksPerDay,
    weekStartDay,
    weekLength,
    homeView,
  }
}

// ─── Import ──────────────────────────────────────────────────────────────────

export function parseImport(raw: unknown): WeekState {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Invalid JSON structure')
  }
  const data = raw as Record<string, unknown>

  if (typeof data.weekStart !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.weekStart)) {
    throw new Error('weekStart must be a YYYY-MM-DD string (e.g. "2026-04-14")')
  }
  if (!Array.isArray(data.tasks)) {
    throw new Error('tasks must be an array')
  }

  const tasks: Task[] = (data.tasks as unknown[]).map((t, i) => {
    if (typeof t !== 'object' || t === null) throw new Error(`Task ${i}: must be an object`)
    const task = t as Record<string, unknown>
    if (typeof task.text !== 'string' || !task.text.trim()) {
      throw new Error(`Task ${i}: text is required and must be a non-empty string`)
    }
    const dayIndex = Number(task.dayIndex)
    if (!Number.isInteger(dayIndex) || dayIndex < 0 || dayIndex > 6) {
      throw new Error(`Task ${i}: dayIndex must be 0–6 (0=Mon … 6=Sun)`)
    }
    const label = typeof task.label === 'string' && LABEL_OPTIONS.includes(task.label as TaskLabel)
      ? (task.label as TaskLabel)
      : undefined

    return {
      id: crypto.randomUUID(),
      text: task.text.trim(),
      completed: task.completed === true,
      dayIndex,
      priority: task.priority === true,
      label,
    }
  })

  const settings: AppSettings = data.settings ? validateSettings(data.settings) : { maxPriority: 2, maxTasksPerDay: 5, weekStartDay: 1, weekLength: 7, homeView: 'day' }

  return {
    weekStart: data.weekStart as string,
    tasks,
    settings,
  }
}

export function readJsonFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      try { resolve(JSON.parse(e.target!.result as string)) }
      catch { reject(new Error('File is not valid JSON')) }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
