import { useState, useRef } from 'react'
import type { TaskLabel } from '../types'

const CATEGORY_OPTIONS: TaskLabel[] = ['Work', 'Life']

interface Props {
  onAdd: (text: string, label?: TaskLabel) => void
  disabled?: boolean
  placeholder?: string
}

export function AddTask({ onAdd, disabled, placeholder }: Props) {
  const [text, setText] = useState('')
  const [label, setLabel] = useState<TaskLabel | ''>('')
  const inputRef = useRef<HTMLInputElement>(null)

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
      <div className="add-task-categories" aria-label="Task category selector">
        {CATEGORY_OPTIONS.map(option => (
          <button
            key={option}
            type="button"
            className={`add-task-category${label === option ? ' add-task-category--active' : ''}`}
            onClick={() => setLabel(prev => (prev === option ? '' : option))}
            disabled={disabled}
            aria-pressed={label === option}
            aria-label={`Set category to ${option}`}
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
        placeholder={disabled ? (placeholder || 'Day is full') : 'Add a task…'}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') submit()
        }}
        maxLength={200}
        disabled={disabled}
      />
      <button
        className="add-task-btn"
        onClick={submit}
        aria-label="Add task"
        disabled={disabled || !text.trim()}
      >
        +
      </button>
    </div>
  )
}
