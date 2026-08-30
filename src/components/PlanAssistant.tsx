import { useMemo, useState } from 'react'
import { DEFAULT_MODELS, requestPlan } from '../ai/client'
import { createFixtureProposal } from '../ai/fixture'
import {
  createWeekRevision,
  validatePlanProposal,
} from '../domain/planProposal'
import type {
  PlanDiff,
  PlanProposal,
  PlanProvider,
  WeekState,
} from '../types'
import { dayDate, formatDayLabel } from '../utils/dates'

const PROVIDER_LABELS: Record<PlanProvider, string> = {
  fixture: 'Fixture demo (no key)',
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  openrouter: 'OpenRouter',
}

interface Candidate {
  proposal: PlanProposal
  diffs: PlanDiff[]
  revision: string
  provider: PlanProvider
  model: string
  state: WeekState
}

interface PlanAssistantProps {
  state: WeekState
  onApply: (revision: string, proposal: PlanProposal) => void
}

function dayName(state: WeekState, dayIndex: number): string {
  const date = dayDate(state.weekStart, dayIndex)
  const label = formatDayLabel(date)
  return `${date.toLocaleDateString('en-US', { weekday: 'short' })}, ${label.month} ${label.num}`
}

export function PlanAssistant({ state, onApply }: PlanAssistantProps) {
  const [open, setOpen] = useState(false)
  const [provider, setProvider] = useState<PlanProvider>('fixture')
  const [model, setModel] = useState(DEFAULT_MODELS.anthropic)
  const [apiKey, setApiKey] = useState('')
  const [instruction, setInstruction] = useState('Balance my week and identify the most important tasks.')
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const currentRevision = useMemo(() => createWeekRevision(state), [state])
  const stale = candidate !== null && candidate.revision !== currentRevision

  function selectProvider(next: PlanProvider) {
    setProvider(next)
    setCandidate(null)
    setMessage(null)
    if (next !== 'fixture') setModel(DEFAULT_MODELS[next])
  }

  async function generate() {
    if (provider !== 'fixture' && !apiKey.trim()) {
      setMessage(`Enter an ${PROVIDER_LABELS[provider]} API key for this request.`)
      return
    }
    if (provider !== 'fixture' && !model.trim()) {
      setMessage('Enter a provider model ID.')
      return
    }

    const requestState = state
    const revision = createWeekRevision(requestState)
    setBusy(true)
    setMessage(null)
    setCandidate(null)
    try {
      const proposal = provider === 'fixture'
        ? createFixtureProposal(requestState)
        : await requestPlan({
            provider,
            model: model.trim(),
            apiKey,
            instruction,
            state: requestState,
          })
      const { diffs } = validatePlanProposal(requestState, proposal)
      setCandidate({
        proposal,
        diffs,
        revision,
        provider,
        model: provider === 'fixture' ? 'deterministic-v1' : model.trim(),
        state: requestState,
      })
    } catch (error) {
      setMessage((error as Error).message)
    } finally {
      if (provider !== 'fixture') setApiKey('')
      setBusy(false)
    }
  }

  function apply() {
    if (!candidate) return
    if (candidate.revision !== createWeekRevision(state)) {
      setMessage('The week changed after this proposal was generated. Generate a fresh proposal.')
      return
    }
    try {
      validatePlanProposal(state, candidate.proposal)
      onApply(candidate.revision, candidate.proposal)
      setCandidate(null)
      setMessage('Proposal applied after your approval.')
    } catch (error) {
      setMessage((error as Error).message)
    }
  }

  return (
    <section className="plan-assistant" aria-labelledby="plan-assistant-title">
      <div className="plan-assistant__heading">
        <div>
          <p className="plan-assistant__eyebrow">Human-approved AI planning</p>
          <h2 id="plan-assistant-title">Plan my week</h2>
          <p>Generate a proposal first. Nothing changes until you review and approve every move.</p>
        </div>
        <button className="btn" type="button" onClick={() => setOpen(current => !current)} aria-expanded={open}>
          {open ? 'Close assistant' : 'Open assistant'}
        </button>
      </div>

      {open ? (
        <div className="plan-assistant__body">
          <div className="plan-assistant__controls">
            <label>
              Provider
              <select value={provider} onChange={event => selectProvider(event.target.value as PlanProvider)}>
                {Object.entries(PROVIDER_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            {provider !== 'fixture' ? (
              <>
                <label>
                  Model ID
                  <input value={model} onChange={event => setModel(event.target.value)} maxLength={120} />
                </label>
                <label>
                  API key
                  <input
                    type="password"
                    value={apiKey}
                    onChange={event => setApiKey(event.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                    maxLength={500}
                    placeholder="Used for this request only"
                  />
                </label>
              </>
            ) : null}
            <label className="plan-assistant__instruction">
              Planning instruction
              <textarea
                value={instruction}
                onChange={event => setInstruction(event.target.value)}
                maxLength={1000}
                rows={3}
              />
            </label>
          </div>

          <div className="plan-assistant__boundary">
            {provider === 'fixture' ? (
              <span>Fixture mode is deterministic and makes no external request.</span>
            ) : (
              <span>Your current task text and instruction go to {PROVIDER_LABELS[provider]}. The key stays in active memory and is not saved.</span>
            )}
          </div>

          <button className="btn btn--primary" type="button" onClick={() => void generate()} disabled={busy}>
            {busy ? 'Generating proposal…' : 'Generate proposal'}
          </button>

          {message ? <p className="plan-assistant__message" role="status" aria-live="polite">{message}</p> : null}

          {candidate ? (
            <section className="plan-proposal" aria-label="Plan proposal">
              <div className="plan-proposal__meta">
                <span>{PROVIDER_LABELS[candidate.provider]}</span>
                <span>{candidate.model}</span>
                <span>{candidate.diffs.length} {candidate.diffs.length === 1 ? 'change' : 'changes'}</span>
              </div>
              <h3>Review the proposed changes</h3>
              <p>{candidate.proposal.summary}</p>
              <ul className="plan-proposal__list">
                {candidate.diffs.map(diff => (
                  <li key={diff.taskId}>
                    <strong>{diff.text}</strong>
                    <span>
                      {dayName(candidate.state, diff.fromDayIndex)} → {dayName(candidate.state, diff.toDayIndex)}
                      {' · '}
                      Priority {diff.fromPriority ? 'on' : 'off'} → {diff.toPriority ? 'on' : 'off'}
                    </span>
                    <small>{diff.reason}</small>
                  </li>
                ))}
              </ul>
              {stale ? <p className="plan-assistant__warning" role="alert">This proposal is stale because the week changed.</p> : null}
              <div className="plan-proposal__actions">
                <button className="btn btn--primary" type="button" onClick={apply} disabled={stale}>
                  Approve all changes
                </button>
                <button className="btn" type="button" onClick={() => setCandidate(null)}>Dismiss proposal</button>
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
