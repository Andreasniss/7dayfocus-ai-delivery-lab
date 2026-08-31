import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App, { createDragAnnouncements } from '../App'
import { LEGACY_STORAGE_KEY, STORAGE_KEY } from '../lib/storage'
import { getWeekStart } from '../utils/dates'

describe('P01 local planner smoke flow', () => {
  function firstAddTaskInput() {
    return screen.getAllByPlaceholderText('Add a task…')[0]!
  }

  function firstAddTaskButton() {
    return screen.getAllByRole('button', { name: /^Add task/ })[0]!
  }

  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('adds a task and persists it in local browser storage', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(firstAddTaskInput(), 'Review the planner baseline')
    await user.click(firstAddTaskButton())

    expect(screen.getByText('Review the planner baseline')).toBeInTheDocument()
    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as {
        version?: number
        state?: { tasks?: Array<{ text: string }> }
      }
      expect(saved.version).toBe(2)
      expect(saved.state?.tasks?.[0]?.text).toBe('Review the planner baseline')
    })
  })

  it('links the public portfolio attribution and displays the independence disclosure', () => {
    render(<App />)

    expect(screen.getByRole('link', { name: 'Andreas Nissen' })).toHaveAttribute(
      'href',
      'https://github.com/Andreasniss',
    )
    expect(screen.getByRole('link', { name: 'andreasnissen.dev' })).toHaveAttribute(
      'href',
      'https://andreasnissen.dev',
    )
    expect(screen.getByRole('link', { name: 'Connect on LinkedIn' })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/andreasnissen',
    )
    expect(screen.getByRole('link', { name: 'Source on GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/Andreasniss/7dayfocus-ai-delivery-lab',
    )
    expect(screen.getByText(/Personal demo project/)).toHaveTextContent(
      'Views and opinions are my own. Not affiliated with or endorsed by my employer.',
    )
  })

  it('does not overwrite unreadable storage without explicit confirmation', async () => {
    const user = userEvent.setup()
    const unreadable = '{not-json'
    const readableLegacy = JSON.stringify({
      weekStart: '2026-08-24',
      tasks: [{ id: 'legacy-id', text: 'Recoverable legacy task', completed: false, dayIndex: 0 }],
    })
    localStorage.setItem(STORAGE_KEY, unreadable)
    localStorage.setItem(LEGACY_STORAGE_KEY, readableLegacy)
    const confirm = vi.fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
    vi.stubGlobal('confirm', confirm)

    render(<App />)

    expect(screen.getByRole('alert')).toHaveTextContent('Saved data could not be loaded')
    await user.click(screen.getByRole('button', { name: 'Replace saved data' }))
    expect(confirm).toHaveBeenCalledOnce()
    expect(localStorage.getItem(STORAGE_KEY)).toBe(unreadable)

    await user.click(screen.getByRole('button', { name: 'Replace saved data' }))
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')).toMatchObject({ version: 2 })
    expect(localStorage.getItem(LEGACY_STORAGE_KEY)).toBe(readableLegacy)
  })

  it('migrates the P01 storage key only after writing the current envelope', async () => {
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify({
      weekStart: '2026-08-24',
      tasks: [{ id: 'legacy-id', text: 'Keep legacy work', completed: false, dayIndex: 0 }],
    }))

    render(<App />)

    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')).toMatchObject({
        version: 2,
        state: { tasks: [{ text: 'Keep legacy work' }] },
      })
      expect(localStorage.getItem(LEGACY_STORAGE_KEY)).toBeNull()
    })
  })

  it('shows a retry action when browser storage rejects a save', async () => {
    const user = userEvent.setup()
    render(<App />)
    const setItem = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('Storage unavailable')
    })

    await user.type(firstAddTaskInput(), 'Keep the save visible')
    await user.click(firstAddTaskButton())

    expect(await screen.findByRole('alert')).toHaveTextContent('Changes are not saved')
    expect(screen.getByRole('button', { name: 'Retry save' })).toBeInTheDocument()

    setItem.mockRestore()
    await user.click(screen.getByRole('button', { name: 'Retry save' }))
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
    expect(localStorage.getItem(STORAGE_KEY)).toContain('Keep the save visible')
  })

  it('uses the configured period length in review and blocks an empty target date', async () => {
    const user = userEvent.setup()
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: 2,
      state: {
        weekStart: '2026-08-24',
        tasks: [],
        settings: {
          maxPriority: 2,
          maxTasksPerDay: 5,
          weekStartDay: 1,
          weekLength: 5,
          homeView: 'week',
        },
      },
    }))

    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Next week' }))

    expect(screen.getByText(/Moving from Aug 24–28, 2026/)).toBeInTheDocument()
    expect(screen.getByText('Aug 31 – Sep 4, 2026')).toBeInTheDocument()

    const targetDate = screen.getByLabelText('Next week start date')
    fireEvent.change(targetDate, { target: { value: '0999-01-01' } })
    expect(screen.getByText('Choose a valid start date.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start Fresh Week' })).toBeDisabled()
  })

  it('keeps rollover open and explains an over-capacity recovery selection', async () => {
    const user = userEvent.setup()
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: 2,
      state: {
        weekStart: '2026-08-24',
        tasks: Array.from({ length: 3 }, (_, index) => ({
          id: `00000000-0000-4000-8000-00000000000${index + 1}`,
          text: `Recovery task ${index + 1}`,
          completed: false,
          dayIndex: 0,
          priority: false,
        })),
        settings: {
          maxPriority: 1,
          maxTasksPerDay: 2,
          weekStartDay: 1,
          weekLength: 7,
          homeView: 'week',
        },
      },
    }))

    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Next week' }))
    await user.click(screen.getByRole('button', { name: 'All' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Mon exceeds the 2-task daily limit')
    expect(screen.getByRole('button', { name: 'Start Week · Carry 3 tasks' })).toBeDisabled()
    expect(screen.getByRole('heading', { name: 'Prepare Next Week' })).toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: /Recovery task 3/ }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start Week · Carry 2 tasks' })).toBeEnabled()
  })

  it('describes completed tasks truthfully during rollover', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(firstAddTaskInput(), 'Completed work')
    await user.click(firstAddTaskButton())
    await user.click(screen.getByRole('button', { name: 'Mark complete: Completed work' }))
    await user.click(screen.getByRole('button', { name: 'Next week' }))

    expect(screen.getByText(/1 completed task \(not carried forward\)/)).toBeInTheDocument()
    expect(screen.queryByText(/archived/i)).not.toBeInTheDocument()
  })

  it('uses task text and formatted day names in drag announcements without exposing internal IDs', () => {
    const taskId = '00000000-0000-4000-8000-000000000001'
    const announcements = createDragAnnouncements([{
      id: taskId,
      text: 'Prepare the agenda',
      completed: false,
      dayIndex: 0,
      priority: false,
    }], '2026-08-24', 7)
    const active = { id: taskId } as Parameters<typeof announcements.onDragStart>[0]['active']
    const wednesday = { id: 'day-2' } as NonNullable<Parameters<typeof announcements.onDragOver>[0]['over']>

    const messages = [
      announcements.onDragStart({ active }),
      announcements.onDragOver({ active, over: wednesday }),
      announcements.onDragEnd({ active, over: wednesday }),
      announcements.onDragCancel({ active, over: null }),
    ]

    expect(messages).toEqual([
      'Picked up task “Prepare the agenda”.',
      'Task “Prepare the agenda” is over Wednesday, Aug 26, 2026.',
      'Dropped task “Prepare the agenda” on Wednesday, Aug 26, 2026.',
      'Cancelled moving task “Prepare the agenda”.',
    ])
    expect(messages.join(' ')).not.toContain(taskId)
    expect(messages.join(' ')).not.toContain('day-2')
    expect(announcements.onDragOver({ active, over: null })).toBe(
      'Task “Prepare the agenda” is not over a planning day.',
    )
  })

  it('announces keyboard drags and renders an aria-hidden noninteractive preview', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(firstAddTaskInput(), 'Keyboard movable')
    await user.click(firstAddTaskButton())

    screen.getByRole('button', { name: 'Move task: Keyboard movable' }).focus()
    await user.keyboard('[Space]')
    expect(screen.getAllByText('Keyboard movable')).toHaveLength(2)
    expect(screen.getByRole('status')).toHaveTextContent('Picked up task “Keyboard movable”.')

    const previewText = screen.getAllByText('Keyboard movable').find(element => element.closest('.task-item--overlay'))
    const preview = previewText?.closest('.task-item--overlay')
    expect(preview).toHaveAttribute('aria-hidden', 'true')
    expect(preview).toHaveClass('task-item--overlay')
    expect(within(preview as HTMLElement).queryAllByRole('button', { hidden: true })).toHaveLength(0)
    expect(preview?.querySelector('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).toBeNull()

    await user.keyboard('{Escape}')
    expect(screen.getAllByText('Keyboard movable')).toHaveLength(1)
    expect(screen.getByRole('status')).toHaveTextContent('Cancelled moving task “Keyboard movable”.')
  })

  it('disables add fields when a recovery state reaches the global planning limit', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: 2,
      state: {
        weekStart: '2026-08-24',
        tasks: Array.from({ length: 105 }, (_, index) => ({
          id: `00000000-0000-4000-8000-${(index + 1).toString(16).padStart(12, '0')}`,
          text: `Recovery task ${index + 1}`,
          completed: false,
          dayIndex: 1,
          priority: false,
        })),
        settings: {
          maxPriority: 2,
          maxTasksPerDay: 15,
          weekStartDay: 1,
          weekLength: 7,
          homeView: 'week',
        },
      },
    }))

    render(<App />)

    const mondayInput = screen.getByRole('textbox', { name: 'Task description for Mon Aug 24' })
    expect(mondayInput).toBeDisabled()
    expect(mondayInput).toHaveAttribute('placeholder', 'Planner is full (max 105 tasks)')
  })

  it('applies the imported home view after a valid portable import', async () => {
    const user = userEvent.setup()
    render(<App />)
    const portable = new File([JSON.stringify({
      _meta: { version: '2' },
      weekStart: getWeekStart(new Date()),
      tasks: [],
      settings: {
        maxPriority: 2,
        maxTasksPerDay: 5,
        weekStartDay: 1,
        weekLength: 7,
        homeView: 'week',
      },
    })], 'planner.json', { type: 'application/json' })

    await user.upload(screen.getByLabelText('Import planner data'), portable)

    expect(await screen.findByRole('button', { name: 'Day view' })).toBeInTheDocument()
  })

  it('keeps current planner state when a portable import is rejected', async () => {
    const user = userEvent.setup()
    const alert = vi.fn()
    vi.stubGlobal('alert', alert)
    render(<App />)

    await user.type(firstAddTaskInput(), 'Keep current work')
    await user.click(firstAddTaskButton())
    const invalid = new File([JSON.stringify({
      _meta: { version: '2' },
      weekStart: getWeekStart(new Date()),
      tasks: [{ text: 'Invalid', dayIndex: 0, label: 'Unsupported' }],
      settings: {
        maxPriority: 2,
        maxTasksPerDay: 5,
        weekStartDay: 1,
        weekLength: 7,
        homeView: 'week',
      },
    })], 'invalid.json', { type: 'application/json' })

    await user.upload(screen.getByLabelText('Import planner data'), invalid)

    await waitFor(() => expect(alert).toHaveBeenCalledOnce())
    expect(screen.getByText('Keep current work')).toBeInTheDocument()
  })
})
