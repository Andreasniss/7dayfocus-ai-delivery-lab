import { useDroppable } from '@dnd-kit/core'
import { MAX_TOTAL_TASKS } from '../domain/weekState'
import type { Task, AppSettings } from '../types'
import { TaskItem } from './TaskItem'
import { AddTask } from './AddTask'
import { formatDayLabel, dayDate, isSameDay } from '../utils/dates'

interface Props {
  dayIndex: number
  weekStart: string
  tasks: Task[]
  onAddTask: (text: string, label?: Task['label']) => void
  onToggleTask: (id: string) => void
  onDeleteTask: (id: string) => void
  onTogglePriority: (id: string) => void
  onSetLabel: (id: string, label?: Task['label']) => void
  onEditTask: (id: string, text: string) => void
  settings: AppSettings
  taskLimitReached?: boolean
}

export function DayColumn({
  dayIndex,
  weekStart,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onTogglePriority,
  onSetLabel,
  onEditTask,
  settings,
  taskLimitReached = false,
}: Props) {
  const date = dayDate(weekStart, dayIndex)
  const label = formatDayLabel(date)
  const isToday = isSameDay(date, new Date())
  const isWeekend = date.getDay() === 0 || date.getDay() === 6

  const droppableId = `day-${dayIndex}`

  const priorityTasks = tasks.filter(t => t.priority)
  const regularTasks = tasks.filter(t => !t.priority)
  const priorityFull = priorityTasks.length >= settings.maxPriority
  const isOverLimit = tasks.length > settings.maxTasksPerDay
  const isOverPriority = priorityTasks.length > settings.maxPriority
  const dayFull = tasks.length >= settings.maxTasksPerDay
  const { setNodeRef, isOver } = useDroppable({ id: droppableId, disabled: dayFull })

  const done = tasks.filter(t => t.completed).length
  const total = tasks.length

  return (
    <div
      ref={setNodeRef}
      className={[
        'day-column',
        isToday ? 'day-column--today' : '',
        isWeekend ? 'day-column--weekend' : '',
        isOver ? 'day-column--over' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="day-header">
        <div className="day-header-main">
          <span className={`day-name${isToday ? ' day-name--today' : ''}`}>{label.name}</span>
          <span className={`day-num${isToday ? ' day-num--today' : ''}`}>{label.num}</span>
        </div>
        {(isOverLimit || isOverPriority) && (
          <div className="day-limit-pill" title="This day exceeds your focus limits">
            {isOverLimit ? `Over (${total}/${settings.maxTasksPerDay})` : `Prio (${priorityTasks.length}/${settings.maxPriority})`}
          </div>
        )}
        {total > 0 && (
          <span className={`day-progress${done === total ? ' day-progress--done' : ''}`}>
            {done}/{total}
          </span>
        )}
      </div>

      <div className="priority-section">
        <div className="priority-header">
          <span className="priority-label">
            <span aria-hidden="true">★</span>
            Priority of the Day
          </span>
          <span className={`priority-count${priorityFull ? ' priority-count--full' : ''}`}>
            {priorityTasks.length}/{settings.maxPriority}
          </span>
        </div>

        {priorityTasks.length === 0 ? (
          <p className="priority-empty">Star a task to set it as priority</p>
        ) : (
          <div className="priority-tasks">
            {priorityTasks.map(task => (
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

      <div className="day-tasks">
        {regularTasks.length === 0 && (
          <p className="day-empty">
            {total === 0 ? 'No tasks yet' : ''}
          </p>
        )}
        {regularTasks.map(task => (
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
        onAdd={onAddTask} 
        dayLabel={`${label.name} ${label.month} ${label.num}`}
        disabled={dayFull || taskLimitReached}
        disabledReason={taskLimitReached
          ? `Planner is full (max ${MAX_TOTAL_TASKS} tasks)`
          : dayFull
            ? `Day is full (max ${settings.maxTasksPerDay})`
            : undefined}
      />
    </div>
  )
}
