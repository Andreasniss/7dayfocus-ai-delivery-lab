import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
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
  onMoveTo: () => void
  canMoveTo: boolean
  moveToDescriptionId: string
  onEditTask: (id: string, text: string) => void
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
    expect(screen.getByRole('button', { name: 'Mark complete: Write tests' })).toBeInTheDocument()
  })

  it('shows "Mark incomplete" label when task is completed', () => {
    renderTask({ ...baseTask, completed: true })
    expect(screen.getByRole('button', { name: 'Mark incomplete: Write tests' })).toBeInTheDocument()
  })

  it('applies done class when task is completed', () => {
    renderTask({ ...baseTask, completed: true })
    const item = screen.getByText('Write tests').closest('.task-item')
    expect(item).toHaveClass('task-item--done')
  })

  it('calls onToggle when checkbox clicked', async () => {
    const { onToggle } = renderTask(baseTask)
    await userEvent.click(screen.getByRole('button', { name: 'Mark complete: Write tests' }))
    expect(onToggle).toHaveBeenCalledOnce()
  })

  it('calls onDelete when delete button clicked', async () => {
    const { onDelete } = renderTask(baseTask)
    await userEvent.click(screen.getByRole('button', { name: 'Delete task: Write tests' }))
    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('applies overlay class when overlay prop is true', () => {
    renderTask(baseTask, { overlay: true })
    const item = screen.getByText('Write tests').closest('.task-item')
    expect(item).toHaveClass('task-item--overlay')
  })

  it('renders a category chip when task has a label', () => {
    renderTask({ ...baseTask, label: 'Work' }, { onSetLabel: vi.fn() })
    expect(screen.getByRole('button', { name: 'Change category from Work: Write tests' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change category from Work: Write tests' })).toHaveClass('task-category-chip')
  })

  it('calls onSetLabel when the category chip is clicked', async () => {
    const onSetLabel = vi.fn()
    renderTask({ ...baseTask, label: 'Work' }, { onSetLabel })
    await userEvent.click(screen.getByRole('button', { name: 'Change category from Work: Write tests' }))
    expect(onSetLabel).toHaveBeenCalledWith(undefined)
  })

  it('includes the task text in every available action name', () => {
    renderTask(
      { ...baseTask, label: 'Work' },
      { onSetLabel: vi.fn(), onMoveTo: vi.fn(), onEditTask: vi.fn() },
    )

    const names = [
      'Move task: Write tests',
      'Mark complete: Write tests',
      'Change category from Work: Write tests',
      'Edit task: Write tests',
      'Move to Today: Write tests',
      'Set as priority: Write tests',
      'Delete task: Write tests',
    ]

    names.forEach(name => {
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    })
  })

  it('limits edited task text to the domain maximum', async () => {
    renderTask(baseTask, { onEditTask: vi.fn() })
    await userEvent.click(screen.getByRole('button', { name: 'Edit task: Write tests' }))
    expect(screen.getByRole('textbox', { name: 'Edit task: Write tests' })).toHaveAttribute('maxLength', '200')
  })

  it('exposes a dedicated keyboard-focusable drag handle', () => {
    renderTask(baseTask)
    const handle = screen.getByRole('button', { name: 'Move task: Write tests' })
    expect(handle).toHaveAttribute('tabIndex', '0')
  })

  it('keeps a recovered overlong task open until it is shortened to the current limit', async () => {
    const onEditTask = vi.fn()
    renderTask({ ...baseTask, text: 'x'.repeat(250) }, { onEditTask })
    await userEvent.click(screen.getByRole('button', { name: `Edit task: ${'x'.repeat(250)}` }))

    const editor = screen.getByRole('textbox')
    expect(screen.getByRole('alert')).toHaveTextContent('currently 250')
    fireEvent.change(editor, { target: { value: 'x'.repeat(201) } })
    fireEvent.keyDown(editor, { key: 'Enter' })
    expect(onEditTask).not.toHaveBeenCalled()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('currently 201')

    fireEvent.change(editor, { target: { value: 'x'.repeat(200) } })
    fireEvent.keyDown(editor, { key: 'Enter' })
    expect(onEditTask).toHaveBeenCalledWith(baseTask.id, 'x'.repeat(200))
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('restores focus to the edit trigger after saving', async () => {
    const user = userEvent.setup()
    renderTask(baseTask, { onEditTask: vi.fn() })
    await user.click(screen.getByRole('button', { name: 'Edit task: Write tests' }))
    await user.keyboard('{Enter}')

    expect(screen.getByRole('button', { name: 'Edit task: Write tests' })).toHaveFocus()
  })

  it('restores focus to the edit trigger after cancelling', async () => {
    const user = userEvent.setup()
    renderTask(baseTask, { onEditTask: vi.fn() })
    await user.click(screen.getByRole('button', { name: 'Edit task: Write tests' }))
    await user.keyboard('{Escape}')

    expect(screen.getByRole('button', { name: 'Edit task: Write tests' })).toHaveFocus()
  })
})

describe('TaskItem priority', () => {
  it('shows "Set as priority" button when onTogglePriority is provided', () => {
    renderTask(baseTask)
    expect(screen.getByRole('button', { name: 'Set as priority: Write tests' })).toBeInTheDocument()
  })

  it('shows "Remove priority" label when task is priority', () => {
    renderTask({ ...baseTask, priority: true })
    expect(screen.getByRole('button', { name: 'Remove priority: Write tests' })).toBeInTheDocument()
  })

  it('calls onTogglePriority when star clicked', async () => {
    const { onTogglePriority } = renderTask(baseTask)
    await userEvent.click(screen.getByRole('button', { name: 'Set as priority: Write tests' }))
    expect(onTogglePriority).toHaveBeenCalledOnce()
  })

  it('disables star button when canTogglePriority is false and task is not priority', () => {
    renderTask(baseTask, { canTogglePriority: false })
    expect(screen.getByRole('button', { name: 'Set as priority: Write tests' })).toBeDisabled()
  })

  it('keeps star enabled for a priority task even when canTogglePriority is false', () => {
    renderTask({ ...baseTask, priority: true }, { canTogglePriority: false })
    expect(screen.getByRole('button', { name: 'Remove priority: Write tests' })).toBeEnabled()
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
