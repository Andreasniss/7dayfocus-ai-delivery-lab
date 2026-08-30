import { useEffect, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { DayColumn } from './components/DayColumn'
import { DayView } from './components/DayView'
import { Header } from './components/Header'
import { TaskItem } from './components/TaskItem'
import { WeekReview } from './components/WeekReview'
import { useWeekStore } from './hooks/useWeekStore'
import { exportData, parseImport, readJsonFile } from './lib/dataIO'
import type { Task } from './types'
import { getTodayIndex } from './utils/dates'

export default function App() {
  const { state, dispatch } = useWeekStore()
  const [showReview, setShowReview] = useState(false)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [viewMode, setViewMode] = useState<'week' | 'day'>(state.settings.homeView)
  const importInputRef = useRef<HTMLInputElement>(null)
  const todayIdx = getTodayIndex(state.weekStart, state.settings.weekLength)

  useEffect(() => {
    if (todayIdx === -1) setViewMode('week')
  }, [todayIdx])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
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
    } catch (error) {
      window.alert(`Import failed: ${(error as Error).message}`)
    } finally {
      if (importInputRef.current) importInputRef.current.value = ''
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="app">
        <Header
          weekStart={state.weekStart}
          weekLength={state.settings.weekLength}
          viewMode={viewMode}
          onToggleView={() => setViewMode(current => current === 'week' ? 'day' : 'week')}
          onNewWeek={() => setShowReview(true)}
          onImport={() => importInputRef.current?.click()}
          onExport={() => exportData(state)}
        />
        <input
          ref={importInputRef}
          className="visually-hidden"
          type="file"
          accept="application/json,.json"
          aria-label="Import planner data"
          onChange={event => {
            const file = event.target.files?.[0]
            if (file) void handleImport(file)
          }}
        />

        <main className={viewMode === 'day' ? 'week-view week-view--day' : 'week-view'}>
          {viewMode === 'week' ? (
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
            />
          )}
        </main>

        <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
          {activeTask ? <TaskItem task={activeTask} onToggle={() => {}} onDelete={() => {}} overlay /> : null}
        </DragOverlay>

        {showReview ? (
          <WeekReview
            weekStart={state.weekStart}
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
