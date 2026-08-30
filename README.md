# 7DayFocus AI Delivery Lab

`7dayfocus-ai-delivery-lab` is an independent portfolio reference project for making AI-assisted software delivery inspectable: scope, decisions, evidence, and limits.

> **Status:** Private P01 committed-baseline candidate. The clean-room baseline is committed to a private, non-fork repository. Manual browser/visual QA and final P01 acceptance remain pending. This is not a public release or production service.

## What works in P01

P01 contains a local-first React weekly planner that can:

- add, edit, complete, prioritize, move, and delete tasks;
- switch between day and week views;
- review selected tasks before carrying them into a new week; and
- import and export planner data as JSON.

The application starts empty and stores user-created data in browser `localStorage`. Its runtime has no model-provider integration, hosted backend, authentication, telemetry, analytics, or remote application request.

## Run and verify

Prerequisites are Node.js 24.19.0, as selected by `.nvmrc`, and npm 11.9.0. The package manifest also permits the supported Node.js 20 and 22 release lines recorded there.

```bash
nvm use
npm ci
npm run verify
npm run dev
```

Open the local URL printed by Vite. No provider account or API key is required. `npm run verify` runs linting, TypeScript checks, 66 automated tests, and a production build.

The dated commands and results for this candidate are recorded in [`docs/P01-DISCLOSURE-REVIEW.md`](docs/P01-DISCLOSURE-REVIEW.md). Automated tests and a static build are not a claim of completed manual visual QA.

## P01 boundary

P01 deliberately excludes:

- Claude or any other model-provider integration;
- FastAPI or another application backend;
- accounts, multi-user operation, cloud deployment, or production persistence;
- real customer, employer, health, financial, or other sensitive data; and
- claims of production readiness, security certification, reliability, adoption, or scale.

The architecture decision is recorded in [`docs/adr/0001-static-react-with-later-local-fastapi.md`](docs/adr/0001-static-react-with-later-local-fastapi.md). Exact claim limits and known P02 work are in [`BASELINE.md`](BASELINE.md).

## Responsible use

Use only non-sensitive synthetic or fictional data in this pre-release baseline. Do not place secrets, confidential material, personal data, or private operational details in planner data, fixtures, screenshots, issues, or commits. See [`SECURITY.md`](SECURITY.md) and [`PROVENANCE.md`](PROVENANCE.md).

## Independence and trademarks

This is an independent project. It is not affiliated with, sponsored by, or endorsed by Anthropic, OpenAI, or any other AI model or platform provider. Claude and all other third-party names and marks belong to their respective owners.

## License

Code and documentation in this repository are licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0), subject to third-party package licenses recorded in `package-lock.json`. The complete project license text is retained in `LICENSE`.
