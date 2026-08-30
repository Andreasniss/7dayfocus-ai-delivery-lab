import { useEffect, useReducer } from 'react'
import type { Action, AppSettings, Task, WeekState } from '../types'
import { getWeekStart } from '../utils/dates'

const STORAGE_NAME = '7dayfocus-v1'

const DEFAULT_SETTINGS: AppSettings = {
  maxPriority: 2,
  maxTasksPerDay: 5,
  weekStartDay: 1,
  weekLength: 7,
  homeView: 'day',
}

function withDefaultSettings(settings?: Partial<AppSettings>): AppSettings {
  return { ...DEFAULT_SETTINGS, ...settings }
}

function newId(): string {
  return Math.random().toString(36).slice(2, 10)
}

function reducer(state: WeekState, action: Action): WeekState {
  switch (action.type) {
    case 'LOAD':
      return { ...action.state, settings: withDefaultSettings(action.state.settings) }
    case 'ADD_TASK': {
      const dayTasks = state.tasks.filter(task => task.dayIndex === action.dayIndex)
      if (dayTasks.length >= state.settings.maxTasksPerDay) return state
      const task: Task = {
        id: newId(),
        text: action.text.trim(),
        completed: false,
        dayIndex: action.dayIndex,
        label: action.label,
      }
      return { ...state, tasks: [...state.tasks, task] }
    }
    case 'EDIT_TASK': {
      const text = action.text.trim()
      if (!text) return state
      return { ...state, tasks: state.tasks.map(task => task.id === action.id ? { ...task, text } : task) }
    }
    case 'TOGGLE_TASK':
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
      return { ...state, tasks: state.tasks.filter(task => task.id !== action.id) }
    case 'MOVE_TASK': {
      const targetTasks = state.tasks.filter(task => task.dayIndex === action.toDayIndex)
      if (targetTasks.length >= state.settings.maxTasksPerDay) return state
      return {
        ...state,
        tasks: state.tasks.map(task => task.id === action.id
          ? { ...task, dayIndex: action.toDayIndex, completed: false, priority: false }
          : task),
      }
    }
    case 'SET_TASK_LABEL':
      return { ...state, tasks: state.tasks.map(task => task.id === action.id ? { ...task, label: action.label } : task) }
    case 'START_NEW_WEEK': {
      const weekStart = action.newWeekStart ?? getWeekStart(new Date(), state.settings.weekStartDay)
      const carriedTasks: Task[] = action.carryOverIds.map(id => {
        const original = state.tasks.find(task => task.id === id)!
        return { ...original, id: newId(), completed: false, priority: false }
      })
      return { ...state, weekStart, tasks: carriedTasks }
    }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: action.settings }
    default:
      return state
  }
}

function loadFromStorage(): WeekState | null {
  try {
    const raw = localStorage.getItem(STORAGE_NAME)
    return raw ? JSON.parse(raw) as WeekState : null
  } catch {
    return null
  }
}

function saveToStorage(state: WeekState): void {
  try {
    localStorage.setItem(STORAGE_NAME, JSON.stringify(state))
  } catch {
    // P02 adds an explicit user-visible storage failure path.
  }
}

function initialState(): WeekState {
  return {
    weekStart: getWeekStart(new Date(), DEFAULT_SETTINGS.weekStartDay),
    tasks: [],
    settings: DEFAULT_SETTINGS,
  }
}

export function useWeekStore() {
  const [state, dispatch] = useReducer(reducer, null, () => {
    const saved = loadFromStorage()
    return saved ? { ...saved, settings: withDefaultSettings(saved.settings) } : initialState()
  })

  useEffect(() => saveToStorage(state), [state])

  return { state, dispatch }
}
