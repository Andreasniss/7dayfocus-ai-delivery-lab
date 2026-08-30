import type {
  Action,
  AppSettings,
  DomainAction,
  Task,
  TaskLabel,
  WeekState,
} from '../types'
import { getNextWeekStart, getWeekStart } from '../utils/dates'

export const DEFAULT_SETTINGS: AppSettings = {
  maxPriority: 2,
  maxTasksPerDay: 5,
  weekStartDay: 1,
  weekLength: 7,
  homeView: 'day',
}

export const MAX_TASK_TEXT_LENGTH = 200
export const MAX_TOTAL_TASKS = 105
export const MAX_RECOVERABLE_TASK_TEXT_LENGTH = 1_000
export const MAX_RECOVERABLE_TOTAL_TASKS = 1_000

const LABEL_OPTIONS: readonly TaskLabel[] = ['Work', 'Life']
const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type RecordValue = Record<string, unknown>
export type IdFactory = () => string

function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

  const [year, month, day] = value.split('-').map(Number)
  if (!year || year < 1000 || !month || !day) return false

  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
}

export function isUuidV4(value: unknown): value is string {
  return typeof value === 'string' && UUID_V4_PATTERN.test(value)
}

function readInteger(
  settings: RecordValue,
  key: keyof Pick<AppSettings, 'maxPriority' | 'maxTasksPerDay' | 'weekStartDay' | 'weekLength'>,
  minimum: number,
  maximum: number,
  fallback?: number,
): number {
  const value = settings[key]
  if (value === undefined && fallback !== undefined) return fallback
  if (typeof value !== 'number' || !Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(`settings.${key} must be an integer between ${minimum} and ${maximum}`)
  }
  return value
}

export function parseAppSettings(raw: unknown, allowMissing = false): AppSettings {
  if (!isRecord(raw)) throw new Error('settings must be an object')

  const maxPriority = readInteger(raw, 'maxPriority', 1, 5, allowMissing ? DEFAULT_SETTINGS.maxPriority : undefined)
  const maxTasksPerDay = readInteger(raw, 'maxTasksPerDay', 1, 15, allowMissing ? DEFAULT_SETTINGS.maxTasksPerDay : undefined)
  const weekStartDay = readInteger(raw, 'weekStartDay', 0, 6, allowMissing ? DEFAULT_SETTINGS.weekStartDay : undefined)
  const weekLength = readInteger(raw, 'weekLength', 1, 7, allowMissing ? DEFAULT_SETTINGS.weekLength : undefined)
  const homeViewValue = raw.homeView
  const homeView = homeViewValue === undefined && allowMissing
    ? DEFAULT_SETTINGS.homeView
    : homeViewValue

  if (homeView !== 'day' && homeView !== 'week') {
    throw new Error('settings.homeView must be "day" or "week"')
  }
  if (maxPriority > maxTasksPerDay) {
    throw new Error('settings.maxPriority cannot exceed settings.maxTasksPerDay')
  }

  return { maxPriority, maxTasksPerDay, weekStartDay, weekLength, homeView }
}

function parseLegacyAppSettings(raw: unknown, tasks: unknown[]): AppSettings {
  const value = raw === undefined ? {} : raw
  if (!isRecord(value)) throw new Error('settings must be an object')

  const maxPriority = readInteger(value, 'maxPriority', 1, 5, DEFAULT_SETTINGS.maxPriority)
  const requestedMaxTasks = readInteger(value, 'maxTasksPerDay', 1, 15, DEFAULT_SETTINGS.maxTasksPerDay)
  const weekStartDay = readInteger(value, 'weekStartDay', 0, 6, DEFAULT_SETTINGS.weekStartDay)
  const requestedWeekLength = readInteger(value, 'weekLength', 1, 7, DEFAULT_SETTINGS.weekLength)
  const homeViewValue = value.homeView ?? DEFAULT_SETTINGS.homeView
  if (homeViewValue !== 'day' && homeViewValue !== 'week') {
    throw new Error('settings.homeView must be "day" or "week"')
  }

  const highestDayIndex = tasks.reduce<number>((highest, task) => {
    if (!isRecord(task)) return highest
    const dayIndex = task.dayIndex
    return typeof dayIndex === 'number' && Number.isInteger(dayIndex) && dayIndex >= 0 && dayIndex <= 6
      ? Math.max(highest, dayIndex)
      : highest
  }, -1)

  return {
    maxPriority,
    maxTasksPerDay: Math.max(requestedMaxTasks, maxPriority),
    weekStartDay,
    weekLength: Math.max(requestedWeekLength, highestDayIndex + 1),
    homeView: homeViewValue,
  }
}

