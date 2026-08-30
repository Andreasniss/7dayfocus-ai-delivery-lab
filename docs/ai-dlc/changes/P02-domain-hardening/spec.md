# P02 Domain Hardening: Specification

- **Owner:** Andreas
- **Captured:** 2026-08-30
- **Status:** Draft contract for review in the GitHub pull request
- **Depends on:** `intent.md`, ADR 0001, and proposed ADR 0002

This specification was written after P02 implementation had begun. Acceptance must be based on the final pull-request diff and tests, not on an implied pre-code approval.

## Domain boundary

The planner's state transitions must be implemented as a pure reducer. For the same valid state and action, it must produce the same result without reading time, browser storage, the DOM, network state, or randomness.

Random IDs and wall-clock-derived dates must be materialized outside the reducer and passed into it explicitly. Runtime adapters may call `crypto.randomUUID()` or read the clock; the reducer may not. The reducer may derive the next week start as a deterministic seven-day offset from the stored week start when an action omits an explicit date.

## State contract

A valid current `WeekState` has:

- a real calendar date in exact `YYYY-MM-DD` form;
- complete settings with integer bounds:
  - `maxPriority`: 1–5;
  - `maxTasksPerDay`: 1–15;
  - `weekStartDay`: 0–6;
  - `weekLength`: 1–7;
  - `homeView`: `day` or `week`;
- `maxPriority <= maxTasksPerDay`;
- at most 1,000 tasks in the defensive runtime-recovery bound;
- unique runtime IDs in UUID v4 form, generated under the current identifier policy;
- non-blank task text of at most 1,000 trimmed characters in a recoverable migrated/runtime value;
- an integer `dayIndex` within the configured week; and
- a required boolean completion field, an optional boolean priority field, and an optional `Work` or `Life` label.

Legacy and portable imports must not preserve external task IDs. Their replacement IDs must also be UUID v4 values.

New task creation, task edits, and strict portable-format version `2` use the narrower product limits of 200 trimmed characters per task and 105 total tasks. The wider runtime bounds exist only so P01-reachable data can migrate without truncation; they do not increase the new-work planning limits. A supported legacy payload beyond 1,000 tasks or 1,000 characters in one task is left unchanged and requires out-of-band recovery rather than being loaded unsafely.

## Action invariants

Invalid actions return the original state object without a partial update.

- **Add:** reject blank or overlong text, duplicate/invalid ID, unsupported label, invalid day, or a day at capacity.
- **Edit:** reject an unknown task or blank/overlong replacement text.
- **Toggle/delete/label:** reject unknown IDs and unsupported labels.
- **Priority:** all tasks count toward the daily priority limit regardless of completion state.
- **Move:** reject an unknown ID, invalid target, or full target day. Moving to the same day is a no-op. Moving to another day resets `completed` and `priority`.
- **Settings:** reject settings that are structurally invalid, orphan existing tasks outside a shortened week, or increase an existing task/priority-capacity violation. A view change or settings change that leaves a preserved violation unchanged, or reduces it, is allowed.
- **New week:** validate the new date and the complete carry-over request before changing state. Unknown or duplicate source IDs, completed source tasks, invalid/duplicate new IDs, or a resulting invariant violation reject the whole action. Valid carried tasks receive new IDs and reset completion and priority.

All tasks, including completed tasks, count toward the daily task limit. Pre-existing over-capacity legacy data may be preserved during migration, but subsequent actions must not increase the violation.

## Browser-storage contract

- Current data is stored under an explicit envelope with storage schema version `2` and a validated, bounded state payload.
- A supported legacy payload is parsed and migrated deterministically. Every migrated task receives a fresh ID. P01-reachable long text and task counts are preserved within the documented runtime-recovery bounds; a too-short legacy week is expanded to include its tasks, and a legacy daily-task limit below its priority limit is raised to the priority limit.
- An unknown schema version, malformed JSON, invalid current payload, storage-method exception, or exception while acquiring browser storage must produce a visible load issue and leave the original stored value unchanged.
- After a load issue, automatic persistence must remain blocked so initial fallback state cannot silently overwrite the unreadable value.
- Replacing unreadable saved data requires an explicit user action and human-readable warning.
- A write exception or validation failure must keep changes in memory, present a visible save issue, and offer a retry path.
- A current payload takes precedence over a legacy key. Legacy cleanup is best effort only after the migrated current payload is written successfully.

## Portable import/export contract

- File content is untrusted and must be limited to 8 MiB before parsing. This bound accommodates the documented worst-case recoverable state, including JSON escaping overhead.
- Portable version `2` must reject malformed JSON, impossible dates, invalid scalar types, unsupported labels or views, out-of-week day indexes, duplicate/invalid structure, task/priority counts that exceed the imported settings, text above 200 characters, or more than 105 tasks.
- Portable version `1` and files without metadata use the bounded P01 migration policy rather than being misrepresented as version `2`. Unsupported future versions are rejected.
- Imported task IDs are always regenerated.
- A rejected import must not mutate current planner state.
- Export metadata must describe `dayIndex` as an offset from `weekStart`, independent of a Monday assumption.

The portable file version is a separate contract from the browser-storage schema version and must be named/documented accordingly.

## User-visible recovery

Storage errors must be exposed through an accessible alert. A load problem offers a clearly worded, confirmation-gated replacement action; a save problem offers retry. The interface must not imply that data was saved when persistence failed.

## Interaction and accessibility contract

- A UI control must not present a known-invalid domain action as successful. Rollover and overdue bulk moves preflight capacity before dispatch, remain open or unchanged on failure, and expose a human-readable reason. Full day targets are not active drop destinations.
- The 105-task planning limit disables new-task controls without clearing typed input, and the reason is rendered and programmatically associated with the disabled controls.
- Every repeated task action has a task-specific accessible name; every add/category control has day context.
- The week-review surface is a labeled modal dialog with initial focus, focus containment, Escape cancellation, and focus restoration to its opener.
- Keyboard drag-and-drop is supported through a dedicated drag handle. Live announcements identify the task and destination by human-readable text/date rather than internal IDs, and the visual drag overlay is noninteractive and hidden from assistive technology.
- A recoverable legacy task longer than the new 200-character edit limit remains editable. Saving preserves the editor and shows an inline error until the value is shortened; save and cancel restore focus to the edit trigger.
- If the stored week does not contain today's date, the application falls back to the week view rather than rendering an invalid day.

## Test contract

Tests must cover, at minimum:

- strict date, settings, task, and label parsing;
- add/edit/move/settings boundaries;
- atomic rollover failures and successful reset semantics;
- current-version load, supported migration, unknown version, malformed data, read failure, write failure, and no-overwrite behavior;
- strict portable import and regenerated IDs;
- the accessible storage alert and explicit recovery paths; and
- rollover and overdue-move capacity preflights, including exact-fit and no-partial-update behavior;
- modal focus/Escape behavior, contextual control labels, global-capacity descriptions, edit-focus restoration, and human-readable keyboard-drag announcements;
- compatibility with the existing planner flow.

## Verification and claim limit

The local merge gate is `npm run verify`. Passing it demonstrates only the checks included in that script. Manual browser/visual QA, a focused accessibility review, authenticated fresh-clone verification, hosted CI, and security assessment remain separate evidence and must not be implied.
