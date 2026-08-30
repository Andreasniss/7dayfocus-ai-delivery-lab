// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createAppServer } from './index.mjs'

const ID = '11111111-1111-4111-8111-111111111111'
const servers = []

function requestBody() {
  return {
    provider: 'openai',
    model: 'gpt-5.6-luna',
    apiKey: 'not-a-real-secret-key',
    instruction: 'Balance my week',
    state: {
      weekStart: '2026-08-31',
      settings: { maxPriority: 2, maxTasksPerDay: 5, weekStartDay: 1, weekLength: 7, homeView: 'week' },
      tasks: [{ id: ID, text: 'Test task', completed: false, dayIndex: 0 }],
    },
  }
}

async function start(providerRequest = vi.fn(async () => ({
  summary: 'Proposal',
  changes: [{ taskId: ID, dayIndex: 1, reason: 'Balance' }],
}))) {
  const server = createAppServer({ providerRequest })
  servers.push(server)
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  return { providerRequest, url: `http://127.0.0.1:${address.port}` }
}

afterEach(async () => {
  await Promise.all(servers.splice(0).map(server => new Promise(resolve => server.close(resolve))))
})

describe('local gateway', () => {
  it('accepts a bounded loopback same-origin request', async () => {
    const { providerRequest, url } = await start()
    const response = await fetch(`${url}/api/plan`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: url },
      body: JSON.stringify(requestBody()),
    })
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.proposal.summary).toBe('Proposal')
    expect(JSON.stringify(payload)).not.toContain(requestBody().apiKey)
    expect(providerRequest).toHaveBeenCalledTimes(1)
  })

  it('rejects a non-loopback origin before provider execution', async () => {
    const { providerRequest, url } = await start()
    const response = await fetch(`${url}/api/plan`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://evil.invalid' },
      body: JSON.stringify(requestBody()),
    })
    expect(response.status).toBe(403)
    expect(providerRequest).not.toHaveBeenCalled()
  })

  it('rejects oversized requests before provider execution', async () => {
    const { providerRequest, url } = await start()
    const response = await fetch(`${url}/api/plan`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: url },
      body: JSON.stringify({ ...requestBody(), padding: 'x'.repeat(130 * 1024) }),
    })
    expect(response.status).toBe(413)
    expect(providerRequest).not.toHaveBeenCalled()
  })

  it('returns bounded errors without provider bodies or credentials', async () => {
    const providerRequest = vi.fn(async () => {
      throw Object.assign(new Error('The provider rejected the API key or access.'), { status: 401 })
    })
    const { url } = await start(providerRequest)
    const response = await fetch(`${url}/api/plan`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: url },
      body: JSON.stringify(requestBody()),
    })
    const text = await response.text()
    expect(response.status).toBe(401)
    expect(text).not.toContain(requestBody().apiKey)
    expect(text).not.toContain('not-a-real-secret-key')
  })
})
