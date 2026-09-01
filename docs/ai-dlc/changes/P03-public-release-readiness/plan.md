# P03 Public Release Readiness: Plan

- **Owner:** Andreas
- **Accepted:** 2026-08-30
- **Status:** Completed and accepted; pull request #5 merged

## Sequence

- [x] Record owner authorization and open issue #4.
- [x] Create `p03/public-release-readiness` from merged P02 commit `16c04f6`.
- [x] Capture intent, specification, and plan before implementation.
- [x] Reconcile current and historical status claims.
- [x] Improve the README proof path and add creator/source attribution.
- [x] Add minimal CI and pull-request review scaffolding.
- [x] Run focused tests, full verification, and clean-copy verification.
- [x] Review dependencies, licenses, disclosures, and all remote commit diffs.
- [x] Attempt desktop/mobile capture and record the exact browser-access blocker.
- [x] Open private draft pull request #5.
- [x] Complete review of the current pull-request head.
- [x] Merge privately after the applicable P03 clean-merge gates passed; the later rendered-QA waiver governed P05 publication, not the P03 merge.
- [x] Keep visibility private until Andreas explicitly authorized publication; publication was later completed through P05.

## Closeout clarification

P06 reconciled this checklist on 2026-09-01 from the merged pull request and P05 publication record. It does not convert the unavailable rendered QA or failed hosted Actions run into passed evidence.

## Stop conditions

Stop before merge for a P0-P2 finding, failed verification, stale documentation, an unreviewed head change, or a publication claim unsupported by evidence. Stop before visibility change regardless of green checks until Andreas explicitly authorizes it.