function parseTask(
  raw: unknown,
  index: number,
  settings: AppSettings,
  options: {
    createId?: IdFactory
    idMode: 'preserve' | 'replace'
    maxTextLength: number
    requireCompleted: boolean
  },
): Task {
  if (!isRecord(raw)) throw new Error(`Task ${index}: must be an object`)

  if (typeof raw.text !== 'string' || !raw.text.trim()) {
    throw new Error(`Task ${index}: text is required and must be a non-empty string`)
  }
  if (raw.text.trim().length > options.maxTextLength) {
    throw new Error(`Task ${index}: text must not exceed ${options.maxTextLength} characters`)
  }

  const dayIndex = raw.dayIndex
  if (typeof dayIndex !== 'number' || !Number.isInteger(dayIndex) || dayIndex < 0 || dayIndex >= settings.weekLength) {
    throw new Error(`Task ${index}: dayIndex must be within the configured week`)
  }

  if (options.requireCompleted && typeof raw.completed !== 'boolean') {
    throw new Error(`Task ${index}: completed must be a boolean`)
  }
  if (raw.completed !== undefined && typeof raw.completed !== 'boolean') {
    throw new Error(`Task ${index}: completed must be a boolean`)
  }
  if (raw.priority !== undefined && typeof raw.priority !== 'boolean') {
    throw new Error(`Task ${index}: priority must be a boolean`)
  }
  if (raw.label !== undefined && !LABEL_OPTIONS.includes(raw.label as TaskLabel)) {
    throw new Error(`Task ${index}: label must be "Work" or "Life"`)
  }

  let id: string
  if (options.idMode === 'replace') {
    if (!options.createId) throw new Error('An ID factory is required when IDs are replaced')
    id = options.createId()
  } else {
    if (!isUuidV4(raw.id)) {
      throw new Error(`Task ${index}: id must be a valid UUID v4`)
    }
    id = raw.id
  }

  if (!isUuidV4(id)) {
    throw new Error(`Task ${index}: generated id must be a valid UUID v4`)
  }

  return {
    id,
    text: raw.text.trim(),
    completed: raw.completed === true,
    dayIndex,
    priority: raw.priority === true,
    label: raw.label as TaskLabel | undefined,
  }
}

function parseWeekState(
  raw: unknown,
  options: {
    allowMissingSettings: boolean
    enforceCapacity: boolean
    idMode: 'preserve' | 'replace'
    createId?: IdFactory
    legacySettings: boolean
    maxTaskCount: number
    maxTextLength: number
    requireCompleted: boolean
  },
): WeekState {
  if (!isRecord(raw)) throw new Error('Planner state must be an object')
  if (!isIsoDate(raw.weekStart)) throw new Error('weekStart must be a valid YYYY-MM-DD date')
  if (!Array.isArray(raw.tasks)) throw new Error('tasks must be an array')
  if (raw.tasks.length > options.maxTaskCount) {
    throw new Error(`tasks must not contain more than ${options.maxTaskCount} entries`)
  }

  const settings = options.legacySettings
    ? parseLegacyAppSettings(raw.settings, raw.tasks)
    : raw.settings === undefined && options.allowMissingSettings
      ? { ...DEFAULT_SETTINGS }
      : parseAppSettings(raw.settings, options.allowMissingSettings)
  const tasks = raw.tasks.map((task, index) => parseTask(
    task,
    index,
    settings,
    options,
  ))

  const uniqueIds = new Set(tasks.map(task => task.id))
  if (uniqueIds.size !== tasks.length) throw new Error('Task IDs must be unique')

  if (options.enforceCapacity) assertCapacity(tasks, settings)

  return { weekStart: raw.weekStart, tasks, settings }
}

function assertCapacity(tasks: Task[], settings: AppSettings): void {
  for (let dayIndex = 0; dayIndex < settings.weekLength; dayIndex += 1) {
    const dayTasks = tasks.filter(task => task.dayIndex === dayIndex)
    if (dayTasks.length > settings.maxTasksPerDay) {
      throw new Error(`Day ${dayIndex}: task count exceeds settings.maxTasksPerDay`)
    }
    if (dayTasks.filter(task => task.priority).length > settings.maxPriority) {
      throw new Error(`Day ${dayIndex}: priority count exceeds settings.maxPriority`)
    }
  }
}

function respectsCapacity(tasks: Task[], settings: AppSettings): boolean {
  try {
    assertCapacity(tasks, settings)
    return true
  } catch {
    return false
  }
}

export type CarryOverCapacityIssue =
  | { kind: 'total'; limit: number }
  | { kind: 'day'; dayIndex: number; limit: number }

