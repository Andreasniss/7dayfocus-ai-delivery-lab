# Provenance

This record explains the origin of the P01 candidate without publishing private prompts, repository history, credentials, or operational data.

## Clean-room source boundary

P01 was prepared from a maintainer-controlled private predecessor snapshot at commit `b2ef5dd80bcc443a06a8f9b7723c75d59ca99001`. That repository remains private and unchanged.

The new project uses a clean-room staging tree and does not import the predecessor's Git history. The reviewed release procedure creates a fresh, non-fork repository only after disclosure checks and human acceptance pass.

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
- OpenAI Codex assisted with the P01 clean-room extraction, local-only refactor, documentation, test addition, and verification. Its output was treated as proposed work and subjected to deterministic checks and human acceptance.

AI assistance does not establish correctness. Claims in this repository are limited to evidence that was actually run or reviewed. The project does not imply that Claude, Anthropic, OpenAI, or another provider powers a P01 feature.

## Data and asset boundary

- The application starts with empty local state; automated tests use fictional task text.
- No customer, employer, production, health, financial, or other personal dataset is included.
- No screenshot, raster image, vector image, custom icon file, remote font, analytics script, or tracking asset is included in P01.
- Interface marks are text or Unicode characters rather than imported icon assets.
- Third-party packages retain their licenses. The candidate's package-license inventory is recorded in the disclosure review.

If a later milestone introduces a model-provider connection, external data, screenshots, or new assets, update this file with the source, authorization, transformation, retention, and disclosure path before presenting that capability as delivered.

## Corrections

After a repository exists, provenance corrections may be proposed in an issue when they do not disclose private information. Use the private reporting path in [`SECURITY.md`](SECURITY.md) when a correction could expose a secret, personal data, or a security weakness.

## License and independence

Unless a file says otherwise, repository code and documentation are released under Apache License 2.0. Third-party material retains its original license and attribution requirements.

This independent project is not affiliated with, sponsored by, or endorsed by Anthropic, OpenAI, or any other provider. Third-party product names are used only for accurate identification.
