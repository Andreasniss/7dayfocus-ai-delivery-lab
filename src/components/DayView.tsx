import { useId, useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { MAX_TOTAL_TASKS } from '../domain/weekState'
import type { Task, AppSettings } from '../types'
import { TaskItem } from './TaskItem'
import { AddTask } from './AddTask'
import { formatDayLabel, dayDate } from '../utils/dates'

interface Props {
  weekStart: string
  tasks: Task[]
  todayIdx: number
  onAddTask: (dayIndex: number, text: string, label?: Task['label']) => void
  onToggleTask: (id: string) => void
  onDeleteTask: (id: string) => void
  onTogglePriority: (id: string) => void
  onSetLabel: (id: string, label?: Task['label']) => void
  onMoveTask: (id: string, toDayIndex: number) => void
  onEditTask: (id: string, text: string) => void
  settings: AppSettings
  taskLimitReached?: boolean
}

function DroppableZone({
  id,
  children,
  className,
  disabled = false,
}: {
  id: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ id, disabled })
  return (
    <div ref={setNodeRef} className={`${className ?? ''}${isOver ? ' dv-drop--over' : ''}`}>
      {children}
    </div>
  )
}

function UpcomingDay({
  dayIndex,
  weekStart,
  tasks,
  onToggleTask,
  onDeleteTask,
  onTogglePriority,
  onSetLabel,
  onEditTask,
  onAddTask,
  settings,
  taskLimitReached = false,
}: {
  dayIndex: number
  weekStart: string
  tasks: Task[]
  onToggleTask: (id: string) => void
  onDeleteTask: (id: string) => void
  onTogglePriority: (id: string) => void
  onEditTask: (id: string, text: string) => void
  onAddTask: (dayIndex: number, text: string, label?: Task['label']) => void
  onSetLabel: (id: string, label?: Task['label']) => void
  settings: AppSettings
  taskLimitReached: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const date = dayDate(weekStart, dayIndex)
  const label = formatDayLabel(date)
  const disclosureId = `upcoming-day-${dayIndex}-tasks`
  const done = tasks.filter(t => t.completed).length
  const total = tasks.length
  
  const priorityTasks = tasks.filter(t => t.priority)
  const priorityFull = priorityTasks.length >= settings.maxPriority
  const dayFull = total >= settings.maxTasksPerDay
  const isOverLimit = total > settings.maxTasksPerDay
  const isOverPriority = priorityTasks.length > settings.maxPriority
  const { setNodeRef, isOver } = useDroppable({ id: `day-${dayIndex}`, disabled: dayFull })

  return (
    <div ref={setNodeRef} className={`dv-upcoming-day${isOver ? ' dv-drop--over' : ''}`}>
      <button
        type="button"
        className="dv-upcoming-row"
        aria-expanded={expanded}
        aria-controls={disclosureId}
        onClick={() => setExpanded(e => !e)}
      >
        <span className={`dv-chevron${expanded ? ' dv-chevron--open' : ''}`} aria-hidden="true">›</span>
        <span className="dv-upcoming-name">{label.name}</span>
        <span className="dv-upcoming-date">{label.num} {label.month}</span>
        {(isOverLimit || isOverPriority) && (
          <span className="day-limit-pill day-limit-pill--small" title="Exceeds focus limits">
            {isOverLimit ? total : priorityTasks.length}
          </span>
        )}
        {total > 0 && (
          <span className={`dv-upcoming-count${done === total ? ' dv-upcoming-count--done' : ''}`}>
            {done}/{total}
          </span>
        )}
        {total === 0 && <span className="dv-upcoming-empty-label">No tasks</span>}
      </button>

      <div id={disclosureId} className="dv-upcoming-tasks" hidden={!expanded}>
          {tasks.length === 0 ? (
            <p className="day-empty" style={{ padding: '8px 16px' }}>No tasks yet</p>
          ) : (
            tasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={() => onToggleTask(task.id)}
                onDelete={() => onDeleteTask(task.id)}
                onTogglePriority={() => onTogglePriority(task.id)}
                onSetLabel={label => onSetLabel(task.id, label)}
                canTogglePriority={!priorityFull || task.priority === true}
                onEditTask={onEditTask}
              />
            ))
          )}
          <AddTask
            onAdd={(text, label) => onAddTask(dayIndex, text, label)} 
            dayLabel={`${label.name} ${label.num} ${label.month}`}
            disabled={dayFull || taskLimitReached}
            disabledReason={taskLimitReached
              ? `Planner is full (max ${MAX_TOTAL_TASKS} tasks)`
              : dayFull
                ? `Day is full (max ${settings.maxTasksPerDay})`
                : undefined}
          />
      </div>
    </div>
  )
}

