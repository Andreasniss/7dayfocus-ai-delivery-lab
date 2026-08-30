import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useWeekStore } from '../hooks/useWeekStore'

// Minimal localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

vi.stubGlobal('localStorage', localStorageMock)

beforeEach(() => {
  localStorageMock.clear()
})

function getHook() {
  return renderHook(() => useWeekStore())
}

describe('ADD_TASK', () => {
  it('adds a task to the correct day', () => {
    const { result } = getHook()
    act(() => {
      result.current.dispatch({ type: 'ADD_TASK', dayIndex: 2, text: 'Buy milk' })
    })
    const tasks = result.current.state.tasks
    expect(tasks).toHaveLength(1)
    expect(tasks[0]!.text).toBe('Buy milk')
    expect(tasks[0]!.dayIndex).toBe(2)
    expect(tasks[0]!.completed).toBe(false)
  })

  it('trims whitespace from task text', () => {
    const { result } = getHook()
    act(() => {
      result.current.dispatch({ type: 'ADD_TASK', dayIndex: 0, text: '  spaces  ' })
    })
    expect(result.current.state.tasks[0]!.text).toBe('spaces')
  })

  it('accumulates multiple tasks', () => {
    const { result } = getHook()
    act(() => {
      result.current.dispatch({ type: 'ADD_TASK', dayIndex: 0, text: 'Task A' })
      result.current.dispatch({ type: 'ADD_TASK', dayIndex: 1, text: 'Task B' })
    })
    expect(result.current.state.tasks).toHaveLength(2)
  })

  it('preserves a label when a task is added', () => {
    const { result } = getHook()
    act(() => {
      result.current.dispatch({ type: 'ADD_TASK', dayIndex: 0, text: 'Email boss', label: 'Life' })
    })
    expect(result.current.state.tasks[0]!.label).toBe('Life')
  })
})

describe('TOGGLE_TASK', () => {
  it('marks a task completed', () => {
    const { result } = getHook()
    act(() => {
      result.current.dispatch({ type: 'ADD_TASK', dayIndex: 0, text: 'Read book' })
    })
    const id = result.current.state.tasks[0]!.id
    act(() => {
      result.current.dispatch({ type: 'TOGGLE_TASK', id })
    })
    expect(result.current.state.tasks[0]!.completed).toBe(true)
  })

  it('toggles back to incomplete', () => {
    const { result } = getHook()
    act(() => {
      result.current.dispatch({ type: 'ADD_TASK', dayIndex: 0, text: 'Read book' })
    })
    const id = result.current.state.tasks[0]!.id
    act(() => {
      result.current.dispatch({ type: 'TOGGLE_TASK', id })
      result.current.dispatch({ type: 'TOGGLE_TASK', id })
    })
    expect(result.current.state.tasks[0]!.completed).toBe(false)
  })

  it('only toggles the targeted task', () => {
    const { result } = getHook()
    act(() => {
      result.current.dispatch({ type: 'ADD_TASK', dayIndex: 0, text: 'Task A' })
      result.current.dispatch({ type: 'ADD_TASK', dayIndex: 0, text: 'Task B' })
    })
    const id = result.current.state.tasks[0]!.id
    act(() => {
      result.current.dispatch({ type: 'TOGGLE_TASK', id })
    })
    expect(result.current.state.tasks[0]!.completed).toBe(true)
    expect(result.current.state.tasks[1]!.completed).toBe(false)
  })
})

describe('DELETE_TASK', () => {
  it('removes a task by id', () => {
    const { result } = getHook()
    act(() => {
      result.current.dispatch({ type: 'ADD_TASK', dayIndex: 0, text: 'Delete me' })
    })
    const id = result.current.state.tasks[0]!.id
    act(() => {
      result.current.dispatch({ type: 'DELETE_TASK', id })
    })
    expect(result.current.state.tasks).toHaveLength(0)
  })

  it('leaves other tasks intact', () => {
    const { result } = getHook()
    act(() => {
      result.current.dispatch({ type: 'ADD_TASK', dayIndex: 0, text: 'Keep me' })
      result.current.dispatch({ type: 'ADD_TASK', dayIndex: 0, text: 'Delete me' })
    })
    const idToDelete = result.current.state.tasks[1]!.id
    act(() => {
      result.current.dispatch({ type: 'DELETE_TASK', id: idToDelete })
    })
    expect(result.current.state.tasks).toHaveLength(1)
    expect(result.current.state.tasks[0]!.text).toBe('Keep me')
  })
})

