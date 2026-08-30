import { DndContext } from '@dnd-kit/core'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DayView } from '../components/DayView'
import type { AppSettings, Task } from '../types'

const settings: AppSettings = {
  maxPriority: 2,
  maxTasksPerDay: 5,
  weekStartDay: 1,
  weekLength: 7,
  homeView: 'day',
}

function task(id: string, dayIndex: number, overrides: Partial<Task> = {}): Task {
  return {
    id,
    text: `Task ${id}`,
    completed: false,
    dayIndex,
    ...overrides,
  }
}

function renderDayView(
  tasks: Task[],
  options: {
    onMoveTask?: (id: string, toDayIndex: number) => void
    onSetLabel?: (id: string, label?: Task['label']) => void
    settings?: AppSettings
  } = {},
) {
  const onMoveTask = options.onMoveTask ?? vi.fn()
  const onSetLabel = options.onSetLabel ?? vi.fn()

  render(
    <DndContext>
      <DayView
        weekStart="2026-08-24"
        tasks={tasks}
        todayIdx={2}
        onAddTask={vi.fn()}
        onToggleTask={vi.fn()}
        onDeleteTask={vi.fn()}
        onTogglePriority={vi.fn()}
        onSetLabel={onSetLabel}
        onMoveTask={onMoveTask}
        onEditTask={vi.fn()}
        settings={options.settings ?? settings}
      />
    </DndContext>,
  )

  return { onMoveTask, onSetLabel }
}

describe('DayView overdue capacity', () => {
  it('blocks every overdue move control and explains that completed Today tasks still fill the day', async () => {
    const fullToday = Array.from({ length: 5 }, (_, index) => task(`today-${index}`, 2, { completed: true }))
    const { onMoveTask } = renderDayView([...fullToday, task('overdue', 0)])

    expect(screen.getByText(
      'Today is full. Move or delete a task from Today before moving an overdue task.',
    )).toHaveAttribute('role', 'status')
    expect(screen.getByRole('button', { name: 'Move to Today' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Move all → Today' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Move to Today: Task overdue' })).toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: 'Move to Today' }))
    expect(onMoveTask).not.toHaveBeenCalled()
  })

  it('moves every overdue task when the complete bulk request exactly fits', async () => {
    const onMoveTask = vi.fn()
    renderDayView([
      task('today-1', 2),
      task('today-2', 2),
      task('today-3', 2),
      task('overdue-1', 0),
      task('overdue-2', 1),
    ], { onMoveTask })

    const moveAll = screen.getByRole('button', { name: 'Move to Today' })
    expect(moveAll).toBeEnabled()
    await userEvent.click(moveAll)

    expect(onMoveTask.mock.calls).toEqual([
      ['overdue-1', 2],
      ['overdue-2', 2],
    ])
  })

  it('prevents an oversized group from partially moving while keeping a fitting group and individual moves available', async () => {
    const onMoveTask = vi.fn()
    renderDayView([
      task('today-1', 2),
      task('today-2', 2),
      task('today-3', 2),
      task('today-4', 2),
      task('monday-1', 0),
      task('monday-2', 0),
      task('tuesday-1', 1),
    ], { onMoveTask })

    expect(screen.getByText(
      'Today has 1 open slot. Move overdue tasks individually or free more space to move them all.',
    )).toHaveAttribute('role', 'status')
    expect(screen.getByRole('button', { name: 'Move to Today' })).toBeDisabled()

    const groupMoves = screen.getAllByRole('button', { name: 'Move all → Today' })
    expect(groupMoves[0]).toBeDisabled()
    expect(groupMoves[1]).toBeEnabled()

    await userEvent.click(groupMoves[0])
    expect(onMoveTask).not.toHaveBeenCalled()

    await userEvent.click(groupMoves[1])
    expect(onMoveTask).toHaveBeenCalledExactlyOnceWith('tuesday-1', 2)

    expect(screen.getAllByRole('button', { name: /^Move to Today: Task / })).toHaveLength(3)
  })

  it('uses source-day priority capacity and wires category changes for overdue tasks', async () => {
    const onSetLabel = vi.fn()
    renderDayView([
      task('overdue-open', 0),
      task('today-priority', 2, { priority: true }),
    ], {
      onSetLabel,
      settings: { ...settings, maxPriority: 1 },
    })

    const overdueItem = screen.getByText('Task overdue-open').closest<HTMLElement>('.task-item')
    expect(overdueItem).not.toBeNull()
    expect(within(overdueItem!).getByRole('button', { name: 'Set as priority: Task overdue-open' })).toBeEnabled()

    await userEvent.click(within(overdueItem!).getByRole('button', { name: 'Add category: Task overdue-open' }))
    expect(onSetLabel).toHaveBeenCalledExactlyOnceWith('overdue-open', 'Life')
  })

  it('counts a completed source-day priority when disabling an overdue priority control', () => {
    renderDayView([
      task('overdue-blocked', 0),
      task('completed-priority', 0, { completed: true, priority: true }),
    ], { settings: { ...settings, maxPriority: 1 } })

    const overdueItem = screen.getByText('Task overdue-blocked').closest<HTMLElement>('.task-item')
    expect(overdueItem).not.toBeNull()
    expect(within(overdueItem!).getByRole('button', { name: 'Set as priority: Task overdue-blocked' })).toBeDisabled()
  })
})

describe('DayView disclosure semantics', () => {
  it('connects each upcoming-day disclosure to valid non-button content and labels its add-task input', async () => {
    const constrainedSettings = { ...settings, maxTasksPerDay: 1 }
    renderDayView([
      task('upcoming-1', 3),
      task('upcoming-2', 3),
    ], { settings: constrainedSettings })

    const disclosure = screen.getByText('Thu').closest('button')
    expect(disclosure).not.toBeNull()
    expect(disclosure).toHaveAttribute('aria-expanded', 'false')
    expect(disclosure).toHaveAttribute('aria-controls', 'upcoming-day-3-tasks')
    expect(disclosure?.querySelector('.day-limit-pill')?.tagName).toBe('SPAN')
    expect(disclosure?.querySelector('div')).toBeNull()

    await userEvent.click(disclosure!)

    expect(disclosure).toHaveAttribute('aria-expanded', 'true')
    expect(document.getElementById('upcoming-day-3-tasks')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Task description for Thu 27 Aug' })).toBeDisabled()
    expect(screen.getByRole('textbox', { name: 'Task description for Today' })).toBeInTheDocument()
  })
})
