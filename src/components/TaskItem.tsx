import { useState, useRef, useEffect } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { MAX_TASK_TEXT_LENGTH } from '../domain/weekState'
import type { Task, TaskLabel } from '../types'

interface Props {
  task: Task
  onToggle: () => void
  onDelete: () => void
  onTogglePriority?: () => void
  canTogglePriority?: boolean
  onSetLabel?: (label: TaskLabel | undefined) => void
  onMoveTo?: () => void
  canMoveTo?: boolean
  moveToDescriptionId?: string
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
  canMoveTo = true,
  moveToDescriptionId,
  onEditTask,
  overlay = false,
}: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(task.text)
  const [editError, setEditError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const editButtonRef = useRef<HTMLButtonElement>(null)
  const restoreEditFocusRef = useRef(false)
  const editErrorId = `task-edit-error-${task.id}`

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  })

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  useEffect(() => {
    if (!isEditing && restoreEditFocusRef.current) {
      restoreEditFocusRef.current = false
      editButtonRef.current?.focus()
    }
  }, [isEditing])

  const style = overlay
    ? undefined
    : {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.35 : 1,
      }

  function validateEdit(value: string): string | null {
    const trimmed = value.trim()
    if (!trimmed) return 'Task text cannot be empty.'
    if (trimmed.length > MAX_TASK_TEXT_LENGTH) {
      return `Shorten this task to ${MAX_TASK_TEXT_LENGTH} characters or fewer before saving (currently ${trimmed.length}).`
    }
    return null
  }

  function beginEditing() {
    restoreEditFocusRef.current = false
    setEditText(task.text)
    setEditError(validateEdit(task.text))
    setIsEditing(true)
  }

  function closeEditor() {
    restoreEditFocusRef.current = true
    setIsEditing(false)
  }

  function handleSave() {
    const error = validateEdit(editText)
    if (error) {
      setEditError(error)
      return
    }

    const trimmed = editText.trim()
    if (trimmed !== task.text) onEditTask?.(task.id, trimmed)
    setEditText(trimmed)
    setEditError(null)
    closeEditor()
  }

  function handleCancel() {
    setEditText(task.text)
    setEditError(null)
    closeEditor()
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-item${task.completed ? ' task-item--done' : ''}${task.priority ? ' task-item--priority' : ''}${overlay ? ' task-item--overlay' : ''}${isEditing ? ' task-item--editing' : ''}`}
    >
      {!overlay && !isEditing ? (
        <button
          type="button"
          className="task-drag-handle"
          {...listeners}
          {...attributes}
          aria-label={`Move task: ${task.text}`}
          title="Move task"
        >
          <span aria-hidden="true">⠿</span>
        </button>
      ) : null}
      <button
        type="button"
        className="task-checkbox"
        onPointerDown={e => e.stopPropagation()}
        onClick={onToggle}
        aria-label={`${task.completed ? 'Mark incomplete' : 'Mark complete'}: ${task.text}`}
      >
        {task.completed ? <span aria-hidden="true">✓</span> : null}
      </button>

      {isEditing ? (
        <>
          <input
            ref={inputRef}
            className="task-text-input"
            aria-label={`Edit task: ${task.text}`}
            aria-invalid={editError !== null}
            aria-describedby={editError ? editErrorId : undefined}
            value={editText}
            maxLength={MAX_TASK_TEXT_LENGTH}
            onChange={e => {
              setEditText(e.target.value)
              setEditError(validateEdit(e.target.value))
            }}
            onBlur={handleSave}
            onPointerDown={e => e.stopPropagation()}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSave()
              }
              if (e.key === 'Escape') {
                e.preventDefault()
                handleCancel()
              }
            }}
          />
          {editError ? (
            <span id={editErrorId} className="task-edit-error" role="alert">
              {editError}
            </span>
          ) : null}
        </>
      ) : (
        <>
          {task.label ? (
            <button
              type="button"
              className={`task-category-chip task-category-chip--${task.label}`}
              onPointerDown={e => e.stopPropagation()}
              onClick={() => onSetLabel?.(task.label === 'Life' ? 'Work' : undefined)}
              aria-label={`Change category from ${task.label}: ${task.text}`}
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
              aria-label={`Add category: ${task.text}`}
              title="Add category"
            >
              <span className="category-icon">＋</span>
            </button>
          )}
          <span
            className="task-text"
            onDoubleClick={() => onEditTask && beginEditing()}
            onClick={() => {
              // Alternatively, allow single click to edit on mobile where double click is hard.
              // Using a simple check: if no selection, open edit mode.
              if (onEditTask && window.getSelection()?.toString() === '') {
                beginEditing()
              }
            }}
          >
            {task.text}
          </span>
          {onEditTask ? (
            <button
              ref={editButtonRef}
              type="button"
              className="task-edit"
              onPointerDown={e => e.stopPropagation()}
              onClick={beginEditing}
              aria-label={`Edit task: ${task.text}`}
              title="Edit task"
            >
              <span aria-hidden="true">✎</span>
            </button>
          ) : null}
        </>
      )}

      {onMoveTo && !isEditing && (
        <button
          className="task-move-to"
          type="button"
          onPointerDown={e => e.stopPropagation()}
          onClick={onMoveTo}
          disabled={!canMoveTo}
          aria-describedby={!canMoveTo ? moveToDescriptionId : undefined}
          aria-label={`Move to Today: ${task.text}`}
        >
          → Today
        </button>
      )}

      {onTogglePriority && !isEditing && (
        <button
          className={`task-priority${task.priority ? ' task-priority--active' : ''}`}
          type="button"
          onPointerDown={e => e.stopPropagation()}
          onClick={onTogglePriority}
          disabled={!canTogglePriority && !task.priority}
          aria-label={`${task.priority ? 'Remove priority' : 'Set as priority'}: ${task.text}`}
          title={!canTogglePriority && !task.priority ? 'Priority limit reached' : undefined}
        >
          <span aria-hidden="true">{task.priority ? '★' : '☆'}</span>
        </button>
      )}

      {!isEditing && (
        <button
          className="task-delete"
          type="button"
          onPointerDown={e => e.stopPropagation()}
          onClick={onDelete}
          aria-label={`Delete task: ${task.text}`}
        >
          <span aria-hidden="true">×</span>
        </button>
      )}
    </div>
  )
}