describe('MOVE_TASK', () => {
  it('moves a task to a new day', () => {
    const { result } = getHook()
    act(() => {
      result.current.dispatch({ type: 'ADD_TASK', dayIndex: 0, text: 'Move me' })
    })
    const id = result.current.state.tasks[0]!.id
    act(() => {
      result.current.dispatch({ type: 'MOVE_TASK', id, toDayIndex: 4 })
    })
    expect(result.current.state.tasks[0]!.dayIndex).toBe(4)
  })

  it('resets completed status when moved', () => {
    const { result } = getHook()
    act(() => {
      result.current.dispatch({ type: 'ADD_TASK', dayIndex: 0, text: 'Done task' })
    })
    const id = result.current.state.tasks[0]!.id
    act(() => {
      result.current.dispatch({ type: 'TOGGLE_TASK', id })
    })
    expect(result.current.state.tasks[0]!.completed).toBe(true)
    act(() => {
      result.current.dispatch({ type: 'MOVE_TASK', id, toDayIndex: 2 })
    })
    expect(result.current.state.tasks[0]!.completed).toBe(false)
  })

  it('resets priority when moved to another day', () => {
    const { result } = getHook()
    act(() => {
      result.current.dispatch({ type: 'ADD_TASK', dayIndex: 0, text: 'Priority task' })
    })
    const id = result.current.state.tasks[0]!.id
    act(() => {
      result.current.dispatch({ type: 'TOGGLE_PRIORITY', id })
      result.current.dispatch({ type: 'MOVE_TASK', id, toDayIndex: 3 })
    })
    expect(result.current.state.tasks[0]!.priority).toBeFalsy()
  })
})

describe('TOGGLE_PRIORITY', () => {
  it('marks a task as priority', () => {
    const { result } = getHook()
    act(() => {
      result.current.dispatch({ type: 'ADD_TASK', dayIndex: 0, text: 'Important' })
    })
    const id = result.current.state.tasks[0]!.id
    act(() => {
      result.current.dispatch({ type: 'TOGGLE_PRIORITY', id })
    })
    expect(result.current.state.tasks[0]!.priority).toBe(true)
  })

  it('removes priority when toggled again', () => {
    const { result } = getHook()
    act(() => {
      result.current.dispatch({ type: 'ADD_TASK', dayIndex: 0, text: 'Important' })
    })
    const id = result.current.state.tasks[0]!.id
    act(() => {
      result.current.dispatch({ type: 'TOGGLE_PRIORITY', id })
      result.current.dispatch({ type: 'TOGGLE_PRIORITY', id })
    })
    expect(result.current.state.tasks[0]!.priority).toBe(false)
  })

  it('enforces max priority tasks per day based on settings', () => {
    const { result } = getHook()
    // Default is 2
    act(() => {
      result.current.dispatch({ type: 'ADD_TASK', dayIndex: 0, text: 'Task 1' })
      result.current.dispatch({ type: 'ADD_TASK', dayIndex: 0, text: 'Task 2' })
      result.current.dispatch({ type: 'ADD_TASK', dayIndex: 0, text: 'Task 3' })
    })
    const id1 = result.current.state.tasks[0].id
    const id2 = result.current.state.tasks[1].id
    const id3 = result.current.state.tasks[2].id

    act(() => {
      result.current.dispatch({ type: 'TOGGLE_PRIORITY', id: id1 })
      result.current.dispatch({ type: 'TOGGLE_PRIORITY', id: id2 })
      result.current.dispatch({ type: 'TOGGLE_PRIORITY', id: id3 })
    })

    const priorities = result.current.state.tasks.filter(t => t.priority)
    expect(priorities).toHaveLength(2)

    // Update settings to allow 3
    act(() => {
      result.current.dispatch({ 
        type: 'UPDATE_SETTINGS', 
        settings: { ...result.current.state.settings, maxPriority: 3 } 
      })
    })

    act(() => {
      result.current.dispatch({ type: 'TOGGLE_PRIORITY', id: id3 })
    })

    const newPriorities = result.current.state.tasks.filter(t => t.priority)
    expect(newPriorities).toHaveLength(3)
  })

  it('enforces total tasks per day based on settings', () => {
    const { result } = getHook()
    // Default is 5
    act(() => {
      for (let i = 0; i < 5; i++) {
        result.current.dispatch({ type: 'ADD_TASK', dayIndex: 1, text: `Task ${i}` })
      }
    })
    expect(result.current.state.tasks.filter(t => t.dayIndex === 1)).toHaveLength(5)
    
    act(() => {
      result.current.dispatch({ type: 'ADD_TASK', dayIndex: 1, text: 'Task 6' })
    })
    expect(result.current.state.tasks.filter(t => t.dayIndex === 1)).toHaveLength(5)

    // Update settings to allow 7
    act(() => {
      result.current.dispatch({
        type: 'UPDATE_SETTINGS',
        settings: { ...result.current.state.settings, maxTasksPerDay: 7 }
      })
    })

    act(() => {
      result.current.dispatch({ type: 'ADD_TASK', dayIndex: 1, text: 'Task 6' })
      result.current.dispatch({ type: 'ADD_TASK', dayIndex: 1, text: 'Task 7' })
    })
    expect(result.current.state.tasks.filter(t => t.dayIndex === 1)).toHaveLength(7)
  })

  it('priority limits are per-day, not global', () => {
    const { result } = getHook()
    act(() => {
      result.current.dispatch({ type: 'ADD_TASK', dayIndex: 0, text: 'Mon 1' })
      result.current.dispatch({ type: 'ADD_TASK', dayIndex: 0, text: 'Mon 2' })
      result.current.dispatch({ type: 'ADD_TASK', dayIndex: 1, text: 'Tue 1' })
    })
    const [mon1, mon2, tue1] = result.current.state.tasks.map(t => t.id)
    act(() => {
      result.current.dispatch({ type: 'TOGGLE_PRIORITY', id: mon1! })
      result.current.dispatch({ type: 'TOGGLE_PRIORITY', id: mon2! })
      result.current.dispatch({ type: 'TOGGLE_PRIORITY', id: tue1! }) // different day — should work
    })
    expect(result.current.state.tasks.find(t => t.id === tue1)!.priority).toBe(true)
  })
})

