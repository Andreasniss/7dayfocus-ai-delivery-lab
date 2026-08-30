# 7DayFocus AI Delivery Lab

`7dayfocus-ai-delivery-lab` is an independent portfolio reference project for making AI-assisted software delivery inspectable: scope, decisions, evidence, and limits.

> **Status:** Private P02 domain-hardening pull-request candidate. P01 manual browser/visual QA and final P01 acceptance remain pending; starting P02 does not retroactively satisfy those gates. This is not a public release or production service.

## What works in P01

P01 contains a local-first React weekly planner that can:

- add, edit, complete, prioritize, move, and delete tasks;
- switch between day and week views;
- review selected tasks before carrying them into a new week; and
- import and export planner data as JSON.

The application starts empty and stores user-created data in browser `localStorage`. Its runtime has no model-provider integration, hosted backend, authentication, telemetry, analytics, or remote application request.

## What the P02 candidate adds

P02 keeps the same local-only product boundary while hardening ordinary software behavior before applied-AI work begins:

- a deterministic pure domain reducer with explicit task, week, capacity, settings, move, and rollover invariants;
- UUID v4 identifiers generated outside the reducer with `crypto.randomUUID()`;
- a validated versioned browser-storage envelope and supported migration from the P01 key;
- non-destructive handling of unreadable or unsupported stored data, with visible replace/retry recovery;
- a strict version-2 portable format plus bounded migration of version-1/P01 files, always with regenerated IDs; and
- capacity-safe rollover and overdue moves, contextual controls, modal focus behavior, and human-readable keyboard-drag announcements; and
- adversarial tests for invalid actions, migration, corruption, storage failure, import, recovery, capacity, and accessibility behavior.

P02 remains a review candidate until its private pull request is accepted. The live scope and status are tracked in [GitHub issue #2](https://github.com/Andreasniss/7dayfocus-ai-delivery-lab/issues/2).

## Run and verify

Prerequisites are Node.js 24.19.0, as selected by `.nvmrc`, and npm 11.9.0. The package manifest also permits the supported Node.js 20 and 22 release lines recorded there.

```bash
nvm use
npm ci
npm run verify
npm run dev
```

Open the local URL printed by Vite. No provider account or API key is required. `npm run verify` runs linting, TypeScript checks, the current automated test suite, and a production build.

P01 evidence remains in [`docs/P01-DISCLOSURE-REVIEW.md`](docs/P01-DISCLOSURE-REVIEW.md). P02 intent, specification, plan, and observed results are recorded in [`docs/ai-dlc/changes/P02-domain-hardening/`](docs/ai-dlc/changes/P02-domain-hardening/). Automated tests and a static build are not a claim of completed manual visual QA.

## Current boundary

P02 continues to exclude:

- Claude or any other model-provider integration;
- FastAPI or another application backend;
- accounts, multi-user operation, cloud deployment, or production persistence;
- real customer, employer, health, financial, or other sensitive data; and
- claims of production readiness, security certification, reliability, adoption, or scale.

The static-first architecture decision is recorded in [`docs/adr/0001-static-react-with-later-local-fastapi.md`](docs/adr/0001-static-react-with-later-local-fastapi.md). The proposed P02 domain and persistence decision is in [`docs/adr/0002-domain-and-persistence-invariants.md`](docs/adr/0002-domain-and-persistence-invariants.md). Exact claim limits remain in [`BASELINE.md`](BASELINE.md).

## Inspectable AI-assisted delivery

The repository now includes a minimum delivery layer derived from selected public Anthropic guidance and adapted with provider-neutral project conventions:

- [`AGENTS.md`](AGENTS.md) and [`CLAUDE.md`](CLAUDE.md) for concise repository context;
- [`REVIEW.md`](REVIEW.md) for the review contract; and
- [`docs/ai-dlc/README.md`](docs/ai-dlc/README.md) for the artifact flow, direct-source boundary, and deferred controls.

This layer was introduced during P02 after implementation had begun. It is a truthful mid-change adoption record, not a backdated claim that the full artifact chain preceded the code. It is not an Anthropic standard, certification, approval, endorsement, or compliance claim.

## Responsible use

Use only non-sensitive synthetic or fictional data in this pre-release baseline. Do not place secrets, confidential material, personal data, or private operational details in planner data, fixtures, screenshots, issues, or commits. See [`SECURITY.md`](SECURITY.md) and [`PROVENANCE.md`](PROVENANCE.md).

## Independence and trademarks

This is an independent project. It is not affiliated with, sponsored by, or endorsed by Anthropic, OpenAI, or any other AI model or platform provider. Claude and all other third-party names and marks belong to their respective owners.

## License

Code and documentation in this repository are licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0), subject to third-party package licenses recorded in `package-lock.json`. The complete project license text is retained in `LICENSE`.
