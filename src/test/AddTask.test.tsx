import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddTask } from '../components/AddTask'

describe('AddTask', () => {
  it('renders input, category selector, and add button', () => {
    render(<AddTask onAdd={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Set category to Work' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Set category to Life' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Add a task…')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add task' })).toBeInTheDocument()
  })

  it('add button is disabled when input is empty', () => {
    render(<AddTask onAdd={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Add task' })).toBeDisabled()
  })

  it('calls onAdd with selected label when category is chosen', async () => {
    const onAdd = vi.fn()
    render(<AddTask onAdd={onAdd} />)

    await userEvent.click(screen.getByRole('button', { name: 'Set category to Life' }))
    await userEvent.type(screen.getByPlaceholderText('Add a task…'), 'Workout')
    await userEvent.click(screen.getByRole('button', { name: 'Add task' }))

    expect(onAdd).toHaveBeenCalledWith('Workout', 'Life')
  })

  it('add button enables when text is typed', async () => {
    render(<AddTask onAdd={vi.fn()} />)
    await userEvent.type(screen.getByPlaceholderText('Add a task…'), 'Hello')
    expect(screen.getByRole('button', { name: 'Add task' })).toBeEnabled()
  })

  it('calls onAdd with trimmed text when button clicked', async () => {
    const onAdd = vi.fn()
    render(<AddTask onAdd={onAdd} />)
    await userEvent.type(screen.getByPlaceholderText('Add a task…'), '  Buy milk  ')
    await userEvent.click(screen.getByRole('button', { name: 'Add task' }))
    expect(onAdd).toHaveBeenCalledWith('Buy milk', undefined)
  })

  it('calls onAdd when Enter is pressed', async () => {
    const onAdd = vi.fn()
    render(<AddTask onAdd={onAdd} />)
    const input = screen.getByPlaceholderText('Add a task…')
    await userEvent.type(input, 'Press Enter{Enter}')
    expect(onAdd).toHaveBeenCalledWith('Press Enter', undefined)
  })

  it('clears input after submitting', async () => {
    render(<AddTask onAdd={vi.fn()} />)
    const input = screen.getByPlaceholderText('Add a task…')
    await userEvent.type(input, 'Task{Enter}')
    expect(input).toHaveValue('')
  })

  it('does not call onAdd when input is only whitespace', async () => {
    const onAdd = vi.fn()
    render(<AddTask onAdd={onAdd} />)
    await userEvent.type(screen.getByPlaceholderText('Add a task…'), '   {Enter}')
    expect(onAdd).not.toHaveBeenCalled()
  })
})

