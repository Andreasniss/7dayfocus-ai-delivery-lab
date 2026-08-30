# P02 Domain Hardening: Intent

- **Owner:** Andreas
- **Captured:** 2026-08-30
- **Status:** Draft for owner acceptance in the GitHub pull request
- **Adoption note:** P02 implementation began before this lifecycle packet was created. This is a truthful mid-change capture, not a backdated pre-implementation approval.

## Problem

The P01 planner demonstrates a local weekly workflow, but its core state transitions and browser persistence are not yet strong enough to support later applied-AI experiments safely. Domain rules are coupled to a React hook, identifiers are not collision-resistant, imported and stored JSON lack a complete versioned validation boundary, and some invalid actions or storage failures can be ignored or handled silently.

Building an AI-assisted feature on that foundation would make failures harder to distinguish: a model or orchestration layer could be blamed for defects that actually originate in ordinary state, migration, or recovery behavior.

## Intended outcome

P02 should make planner behavior deterministic, testable, and explicit before applied-AI work starts:

- pure domain transitions with documented invariants;
- strict handling of untrusted stored and imported data;
- an explicit versioned browser-storage schema and deterministic legacy migration;
- collision-resistant IDs for new, migrated, imported, and carried tasks;
- visible recovery when browser storage cannot be read or written; and
- adversarial tests for boundary, malformed-input, failure, and atomicity paths.

The resulting evidence should let a reviewer inspect what the app accepts, rejects, migrates, preserves, and reports without relying on a demo narrative.

## User value

A user should not lose or silently replace saved planner data because it is malformed, unsupported, or temporarily inaccessible. Valid actions should behave consistently, and invalid actions should leave state unchanged rather than partially applying.

## Non-goals

P02 does not add:

- Claude, OpenAI, or another model-provider integration;
- a backend, cloud service, authentication, multi-user state, telemetry, or remote persistence;
- production, scale, security-certification, or accessibility-conformance claims;
- a public release or portfolio claim; or
- Claude Code hooks, custom agents, reusable skills, or hosted CI. Those controls are deferred for P03 evaluation.

## Constraints

- Keep the repository private.
- Preserve the static, local-first boundary from ADR 0001.
- Use only synthetic/fictional test data.
- Preserve recoverable legacy data; do not silently overwrite corrupt or unsupported stored data.
- Avoid a new runtime dependency unless a concrete requirement justifies it.
- Use GitHub issue #2 as the live backlog record and, once opened, the pull request as the authoritative candidate-diff, findings, and approval record.

## Success signals

P02 is ready for owner acceptance only when:

1. the specification and implementation agree on every listed invariant;
2. pure reducer and storage/migration tests cover success and adversarial paths;
3. a storage failure is visible and has an explicit recovery action;
4. `npm run verify` passes on the candidate revision;
5. known limitations and unavailable checks are recorded without inflation; and
6. Andreas reviews the pull request and explicitly accepts any remaining risk.

## Human judgment gates

Andreas must approve any choice that can discard or replace saved data, any scope change, any waived blocking finding, and the eventual public release. No agent may infer that approval from a passing test suite.
