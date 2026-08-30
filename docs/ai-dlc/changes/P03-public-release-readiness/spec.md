# P03 Public Release Readiness: Specification

- **Owner:** Andreas
- **Accepted:** 2026-08-30

## Documentation contract

1. Current documentation describes P02 as merged and owner-accepted.
2. Historical P01 and P02 evidence remains visible but is clearly labeled as historical.
3. Visibility-independent wording avoids becoming false when the repository is later made public.
4. The README first screen identifies the product, portfolio purpose, creator, evidence, guided path, and limits.
5. Provider references are factual source/tool attribution only and do not imply affiliation, endorsement, certification, or compliance.

## Product and attribution contract

1. The application continues to run locally with no provider account, backend, telemetry, or remote persistence.
2. The interface includes a quiet persistent creator link and a source link to the verified repository.
3. External links open safely without changing application behavior.
4. No customer, employer, confidential, personal, or production data is added.

## Verification contract

1. `npm run verify` passes on the candidate.
2. A clean copy installs the locked dependency graph and passes the same gate.
3. Dependency audit, license, targeted credential/disclosure checks, and all remote commit diffs are reviewed.
4. Hosted CI is claimed only if its workflow completes successfully on the candidate.
5. Rendered desktop and mobile QA is claimed only from screenshots captured and inspected in the permitted browser. An inaccessible preview remains a publication blocker, not a passed check.
6. All open findings and residual limitations remain in the PR and evidence ledger.

## Publication contract

This change may be merged while the repository remains private. Visibility change, release publication, and downstream portfolio claims require a later explicit owner decision after all blocking checks are resolved or explicitly accepted.