/** Shared preflight for rollover selections; carried tasks retain their day indexes. */
export function getCarryOverCapacityIssue(
  tasks: readonly Task[],
  settings: Pick<AppSettings, 'maxTasksPerDay' | 'weekLength'>,
): CarryOverCapacityIssue | null {
  if (tasks.length > MAX_TOTAL_TASKS) {
    return { kind: 'total', limit: MAX_TOTAL_TASKS }
  }

  for (let dayIndex = 0; dayIndex < settings.weekLength; dayIndex += 1) {
    if (tasks.filter(task => task.dayIndex === dayIndex).length > settings.maxTasksPerDay) {
      return { kind: 'day', dayIndex, limit: settings.maxTasksPerDay }
    }
  }

  return null
}

export function isStrictPortableWeekState(state: WeekState): boolean {
  try {
    const validated = parseRuntimeWeekState(state)
    return validated.tasks.length <= MAX_TOTAL_TASKS
      && validated.tasks.every(task => task.text.length <= MAX_TASK_TEXT_LENGTH)
      && respectsCapacity(validated.tasks, validated.settings)
  } catch {
    return false
  }
}

function capacityDoesNotWorsen(
  tasks: Task[],
  current: AppSettings,
  proposed: AppSettings,
): boolean {
  for (let dayIndex = 0; dayIndex < proposed.weekLength; dayIndex += 1) {
    const dayTasks = tasks.filter(task => task.dayIndex === dayIndex)
    const taskCount = dayTasks.length
    const priorityCount = dayTasks.filter(task => task.priority).length
    const currentTaskExcess = Math.max(0, taskCount - current.maxTasksPerDay)
    const proposedTaskExcess = Math.max(0, taskCount - proposed.maxTasksPerDay)
    const currentPriorityExcess = Math.max(0, priorityCount - current.maxPriority)
    const proposedPriorityExcess = Math.max(0, priorityCount - proposed.maxPriority)

    if (
      proposedTaskExcess > currentTaskExcess
      || proposedPriorityExcess > currentPriorityExcess
    ) return false
  }
  return true
}

/** Strict parser for the current runtime schema. */
export function parseRuntimeWeekState(raw: unknown): WeekState {
  return parseWeekState(raw, {
    allowMissingSettings: false,
    enforceCapacity: false,
    idMode: 'preserve',
    legacySettings: false,
    maxTaskCount: MAX_RECOVERABLE_TOTAL_TASKS,
    maxTextLength: MAX_RECOVERABLE_TASK_TEXT_LENGTH,
    requireCompleted: true,
  })
}

/** Migrates P01 state, preserving structurally valid data even when it exceeds current limits. */
export function parseLegacyWeekState(raw: unknown, createId: IdFactory): WeekState {
  return parseWeekState(raw, {
    allowMissingSettings: true,
    enforceCapacity: false,
    idMode: 'replace',
    createId,
    legacySettings: true,
    maxTaskCount: MAX_RECOVERABLE_TOTAL_TASKS,
    maxTextLength: MAX_RECOVERABLE_TASK_TEXT_LENGTH,
    requireCompleted: false,
  })
}

/** Parses a portable file strictly and replaces untrusted task IDs. */
export function parsePortableWeekState(raw: unknown, createId: IdFactory = createTaskId): WeekState {
  return parseWeekState(raw, {
    allowMissingSettings: true,
    enforceCapacity: true,
    idMode: 'replace',
    createId,
    legacySettings: false,
    maxTaskCount: MAX_TOTAL_TASKS,
    maxTextLength: MAX_TASK_TEXT_LENGTH,
    requireCompleted: true,
  })
}

export function createTaskId(): string {
  return crypto.randomUUID()
}

export function createInitialWeekState(now = new Date()): WeekState {
  return {
    weekStart: getWeekStart(now, DEFAULT_SETTINGS.weekStartDay),
    tasks: [],
    settings: { ...DEFAULT_SETTINGS },
  }
}

export function materializeAction(action: Action, createId: IdFactory = createTaskId): DomainAction {
  if (action.type === 'ADD_TASK') {
    return { ...action, id: createId() }
  }
  if (action.type === 'START_NEW_WEEK') {
    return {
      type: action.type,
      carryOvers: action.carryOverIds.map(sourceId => ({ sourceId, newId: createId() })),
      newWeekStart: action.newWeekStart,
    }
  }
  return action
}

function validDayIndex(state: WeekState, dayIndex: number): boolean {
  return Number.isInteger(dayIndex) && dayIndex >= 0 && dayIndex < state.settings.weekLength
}

