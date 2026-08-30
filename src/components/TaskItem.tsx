import { useState, useRef, useEffect } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Task, TaskLabel } from '../types'

interface Props {
  task: Task
  onToggle: () => void
  onDelete: () => void
  onTogglePriority?: () => void
  canTogglePriority?: boolean
  onSetLabel?: (label: TaskLabel | undefined) => void
  onMoveTo?: () => void
  onEditTask?: (id: string, text: string) => void
  overlay?: boolean
}

export function TaskItem({
  task,
  onToggle,
  onDelete,
  onTogglePriority,
  canTogglePriority = true,
  onSetLabel,
  onMoveTo,
  onEditTask,
  overlay = false,
}: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(task.text)
  const inputRef = useRef<HTMLInputElement>(null)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  })

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const style = overlay
    ? undefined
    : {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.35 : 1,
      }

  function handleSave() {
    if (editText.trim() && editText !== task.text) {
      onEditTask?.(task.id, editText)
    } else {
      setEditText(task.text) // revert on completely empty string
    }
    setIsEditing(false)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-item${task.completed ? ' task-item--done' : ''}${task.priority ? ' task-item--priority' : ''}${overlay ? ' task-item--overlay' : ''}${isEditing ? ' task-item--editing' : ''}`}
      {...(!overlay && !isEditing ? listeners : {})}
      {...(!overlay && !isEditing ? attributes : {})}
    >
      <button
        className="task-checkbox"
        onPointerDown={e => e.stopPropagation()}
        onClick={onToggle}
        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {task.completed ? <span aria-hidden="true">✓</span> : null}
      </button>

      {isEditing ? (
        <input
          ref={inputRef}
          className="task-text-input"
          value={editText}
          onChange={e => setEditText(e.target.value)}
          onBlur={handleSave}
          onPointerDown={e => e.stopPropagation()}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') {
              setEditText(task.text)
              setIsEditing(false)
            }
          }}
        />
      ) : (
        <>
          {task.label ? (
            <button
              type="button"
              className={`task-category-chip task-category-chip--${task.label}`}
              onPointerDown={e => e.stopPropagation()}
              onClick={() => onSetLabel?.(task.label === 'Life' ? 'Work' : undefined)}
              aria-label={`Change category from ${task.label}`}
              title={`Category: ${task.label}`}
            >
              <span className="category-icon">{task.label === 'Work' ? '💼' : '🏠'}</span>
            </button>
          ) : (
            <button
              type="button"
              className="task-category-chip task-category-chip--empty"
              onPointerDown={e => e.stopPropagation()}
              onClick={() => onSetLabel?.('Life')}
              aria-label="Add category"
              title="Add category"
            >
              <span className="category-icon">＋</span>
            </button>
          )}
          <span
            className="task-text"
            onDoubleClick={() => onEditTask && setIsEditing(true)}
            onClick={() => {
              // Alternatively, allow single click to edit on mobile where double click is hard.
              // Using a simple check: if no selection, open edit mode.
              if (onEditTask && window.getSelection()?.toString() === '') {
                setIsEditing(true)
              }
            }}
          >
            {task.text}
          </span>
        </>
      )}

      {onMoveTo && !isEditing && (
        <button
          className="task-move-to"
          onPointerDown={e => e.stopPropagation()}
          onClick={onMoveTo}
          aria-label="Move to today"
        >
          → Today
        </button>
      )}

      {onTogglePriority && !isEditing && (
        <button
          className={`task-priority${task.priority ? ' task-priority--active' : ''}`}
          onPointerDown={e => e.stopPropagation()}
          onClick={onTogglePriority}
          disabled={!canTogglePriority && !task.priority}
          aria-label={task.priority ? 'Remove priority' : 'Set as priority'}
          title={!canTogglePriority && !task.priority ? 'Max 2 priorities per day' : undefined}
        >
          <span aria-hidden="true">{task.priority ? '★' : '☆'}</span>
        </button>
      )}

      {!isEditing && (
        <button
          className="task-delete"
          onPointerDown={e => e.stopPropagation()}
          onClick={onDelete}
          aria-label="Delete task"
        >
          <span aria-hidden="true">×</span>
        </button>
      )}
    </div>
  )
}
