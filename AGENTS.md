# Repository Instructions for AI-Assisted Work

These instructions apply to every file in this repository. Human owner: **Andreas**.

## Purpose and current boundary

This repository is an inspectable portfolio reference for AI-assisted software delivery. It is not a production service or evidence of affiliation with an AI provider or employer.

P02 stabilized the planner domain and browser persistence. P03 prepared a truthful public-release candidate without changing visibility. P04 added the accepted local BYOK proposal workflow in issue #6. P11 adds a fixture-only Tauri v2 Android shell under issue #17. Do not add accounts, telemetry, remote persistence, hosted credentials, real customer or employer data, or model-driven mutations beyond the P04 contract.

## Source of truth

- Before a pull request exists, the active GitHub issue is the live source of truth. Once opened, the pull request is authoritative for the candidate diff, review findings, and approval; the linked issue remains authoritative for backlog scope and status.
- The change packet under `docs/ai-dlc/changes/` records intent, specification, plan, and evidence for the corresponding change. It is a committed snapshot, not a replacement for GitHub status.
- Architecture decisions live in `docs/adr/`.
- Do not mark a check as passed until the named command or review has actually completed on the candidate revision.

## Required working sequence

1. Read the change's `intent.md`, `spec.md`, and `plan.md` before editing.
2. For changes started after the P02 transition, do not begin implementation until Andreas's acceptance of the intent, specification, and plan is recorded. P02 is the explicitly disclosed mid-change exception.
3. Stop and ask Andreas when scope, user impact, data-loss risk, or a production/publication boundary is ambiguous.
4. Keep domain decisions in pure modules and side effects at explicit adapters or UI boundaries.
5. Add or update tests with behavior changes.
6. Run the smallest relevant check while iterating, then run the complete verification gate before requesting merge.
7. Record only observed results in the change's `evidence.md` and surface open findings in the pull request.

## Commands

Use the Node.js version selected by `.nvmrc` and the locked npm graph.

```bash
nvm use
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
npm run verify
```

`npm run verify` is the local merge gate. GitHub-hosted CI is not available evidence unless a workflow actually runs successfully and its result is linked in the pull request.

## Domain and persistence rules

- Treat imported and stored JSON as untrusted input.
- Validate the storage version and the complete runtime shape before use.
- Do not silently overwrite unreadable or unsupported stored data.
- Generate new task and migrated/imported identifiers with `crypto.randomUUID()`.
- Keep reducer transitions deterministic and free of storage, time, UI, and network side effects.
- Reject invalid actions atomically; do not partially apply rollover, migration, or settings changes.
- Preserve P01-reachable legacy data within the documented recovery bounds, including long text, higher task counts, and pre-existing over-capacity data, while preventing new actions from worsening an invalid state.
- Apply the 200-character and 105-task planning limits to new actions and the strict portable format; do not silently truncate a recoverable legacy value.
- All tasks, including completed tasks, count toward daily capacity.
- Moving a task to a different day resets its completion and priority state.

## P04 provider and approval rules

- Bind the gateway to loopback and map the provider enum to fixed HTTPS origins; never accept an arbitrary base URL.
- Never persist, log, echo, export, or commit an API key, prompt transcript, or provider response.
- Treat provider responses as untrusted even when structured outputs are enabled.
- Models may propose only moves and priority changes for existing incomplete tasks.
- Validate the complete proposal against the current snapshot and capacity rules before showing or applying it.
- Require one explicit human approval and apply through one atomic domain action; reject stale proposals without mutation.
- Keep fixture mode credential-free and free of external network requests.

## P11 Android rules

- Packaged Tauri mode exposes only the deterministic fixture. Do not offer live providers or call `/api/plan` from the Android shell.
- Keep the Tauri capability set minimal. Do not add HTTP, filesystem, shell, authentication, deep-link, remote-sync, or credential plugins without a later accepted design and threat review.
- Keep signing keys, passwords, device identifiers, generated local paths, and Play Console exports out of Git.
- Do not claim an APK, device installation, mobile behavior, signing, or Play availability until the exact revision is built and observed in the required environment.
- Physical-device success is the required P11 outcome. Google Play remains optional and capped at three focused hours after device success.

## Review and evidence

Follow `REVIEW.md`. A clean tool result is evidence for that tool only; it is not a production-readiness, security, accessibility, or visual-quality claim. Preserve failed checks and known limitations in the pull request or evidence record until resolved or explicitly accepted by Andreas.

Do not commit raw chat transcripts, prompt histories, hidden reasoning, private chain-of-thought, credentials, personal data, or confidential operational material. Record concise decisions, assumptions, inputs, outputs, and verifiable evidence instead.

## Independence

The process is derived from selected public Anthropic guidance and uses provider-neutral repository conventions. It is not an Anthropic standard, certification, endorsement, approval, or compliance claim. Do not describe this repository or its process as "Anthropic-compliant."
