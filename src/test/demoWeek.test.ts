import { describe, expect, it } from 'vitest'
import demoWeek from '../../examples/demo-week.json'
import { createFixtureProposal } from '../ai/fixture'
import { parseImport } from '../lib/dataIO'
import { validatePlanProposal } from '../domain/planProposal'

describe('public demo week', () => {
  it('imports the published fictional dataset with fresh IDs and visible variety', () => {
    const state = parseImport(demoWeek)
    const second = parseImport(demoWeek)
    expect(state.tasks).toHaveLength(15)
    expect(state.tasks.some(task => task.completed)).toBe(true)
    expect(state.tasks.some(task => task.priority)).toBe(true)
    expect(new Set(state.tasks.map(task => task.label))).toEqual(new Set(['Work', 'Life']))
    expect(new Set(state.tasks.map(task => task.id)).size).toBe(15)
    expect(state.tasks.every(task => !second.tasks.some(other => other.id === task.id))).toBe(true)
  })

  it('reproduces the documented non-mutating, capacity-safe fixture proposal', () => {
    const state = parseImport(demoWeek)
    const before = JSON.stringify(state)
    const proposal = createFixtureProposal(state)
    const { diffs } = validatePlanProposal(state, proposal)
    expect(diffs).toHaveLength(1)
    expect(diffs[0]).toMatchObject({ text: 'Map onboarding flow', fromDayIndex: 0, toDayIndex: 6 })
    expect(JSON.stringify(state)).toBe(before)
  })
})
