import { describe, expect, it } from 'vitest'
import { parsePlanProposal, validatePlanProposal } from '../domain/planProposal'
import type { PlanProposal, Task, WeekState } from '../types'

const A = '11111111-1111-4111-8111-111111111111'
const B = '22222222-2222-4222-8222-222222222222'
const C = '33333333-3333-4333-8333-333333333333'
const D = '44444444-4444-4444-8444-444444444444'
const E = '55555555-5555-4555-8555-555555555555'

const tasks: Task[] = [
  { id: A, text: 'Draft architecture', completed: false, dayIndex: 0 },
  { id: B, text: 'Run eval review', completed: false, dayIndex: 0, priority: true },
  { id: C, text: 'Write documentation', completed: false, dayIndex: 1 },
  { id: D, text: 'Test mobile flow', completed: false, dayIndex: 1 },
  { id: E, text: 'Completed setup', completed: true, dayIndex: 2 },
]

const state: WeekState = {
  weekStart: '2026-08-31',
  settings: { maxPriority: 1, maxTasksPerDay: 2, weekStartDay: 1, weekLength: 7, homeView: 'week' },
  tasks,
}

type EvalCase = { id: string; expected: 'accept' | 'reject'; proposal: unknown }
const p = (changes: PlanProposal['changes']): PlanProposal => ({ summary: 'Eval proposal', changes })

const CASES: EvalCase[] = [
  { id: 'valid-move-to-light-day', expected: 'accept', proposal: p([{ taskId: A, dayIndex: 2, reason: 'Balance' }]) },
  { id: 'valid-add-priority', expected: 'accept', proposal: p([{ taskId: C, priority: true, reason: 'Important' }]) },
  { id: 'valid-move-and-prioritize', expected: 'accept', proposal: p([{ taskId: A, dayIndex: 2, priority: true, reason: 'Focus' }]) },
  { id: 'valid-simultaneous-swap', expected: 'accept', proposal: p([{ taskId: A, dayIndex: 1, reason: 'Swap' }, { taskId: C, dayIndex: 0, reason: 'Swap' }]) },
  { id: 'valid-move-clears-priority', expected: 'accept', proposal: p([{ taskId: B, dayIndex: 3, reason: 'Spread work' }]) },
  { id: 'valid-reassign-priority', expected: 'accept', proposal: p([{ taskId: B, priority: false, reason: 'Defer' }, { taskId: A, priority: true, reason: 'Focus' }]) },
  { id: 'valid-move-third-day', expected: 'accept', proposal: p([{ taskId: C, dayIndex: 3, reason: 'Balance' }]) },
  { id: 'valid-move-fourth-day', expected: 'accept', proposal: p([{ taskId: D, dayIndex: 4, reason: 'Balance' }]) },
  { id: 'valid-clear-priority', expected: 'accept', proposal: p([{ taskId: B, priority: false, reason: 'No longer urgent' }]) },
  { id: 'valid-two-independent-moves', expected: 'accept', proposal: p([{ taskId: A, dayIndex: 2, reason: 'Balance' }, { taskId: C, dayIndex: 3, reason: 'Balance' }]) },
  { id: 'reject-duplicate-task', expected: 'reject', proposal: p([{ taskId: A, dayIndex: 2, reason: 'One' }, { taskId: A, priority: true, reason: 'Two' }]) },
  { id: 'reject-unknown-task', expected: 'reject', proposal: p([{ taskId: '66666666-6666-4666-8666-666666666666', dayIndex: 2, reason: 'Unknown' }]) },
  { id: 'reject-completed-task', expected: 'reject', proposal: p([{ taskId: E, priority: true, reason: 'Already done' }]) },
  { id: 'reject-negative-day', expected: 'reject', proposal: p([{ taskId: A, dayIndex: -1, reason: 'Outside' }]) },
  { id: 'reject-day-after-week', expected: 'reject', proposal: p([{ taskId: A, dayIndex: 7, reason: 'Outside' }]) },
  { id: 'reject-no-op-day', expected: 'reject', proposal: p([{ taskId: A, dayIndex: 0, reason: 'Same' }]) },
  { id: 'reject-no-op-priority', expected: 'reject', proposal: p([{ taskId: B, priority: true, reason: 'Same' }]) },
  { id: 'reject-task-overflow', expected: 'reject', proposal: p([{ taskId: A, dayIndex: 1, reason: 'Overflow' }]) },
  { id: 'reject-priority-overflow', expected: 'reject', proposal: p([{ taskId: C, priority: true, reason: 'One' }, { taskId: D, priority: true, reason: 'Two' }]) },
  { id: 'reject-unsupported-delete', expected: 'reject', proposal: { ...p([{ taskId: A, dayIndex: 2, reason: 'Move' }]), deleteTaskId: B } },
  { id: 'reject-unsupported-rewrite', expected: 'reject', proposal: p([{ taskId: A, dayIndex: 2, reason: 'Move', text: 'Rewrite' } as never]) },
  { id: 'reject-empty-changes', expected: 'reject', proposal: p([]) },
  { id: 'reject-missing-reason', expected: 'reject', proposal: { summary: 'Eval proposal', changes: [{ taskId: A, dayIndex: 2 }] } },
  { id: 'reject-malformed-id', expected: 'reject', proposal: p([{ taskId: 'A', dayIndex: 2, reason: 'Malformed' }]) },
]

describe('Plan My Week deterministic eval suite', () => {
  it('contains at least 20 named scenarios', () => {
    expect(CASES).toHaveLength(24)
    expect(new Set(CASES.map(candidate => candidate.id)).size).toBe(CASES.length)
  })

  it.each(CASES)('$id -> $expected', ({ expected, proposal }) => {
    const run = () => validatePlanProposal(state, parsePlanProposal(proposal))
    if (expected === 'accept') expect(run).not.toThrow()
    else expect(run).toThrow()
  })
})
