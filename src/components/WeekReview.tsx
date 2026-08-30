import { useEffect, useId, useRef, useState } from 'react'
import { getCarryOverCapacityIssue, isIsoDate } from '../domain/weekState'
import type { Task } from '../types'
import { dayDate, formatDayLabel, formatWeekRange, getNextWeekStart } from '../utils/dates'

interface Props {
  weekStart: string
  weekLength: number
  maxTasksPerDay: number
  tasks: Task[]
  onConfirm: (carryOverIds: string[], newWeekStart: string) => void
  onCancel: () => void
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'details > summary:first-of-type',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter(element => element.closest('[hidden]') === null && element.getAttribute('aria-hidden') !== 'true')
}

export function WeekReview({
  weekStart,
  weekLength,
  maxTasksPerDay,
  tasks,
  onConfirm,
  onCancel,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [targetDate, setTargetDate] = useState(getNextWeekStart(weekStart))
  const modalRef = useRef<HTMLDivElement>(null)
  const onCancelRef = useRef(onCancel)
  const titleId = useId()
  const targetDateIsValid = isIsoDate(targetDate)

  onCancelRef.current = onCancel

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    const modal = modalRef.current

    if (!modal) return
    const dialog: HTMLDivElement = modal

    const initialFocusTarget = getFocusableElements(dialog)[0] ?? dialog
    initialFocusTarget.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCancelRef.current()
        return
      }

      if (event.key !== 'Tab') return

      const focusableElements = getFocusableElements(dialog)
      if (focusableElements.length === 0) {
        event.preventDefault()
        dialog.focus()
        return
      }

      const first = focusableElements[0]
      const last = focusableElements[focusableElements.length - 1]
      const activeElement = document.activeElement

      if (event.shiftKey && (activeElement === first || !dialog.contains(activeElement))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (activeElement === last || !dialog.contains(activeElement))) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [])

  const incompleteTasks = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed)
  const selectedTasks = incompleteTasks.filter(task => selected.has(task.id))
  const capacityIssue = getCarryOverCapacityIssue(selectedTasks, {
    maxTasksPerDay,
    weekLength,
  })
  const selectionIssue = capacityIssue?.kind === 'total'
    ? `Choose at most ${capacityIssue.limit} tasks to carry forward.`
    : capacityIssue?.kind === 'day'
      ? `${formatDayLabel(dayDate(weekStart, capacityIssue.dayIndex)).name} exceeds the ${capacityIssue.limit}-task daily limit. Deselect at least one task.`
      : null

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
      <div
        ref={modalRef}
        className="review-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="review-header">
          <div>
            <h2 id={titleId} className="review-title">Prepare Next Week</h2>
            <div className="review-date-picker">
              <span className="review-date-label">Start on:</span>
              <input 
                type="date" 
                className="review-date-input"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                required
                aria-label="Next week start date"
                aria-invalid={!targetDateIsValid}
                aria-describedby={!targetDateIsValid ? 'review-date-error' : undefined}
              />
            </div>
            {!targetDateIsValid ? (
              <p id="review-date-error" className="review-date-error">Choose a valid start date.</p>
            ) : null}
            <p className="review-subtitle">
              Moving from {formatWeekRange(weekStart, weekLength)}
              <br />
              to <strong>{targetDateIsValid ? formatWeekRange(targetDate, weekLength) : 'a valid start date'}</strong>
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
                  <span className="review-task-day">
                    {formatDayLabel(dayDate(weekStart, task.dayIndex)).name}
                  </span>
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
              {completedTasks.length} completed task{completedTasks.length !== 1 ? 's' : ''} (not carried forward)
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
          {selectionIssue ? (
            <p id="review-selection-error" className="review-date-error review-selection-error" role="alert">
              {selectionIssue}
            </p>
          ) : null}
          <button className="review-btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="review-btn-confirm"
            disabled={!targetDateIsValid || selectionIssue !== null}
            aria-describedby={selectionIssue ? 'review-selection-error' : undefined}
            onClick={() => onConfirm(Array.from(selected), targetDate)}
          >
            {selected.size > 0
              ? `Start Week · Carry ${selected.size} task${selected.size !== 1 ? 's' : ''}`
              : 'Start Fresh Week'}
          </button>
        </div>
      </div>
    </div>
  )
}
