# ADR 0003: Public Release Boundary

- **Status:** Proposed for P03 acceptance
- **Decision owner:** Andreas
- **Date:** 2026-08-30

## Context

The repository is intended to become a public portfolio reference. Visibility changes expose the complete Git history and repository activity, allow public forks, and can make workflow history visible. Publication must therefore be treated as a separate release decision rather than a side effect of a successful code merge.

## Decision

1. Release-readiness work may be merged while visibility remains private.
2. Current documentation must remain truthful before and after a later visibility change; historical visibility is recorded only as dated evidence.
3. The public proof path starts with a reviewer-oriented README, reproducible local verification, explicit ownership, source attribution, and known limitations.
4. A visibility change requires explicit owner approval after credential/disclosure, dependency/license, behavior, and documentation checks are reviewed.
5. Hosted CI, a rendered demo, a GitHub release, and downstream CV/LinkedIn claims are separate evidence-producing actions. None is inferred from repository visibility.
6. Public use remains limited to non-sensitive synthetic or fictional data. The localStorage and export boundary does not provide confidentiality, access control, or production durability.

## Consequences

The repository can be prepared and reviewed without accidental publication. A clean merge is not permission to change access. Publication may be delayed by a visual-QA or security-evidence gap even when local automated tests are green.

## Independence

This is an independent project decision. It does not indicate endorsement, approval, certification, or compliance by Anthropic, OpenAI, GitHub, AWS, or another provider or employer.
