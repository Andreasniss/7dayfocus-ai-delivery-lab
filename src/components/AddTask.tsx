import { useId, useState, useRef } from 'react'
import { MAX_TASK_TEXT_LENGTH } from '../domain/weekState'
import type { TaskLabel } from '../types'

const CATEGORY_OPTIONS: TaskLabel[] = ['Work', 'Life']

interface Props {
  onAdd: (text: string, label?: TaskLabel) => void
  dayLabel: string
  disabled?: boolean
  disabledReason?: string
}

export function AddTask({
  onAdd,
  dayLabel,
  disabled,
  disabledReason,
}: Props) {
  const [text, setText] = useState('')
  const [label, setLabel] = useState<TaskLabel | ''>('')
  const inputRef = useRef<HTMLInputElement>(null)
  const disabledReasonId = `${useId()}-add-task-disabled-reason`
  const describedBy = disabled ? disabledReasonId : undefined
  const visibleDisabledReason = disabledReason ?? 'Adding tasks is currently unavailable.'

  function submit() {
    const trimmed = text.trim()
    if (!trimmed) return
    onAdd(trimmed, label || undefined)
    setText('')
    setLabel('')
    inputRef.current?.focus()
  }

  return (
    <div className={`add-task${disabled ? ' add-task--disabled' : ''}`}>
      <div
        className="add-task-categories"
        role="group"
        aria-label={`Task category for ${dayLabel}`}
        aria-describedby={describedBy}
      >
        {CATEGORY_OPTIONS.map(option => (
          <button
            key={option}
            type="button"
            className={`add-task-category${label === option ? ' add-task-category--active' : ''}`}
            onClick={() => setLabel(prev => (prev === option ? '' : option))}
            disabled={disabled}
            aria-pressed={label === option}
            aria-describedby={describedBy}
            aria-label={`${label === option ? 'Remove' : 'Set'} ${option} category for ${dayLabel}`}
            title={option}
          >
            <span className="category-icon">{option === 'Work' ? '💼' : '🏠'}</span>
          </button>
        ))}
      </div>

      <input
        ref={inputRef}
        className="add-task-input"
        type="text"
        aria-label={`Task description for ${dayLabel}`}
        aria-describedby={describedBy}
        placeholder={disabled ? visibleDisabledReason : 'Add a task…'}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') submit()
        }}
        maxLength={MAX_TASK_TEXT_LENGTH}
        disabled={disabled}
      />
      <button
        type="button"
        className="add-task-btn"
        onClick={submit}
        aria-label={`Add task for ${dayLabel}`}
        aria-describedby={describedBy}
        disabled={disabled || !text.trim()}
      >
        +
      </button>
      {disabled ? (
        <p id={disabledReasonId} className="add-task-disabled-reason">
          {visibleDisabledReason}
        </p>
      ) : null}
    </div>
  )
}
