import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DndContext } from '@dnd-kit/core'
import { TaskItem } from '../components/TaskItem'
import type { Task } from '../types'

function renderTask(task: Task, overrides: Partial<{
  onToggle: () => void
  onDelete: () => void
  onTogglePriority: () => void
  canTogglePriority: boolean
  overlay: boolean
  onSetLabel: (label: Task['label']) => void
}> = {}) {
  const props = {
    onToggle: vi.fn(),
    onDelete: vi.fn(),
    onTogglePriority: vi.fn(),
    canTogglePriority: true,
    ...overrides,
  }
  render(
    <DndContext>
      <TaskItem task={task} {...props} />
    </DndContext>
  )
  return props
}

const baseTask: Task = {
  id: 'test-1',
  text: 'Write tests',
  completed: false,
  dayIndex: 0,
}

describe('TaskItem', () => {
  it('renders the task text', () => {
    renderTask(baseTask)
    expect(screen.getByText('Write tests')).toBeInTheDocument()
  })

  it('shows "Mark complete" label when task is incomplete', () => {
    renderTask(baseTask)
    expect(screen.getByRole('button', { name: 'Mark complete' })).toBeInTheDocument()
  })

  it('shows "Mark incomplete" label when task is completed', () => {
    renderTask({ ...baseTask, completed: true })
    expect(screen.getByRole('button', { name: 'Mark incomplete' })).toBeInTheDocument()
  })

  it('applies done class when task is completed', () => {
    renderTask({ ...baseTask, completed: true })
    const item = screen.getByText('Write tests').closest('.task-item')
    expect(item).toHaveClass('task-item--done')
  })

  it('calls onToggle when checkbox clicked', async () => {
    const { onToggle } = renderTask(baseTask)
    await userEvent.click(screen.getByRole('button', { name: 'Mark complete' }))
    expect(onToggle).toHaveBeenCalledOnce()
  })

  it('calls onDelete when delete button clicked', async () => {
    const { onDelete } = renderTask(baseTask)
    await userEvent.click(screen.getByRole('button', { name: 'Delete task' }))
    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('applies overlay class when overlay prop is true', () => {
    renderTask(baseTask, { overlay: true })
    const item = screen.getByText('Write tests').closest('.task-item')
    expect(item).toHaveClass('task-item--overlay')
  })

  it('renders a category chip when task has a label', () => {
    renderTask({ ...baseTask, label: 'Work' }, { onSetLabel: vi.fn() })
    expect(screen.getByRole('button', { name: 'Change category from Work' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change category from Work' })).toHaveClass('task-category-chip')
  })

  it('calls onSetLabel when the category chip is clicked', async () => {
    const onSetLabel = vi.fn()
    renderTask({ ...baseTask, label: 'Work' }, { onSetLabel })
    await userEvent.click(screen.getByRole('button', { name: 'Change category from Work' }))
    expect(onSetLabel).toHaveBeenCalledWith(undefined)
  })
})

describe('TaskItem priority', () => {
  it('shows "Set as priority" button when onTogglePriority is provided', () => {
    renderTask(baseTask)
    expect(screen.getByRole('button', { name: 'Set as priority' })).toBeInTheDocument()
  })

  it('shows "Remove priority" label when task is priority', () => {
    renderTask({ ...baseTask, priority: true })
    expect(screen.getByRole('button', { name: 'Remove priority' })).toBeInTheDocument()
  })

  it('calls onTogglePriority when star clicked', async () => {
    const { onTogglePriority } = renderTask(baseTask)
    await userEvent.click(screen.getByRole('button', { name: 'Set as priority' }))
    expect(onTogglePriority).toHaveBeenCalledOnce()
  })

  it('disables star button when canTogglePriority is false and task is not priority', () => {
    renderTask(baseTask, { canTogglePriority: false })
    expect(screen.getByRole('button', { name: 'Set as priority' })).toBeDisabled()
  })

  it('keeps star enabled for a priority task even when canTogglePriority is false', () => {
    renderTask({ ...baseTask, priority: true }, { canTogglePriority: false })
    expect(screen.getByRole('button', { name: 'Remove priority' })).toBeEnabled()
  })

  it('does not show priority button when onTogglePriority is not provided', () => {
    render(
      <DndContext>
        <TaskItem task={baseTask} onToggle={vi.fn()} onDelete={vi.fn()} />
      </DndContext>
    )
    expect(screen.queryByRole('button', { name: /priority/i })).not.toBeInTheDocument()
  })
})

