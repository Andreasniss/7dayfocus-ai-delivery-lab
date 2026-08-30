# Provenance

This record explains the origin of the P01 candidate without publishing private prompts, repository history, credentials, or operational data.

## Clean-room source boundary

P01 was prepared from a maintainer-controlled private predecessor snapshot at commit `b2ef5dd80bcc443a06a8f9b7723c75d59ca99001`. On August 30, 2026, that repository was rechecked as private and unchanged at the pinned commit.

The new project was created as a private, non-fork repository with fresh history. Its initial `main` commit, `5f1e0566e237fb63fce4cc38bbfd25b6def64648`, has no parents and points to tree `f65e72bf57b9a2b11c0fbc4b46348854f68b5e27`, containing the 37 reviewed files. The remote and local Git blobs matched for all 37 files. No predecessor Git objects or history were imported.

| Material | P01 treatment |
| --- | --- |
| Apache 2.0 license | Retained from the predecessor snapshot. |
| Planner UI, date and data utilities, entry point, and tests | Selected from an explicit path allowlist, then reviewed and sanitized for the local-only boundary. |
| App shell, header, store, types, styling, build configuration, and manifests | Rewritten or regenerated before the first commit. |
| Existing Git history, private documentation, prompts, screenshots, icons, environment files, auth/cloud/native code, caches, and build output | Excluded from the new project. |
| Public-project documentation and P01 smoke test | Authored for this clean-room project. |

The path-level source comparison and final disclosure checks are summarized in [`docs/P01-DISCLOSURE-REVIEW.md`](docs/P01-DISCLOSURE-REVIEW.md).

## Human and AI roles

- Andreas Nissen owns the product intent, scope, architecture decisions, expert review, disclosure decisions, and release acceptance.
- The predecessor planner was developed under Andreas's direction with Claude Code assistance.
- OpenAI Codex assisted with the P01 clean-room extraction, local-only refactor, documentation, test addition, and verification. Its output was treated as proposed work and subjected to deterministic checks and owner authorization for private repository creation. Manual visual QA and final P01 acceptance remain pending.

AI assistance does not establish correctness. Claims in this repository are limited to evidence that was actually run or reviewed. The project does not imply that Claude, Anthropic, OpenAI, or another provider powers a P01 feature.

## Data and asset boundary

- The application starts with empty local state; automated tests use fictional task text.
- No customer, employer, production, health, financial, or other personal dataset is included.
- No screenshot, raster image, vector image, custom icon file, remote font, analytics script, or tracking asset is included in P01.
- Interface marks are text or Unicode characters rather than imported icon assets.
- Third-party packages retain their licenses. The candidate's package-license inventory is recorded in the disclosure review.

If a later milestone introduces a model-provider connection, external data, screenshots, or new assets, update this file with the source, authorization, transformation, retention, and disclosure path before presenting that capability as delivered.

## Corrections

Provenance corrections may be proposed in an issue when they do not disclose private information. Use the private reporting path in [`SECURITY.md`](SECURITY.md) when a correction could expose a secret, personal data, or a security weakness.

## License and independence

Unless a file says otherwise, repository code and documentation are licensed under Apache License 2.0. Third-party material retains its original license and attribution requirements.

This independent project is not affiliated with, sponsored by, or endorsed by Anthropic, OpenAI, or any other provider. Third-party product names are used only for accurate identification.
