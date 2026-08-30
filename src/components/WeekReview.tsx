import { useState } from 'react'
import type { Task } from '../types'
import { formatWeekRange, getNextWeekStart } from '../utils/dates'

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface Props {
  weekStart: string
  tasks: Task[]
  onConfirm: (carryOverIds: string[], newWeekStart: string) => void
  onCancel: () => void
}

export function WeekReview({ weekStart, tasks, onConfirm, onCancel }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [targetDate, setTargetDate] = useState(getNextWeekStart(weekStart))

  const incompleteTasks = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed)

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    setSelected(new Set(incompleteTasks.map(t => t.id)))
  }

  function selectNone() {
    setSelected(new Set())
  }

  return (
    <div className="review-backdrop" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="review-modal">
        <div className="review-header">
          <div>
            <h2 className="review-title">Prepare Next Week</h2>
            <div className="review-date-picker">
              <span className="review-date-label">Start on:</span>
              <input 
                type="date" 
                className="review-date-input"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
            <p className="review-subtitle">
              Moving from {formatWeekRange(weekStart)} 
              <br />
              to <strong>{formatWeekRange(targetDate)}</strong>
            </p>
          </div>
          <button className="review-close" onClick={onCancel} aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="review-summary">
          <div className="review-stat">
            <span className="review-stat-num">{completedTasks.length}</span>
            <span className="review-stat-label">completed</span>
          </div>
          <div className="review-stat-divider" />
          <div className="review-stat">
            <span className="review-stat-num">{incompleteTasks.length}</span>
            <span className="review-stat-label">unfinished</span>
          </div>
        </div>

        {incompleteTasks.length > 0 ? (
          <>
            <div className="review-section-header">
              <p className="review-section-title">
                Which unfinished tasks carry over?
              </p>
              <div className="review-select-actions">
                <button className="review-select-btn" onClick={selectAll}>All</button>
                <span className="review-select-sep">·</span>
                <button className="review-select-btn" onClick={selectNone}>None</button>
              </div>
            </div>

            <div className="review-task-list">
              {incompleteTasks.map(task => (
                <label key={task.id} className="review-task">
                  <input
                    type="checkbox"
                    className="review-task-checkbox"
                    checked={selected.has(task.id)}
                    onChange={() => toggle(task.id)}
                  />
                  <span className="review-task-day">{DAY_NAMES[task.dayIndex]}</span>
                  <span className="review-task-text">{task.text}</span>
                </label>
              ))}
            </div>
          </>
        ) : (
          <div className="review-empty">
            <p>🎉 You completed everything this week!</p>
            <p className="review-empty-sub">Start fresh — no tasks to carry over.</p>
          </div>
        )}

        {completedTasks.length > 0 && (
          <details className="review-completed-section">
            <summary className="review-completed-toggle">
              {completedTasks.length} completed task{completedTasks.length !== 1 ? 's' : ''} (archived)
            </summary>
            <div className="review-completed-list">
              {completedTasks.map(task => (
                <div key={task.id} className="review-completed-item">
                  <span aria-hidden="true">✓</span>
                  <span>{task.text}</span>
                </div>
              ))}
            </div>
          </details>
        )}

        <div className="review-actions">
          <button className="review-btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="review-btn-confirm" onClick={() => onConfirm(Array.from(selected), targetDate)}>
            {selected.size > 0
              ? `Start Week · Carry ${selected.size} task${selected.size !== 1 ? 's' : ''}`
              : 'Start Fresh Week'}
          </button>
        </div>
      </div>
    </div>
  )
}