describe('START_NEW_WEEK', () => {
  it('resets to current week start', () => {
    const { result } = getHook()
    act(() => {
      result.current.dispatch({ type: 'ADD_TASK', dayIndex: 0, text: 'Old task' })
      result.current.dispatch({ type: 'ADD_TASK', dayIndex: 1, text: 'Carry me' })
    })
    const carryId = result.current.state.tasks[1]!.id

    act(() => {
      result.current.dispatch({ type: 'START_NEW_WEEK', carryOverIds: [carryId] })
    })

    // Only carried task remains
    expect(result.current.state.tasks).toHaveLength(1)
    expect(result.current.state.tasks[0]!.text).toBe('Carry me')
  })

  it('resets completed status on carried tasks', () => {
    const { result } = getHook()
    act(() => {
      result.current.dispatch({ type: 'ADD_TASK', dayIndex: 0, text: 'Done' })
    })
    const id = result.current.state.tasks[0]!.id
    act(() => {
      result.current.dispatch({ type: 'TOGGLE_TASK', id })
      result.current.dispatch({ type: 'START_NEW_WEEK', carryOverIds: [id] })
    })
    expect(result.current.state.tasks[0]!.completed).toBe(false)
  })

  it('gives carried tasks new IDs', () => {
    const { result } = getHook()
    act(() => {
      result.current.dispatch({ type: 'ADD_TASK', dayIndex: 0, text: 'Carry me' })
    })
    const originalId = result.current.state.tasks[0]!.id
    act(() => {
      result.current.dispatch({ type: 'START_NEW_WEEK', carryOverIds: [originalId] })
    })
    expect(result.current.state.tasks[0]!.id).not.toBe(originalId)
  })

  it('clears tasks when no carry-overs selected', () => {
    const { result } = getHook()
    act(() => {
      result.current.dispatch({ type: 'ADD_TASK', dayIndex: 0, text: 'Gone' })
      result.current.dispatch({ type: 'START_NEW_WEEK', carryOverIds: [] })
    })
    expect(result.current.state.tasks).toHaveLength(0)
  })

  it('sets a custom next week start date when provided', () => {
    const { result } = getHook()
    const customDate = '2025-12-25'
    act(() => {
      result.current.dispatch({ type: 'START_NEW_WEEK', carryOverIds: [], newWeekStart: customDate })
    })
    expect(result.current.state.weekStart).toBe(customDate)
  })
})

