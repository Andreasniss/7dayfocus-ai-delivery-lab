# P04 Plan My Week: Specification

- **Owner:** Andreas
- **Accepted:** 2026-08-31

## Provider contract

1. Supported providers are `fixture`, `anthropic`, `openai`, and `openrouter`.
2. Fixture mode requires no credential and returns a deterministic bounded proposal.
3. Live providers require a non-empty key and model ID for each request.
4. The gateway binds to loopback, accepts only same-origin `/api/plan` requests, limits request size and duration, and never logs bodies, keys, prompts, or responses.
5. Anthropic uses native Messages structured outputs. OpenAI uses Responses structured outputs with storage disabled. OpenRouter uses Chat Completions structured outputs and requires compatible routing parameters.
6. Provider errors are reduced to bounded, credential-free user messages.

## Proposal contract

1. A proposal contains a summary and one or more changes.
2. A change identifies an existing task and may set a different `dayIndex`, a boolean `priority`, or both.
3. Task IDs, text, completion, labels, settings, and week identity cannot be created or changed by a proposal.
4. Unknown, duplicate, unchanged, malformed, over-capacity, and over-priority changes reject the complete proposal.
5. Completed tasks cannot be moved or reprioritized.
6. Applying a move resets completion and priority under the existing reducer contract, after which the proposal's requested priority is applied to the moved task.

## Human-control contract

1. Generation never mutates planner state.
2. The UI shows provider, model, summary, every before/after change, and reason.
3. The user may dismiss or explicitly approve the complete proposal.
4. Approval fails without mutation if the week changed since generation or validation no longer passes.
5. Application is one atomic domain action and produces no partial update.

## Credential and data contract

1. Keys exist only in the credential input's React state and the active request/gateway call.
2. Keys are not persisted, exported, copied into lifecycle evidence, or returned in errors.
3. Live-provider requests transmit the current fictional planner state and user instruction to the selected provider. The UI discloses this before generation.
4. Fixture mode is the default reviewer path and makes no external network request.

## Verification contract

1. Unit tests cover proposal parsing, atomic validation, stale state, capacity, priority, and provider response/error handling.
2. UI tests cover fixture generation, proposal review, approval, dismissal, credential requirements, and failure without mutation.
3. At least 20 deterministic eval cases cover valid and adversarial weekly-planning scenarios.
4. Full and clean-copy verification, dependency audit, secret scan, disclosure review, and current-head review must pass before merge.
5. Live-provider correctness is not claimed without observed credentialed runs.


## Design clarification recorded by P06

The following retrospective clarification was added on 2026-09-01 after P04 merged. It describes the accepted implementation and trade-offs; it is not evidence that these words preceded implementation.

### Selected design

- Keep model access behind a loopback same-origin gateway so browser code never selects an arbitrary destination.
- Normalize every provider response into one bounded proposal contract and validate it independently of provider schema enforcement.
- Keep deterministic fixture mode as the public reviewer and automated-evaluation path.
- Apply an approved proposal through one atomic domain action rather than sequential UI mutations.
- Treat provider keys as request-scoped secrets and planner content as user-selected outbound data.

### Alternatives not selected

| Alternative | Reason not selected |
| --- | --- |
| Direct browser-to-provider requests | Inconsistent browser support and a weaker origin/credential boundary |
| Hosted credential proxy | Would add authentication, remote secret handling, abuse protection, telemetry, and production operations outside P04 |
| Provider-specific proposal shapes | Would weaken cross-provider comparison and duplicate validation/application logic |
| Automatic or partial application | Conflicts with the complete-diff and explicit-approval control contract |
| Free-form model text parsed heuristically | Provides weaker structural guarantees and poorer adversarial testability |

### Areas of concern and policy boundaries

- Live-provider retention, billing, model availability, and behavior remain provider-controlled and unverified here.
- A compromised browser, extension, operating system, or local process remains outside the key-protection boundary.
- Planner content sent in live mode must remain non-sensitive and fictional.
- Concurrent tabs are last-write-wins.
- No Anthropic, OpenAI, OpenRouter, AWS, employer, or certification endorsement is implied.
