# P04 Plan My Week: Intent

- **Owner:** Andreas
- **Accepted:** 2026-08-31
- **Live scope:** [GitHub issue #6](https://github.com/Andreasniss/7dayfocus-ai-delivery-lab/issues/6)

## Outcome

Add a useful, inspectable AI assistant that proposes a safer weekly distribution of existing tasks while keeping every state change under explicit human control.

## Reviewer and proof

The primary reviewer is a senior applied-AI, deployment, or platform engineer. Within a short guided path, the reviewer should be able to verify:

- three provider adapters behind one bounded contract;
- credential handling that does not persist or log user keys;
- schema-constrained model output plus independent application validation;
- a visible proposal and explicit approval before mutation;
- deterministic fixture mode and adversarial tests without a provider account; and
- honest limits around local operation, provider privacy, and absent live-provider verification.

## In scope

- Anthropic, OpenAI, OpenRouter, and deterministic fixture providers.
- A loopback-only same-origin Node gateway.
- Session-memory credential entry and user-selected model IDs.
- Proposals that move existing tasks and set or clear priority.
- Atomic validation, a complete diff, stale-state detection, and explicit approval.
- Deterministic evaluations and provider adapter contract tests.

## Out of scope

- Creating, deleting, rewriting, or completing tasks.
- Automatic application, background runs, accounts, telemetry, remote persistence, or hosted credential storage.
- Storing keys in browser storage, cookies, files, URLs, logs, repository configuration, or analytics.
- Live provider verification with Andreas's credentials.
- Repository visibility changes or a release.

## Owner gate

Andreas authorized this provider-flexible BYOK implementation on 2026-08-31. Visibility and release remain separate owner-controlled decisions.
