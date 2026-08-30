import { validatePlanProposal } from '../domain/planProposal'
import type { PlanProposal, Task, WeekState } from '../types'

function activeTasks(state: WeekState): Task[] {
  return state.tasks.filter(task => !task.completed)
}

export function createFixtureProposal(state: WeekState): PlanProposal {
  const active = activeTasks(state)
  if (active.length === 0) throw new Error('Add at least one incomplete task before planning the week.')

  const activeDayCounts = Array.from({ length: state.settings.weekLength }, (_, dayIndex) => (
    active.filter(task => task.dayIndex === dayIndex).length
  ))
  const totalDayCounts = Array.from({ length: state.settings.weekLength }, (_, dayIndex) => (
    state.tasks.filter(task => task.dayIndex === dayIndex).length
  ))
  const sourceDay = activeDayCounts.findIndex(count => count === Math.max(...activeDayCounts) && count > 1)
  const targetDay = totalDayCounts.findIndex(count => count === Math.min(...totalDayCounts))
  const changes: PlanProposal['changes'] = []

  if (sourceDay >= 0 && targetDay >= 0 && sourceDay !== targetDay && totalDayCounts[targetDay]! < state.settings.maxTasksPerDay) {
    const task = active.find(candidate => candidate.dayIndex === sourceDay && !candidate.priority)
      ?? active.find(candidate => candidate.dayIndex === sourceDay)
    if (task) {
      changes.push({
        taskId: task.id,
        dayIndex: targetDay,
        priority: false,
        reason: 'Move one task from the busiest day to the lightest day.',
      })
    }
  }

  if (changes.length === 0) {
    const task = active.find(candidate => !candidate.priority)
    if (!task) throw new Error('The fixture found no safe planning change for this week.')
    changes.push({
      taskId: task.id,
      priority: true,
      reason: 'Mark one incomplete task as a visible weekly priority.',
    })
  }

  const proposal = {
    summary: 'Fixture proposal: make one small, capacity-safe improvement without an external model call.',
    changes,
  }
  validatePlanProposal(state, proposal)
  return proposal
}
