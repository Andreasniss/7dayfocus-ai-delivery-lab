import { parsePlanProposal } from '../domain/planProposal'
import type { PlanProposal, PlanProvider, WeekState } from '../types'

export const DEFAULT_MODELS: Record<Exclude<PlanProvider, 'fixture'>, string> = {
  anthropic: 'claude-sonnet-5',
  openai: 'gpt-5.6-luna',
  openrouter: 'openrouter/free',
}

export interface GeneratePlanInput {
  provider: Exclude<PlanProvider, 'fixture'>
  model: string
  apiKey: string
  instruction: string
  state: WeekState
}

export async function requestPlan(input: GeneratePlanInput): Promise<PlanProposal> {
  const response = await fetch('/api/plan', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new Error('The local assistant gateway returned an unreadable response.')
  }
  if (!response.ok) {
    const message = typeof (payload as { error?: { message?: unknown } })?.error?.message === 'string'
      ? (payload as { error: { message: string } }).error.message
      : 'The local assistant gateway could not generate a proposal.'
    throw new Error(message)
  }
  return parsePlanProposal((payload as { proposal?: unknown }).proposal)
}
