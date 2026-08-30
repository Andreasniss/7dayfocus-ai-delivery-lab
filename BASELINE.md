# P01 Baseline

## Status and claim boundary

P01 is the historical clean-room baseline, not a production release. The permitted summary claim for that revision is:

> P01 implements and locally verifies a static React weekly planner with empty initial state, browser-local persistence, no provider integration, and a documented option for a separately started local FastAPI companion in a later milestone.

The automated evidence does not establish manual visual quality, production readiness, security certification, adoption, reliability, or scale.

## P02 disposition

P02 started with the owner's direction before the pending P01 manual visual-QA and final-acceptance gates were closed. That sequencing does not convert either pending P01 gate into completed evidence.

P02 was reviewed, owner-accepted, and merged through [pull request #3](https://github.com/Andreasniss/7dayfocus-ai-delivery-lab/pull/3) as commit `16c04f6`. It adds a pure domain boundary, UUID v4 identifiers, versioned and validated browser persistence, bounded P01 migration, explicit storage recovery, a strict version-2 portable format with version-1 migration, and expanded adversarial tests. These delivered changes are not a production-readiness, certification, adoption, reliability, or scale claim.

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

Recorded on August 30, 2026 for the candidate tree and private root commit:

- [x] `LICENSE` contains the Apache License 2.0 text.
- [x] Repository documentation links resolve within the candidate tree.
- [x] A clean `npm ci`, lint, typecheck, 66-test run, and production build passed.
- [x] An automated application smoke test adds a fictional task and observes browser-local persistence.
- [x] Application source contains no external endpoint, analytics, telemetry, model-provider SDK, or model-provider request path. The generated Vite bundle includes its standard same-origin module-preload helper.
- [x] Gitleaks 8.30.1, TruffleHog 3.97.1 with `--no-verification`, targeted content searches, `npm audit`, and package-license inventory were run and recorded.
- [x] No image or screenshot file is present, so there is no image metadata to retain or strip in P01.
- [x] The owner authorized creation of the new repository and its continued private visibility.
- [x] The private, non-fork repository began with parentless root commit `5f1e0566e237fb63fce4cc38bbfd25b6def64648`, whose tree `f65e72bf57b9a2b11c0fbc4b46348854f68b5e27` contains the 37 reviewed files.
- [x] Remote/local Git-blob comparison matched 37 of 37 files in the initial root tree.
- [x] The predecessor was rechecked as private and unchanged at `b2ef5dd80bcc443a06a8f9b7723c75d59ca99001`.
- [x] An equivalent parentless local reconstruction with the same tree passed history-aware Gitleaks and TruffleHog scans.
- [ ] Manual browser and visual QA has not been recorded.
- [ ] Final owner acceptance of P01 has not been recorded.

**Verification constraints:** An authenticated fresh clone of the private repository was not available from the executor. History scans therefore ran against an equivalent local reconstruction with the same tree, not the exact remote commit object. No candidate-code verification completed in GitHub Actions because Actions was unavailable under an account-level restriction. Neither a fresh-clone check nor hosted CI is claimed as passed.

See [`docs/P01-DISCLOSURE-REVIEW.md`](docs/P01-DISCLOSURE-REVIEW.md) for commands, results, and limits.

## P01 limitations and P02 disposition

P01 preserves a deliberately small planner baseline. The following were disclosed P01 limitations. Merged P02 addresses the first seven; complete browser-level drag-and-drop coverage remains outside the current automated evidence:

- task and rollover identifiers use `Math.random()` rather than a collision-resistant generator;
- persisted and imported JSON is not fully validated against a versioned runtime schema or migration policy;
- storage read/write failures fall back or fail silently instead of producing a user-visible recovery path;
- reducer/domain logic remains embedded in the React hook rather than exposed as a pure module;
- domain actions do not consistently reject blank text, out-of-range day indexes, or unknown rollover identifiers;
- import validation assumes a seven-day mapping and does not fully enforce configured week length;
- capacity and completed-task semantics need an explicit decision record; and
- persistence, rollover, drag-and-drop, import/export, and recovery behavior do not yet have complete end-to-end coverage. P02 adds direct domain/storage coverage and application-level persistence, migration, import, and recovery tests, but does not claim exhaustive drag-and-drop or browser coverage.

Any applied-AI feature remains a separate scoped change with its own intent, trust boundary, tests, and owner acceptance.

## Change control

A change that adds a server, remote access, server/shared persistence, sensitive data, or an external model call crosses the P01 boundary. Before presenting it as delivered, create or update an ADR, threat assumptions, provenance, setup instructions, and verification evidence.

## License and non-affiliation

The project is licensed under Apache License 2.0. It is independent and is not affiliated with, sponsored by, or endorsed by Anthropic, OpenAI, or any other AI provider. Third-party marks belong to their respective owners.
