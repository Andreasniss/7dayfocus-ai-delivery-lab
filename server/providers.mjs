import {
  PLAN_PROPOSAL_SCHEMA,
  SYSTEM_INSTRUCTION,
  buildPlanningInput,
  normalizeProposal,
} from './contract.mjs'

const ENDPOINTS = {
  anthropic: 'https://api.anthropic.com/v1/messages',
  openai: 'https://api.openai.com/v1/responses',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
}
const MAX_PROVIDER_RESPONSE_BYTES = 256 * 1024

function providerHeaders(request) {
  if (request.provider === 'anthropic') {
    return {
      'content-type': 'application/json',
      'x-api-key': request.apiKey,
      'anthropic-version': '2023-06-01',
    }
  }
  return {
    'content-type': 'application/json',
    authorization: `Bearer ${request.apiKey}`,
    ...(request.provider === 'openrouter' ? { 'x-openrouter-title': '7DayFocus AI Delivery Lab' } : {}),
  }
}

function providerBody(request) {
  const input = buildPlanningInput(request)
  if (request.provider === 'anthropic') {
    return {
      model: request.model,
      max_tokens: 2400,
      system: SYSTEM_INSTRUCTION,
      messages: [{ role: 'user', content: input }],
      output_config: { format: { type: 'json_schema', schema: PLAN_PROPOSAL_SCHEMA } },
    }
  }
  if (request.provider === 'openai') {
    return {
      model: request.model,
      instructions: SYSTEM_INSTRUCTION,
      input,
      store: false,
      text: {
        format: {
          type: 'json_schema',
          name: 'weekly_plan_proposal',
          strict: true,
          schema: PLAN_PROPOSAL_SCHEMA,
        },
      },
    }
  }
  return {
    model: request.model,
    messages: [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      { role: 'user', content: input },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: { name: 'weekly_plan_proposal', strict: true, schema: PLAN_PROPOSAL_SCHEMA },
    },
    provider: { require_parameters: true },
  }
}

function extractText(provider, payload) {
  if (provider === 'anthropic') {
    const block = Array.isArray(payload.content) && payload.content.find(item => item?.type === 'text')
    return block?.text
  }
  if (provider === 'openai') {
    if (!Array.isArray(payload.output)) return undefined
    for (const item of payload.output) {
      if (!Array.isArray(item?.content)) continue
      const part = item.content.find(candidate => candidate?.type === 'output_text')
      if (typeof part?.text === 'string') return part.text
    }
    return undefined
  }
  const content = payload.choices?.[0]?.message?.content
  return typeof content === 'string' ? content : undefined
}

function boundedProviderError(status) {
  if (status === 401 || status === 403) return 'The provider rejected the API key or access.'
  if (status === 408 || status === 504) return 'The provider request timed out.'
  if (status === 429) return 'The provider rate limit or budget was reached.'
  return 'The provider could not generate a proposal.'
}

async function readBoundedJson(response) {
  const declaredLength = Number(response.headers.get('content-length'))
  if (Number.isFinite(declaredLength) && declaredLength > MAX_PROVIDER_RESPONSE_BYTES) {
    throw new Error('The provider returned an oversized response.')
  }
  if (!response.body) throw new Error('The provider returned an unreadable response.')

  const reader = response.body.getReader()
  const chunks = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > MAX_PROVIDER_RESPONSE_BYTES) {
        await reader.cancel()
        throw new Error('The provider returned an oversized response.')
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }

  try {
    const bytes = new Uint8Array(size)
    let offset = 0
    for (const chunk of chunks) {
      bytes.set(chunk, offset)
      offset += chunk.byteLength
    }
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch (error) {
    if (error instanceof Error && error.message === 'The provider returned an oversized response.') throw error
    throw new Error('The provider returned an unreadable response.')
  }
}

export async function requestProviderPlan(request, options = {}) {
  const fetchImplementation = options.fetchImplementation ?? fetch
  const response = await fetchImplementation(ENDPOINTS[request.provider], {
    method: 'POST',
    headers: providerHeaders(request),
    body: JSON.stringify(providerBody(request)),
    signal: options.signal ?? AbortSignal.timeout(30_000),
  })

  if (!response.ok) {
    const error = new Error(boundedProviderError(response.status))
    error.status = response.status
    throw error
  }

  const payload = await readBoundedJson(response)
  const text = extractText(request.provider, payload)
  if (!text) throw new Error('The provider returned no structured proposal.')
  try {
    return normalizeProposal(JSON.parse(text))
  } catch {
    throw new Error('The provider returned invalid structured output.')
  }
}
