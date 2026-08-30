import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PlanAssistant } from '../components/PlanAssistant'
import type { WeekState } from '../types'

const ID = '11111111-1111-4111-8111-111111111111'

function state(dayIndex = 0): WeekState {
  return {
    weekStart: '2026-08-31',
    settings: { maxPriority: 2, maxTasksPerDay: 5, weekStartDay: 1, weekLength: 7, homeView: 'week' },
    tasks: [{ id: ID, text: 'Prepare portfolio review', completed: false, dayIndex }],
  }
}

describe('PlanAssistant', () => {
  it('generates, reviews, and explicitly approves a fixture proposal', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    render(<PlanAssistant state={state()} onApply={onApply} />)

    await user.click(screen.getByRole('button', { name: 'Open assistant' }))
    await user.click(screen.getByRole('button', { name: 'Generate proposal' }))

    expect(await screen.findByText('Review the proposed changes')).toBeInTheDocument()
    expect(screen.getByText('Prepare portfolio review')).toBeInTheDocument()
    expect(onApply).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Approve all changes' }))
    expect(onApply).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Proposal applied after your approval.')).toBeInTheDocument()
  })

  it('requires a key for a live provider without calling fetch', async () => {
    const user = userEvent.setup()
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    render(<PlanAssistant state={state()} onApply={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Open assistant' }))
    await user.selectOptions(screen.getByLabelText('Provider'), 'openai')
    await user.click(screen.getByRole('button', { name: 'Generate proposal' }))

    expect(screen.getByText('Enter an OpenAI API key for this request.')).toBeInTheDocument()
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })

  it('sends a live key only in the active request and renders a validated proposal', async () => {
    const user = userEvent.setup()
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      proposal: {
        summary: 'Move the task later',
        changes: [{ taskId: ID, dayIndex: 2, priority: true, reason: 'Balance the week' }],
      },
    }), { status: 200, headers: { 'content-type': 'application/json' } }))
    render(<PlanAssistant state={state()} onApply={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Open assistant' }))
    await user.selectOptions(screen.getByLabelText('Provider'), 'openai')
    await user.type(screen.getByLabelText('API key'), 'not-a-real-openai-key')
    await user.click(screen.getByRole('button', { name: 'Generate proposal' }))

    expect(await screen.findByText('Move the task later')).toBeInTheDocument()
    const request = fetchSpy.mock.calls[0]?.[1]
    expect(String(request?.body)).toContain('not-a-real-openai-key')
    expect(screen.getByLabelText('API key')).toHaveValue('')
    expect(localStorage.getItem('OPENAI_API_KEY')).toBeNull()
    expect(sessionStorage.getItem('OPENAI_API_KEY')).toBeNull()
    fetchSpy.mockRestore()
  })

  it('clears a typed key when the provider changes or the panel closes', async () => {
    const user = userEvent.setup()
    render(<PlanAssistant state={state()} onApply={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Open assistant' }))
    await user.selectOptions(screen.getByLabelText('Provider'), 'openai')
    await user.type(screen.getByLabelText('API key'), 'not-a-real-provider-key')
    await user.selectOptions(screen.getByLabelText('Provider'), 'anthropic')
    expect(screen.getByLabelText('API key')).toHaveValue('')

    await user.type(screen.getByLabelText('API key'), 'another-not-real-provider-key')
    await user.click(screen.getByRole('button', { name: 'Close assistant' }))
    await user.click(screen.getByRole('button', { name: 'Open assistant' }))
    expect(screen.getByLabelText('API key')).toHaveValue('')
  })

  it('blocks approval when the planner changes after generation', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()
    const view = render(<PlanAssistant state={state()} onApply={onApply} />)
    await user.click(screen.getByRole('button', { name: 'Open assistant' }))
    await user.click(screen.getByRole('button', { name: 'Generate proposal' }))
    await screen.findByText('Review the proposed changes')

    view.rerender(<PlanAssistant state={state(1)} onApply={onApply} />)
    expect(screen.getByText('This proposal is stale because the week changed.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Approve all changes' })).toBeDisabled()
  })
})
