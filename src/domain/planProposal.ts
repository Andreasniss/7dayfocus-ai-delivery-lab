import type { PlanChange, PlanDiff, PlanProposal, Task, WeekState } from '../types'

const MAX_SUMMARY_LENGTH = 500
const MAX_REASON_LENGTH = 300
const MAX_PROPOSAL_CHANGES = 105
const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const PROPOSAL_KEYS = new Set(['summary', 'changes'])
const CHANGE_KEYS = new Set(['taskId', 'dayIndex', 'priority', 'reason'])

type RecordValue = Record<string, unknown>

function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasOnlyKeys(value: RecordValue, allowed: Set<string>): boolean {
  return Object.keys(value).every(key => allowed.has(key))
}

function isUuidV4(value: unknown): value is string {
  return typeof value === 'string' && UUID_V4_PATTERN.test(value)
}

function parseBoundedText(value: unknown, field: string, maximum: number): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} must be a non-empty string`)
  const text = value.trim()
  if (text.length > maximum) throw new Error(`${field} must not exceed ${maximum} characters`)
  return text
}

export function parsePlanProposal(raw: unknown): PlanProposal {
  if (!isRecord(raw) || !hasOnlyKeys(raw, PROPOSAL_KEYS)) {
    throw new Error('Proposal must contain only summary and changes')
  }

  const summary = parseBoundedText(raw.summary, 'summary', MAX_SUMMARY_LENGTH)
  if (!Array.isArray(raw.changes) || raw.changes.length === 0 || raw.changes.length > MAX_PROPOSAL_CHANGES) {
    throw new Error(`changes must contain between 1 and ${MAX_PROPOSAL_CHANGES} entries`)
  }

  const changes = raw.changes.map((candidate, index): PlanChange => {
    if (!isRecord(candidate) || !hasOnlyKeys(candidate, CHANGE_KEYS)) {
      throw new Error(`Change ${index}: contains unsupported fields`)
    }
    if (!isUuidV4(candidate.taskId)) throw new Error(`Change ${index}: taskId must be a UUID v4`)
    if (candidate.dayIndex === undefined && candidate.priority === undefined) {
      throw new Error(`Change ${index}: must set dayIndex, priority, or both`)
    }
    if (
      candidate.dayIndex !== undefined
      && (typeof candidate.dayIndex !== 'number' || !Number.isInteger(candidate.dayIndex))
    ) throw new Error(`Change ${index}: dayIndex must be an integer`)
    if (candidate.priority !== undefined && typeof candidate.priority !== 'boolean') {
      throw new Error(`Change ${index}: priority must be a boolean`)
    }

    return {
      taskId: candidate.taskId,
      dayIndex: candidate.dayIndex as number | undefined,
      priority: candidate.priority as boolean | undefined,
      reason: parseBoundedText(candidate.reason, `Change ${index}: reason`, MAX_REASON_LENGTH),
    }
  })

  return { summary, changes }
}

export function createWeekRevision(state: WeekState): string {
  return JSON.stringify({
    weekStart: state.weekStart,
    settings: state.settings,
    tasks: state.tasks.map(task => ({
      id: task.id,
      text: task.text,
      completed: task.completed,
      dayIndex: task.dayIndex,
      priority: task.priority === true,
      label: task.label ?? null,
    })),
  })
}

function applyRequestedChange(task: Task, change: PlanChange): Task {
  const moving = change.dayIndex !== undefined && change.dayIndex !== task.dayIndex
  return {
    ...task,
    dayIndex: change.dayIndex ?? task.dayIndex,
    completed: moving ? false : task.completed,
    priority: change.priority ?? (moving ? false : task.priority === true),
  }
}

export interface ValidatedPlanProposal {
  nextState: WeekState
  diffs: PlanDiff[]
}

export function validatePlanProposal(state: WeekState, proposal: PlanProposal): ValidatedPlanProposal {
  const parsed = parsePlanProposal(proposal)
  const seen = new Set<string>()
  const changesById = new Map<string, PlanChange>()

  for (const change of parsed.changes) {
    if (seen.has(change.taskId)) throw new Error('A task may appear only once in a proposal')
    seen.add(change.taskId)

    const task = state.tasks.find(candidate => candidate.id === change.taskId)
    if (!task) throw new Error('Proposal references an unknown task')
    if (task.completed) throw new Error('Completed tasks cannot be changed by the assistant')
    if (
      change.dayIndex !== undefined
      && (change.dayIndex < 0 || change.dayIndex >= state.settings.weekLength)
    ) throw new Error('Proposal dayIndex is outside the configured week')

    const nextTask = applyRequestedChange(task, change)
    if (nextTask.dayIndex === task.dayIndex && (nextTask.priority === true) === (task.priority === true)) {
      throw new Error('Proposal contains a change that has no effect')
    }
    changesById.set(change.taskId, change)
  }

  const tasks = state.tasks.map(task => {
    const change = changesById.get(task.id)
    return change ? applyRequestedChange(task, change) : task
  })

  for (let dayIndex = 0; dayIndex < state.settings.weekLength; dayIndex += 1) {
    const beforeDayTasks = state.tasks.filter(task => task.dayIndex === dayIndex)
    const dayTasks = tasks.filter(task => task.dayIndex === dayIndex)
    const beforeTaskExcess = Math.max(0, beforeDayTasks.length - state.settings.maxTasksPerDay)
    const afterTaskExcess = Math.max(0, dayTasks.length - state.settings.maxTasksPerDay)
    if (afterTaskExcess > beforeTaskExcess) {
      throw new Error(`Proposal exceeds the task limit for day ${dayIndex}`)
    }
    const beforePriorityExcess = Math.max(
      0,
      beforeDayTasks.filter(task => task.priority).length - state.settings.maxPriority,
    )
    const afterPriorityExcess = Math.max(
      0,
      dayTasks.filter(task => task.priority).length - state.settings.maxPriority,
    )
    if (afterPriorityExcess > beforePriorityExcess) {
      throw new Error(`Proposal exceeds the priority limit for day ${dayIndex}`)
    }
  }

  const diffs = parsed.changes.map(change => {
    const before = state.tasks.find(task => task.id === change.taskId)!
    const after = tasks.find(task => task.id === change.taskId)!
    return {
      taskId: before.id,
      text: before.text,
      fromDayIndex: before.dayIndex,
      toDayIndex: after.dayIndex,
      fromPriority: before.priority === true,
      toPriority: after.priority === true,
      reason: change.reason,
    }
  })

  return { nextState: { ...state, tasks }, diffs }
}
