import { describe, expect, it } from 'vitest'
import {
  createWeekRevision,
  parsePlanProposal,
  validatePlanProposal,
} from '../domain/planProposal'
import { weekReducer } from '../domain/weekState'
import type { PlanProposal, Task, WeekState } from '../types'

const IDS = {
  a: '11111111-1111-4111-8111-111111111111',
  b: '22222222-2222-4222-8222-222222222222',
  c: '33333333-3333-4333-8333-333333333333',
  d: '44444444-4444-4444-8444-444444444444',
}

function task(id: string, dayIndex: number, overrides: Partial<Task> = {}): Task {
  return { id, text: `Task ${id[0]}`, completed: false, dayIndex, ...overrides }
}

function state(tasks: Task[]): WeekState {
  return {
    weekStart: '2026-08-31',
    settings: { maxPriority: 2, maxTasksPerDay: 2, weekStartDay: 1, weekLength: 7, homeView: 'week' },
    tasks,
  }
}

function proposal(changes: PlanProposal['changes']): PlanProposal {
  return { summary: 'A bounded proposal', changes }
}

describe('plan proposal contract', () => {
  it('parses the supported shape', () => {
    expect(parsePlanProposal(proposal([{ taskId: IDS.a, dayIndex: 2, reason: 'Balance the week' }]))).toEqual(
      proposal([{ taskId: IDS.a, dayIndex: 2, reason: 'Balance the week' }]),
    )
  })

  it.each([
    ['extra proposal field', { ...proposal([{ taskId: IDS.a, priority: true, reason: 'Important' }]), command: 'delete' }],
    ['extra change field', proposal([{ taskId: IDS.a, priority: true, reason: 'Important', text: 'rewrite' } as never])],
    ['missing operation', proposal([{ taskId: IDS.a, reason: 'No operation' }])],
    ['invalid task id', proposal([{ taskId: 'task-a', priority: true, reason: 'Invalid id' }])],
    ['empty changes', proposal([])],
    ['empty summary', { summary: '', changes: [{ taskId: IDS.a, priority: true, reason: 'Important' }] }],
    ['empty reason', proposal([{ taskId: IDS.a, priority: true, reason: '' }])],
  ])('rejects %s', (_name, value) => {
    expect(() => parsePlanProposal(value)).toThrow()
  })
})

describe('plan proposal validation and application', () => {
  it('moves and sets priority in the final atomic state', () => {
    const current = state([task(IDS.a, 0), task(IDS.b, 0)])
    const candidate = proposal([{ taskId: IDS.a, dayIndex: 1, priority: true, reason: 'Balance Monday' }])
    const result = validatePlanProposal(current, candidate)

    expect(result.nextState.tasks[0]).toMatchObject({ dayIndex: 1, priority: true, completed: false })
    expect(result.diffs[0]).toMatchObject({ fromDayIndex: 0, toDayIndex: 1, toPriority: true })
  })

  it('supports a simultaneous capacity-safe swap', () => {
    const current = state([task(IDS.a, 0), task(IDS.b, 0), task(IDS.c, 1), task(IDS.d, 1)])
    const result = validatePlanProposal(current, proposal([
      { taskId: IDS.a, dayIndex: 1, reason: 'Swap A' },
      { taskId: IDS.c, dayIndex: 0, reason: 'Swap C' },
    ]))

    expect(result.nextState.tasks.filter(candidate => candidate.dayIndex === 0)).toHaveLength(2)
    expect(result.nextState.tasks.filter(candidate => candidate.dayIndex === 1)).toHaveLength(2)
  })

  it('allows a proposal to reduce rather than worsen legacy capacity excess', () => {
    const current = state([
      task(IDS.a, 0),
      task(IDS.b, 0),
      task(IDS.c, 0),
      task(IDS.d, 0),
    ])
    const result = validatePlanProposal(current, proposal([
      { taskId: IDS.a, dayIndex: 1, reason: 'Reduce the overloaded day' },
    ]))

    expect(result.nextState.tasks.filter(candidate => candidate.dayIndex === 0)).toHaveLength(3)
    expect(result.nextState.tasks.filter(candidate => candidate.dayIndex === 1)).toHaveLength(1)
  })

  it('clears priority when moving unless explicitly restored', () => {
    const current = state([task(IDS.a, 0, { priority: true })])
    const result = validatePlanProposal(current, proposal([
      { taskId: IDS.a, dayIndex: 1, reason: 'Move priority task' },
    ]))
    expect(result.nextState.tasks[0]?.priority).toBe(false)
  })

  it.each([
    ['duplicate tasks', state([task(IDS.a, 0)]), proposal([
      { taskId: IDS.a, dayIndex: 1, reason: 'First' },
      { taskId: IDS.a, priority: true, reason: 'Second' },
    ])],
    ['unknown task', state([task(IDS.a, 0)]), proposal([{ taskId: IDS.b, dayIndex: 1, reason: 'Unknown' }])],
    ['completed task', state([task(IDS.a, 0, { completed: true })]), proposal([{ taskId: IDS.a, dayIndex: 1, reason: 'Done' }])],
    ['day outside week', state([task(IDS.a, 0)]), proposal([{ taskId: IDS.a, dayIndex: 7, reason: 'Outside' }])],
    ['no-op priority', state([task(IDS.a, 0, { priority: true })]), proposal([{ taskId: IDS.a, priority: true, reason: 'Same' }])],
    ['day over capacity', state([task(IDS.a, 0), task(IDS.b, 1), task(IDS.c, 1)]), proposal([{ taskId: IDS.a, dayIndex: 1, reason: 'Overflow' }])],
    ['priority over capacity', state([
      task(IDS.a, 0),
      task(IDS.b, 0, { priority: true }),
      task(IDS.c, 1, { priority: true }),
    ]), proposal([
      { taskId: IDS.a, priority: true, reason: 'Third priority' },
      { taskId: IDS.c, dayIndex: 0, priority: true, reason: 'Also priority' },
    ])],
  ])('rejects %s atomically', (_name, current, candidate) => {
    expect(() => validatePlanProposal(current, candidate)).toThrow()
    const result = weekReducer(current, {
      type: 'APPLY_PLAN_PROPOSAL',
      revision: createWeekRevision(current),
      proposal: candidate,
    })
    expect(result).toBe(current)
  })

  it('rejects a stale revision without mutation', () => {
    const original = state([task(IDS.a, 0)])
    const changed = { ...original, tasks: [task(IDS.a, 1)] }
    const result = weekReducer(changed, {
      type: 'APPLY_PLAN_PROPOSAL',
      revision: createWeekRevision(original),
      proposal: proposal([{ taskId: IDS.a, dayIndex: 2, reason: 'Stale' }]),
    })
    expect(result).toBe(changed)
  })

  it('applies a valid proposal as one reducer transition', () => {
    const current = state([task(IDS.a, 0)])
    const result = weekReducer(current, {
      type: 'APPLY_PLAN_PROPOSAL',
      revision: createWeekRevision(current),
      proposal: proposal([{ taskId: IDS.a, dayIndex: 2, priority: true, reason: 'Schedule it' }]),
    })
    expect(result).not.toBe(current)
    expect(result.tasks[0]).toMatchObject({ dayIndex: 2, priority: true })
  })
})
