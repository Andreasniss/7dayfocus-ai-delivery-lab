export type TaskLabel = 'Work' | 'Life'

export interface Task {
  id: string
  text: string
  completed: boolean
  dayIndex: number
  priority?: boolean
  label?: TaskLabel
}

export interface AppSettings {
  maxPriority: number
  maxTasksPerDay: number
  weekStartDay: number
  weekLength: number
  homeView: 'day' | 'week'
}

export interface WeekState {
  weekStart: string
  tasks: Task[]
  settings: AppSettings
}

/** Commands accepted by the React store. ID creation happens before reduction. */
export type Action =
  | { type: 'ADD_TASK'; dayIndex: number; text: string; label?: TaskLabel }
  | { type: 'EDIT_TASK'; id: string; text: string }
  | { type: 'TOGGLE_TASK'; id: string }
  | { type: 'SET_TASK_LABEL'; id: string; label?: TaskLabel }
  | { type: 'TOGGLE_PRIORITY'; id: string }
  | { type: 'DELETE_TASK'; id: string }
  | { type: 'MOVE_TASK'; id: string; toDayIndex: number }
  | { type: 'START_NEW_WEEK'; carryOverIds: string[]; newWeekStart?: string }
  | { type: 'UPDATE_SETTINGS'; settings: AppSettings }
  | { type: 'LOAD'; state: WeekState }

/** Side-effect-free actions accepted by the pure domain reducer. */
export type DomainAction =
  | { type: 'ADD_TASK'; id: string; dayIndex: number; text: string; label?: TaskLabel }
  | { type: 'EDIT_TASK'; id: string; text: string }
  | { type: 'TOGGLE_TASK'; id: string }
  | { type: 'SET_TASK_LABEL'; id: string; label?: TaskLabel }
  | { type: 'TOGGLE_PRIORITY'; id: string }
  | { type: 'DELETE_TASK'; id: string }
  | { type: 'MOVE_TASK'; id: string; toDayIndex: number }
  | {
      type: 'START_NEW_WEEK'
      carryOvers: Array<{ sourceId: string; newId: string }>
      newWeekStart?: string
    }
  | { type: 'UPDATE_SETTINGS'; settings: AppSettings }
  | { type: 'LOAD'; state: WeekState }

export interface StorageIssue {
  kind: 'load' | 'save'
  message: string
}
