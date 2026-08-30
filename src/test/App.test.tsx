import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

describe('P01 local planner smoke flow', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('adds a task and persists it in local browser storage', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('Add a task…'), 'Review the public baseline')
    await user.click(screen.getByRole('button', { name: 'Add task' }))

    expect(screen.getByText('Review the public baseline')).toBeInTheDocument()
    await waitFor(() => {
      expect(localStorage.getItem('7dayfocus-v1')).toContain('Review the public baseline')
    })
  })
})
