# P02 Domain Hardening: Plan

- **Owner:** Andreas
- **Captured:** 2026-08-30
- **Status:** Completed and accepted; merged through pull request #3 as `16c04f6`
- **Sequence disclosure:** Initial P02 code changes preceded this document. The plan begins from the state observed when the lifecycle gap was identified and does not backdate earlier work.

## Execution sequence

### 1. Establish the change contract

- [x] Capture P02 intent, draft specification, review contract, and lifecycle limits.
- [x] Reconcile the implementation and automated tests with every specification item.
- [x] Obtain Andreas's recorded disposition on the intent, specification, plan, and proposed ADR 0002 in the pull request.

### 2. Extract and harden the domain

- [x] Keep state transitions in a pure reducer.
- [x] Keep wall-clock and UUID creation outside the reducer; derive default rollover dates deterministically from stored state.
- [x] Enforce text, label, date, week, daily-capacity, priority, and settings invariants.
- [x] Make invalid move, settings, and rollover actions atomic no-ops.
- [x] Preserve P01-reachable state within explicit recovery bounds, including over-capacity data, without permitting actions that worsen a violation.

### 3. Version and protect persistence

- [x] Validate a versioned current storage envelope.
- [x] Migrate supported legacy state with regenerated IDs.
- [x] Keep malformed or unsupported stored data unchanged.
- [x] Block automatic overwrite after a load problem.
- [x] Provide visible, accessible replace/retry paths for load and save problems.

### 4. Harden portable data exchange

- [x] Separate portable file versioning from browser-storage versioning; emit strict portable version `2` and migrate version `1`/metadata-free P01 files.
- [x] Bound file size and strictly validate all imported fields and capacities.
- [x] Regenerate imported IDs and leave state unchanged on rejection.
- [x] Correct export metadata so day indexes are documented relative to `weekStart`.

### 5. Build adversarial evidence

- [x] Add focused pure-domain tests.
- [x] Add storage, migration, corruption, and adapter-failure tests.
- [x] Add import/export boundary tests.
- [x] Add application tests for visible storage errors and recovery actions.
- [x] Add focused tests for rollover/overdue capacity preflight, modal focus, contextual labels, recovery-state editing, and keyboard drag announcements.
- [x] Run relevant focused tests while iterating.

### 6. Review and verify

- [x] Review the candidate with every pass in `REVIEW.md`.
- [x] Resolve or explicitly record all findings; the post-open PR finding was fixed, re-reviewed with no major issues, and resolved.
- [x] Run `npm run lint`.
- [x] Run `npm run typecheck` on the worktree state recorded in `evidence.md`.
- [x] Run `npm run test`.
- [x] Run `npm run build`.
- [x] Run the complete `npm run verify` gate on the current local candidate; rerun after any review fix.
- [x] Record the focused accessibility review and disclose rendered browser/visual QA as pending because the available browser could not access the executor-local preview.
- [x] Re-run targeted disclosure and secret checks appropriate to the final worktree; disclose unavailable dedicated scanners and exact remote-history limits.

### 7. Pull request and owner gate

- [x] Create the remote P02 branch from exact merged private `main` revision `50721115a392fb96db0bb90c774d351945b86827`.
- [x] Open private pull request #3 linking the change packet and ADR 0002.
- [x] Treat GitHub review findings and status as authoritative; address the portable-v2 completion-field finding in a follow-up commit.
- [x] Record Andreas's approval.
- [x] Keep applied-AI work and public release gated until P02 is accepted.

## Deferred to P03

P03 may propose `.claude/rules/`, permission settings, deterministic hooks, verifier/adversarial agents, reusable skills, evaluation scaffolding, pull-request templates, and hosted CI. None is part of P02 or implied as implemented.

## Stop conditions

Pause and route to Andreas if implementation would replace unreadable saved data without explicit consent, discard recoverable legacy data, add a new trust boundary, require confidential material, waive a blocking review finding, or expand P02 into model/provider integration.
