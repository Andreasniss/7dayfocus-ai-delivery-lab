import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddTask } from '../components/AddTask'

const DAY_LABEL = 'Monday Aug 30'

describe('AddTask', () => {
  it('renders input, category selector, and add button', () => {
    render(<AddTask onAdd={vi.fn()} dayLabel={DAY_LABEL} />)
    expect(screen.getByRole('group', { name: `Task category for ${DAY_LABEL}` })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: `Set Work category for ${DAY_LABEL}` })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: `Set Life category for ${DAY_LABEL}` })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Add a task…')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: `Add task for ${DAY_LABEL}` })).toBeInTheDocument()
  })

  it('gives every control a day-specific accessible name', () => {
    render(<AddTask onAdd={vi.fn()} dayLabel={DAY_LABEL} />)
    expect(screen.getByRole('group', { name: `Task category for ${DAY_LABEL}` })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: `Set Work category for ${DAY_LABEL}` })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: `Set Life category for ${DAY_LABEL}` })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: `Task description for ${DAY_LABEL}` })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: `Add task for ${DAY_LABEL}` })).toBeInTheDocument()
  })

  it('add button is disabled when input is empty', () => {
    render(<AddTask onAdd={vi.fn()} dayLabel={DAY_LABEL} />)
    expect(screen.getByRole('button', { name: `Add task for ${DAY_LABEL}` })).toBeDisabled()
  })

  it('calls onAdd with selected label when category is chosen', async () => {
    const onAdd = vi.fn()
    render(<AddTask onAdd={onAdd} dayLabel={DAY_LABEL} />)

    await userEvent.click(screen.getByRole('button', { name: `Set Life category for ${DAY_LABEL}` }))
    await userEvent.type(screen.getByPlaceholderText('Add a task…'), 'Workout')
    await userEvent.click(screen.getByRole('button', { name: `Add task for ${DAY_LABEL}` }))

    expect(onAdd).toHaveBeenCalledWith('Workout', 'Life')
  })

  it('add button enables when text is typed', async () => {
    render(<AddTask onAdd={vi.fn()} dayLabel={DAY_LABEL} />)
    await userEvent.type(screen.getByPlaceholderText('Add a task…'), 'Hello')
    expect(screen.getByRole('button', { name: `Add task for ${DAY_LABEL}` })).toBeEnabled()
  })

  it('calls onAdd with trimmed text when button clicked', async () => {
    const onAdd = vi.fn()
    render(<AddTask onAdd={onAdd} dayLabel={DAY_LABEL} />)
    await userEvent.type(screen.getByPlaceholderText('Add a task…'), '  Buy milk  ')
    await userEvent.click(screen.getByRole('button', { name: `Add task for ${DAY_LABEL}` }))
    expect(onAdd).toHaveBeenCalledWith('Buy milk', undefined)
  })

  it('calls onAdd when Enter is pressed', async () => {
    const onAdd = vi.fn()
    render(<AddTask onAdd={onAdd} dayLabel={DAY_LABEL} />)
    const input = screen.getByPlaceholderText('Add a task…')
    await userEvent.type(input, 'Press Enter{Enter}')
    expect(onAdd).toHaveBeenCalledWith('Press Enter', undefined)
  })

  it('clears input after submitting', async () => {
    render(<AddTask onAdd={vi.fn()} dayLabel={DAY_LABEL} />)
    const input = screen.getByPlaceholderText('Add a task…')
    await userEvent.type(input, 'Task{Enter}')
    expect(input).toHaveValue('')
  })

  it('does not call onAdd when input is only whitespace', async () => {
    const onAdd = vi.fn()
    render(<AddTask onAdd={onAdd} dayLabel={DAY_LABEL} />)
    await userEvent.type(screen.getByPlaceholderText('Add a task…'), '   {Enter}')
    expect(onAdd).not.toHaveBeenCalled()
  })

  it('renders and associates the disabled capacity reason with every control', () => {
    const reasonText = 'Day is full (max 5)'
    render(
      <AddTask
        onAdd={vi.fn()}
        dayLabel={DAY_LABEL}
        disabled
        disabledReason={reasonText}
      />,
    )

    const reason = screen.getByText(reasonText)
    expect(reason).toBeVisible()
    const controls = [
      screen.getByRole('group', { name: `Task category for ${DAY_LABEL}` }),
      screen.getByRole('button', { name: `Set Work category for ${DAY_LABEL}` }),
      screen.getByRole('button', { name: `Set Life category for ${DAY_LABEL}` }),
      screen.getByRole('textbox', { name: `Task description for ${DAY_LABEL}` }),
      screen.getByRole('button', { name: `Add task for ${DAY_LABEL}` }),
    ]

    controls.forEach(control => {
      expect(control).toHaveAttribute('aria-describedby', reason.id)
    })
  })
})
