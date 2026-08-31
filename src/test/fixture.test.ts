import { describe, expect, it } from 'vitest'
import { createFixtureProposal } from '../ai/fixture'
import type { WeekState } from '../types'

const COMPLETED = '11111111-1111-4111-8111-111111111111'
const BLOCKED = '22222222-2222-4222-8222-222222222222'
const ELIGIBLE = '33333333-3333-4333-8333-333333333333'

describe('Plan My Week fixture', () => {
  it('skips a fallback task on a day whose priority capacity is full', () => {
    const state: WeekState = {
      weekStart: '2026-08-31',
      settings: { maxPriority: 1, maxTasksPerDay: 5, weekStartDay: 1, weekLength: 7, homeView: 'week' },
      tasks: [
        { id: COMPLETED, text: 'Completed priority', completed: true, dayIndex: 0, priority: true },
        { id: BLOCKED, text: 'Blocked candidate', completed: false, dayIndex: 0 },
        { id: ELIGIBLE, text: 'Eligible candidate', completed: false, dayIndex: 1 },
      ],
    }

    expect(createFixtureProposal(state).changes).toEqual([{
      taskId: ELIGIBLE,
      priority: true,
      reason: 'Mark one incomplete task as a visible weekly priority.',
    }])
  })
})
