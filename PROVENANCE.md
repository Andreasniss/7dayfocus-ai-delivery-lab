# Provenance

This record explains the origin of the P01 baseline and accepted P02 implementation without publishing private prompts, predecessor history, credentials, or operational data.

## Clean-room source boundary

P01 was prepared from a maintainer-controlled private predecessor snapshot at commit `b2ef5dd80bcc443a06a8f9b7723c75d59ca99001`. On August 30, 2026, that repository was rechecked as private and unchanged at the pinned commit.

The new project was created as a private, non-fork repository with fresh history. Its initial `main` commit, `5f1e0566e237fb63fce4cc38bbfd25b6def64648`, has no parents and points to tree `f65e72bf57b9a2b11c0fbc4b46348854f68b5e27`, containing the 37 reviewed files. The remote and local Git blobs matched for all 37 files. No predecessor Git objects or history were imported.

| Material | P01 treatment |
| --- | --- |
| Apache 2.0 license | Retained from the predecessor snapshot. |
| Planner UI, date and data utilities, entry point, and tests | Selected from an explicit path allowlist, then reviewed and sanitized for the local-only boundary. |
| App shell, header, store, types, styling, build configuration, and manifests | Rewritten or regenerated before the first commit. |
| Existing Git history, private documentation, prompts, screenshots, icons, environment files, auth/cloud/native code, caches, and build output | Excluded from the new project. |
| Clean-room project documentation and P01 smoke test | Authored for this clean-room project. |

The path-level source comparison and final disclosure checks are summarized in [`docs/P01-DISCLOSURE-REVIEW.md`](docs/P01-DISCLOSURE-REVIEW.md).

## Human and AI roles

- Andreas Nissen owns the product intent, scope, architecture decisions, expert review, disclosure decisions, and release acceptance.
- The predecessor planner was developed under Andreas's direction with Claude Code assistance.
- OpenAI Codex assisted with the P01 clean-room extraction, local-only refactor, documentation, test addition, and verification. Its output was treated as proposed work and subjected to deterministic checks and owner authorization for repository creation. Manual P01 visual QA remains historical pending evidence rather than a claim of completion.

AI assistance does not establish correctness. Claims in this repository are limited to evidence that was actually run or reviewed. The project does not imply that Claude, Anthropic, OpenAI, or another provider powers a P01 feature.

## P02 provenance

P02 work was authored in this fresh private repository and was not imported from the predecessor's excluded prompts, private documentation, or Git history.

- Andreas directed the P02 scope, repository boundary, and portfolio strategy and retained approval over data replacement, risk acceptance, merge, and publication.
- OpenAI Codex assisted with the domain/persistence implementation, tests, documentation, official-source review, and local verification. Andreas accepted P02 and merged pull request #3 as commit `16c04f6`.
- The lifecycle packet cites Anthropic's public AI-native SDLC and Claude Code documentation. The repository structure also contains project-specific, provider-neutral conventions that Anthropic does not prescribe.
- The lifecycle packet was added after P02 coding began. It records that sequencing explicitly and is not evidence of pre-code intent/specification approval.
- GitHub issue #2 and merged pull request #3 are the authoritative records for scope, findings, and owner disposition.

No raw chat transcript, prompt history, hidden reasoning, private chain-of-thought, provider credential, or confidential operational data is part of P02. References to Anthropic and OpenAI identify public guidance or assisting tools; they do not indicate affiliation, endorsement, certification, approval, or product integration.

## P04 provenance

P04 was developed in this fresh repository from Andreas's direction to add a
human-approved weekly planning assistant with user-supplied Anthropic, OpenAI,
or OpenRouter credentials.

- Andreas selected the product goal, provider scope, bring-your-own-key model,
  human-approval boundary, and continued private visibility.
- OpenAI Codex assisted with official-provider documentation review, lifecycle
  artifacts, architecture, implementation, tests, deterministic evaluations,
  threat modeling, and local verification.
- No real provider credential or sensitive planner data was supplied, stored,
  logged, committed, or used during implementation and verification.
- The credential-free fixture and mocked provider responses are synthetic.
  They verify the local contract and adapters, not live-provider quality or
  availability.
- GitHub issue #6 and the P04 pull request are the authoritative records for
  scope, findings, and owner disposition.

References to Anthropic, OpenAI, and OpenRouter identify supported user-selected
API destinations and public documentation. They do not indicate affiliation,
endorsement, certification, approval, or provider review.

## Data and asset boundary

- The application starts with empty local state; automated tests use fictional task text.
- No customer, employer, production, health, financial, or other personal dataset is included.
- No screenshot, raster image, vector image, custom icon file, remote font, analytics script, or tracking asset was included in P01.
- Interface marks are text or Unicode characters rather than imported icon assets.
- Third-party packages retain their licenses. The candidate's package-license inventory is recorded in the disclosure review.

If a later milestone introduces a model-provider connection, external data, screenshots, or new assets, update this file with the source, authorization, transformation, retention, and disclosure path before presenting that capability as delivered.

## P11 provenance

P11 reuses the architectural lesson and stable Android identifier from Andreas's private predecessor, but does not import its Git history, Supabase integration, authentication, deep-link behavior, remote synchronization, credentials, signing material, or private operational data. The public Tauri configuration, Rust shell, runtime capability boundary, tests, documentation, and application icon were authored as a new change in this repository.

The icon source is the repository-owned `src-tauri/app-icon.svg`, created for P11 under Andreas's direction. Tauri CLI 2.11.4 successfully generated and visually verified the Android and bundle variants from that source. Generated variants are intentionally not committed and can be recreated with `npm run android:icons`. OpenAI Codex assisted with P11 research, artifact drafting, implementation, tests, and verification. Andreas owns and accepts the product boundary, mobile architecture, device testing, signing, and any release decision.

## Corrections

Provenance corrections may be proposed in an issue when they do not disclose private information. Use the private reporting path in [`SECURITY.md`](SECURITY.md) when a correction could expose a secret, personal data, or a security weakness.

## License and independence

Unless a file says otherwise, repository code and documentation are licensed under Apache License 2.0. Third-party material retains its original license and attribution requirements.

This independent project is not affiliated with, sponsored by, or endorsed by Anthropic, OpenAI, or any other provider. Third-party product names are used only for accurate identification.
