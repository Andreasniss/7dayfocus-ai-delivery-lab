import { useState } from 'react'
import type { ComponentProps } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { WeekReview } from '../components/WeekReview'

const defaultProps: ComponentProps<typeof WeekReview> = {
  weekStart: '2026-08-24',
  weekLength: 7,
  maxTasksPerDay: 5,
  tasks: [],
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
}

function renderWeekReview(overrides: Partial<ComponentProps<typeof WeekReview>> = {}) {
  const props = { ...defaultProps, ...overrides }
  render(<WeekReview {...props} />)
  return props
}

function ReviewHarness() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open week review</button>
      {isOpen ? (
        <WeekReview
          {...defaultProps}
          onCancel={() => setIsOpen(false)}
        />
      ) : null}
    </>
  )
}

describe('WeekReview dialog', () => {
  it('is labelled as a modal dialog and moves initial focus inside', async () => {
    const user = userEvent.setup()
    render(<ReviewHarness />)

    await user.click(screen.getByRole('button', { name: 'Open week review' }))

    const dialog = screen.getByRole('dialog', { name: 'Prepare Next Week' })
    const heading = screen.getByRole('heading', { name: 'Prepare Next Week' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', heading.id)
    expect(dialog).toContainElement(document.activeElement as HTMLElement)
    expect(screen.getByLabelText('Next week start date')).toHaveFocus()
  })

  it('closes on Escape and restores focus to the opener', async () => {
    const user = userEvent.setup()
    render(<ReviewHarness />)
    const opener = screen.getByRole('button', { name: 'Open week review' })

    await user.click(opener)
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
  })

  it('wraps Tab and Shift+Tab within the modal', async () => {
    const user = userEvent.setup()
    renderWeekReview()
    const first = screen.getByLabelText('Next week start date')
    const last = screen.getByRole('button', { name: 'Start Fresh Week' })

    last.focus()
    await user.tab()
    expect(first).toHaveFocus()

    first.focus()
    await user.tab({ shift: true })
    expect(last).toHaveFocus()
  })

  it('preserves carry-over capacity validation', async () => {
    const user = userEvent.setup()
    renderWeekReview({
      maxTasksPerDay: 2,
      tasks: Array.from({ length: 3 }, (_, index) => ({
        id: `task-${index + 1}`,
        text: `Recovery task ${index + 1}`,
        completed: false,
        dayIndex: 0,
        priority: false,
      })),
    })

    await user.click(screen.getByRole('button', { name: 'All' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Mon exceeds the 2-task daily limit')
    expect(screen.getByRole('button', { name: 'Start Week · Carry 3 tasks' })).toBeDisabled()

    await user.click(screen.getByRole('checkbox', { name: /Recovery task 3/ }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start Week · Carry 2 tasks' })).toBeEnabled()
  })
})
