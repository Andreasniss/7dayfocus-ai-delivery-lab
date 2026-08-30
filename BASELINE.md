# P01 Baseline

## Status and claim boundary

P01 is an acceptance candidate, not a public release. The permitted summary claim for this revision is:

> P01 implements and locally verifies a static React weekly planner with empty initial state, browser-local persistence, no provider integration, and a documented option for a separately started local FastAPI companion in a later milestone.

The automated evidence does not establish manual visual quality, production readiness, security certification, adoption, reliability, or scale.

## In scope

- A build-generated static React client.
- Local task creation, editing, completion, priority, movement, deletion, week review, and JSON import/export.
- Empty initial state, browser `localStorage`, and fictional data in tests.
- README, provenance, security policy, baseline, Apache 2.0 license, ADR 0001, and written P01 verification evidence.

## Out of scope

- Claude, Anthropic, OpenAI, or another model-provider integration.
- A FastAPI service in P01; ADR 0001 only reserves that option for later.
- API keys, remote inference, autonomous agents, or prompt orchestration.
- Accounts, authentication, multi-user access, cloud deployment, or server/shared/production persistence.
- Real customer, employer, health, financial, or other sensitive data.
- Claims of production readiness, enterprise security, reliability, performance, adoption, or scale.

## Baseline invariants

1. **Non-sensitive:** public examples are fictional and must not be confused with real people, organizations, or measured outcomes.
2. **Local-only runtime:** the application requires no remote application service, telemetry, analytics, or AI-provider call.
3. **No browser secrets:** no credential is embedded in client code or required to run the baseline.
4. **Evidence before claims:** a feature is described as delivered only after its code and relevant verification evidence are present in the same revision.
5. **Static-first:** the client builds as static assets and does not depend on a Python application server at runtime.
6. **Provider-neutral:** future integration language remains conditional and does not imply endorsement or an existing partnership.

## P01 completion evidence

Recorded on August 30, 2026 for this candidate tree:

- [x] `LICENSE` contains the Apache License 2.0 text.
- [x] Repository documentation links resolve within the candidate tree.
- [x] A clean `npm ci`, lint, typecheck, 66-test run, and production build passed.
- [x] An automated application smoke test adds a fictional task and observes browser-local persistence.
- [x] Application source contains no external endpoint, analytics, telemetry, model-provider SDK, or model-provider request path. The generated Vite bundle includes its standard same-origin module-preload helper.
- [x] Gitleaks 8.30.1, TruffleHog 3.97.1 with `--no-verification`, targeted content searches, `npm audit`, and package-license inventory were run and recorded.
- [x] No image or screenshot file is present, so there is no image metadata to retain or strip in P01.
- [ ] Manual browser and visual QA has not been recorded for this candidate.
- [ ] Human owner acceptance and creation of the fresh private repository remain pending.

See [`docs/P01-DISCLOSURE-REVIEW.md`](docs/P01-DISCLOSURE-REVIEW.md) for commands, results, and limits.

## Known limitations reserved for P02

P01 preserves a deliberately small planner baseline. These known defects are not hidden completion claims:

- task and rollover identifiers use `Math.random()` rather than a collision-resistant generator;
- persisted and imported JSON is not fully validated against a versioned runtime schema or migration policy;
- storage read/write failures fall back or fail silently instead of producing a user-visible recovery path;
- reducer/domain logic remains embedded in the React hook rather than exposed as a pure module;
- domain actions do not consistently reject blank text, out-of-range day indexes, or unknown rollover identifiers;
- import validation assumes a seven-day mapping and does not fully enforce configured week length;
- capacity and completed-task semantics need an explicit decision record; and
- persistence, rollover, drag-and-drop, import/export, and recovery behavior do not yet have complete end-to-end coverage.

P02 must stabilize these behaviors before applied-AI work begins.

## Change control

A change that adds a server, remote access, server/shared persistence, sensitive data, or an external model call crosses the P01 boundary. Before presenting it as delivered, create or update an ADR, threat assumptions, provenance, setup instructions, and verification evidence.

## License and non-affiliation

The project is intended for release under Apache License 2.0. It is independent and is not affiliated with, sponsored by, or endorsed by Anthropic, OpenAI, or any other AI provider. Third-party marks belong to their respective owners.
