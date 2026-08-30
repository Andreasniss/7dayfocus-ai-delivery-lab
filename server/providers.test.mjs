// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { parsePlanRequest } from './contract.mjs'
import { requestProviderPlan } from './providers.mjs'

const ID = '11111111-1111-4111-8111-111111111111'

function input(provider) {
  return parsePlanRequest({
    provider,
    model: provider === 'anthropic' ? 'claude-sonnet-5' : provider === 'openai' ? 'gpt-5.6-luna' : 'openrouter/free',
    apiKey: 'not-a-real-secret-key',
    instruction: 'Balance my week',
    state: {
      weekStart: '2026-08-31',
      settings: { maxPriority: 2, maxTasksPerDay: 5, weekStartDay: 1, weekLength: 7, homeView: 'week' },
      tasks: [{ id: ID, text: 'Test task', completed: false, dayIndex: 0 }],
    },
  })
}

const proposal = {
  summary: 'Move the task',
  changes: [{ taskId: ID, dayIndex: 1, priority: null, reason: 'Balance' }],
}

function fakeResponse(provider, status = 200) {
  if (status !== 200) return new Response('do not expose this provider body', { status })
  const text = JSON.stringify(proposal)
  const body = provider === 'anthropic'
    ? { content: [{ type: 'thinking', thinking: '' }, { type: 'text', text }] }
    : provider === 'openai'
      ? { output: [{ type: 'message', content: [{ type: 'output_text', text }] }] }
      : { choices: [{ message: { content: text } }] }
  return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } })
}

describe.each(['anthropic', 'openai', 'openrouter'])('%s provider adapter', provider => {
  it('uses the fixed endpoint and native structured-output contract', async () => {
    let captured
    const result = await requestProviderPlan(input(provider), {
      fetchImplementation: async (url, options) => {
        captured = { url, options, body: JSON.parse(options.body) }
        return fakeResponse(provider)
      },
    })

    expect(captured.url).toMatch(/^https:\/\/(api\.anthropic\.com|api\.openai\.com|openrouter\.ai)\//)
    expect(captured.options.headers).toEqual(expect.objectContaining({ 'content-type': 'application/json' }))
    expect(JSON.stringify(captured.body)).toContain('json_schema')
    if (provider === 'openai') expect(captured.body.store).toBe(false)
    if (provider === 'openrouter') expect(captured.body.provider.require_parameters).toBe(true)
    expect(result.changes[0]).toEqual({ taskId: ID, dayIndex: 1, priority: undefined, reason: 'Balance' })
  })

  it('reduces upstream errors without including response bodies or keys', async () => {
    const request = input(provider)
    await expect(requestProviderPlan(request, {
      fetchImplementation: async () => fakeResponse(provider, 401),
    })).rejects.not.toThrow('do not expose')
    await expect(requestProviderPlan(request, {
      fetchImplementation: async () => fakeResponse(provider, 401),
    })).rejects.not.toThrow(request.apiKey)
  })
})

describe('request validation', () => {
  it.each([
    ['unknown provider', { ...input('openai'), provider: 'custom' }],
    ['arbitrary model text', { ...input('openai'), model: 'https://evil.invalid' }],
    ['short key', { ...input('openai'), apiKey: 'short' }],
    ['oversized instruction', { ...input('openai'), instruction: 'x'.repeat(1001) }],
  ])('rejects %s', (_name, value) => {
    expect(() => parsePlanRequest(value)).toThrow()
  })
})
