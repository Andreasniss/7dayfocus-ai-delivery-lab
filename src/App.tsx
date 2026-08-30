import { useEffect, useMemo, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { DayColumn } from './components/DayColumn'
import { DayView } from './components/DayView'
import { Header } from './components/Header'
import { WeekReview } from './components/WeekReview'
import { MAX_TOTAL_TASKS } from './domain/weekState'
import { useWeekStore } from './hooks/useWeekStore'
import { exportData, parseImport, readJsonFile } from './lib/dataIO'
import type { Task } from './types'
import { dayDate, formatDayLabel, getTodayIndex } from './utils/dates'

const FULL_DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function describeDragTask(tasks: Task[], activeId: string | number): string {
  const task = tasks.find(candidate => candidate.id === String(activeId))
  return task ? `task “${task.text}”` : 'the selected task'
}

function describeDragTarget(overId: string | number, weekStart: string, weekLength: number): string | null {
  const match = /^day-(\d+)$/.exec(String(overId))
  if (!match) return null

  const dayIndex = Number(match[1])
  if (!Number.isInteger(dayIndex) || dayIndex < 0 || dayIndex >= weekLength) return null

  const date = dayDate(weekStart, dayIndex)
  const label = formatDayLabel(date)
  return `${FULL_DAY_NAMES[date.getDay()]}, ${label.month} ${label.num}, ${date.getFullYear()}`
}

export function createDragAnnouncements(tasks: Task[], weekStart: string, weekLength: number): Announcements {
  return {
    onDragStart: ({ active }) => `Picked up ${describeDragTask(tasks, active.id)}.`,
    onDragOver: ({ active, over }) => {
      const task = describeDragTask(tasks, active.id)
      const target = over ? describeDragTarget(over.id, weekStart, weekLength) : null
      const sentenceTask = `${task[0]!.toUpperCase()}${task.slice(1)}`
      return target ? `${sentenceTask} is over ${target}.` : `${sentenceTask} is not over a planning day.`
    },
    onDragEnd: ({ active, over }) => {
      const task = describeDragTask(tasks, active.id)
      const target = over ? describeDragTarget(over.id, weekStart, weekLength) : null
      return target ? `Dropped ${task} on ${target}.` : `Dropped ${task} without moving it.`
    },
    onDragCancel: ({ active }) => `Cancelled moving ${describeDragTask(tasks, active.id)}.`,
  }
}

function TaskDragPreview({ task }: { task: Task }) {
  return (
    <div
      className={`task-item task-item--overlay${task.completed ? ' task-item--done' : ''}${task.priority ? ' task-item--priority' : ''}`}
      aria-hidden="true"
    >
      <span className="task-checkbox">{task.completed ? <span>✓</span> : null}</span>
      {task.label ? (
        <span className={`task-category-chip task-category-chip--${task.label}`}>
          <span className="category-icon">{task.label === 'Work' ? '💼' : '🏠'}</span>
        </span>
      ) : null}
      <span className="task-text">{task.text}</span>
      {task.priority ? (
        <span className="task-priority task-priority--active">
          <span>★</span>
        </span>
      ) : null}
    </div>
  )
}

export default function App() {
  const { state, dispatch, storageIssue, resolveStorageIssue } = useWeekStore()
  const [showReview, setShowReview] = useState(false)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [viewMode, setViewMode] = useState<'week' | 'day'>(state.settings.homeView)
  const importInputRef = useRef<HTMLInputElement>(null)
  const todayIdx = getTodayIndex(state.weekStart, state.settings.weekLength)
  const effectiveViewMode = todayIdx === -1 ? 'week' : viewMode
  const taskLimitReached = state.tasks.length >= MAX_TOTAL_TASKS
  const dragAnnouncements = useMemo(
    () => createDragAnnouncements(state.tasks, state.weekStart, state.settings.weekLength),
    [state.tasks, state.weekStart, state.settings.weekLength],
  )

  useEffect(() => {
    if (todayIdx === -1) setViewMode('week')
  }, [todayIdx])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  )

  function onDragStart({ active }: DragStartEvent) {
    setActiveTask(state.tasks.find(task => task.id === active.id) ?? null)
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setActiveTask(null)
    if (!over) return
    const taskId = String(active.id)
    const task = state.tasks.find(candidate => candidate.id === taskId)
    const overId = String(over.id)
    if (!task || !overId.startsWith('day-')) return
    const dayIndex = Number(overId.slice(4))
    if (Number.isInteger(dayIndex) && dayIndex !== task.dayIndex) {
      dispatch({ type: 'MOVE_TASK', id: taskId, toDayIndex: dayIndex })
    }
  }

  async function handleImport(file: File) {
    try {
      const imported = parseImport(await readJsonFile(file))
      if (state.tasks.length > 0 && !window.confirm('Replace all current local tasks with the imported data?')) return
      dispatch({ type: 'LOAD', state: imported })
      setViewMode(imported.settings.homeView)
    } catch (error) {
      window.alert(`Import failed: ${(error as Error).message}`)
    } finally {
      if (importInputRef.current) importInputRef.current.value = ''
    }
  }

  function handleStorageIssue() {
    if (!storageIssue) return
    if (
      storageIssue.kind === 'load'
      && !window.confirm('Replace the unreadable saved browser data with the planner currently shown? The old local data cannot be recovered after replacement.')
    ) return

    resolveStorageIssue()
  }

  return (
    <DndContext
      sensors={sensors}
      accessibility={{ announcements: dragAnnouncements }}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveTask(null)}
    >
      <div className="app">
        <Header
          weekStart={state.weekStart}
          weekLength={state.settings.weekLength}
          viewMode={effectiveViewMode}
          onToggleView={() => setViewMode(current => current === 'week' ? 'day' : 'week')}
          onNewWeek={() => setShowReview(true)}
          onImport={() => importInputRef.current?.click()}
          onExport={() => exportData(state)}
        />
        {storageIssue ? (
          <section className="storage-alert" role="alert" aria-live="assertive">
            <div>
              <strong>{storageIssue.kind === 'load' ? 'Saved data could not be loaded.' : 'Changes are not saved.'}</strong>{' '}
              <span>{storageIssue.message}</span>
            </div>
            <button className="btn" type="button" onClick={handleStorageIssue}>
              {storageIssue.kind === 'load' ? 'Replace saved data' : 'Retry save'}
            </button>
          </section>
        ) : null}
        <input
          ref={importInputRef}
          className="visually-hidden"
          type="file"
          tabIndex={-1}
          accept="application/json,.json"
          aria-label="Import planner data"
          onChange={event => {
            const file = event.target.files?.[0]
            if (file) void handleImport(file)
          }}
        />

        <main className={effectiveViewMode === 'day' ? 'week-view week-view--day' : 'week-view'}>
          {effectiveViewMode === 'week' ? (
            <div className="week-grid">
              {Array.from({ length: state.settings.weekLength }, (_, dayIndex) => (
                <DayColumn
                  key={dayIndex}
                  dayIndex={dayIndex}
                  weekStart={state.weekStart}
                  tasks={state.tasks.filter(task => task.dayIndex === dayIndex)}
                  onAddTask={(text, label) => dispatch({ type: 'ADD_TASK', dayIndex, text, label })}
                  onToggleTask={id => dispatch({ type: 'TOGGLE_TASK', id })}
                  onDeleteTask={id => dispatch({ type: 'DELETE_TASK', id })}
                  onTogglePriority={id => dispatch({ type: 'TOGGLE_PRIORITY', id })}
                  onSetLabel={(id, label) => dispatch({ type: 'SET_TASK_LABEL', id, label })}
                  onEditTask={(id, text) => dispatch({ type: 'EDIT_TASK', id, text })}
                  settings={state.settings}
                  taskLimitReached={taskLimitReached}
                />
              ))}
            </div>
          ) : (
            <DayView
              weekStart={state.weekStart}
              tasks={state.tasks}
              todayIdx={todayIdx}
              onAddTask={(dayIndex, text, label) => dispatch({ type: 'ADD_TASK', dayIndex, text, label })}
              onToggleTask={id => dispatch({ type: 'TOGGLE_TASK', id })}
              onDeleteTask={id => dispatch({ type: 'DELETE_TASK', id })}
              onTogglePriority={id => dispatch({ type: 'TOGGLE_PRIORITY', id })}
              onSetLabel={(id, label) => dispatch({ type: 'SET_TASK_LABEL', id, label })}
              onMoveTask={(id, toDayIndex) => dispatch({ type: 'MOVE_TASK', id, toDayIndex })}
              onEditTask={(id, text) => dispatch({ type: 'EDIT_TASK', id, text })}
              settings={state.settings}
              taskLimitReached={taskLimitReached}
            />
          )}
        </main>

        <footer className="portfolio-attribution">
          <span>Built by </span>
          <a href="https://github.com/Andreasniss" target="_blank" rel="noreferrer">
            Andreas Nissen
          </a>
          <span aria-hidden="true"> · </span>
          <a
            href="https://github.com/Andreasniss/7dayfocus-ai-delivery-lab"
            target="_blank"
            rel="noreferrer"
          >
            Source
          </a>
        </footer>

        <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
          {activeTask ? <TaskDragPreview task={activeTask} /> : null}
        </DragOverlay>

        {showReview ? (
          <WeekReview
            weekStart={state.weekStart}
            weekLength={state.settings.weekLength}
            maxTasksPerDay={state.settings.maxTasksPerDay}
            tasks={state.tasks}
            onConfirm={(carryOverIds, newWeekStart) => {
              dispatch({ type: 'START_NEW_WEEK', carryOverIds, newWeekStart })
              setShowReview(false)
            }}
            onCancel={() => setShowReview(false)}
          />
        ) : null}
      </div>
    </DndContext>
  )
}