export function DayView({
  weekStart,
  tasks,
  todayIdx,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onTogglePriority,
  onSetLabel,
  onMoveTask,
  onEditTask,
  settings,
  taskLimitReached = false,
}: Props) {
  const capacityStatusId = `${useId()}-overdue-today-capacity-status`

  // Group overdue: incomplete tasks from past days of this week
  const overdueDays: Array<{ dayIndex: number; label: ReturnType<typeof formatDayLabel>; tasks: Task[] }> = []
  for (let i = 0; i < todayIdx; i++) {
    const dayTasks = tasks.filter(t => t.dayIndex === i && !t.completed)
    if (dayTasks.length > 0) {
      overdueDays.push({ dayIndex: i, label: formatDayLabel(dayDate(weekStart, i)), tasks: dayTasks })
    }
  }

  const todayTasks = tasks.filter(t => t.dayIndex === todayIdx)
  const todayPriority = todayTasks.filter(t => t.priority)
  const todayRegular = todayTasks.filter(t => !t.priority)
  const totalOverdue = overdueDays.reduce((count, day) => count + day.tasks.length, 0)
  const availableToday = Math.max(0, settings.maxTasksPerDay - todayTasks.length)
  const allOverdueFitToday = totalOverdue <= availableToday
  
  const isTodayOverLimit = todayTasks.length > settings.maxTasksPerDay
  const isTodayOverPriority = todayPriority.length > settings.maxPriority
  const priorityFull = todayPriority.length >= settings.maxPriority
  const todayFull = todayTasks.length >= settings.maxTasksPerDay

  const upcomingIndices = Array.from({ length: Math.max(0, settings.weekLength - todayIdx - 1) }, (_, i) => todayIdx + 1 + i)

  function moveTasksToToday(tasksToMove: Task[]) {
    if (tasksToMove.length > availableToday) return
    tasksToMove.forEach(task => onMoveTask(task.id, todayIdx))
  }

  const capacityStatus = !allOverdueFitToday
    ? availableToday === 0
      ? 'Today is full. Move or delete a task from Today before moving an overdue task.'
      : `Today has ${availableToday} open ${availableToday === 1 ? 'slot' : 'slots'}. Move overdue tasks individually or free more space to move them all.`
    : null

  return (
    <div className="day-view">
      
      {/* ── Overdue Rescue Banner ── */}
      {overdueDays.length > 0 && (
        <div className="dv-rescue-banner">
          <div className="dv-rescue-text">
            <span className="dv-rescue-icon" aria-hidden="true">!</span>
            <span>You have {totalOverdue} tasks from previous days.</span>
            {capacityStatus ? (
              <span id={capacityStatusId} role="status" aria-live="polite">{capacityStatus}</span>
            ) : null}
          </div>
          <button 
            type="button"
            className="dv-rescue-btn"
            disabled={!allOverdueFitToday}
            aria-describedby={!allOverdueFitToday ? capacityStatusId : undefined}
            title={!allOverdueFitToday
              ? `Needs ${totalOverdue} open ${totalOverdue === 1 ? 'slot' : 'slots'}; ${availableToday} available`
              : undefined}
            onClick={() => moveTasksToToday(overdueDays.flatMap(day => day.tasks))}
          >
            Move to Today
          </button>
        </div>
      )}

      {/* ── Overdue ── */}
      {overdueDays.length > 0 && (
        <section className="dv-section dv-section--overdue">
          <div className="dv-section-header">
            <span className="dv-section-title dv-section-title--overdue">
              <span aria-hidden="true">!</span>
              Overdue
            </span>
            <span className="dv-section-count dv-section-count--overdue">
              {overdueDays.reduce((n, g) => n + g.tasks.length, 0)}
            </span>
          </div>

          {overdueDays.map(({ dayIndex, label, tasks: dayTasks }) => {
            const sourcePriorityFull = tasks.filter(
              task => task.dayIndex === dayIndex && task.priority,
            ).length >= settings.maxPriority

            return (
            <div key={dayIndex} className="dv-overdue-group">
              <div className="dv-overdue-day-header">
                <span className="dv-overdue-day-label">{label.name} {label.num}</span>
                <button
                  type="button"
                  className="dv-move-all"
                  disabled={dayTasks.length > availableToday}
                  aria-describedby={dayTasks.length > availableToday ? capacityStatusId : undefined}
                  onClick={() => moveTasksToToday(dayTasks)}
                  title={dayTasks.length > availableToday
                    ? `Needs ${dayTasks.length} open ${dayTasks.length === 1 ? 'slot' : 'slots'}; ${availableToday} available`
                    : 'Move all to Today'}
                >
                  Move all → Today
                </button>
              </div>
              {dayTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={() => onToggleTask(task.id)}
                  onDelete={() => onDeleteTask(task.id)}
                  onTogglePriority={() => onTogglePriority(task.id)}
                    onSetLabel={label => onSetLabel(task.id, label)}
                    canTogglePriority={!sourcePriorityFull || task.priority === true}
                    onMoveTo={() => moveTasksToToday([task])}
                    canMoveTo={availableToday > 0}
                    moveToDescriptionId={availableToday === 0 ? capacityStatusId : undefined}
                    onEditTask={onEditTask}
                />
              ))}
            </div>
            )
          })}
        </section>
      )}

      {/* ── Today ── */}
      <section className="dv-section dv-section--today">
        <div className="dv-section-header">
          <span className="dv-section-title dv-section-title--today">Today</span>
          {(isTodayOverLimit || isTodayOverPriority) && (
            <div className="day-limit-pill" title="Exceeds focus limits">
              {isTodayOverLimit ? `Over (${todayTasks.length}/${settings.maxTasksPerDay})` : `Prio (${todayPriority.length}/${settings.maxPriority})`}
            </div>
          )}
          {todayTasks.length > 0 && (
            <span className={`dv-section-count${todayTasks.every(t => t.completed) ? ' dv-section-count--done' : ''}`}>
              {todayTasks.filter(t => t.completed).length}/{todayTasks.length}
            </span>
          )}
        </div>

        {/* Priority subsection */}
        <div className="priority-section" style={{ borderBottom: 'none', borderTop: '1px solid var(--border)' }}>
          <div className="priority-header">
            <span className="priority-label">
              <span aria-hidden="true">★</span>
              Priority of the Day
            </span>
            <span className={`priority-count${priorityFull ? ' priority-count--full' : ''}`}>
              {todayPriority.length}/{settings.maxPriority}
            </span>
          </div>
          {todayPriority.length === 0 ? (
            <p className="priority-empty">Star a task to set it as priority</p>
          ) : (
            <div className="priority-tasks">
              {todayPriority.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={() => onToggleTask(task.id)}
                  onDelete={() => onDeleteTask(task.id)}
                  onTogglePriority={() => onTogglePriority(task.id)}
                  onSetLabel={label => onSetLabel(task.id, label)}
                  canTogglePriority={true}
                  onEditTask={onEditTask}
                />
              ))}
            </div>
          )}
        </div>

        {/* Regular tasks — droppable */}
        <DroppableZone id={`day-${todayIdx}`} className="dv-today-body" disabled={todayFull}>
          <div className="day-tasks" style={{ flex: 'none', minHeight: 48 }}>
            {todayRegular.length === 0 && (
              <p className="day-empty">{todayTasks.length === 0 ? 'No tasks yet' : ''}</p>
            )}
            {todayRegular.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={() => onToggleTask(task.id)}
                onDelete={() => onDeleteTask(task.id)}
                onTogglePriority={() => onTogglePriority(task.id)}
                onSetLabel={label => onSetLabel(task.id, label)}
                canTogglePriority={!priorityFull}
                onEditTask={onEditTask}
              />
            ))}
          </div>
          <AddTask
            onAdd={(text, label) => onAddTask(todayIdx, text, label)} 
            dayLabel="Today"
            disabled={todayFull || taskLimitReached}
            disabledReason={taskLimitReached
              ? `Planner is full (max ${MAX_TOTAL_TASKS} tasks)`
              : todayFull
                ? `Day is full (max ${settings.maxTasksPerDay})`
                : undefined}
          />
        </DroppableZone>
      </section>

      {/* ── Upcoming ── */}
      {upcomingIndices.length > 0 && (
        <section className="dv-section dv-section--upcoming">
          <div className="dv-section-header">
            <span className="dv-section-title">Upcoming</span>
            <span className="dv-section-count">
              {upcomingIndices.reduce((n, i) => n + tasks.filter(t => t.dayIndex === i).length, 0) || ''}
            </span>
          </div>
          {upcomingIndices.map(dayIndex => (
            <UpcomingDay
              key={dayIndex}
              dayIndex={dayIndex}
              weekStart={weekStart}
              tasks={tasks.filter(t => t.dayIndex === dayIndex)}
              onToggleTask={onToggleTask}
              onDeleteTask={onDeleteTask}
              onTogglePriority={onTogglePriority}
              onSetLabel={onSetLabel}
              onEditTask={onEditTask}
              onAddTask={onAddTask}
              settings={settings}
              taskLimitReached={taskLimitReached}
            />
          ))}
        </section>
      )}
    </div>
  )
}