export function weekReducer(state: WeekState, action: DomainAction): WeekState {
  switch (action.type) {
    case 'LOAD': {
      try {
        return parseRuntimeWeekState(action.state)
      } catch {
        return state
      }
    }
    case 'ADD_TASK': {
      const text = action.text.trim()
      if (!text || text.length > MAX_TASK_TEXT_LENGTH || !validDayIndex(state, action.dayIndex) || !isUuidV4(action.id)) return state
      if (action.label !== undefined && !LABEL_OPTIONS.includes(action.label)) return state
      if (state.tasks.some(task => task.id === action.id)) return state
      if (state.tasks.length >= MAX_TOTAL_TASKS) return state

      const dayTasks = state.tasks.filter(task => task.dayIndex === action.dayIndex)
      if (dayTasks.length >= state.settings.maxTasksPerDay) return state

      const task: Task = {
        id: action.id,
        text,
        completed: false,
        dayIndex: action.dayIndex,
        label: action.label,
      }
      return { ...state, tasks: [...state.tasks, task] }
    }
    case 'EDIT_TASK': {
      const text = action.text.trim()
      if (!text || text.length > MAX_TASK_TEXT_LENGTH || !state.tasks.some(task => task.id === action.id)) return state
      return { ...state, tasks: state.tasks.map(task => task.id === action.id ? { ...task, text } : task) }
    }
    case 'TOGGLE_TASK':
      if (!state.tasks.some(task => task.id === action.id)) return state
      return { ...state, tasks: state.tasks.map(task => task.id === action.id ? { ...task, completed: !task.completed } : task) }
    case 'TOGGLE_PRIORITY': {
      const task = state.tasks.find(candidate => candidate.id === action.id)
      if (!task) return state
      if (!task.priority) {
        const count = state.tasks.filter(candidate => candidate.dayIndex === task.dayIndex && candidate.priority).length
        if (count >= state.settings.maxPriority) return state
      }
      return { ...state, tasks: state.tasks.map(candidate => candidate.id === action.id ? { ...candidate, priority: !candidate.priority } : candidate) }
    }
    case 'DELETE_TASK':
      if (!state.tasks.some(task => task.id === action.id)) return state
      return { ...state, tasks: state.tasks.filter(task => task.id !== action.id) }
    case 'MOVE_TASK': {
      const task = state.tasks.find(candidate => candidate.id === action.id)
      if (!task || !validDayIndex(state, action.toDayIndex) || task.dayIndex === action.toDayIndex) return state

      const targetTasks = state.tasks.filter(candidate => candidate.dayIndex === action.toDayIndex)
      if (targetTasks.length >= state.settings.maxTasksPerDay) return state

      return {
        ...state,
        tasks: state.tasks.map(candidate => candidate.id === action.id
          ? { ...candidate, dayIndex: action.toDayIndex, completed: false, priority: false }
          : candidate),
      }
    }
    case 'SET_TASK_LABEL':
      if (action.label !== undefined && !LABEL_OPTIONS.includes(action.label)) return state
      if (!state.tasks.some(task => task.id === action.id)) return state
      return { ...state, tasks: state.tasks.map(task => task.id === action.id ? { ...task, label: action.label } : task) }
    case 'START_NEW_WEEK': {
      const weekStart = action.newWeekStart ?? getNextWeekStart(state.weekStart)
      if (!isIsoDate(weekStart)) return state
      if (action.carryOvers.length > MAX_TOTAL_TASKS) return state

      const seenSourceIds = new Set<string>()
      const seenNewIds = new Set<string>()
      const carriedTasks: Task[] = []

      for (const carryOver of action.carryOvers) {
        if (
          seenSourceIds.has(carryOver.sourceId)
          || seenNewIds.has(carryOver.newId)
          || !isUuidV4(carryOver.newId)
          || state.tasks.some(task => task.id === carryOver.newId)
        ) return state
        const original = state.tasks.find(task => task.id === carryOver.sourceId)
        if (!original || original.completed) return state

        seenSourceIds.add(carryOver.sourceId)
        seenNewIds.add(carryOver.newId)
        carriedTasks.push({ ...original, id: carryOver.newId, completed: false, priority: false })
      }

      if (getCarryOverCapacityIssue(carriedTasks, state.settings)) return state
      return { ...state, weekStart, tasks: carriedTasks }
    }
    case 'UPDATE_SETTINGS': {
      try {
        const settings = parseAppSettings(action.settings)
        if (state.tasks.some(task => task.dayIndex >= settings.weekLength)) return state
        if (!capacityDoesNotWorsen(state.tasks, state.settings, settings)) return state
        return { ...state, settings }
      } catch {
        return state
      }
    }
    default:
      return state
  }
}
