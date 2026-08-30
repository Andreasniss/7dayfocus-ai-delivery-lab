# ADR 0002: Pure Domain Boundary and Versioned Local Persistence

- **Status:** Accepted
- **Date:** 2026-08-30
- **Decision owner:** Andreas
- **Decision scope:** planner domain transitions, portable import, and browser-local persistence
- **Sequence disclosure:** Implementation exploration began before this ADR was written. This proposal records the P02 decision for review; it is not a backdated prerequisite or accepted decision until the pull request records owner approval.

## Context

P01 keeps the planner static and local, but its domain rules are coupled to a React hook. It also trusts stored/imported data more than the application boundary permits, creates identifiers with non-cryptographic randomness, and does not give users a reliable visible recovery path when browser storage fails.

Later applied-AI work will introduce more inputs, generated proposals, and evaluation needs. Without a deterministic ordinary-software foundation, reviewers could not tell whether a failure comes from model behavior, orchestration, data validation, persistence, or the user interface.

## Decision

### Pure domain core

Planner transitions will be implemented as a side-effect-free reducer. It will not read wall-clock time, randomness, browser APIs, UI state, or network state. Callers materialize random IDs and wall-clock-derived dates before dispatching domain actions. The reducer may calculate a deterministic seven-day offset from its stored week start when a rollover action omits an explicit date.

The reducer validates actions against explicit invariants and returns the original state for invalid input. Multi-item operations such as rollover and settings changes are atomic: either the complete request is valid or no state change occurs.

### Invariants

- Week start is a real `YYYY-MM-DD` calendar date.
- Day indexes fall within the configured one-to-seven-day week.
- New and edited task text is trimmed, non-empty, and at most 200 characters. P01-reachable text is preserved during migration up to a 1,000-character recovery bound rather than silently truncated.
- Runtime task IDs are unique UUID v4 values; new, imported, migrated, and carried tasks receive IDs from `crypto.randomUUID()` outside the reducer.
- Labels, booleans, integer settings, and view names are accepted only from their enumerated/bounded contracts.
- All tasks, including completed tasks, count toward the daily task capacity.
- Daily priority count cannot exceed its configured maximum.
- Moving a task to another day resets completion and priority; moving to the same day is a no-op.
- Settings may not orphan tasks or reduce capacity/priority limits below existing state.
- P01-reachable state may be preserved during migration up to 1,000 tasks even when it exceeds the new 105-task planning bound or configured daily capacities; later actions may not worsen a capacity violation.

### Versioned storage boundary

Current browser state will use a versioned envelope under a current storage key. Storage version `2` contains a validated, bounded runtime state. Supported legacy data will migrate deterministically and receive fresh task IDs. The migration preserves P01-reachable long text, higher task counts, and over-capacity state within explicit recovery bounds. It expands a legacy week when necessary to keep previously imported day offsets visible and normalizes a daily-task limit that is lower than its priority limit.

Malformed JSON, an unknown version, an invalid payload, an exception while acquiring browser storage, or a storage-method exception will not be interpreted as an empty successful load. The adapter will report a visible issue, preserve the stored value, and block automatic fallback persistence. Replacing unreadable data requires an explicit, confirmation-gated user action.

Write failure leaves the latest state in memory and produces a visible retry path. A legacy key is removed only on a best-effort basis after the migrated current state is written successfully.

### Portable import boundary

Portable files and browser storage have separate version contracts. Portable version `2` is the strict current format; version `1` and files without metadata use the bounded P01 migration policy. Imported files are limited to 8 MiB before parsing so the bound still accommodates the documented recoverable state and JSON escaping overhead. External IDs are never trusted; accepted tasks receive fresh IDs. Unsupported versions or rejected inputs leave the active state unchanged. Export emits version `2` for strict state and version `1` when retained recovery data would not satisfy the strict format, preserving an importable round trip without mislabeling the payload.

### User-interface boundary

The UI may preflight an operation to explain why the pure reducer would reject it, but the reducer remains authoritative. Rollover and overdue bulk moves reuse the domain capacity rule before dispatch so a known-invalid request does not appear to succeed silently. Full targets are disabled, failure reasons are visible and accessible, repeated actions include task/day context, and keyboard drag announcements use human-readable task/date labels rather than internal identifiers.

The overdue bulk-move UI currently dispatches sequential existing move actions only after a deterministic capacity preflight. This is safe for the current synchronous reducer path and avoids a second domain action in P02. A future asynchronous or non-UI caller must introduce an atomic batch action rather than relying on this UI preflight.

## Rationale

A pure reducer makes invariants independently testable and lets UI, storage, and future AI adapters share one behavior contract. Moving time and randomness to the boundary makes tests deterministic without weakening production ID generation.

Versioning makes compatibility deliberate. Preserving unreadable data and requiring explicit replacement favors recoverability over silent convenience. Separating portable and runtime schemas avoids coupling a user exchange format to internal storage evolution.

## Consequences

### Benefits

- Domain behavior can be exhaustively exercised without React or browser setup.
- Invalid and adversarial inputs have explicit no-partial-update semantics.
- Storage corruption and browser failures are visible rather than silently destructive.
- Migrations and future format changes have a named compatibility boundary.
- Future AI-generated proposals can be validated through the same deterministic domain contract.

### Costs and constraints

- Callers must materialize IDs and time-dependent defaults explicitly.
- Runtime, legacy, and portable parsers require separate tests and careful evolution.
- Explicit recovery adds UI state and user decisions.
- Accessible modal, recovery, capacity, editing, and keyboard-drag behavior adds UI state and focused regression coverage.
- Preserving invalid legacy data means the application may temporarily hold a state that new actions are not allowed to worsen.
- Browser `localStorage` remains single-browser, synchronous, quota-limited persistence and is not production or multi-user storage.
- Cross-tab conflict detection is not implemented; concurrent tabs use last-write-wins persistence.

## Alternatives considered

### Keep reducer logic inside the React hook

Rejected because domain tests would remain coupled to UI lifecycle and side effects, obscuring state-machine defects.

### Silently reset invalid data

Rejected because a parse or browser failure is not evidence that the user's data is disposable. Automatic fallback persistence could turn a recoverable problem into data loss.

### Trust imported or legacy IDs

Rejected because external identifiers may be empty, duplicated, malformed, or deliberately crafted. Fresh boundary-generated IDs make collisions and provenance clearer.

### Add a schema-validation dependency

Deferred for P02. The current schema is small enough to validate with narrow typed parsers. Reconsider if schema complexity, reuse, or error-reporting needs grow enough to justify the dependency and supply-chain cost.

### Add a backend for persistence

Rejected for P02 under ADR 0001. It would introduce remote data, authentication, deployment, and operating boundaries unrelated to domain stabilization.

## Verification requirements

Acceptance requires tests for every stated invariant, supported migration, malformed and unsupported storage, read/write failure, explicit recovery, strict portable import, and atomic rollover/settings behavior. `npm run verify` must pass on the final candidate. Manual browser/visual and focused accessibility checks must either be recorded or explicitly disclosed as pending.

## Follow-up triggers

Create or revise an ADR before adding a backend, remote/shared persistence, sensitive data, multi-user access, provider/model calls, or a schema change that discards supported data. Revisit the parser strategy if portable/runtime schemas materially expand.

## Independence and process provenance

This decision is part of an independent portfolio project. Its lifecycle record is derived from selected public Anthropic guidance and adapted with project-specific conventions. It does not indicate Anthropic affiliation, endorsement, approval, certification, or compliance.
