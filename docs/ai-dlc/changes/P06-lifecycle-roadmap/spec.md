# P06 Lifecycle Integrity and Roadmap: Specification

- **Owner:** Andreas
- **Accepted:** 2026-09-01

## Status integrity

1. P02 intent and specification must show their final accepted state while preserving the mid-change adoption disclosure.
2. P03 and P04 plans must show completed merge steps without converting unavailable checks into passes.
3. P03 and P04 evidence must distinguish original candidate observations from later closeout.
4. P04 design clarification must be explicitly dated as retrospective.
5. Current and historical limitations remain visible.

## Roadmap contract

1. `ROADMAP.md` is the versioned summary; open GitHub issues remain authoritative for live scope and status.
2. Each roadmap item links to exactly one primary issue.
3. The roadmap distinguishes the P11 optional personal learning goal from parked P07–P10 extensions.
4. Planned work is never phrased as delivered capability.
5. Feature candidates remain bound by deterministic validation, complete diff, explicit approval, and atomic application.

## Product-discovery contract

1. The public README and portfolio case study state that the original need was valid when the prototype began.
2. They state that Claude and ChatGPT now provide the orchestration layer while Todoist provides task persistence and visualization through its connector and CLI.
3. Stopping standalone development is described as a discovery outcome, not product adoption or production evidence.
4. The earlier Android/Tauri work is described as tested and prepared, never as production-launched.

## Android contract

1. Installing and testing a current build on Andreas's personal phone is the required P11 outcome.
2. Google Play publication is optional.
3. Play work starts only after personal-device success and is capped at three hours of focused launch work.
4. A Google account, testing, identity, policy, privacy, security, or engineering gate that exceeds the remaining budget triggers a documented stop.
5. Prior registration cost does not justify exceeding the time box.
6. Any store or mobile claim requires observed evidence linked from the relevant change packet.

## Design decisions

- Use one repository roadmap plus GitHub issues rather than a second project-management system.
- Keep P07–P11 as outcome-sized changes, with detailed artifact packets created before their implementation.
- Treat P07–P10 as parked evidence or feature extensions and P11 as a personally meaningful optional delivery path.
- Record retrospective clarification in place with a P06 date instead of silently rewriting history.

## Alternatives not selected

| Alternative | Reason |
| --- | --- |
| Leave deferred controls only in the lifecycle guide | Not prioritized, assignable, or measurable |
| Mark all Anthropic stages complete through documentation | Would confuse intended process with observed operational evidence |
| Make Play Store publication mandatory | Google gating may exceed the portfolio value and Andreas's time budget |
| Drop Android entirely | Conflicts with Andreas's personal goal and prior Android Studio exploration |
| Build every roadmap item in P06 | Would bypass accepted artifact gates and create an unreviewable change |

## Areas of concern

- GitHub issues can change after the committed roadmap; live issue state remains authoritative.
- Retrospective clarification can be mistaken for original design evidence unless its date and purpose stay visible.
- The earlier private repository confirms a Tauri v2 Android foundation; the safe reuse and reconciliation path remains a P11 decision.
- Hosting, live-provider runs, telemetry, signing, and Play Console work introduce boundaries requiring later explicit approval.

## Verification contract

- Fetch every changed file from the candidate branch and verify intended status/link text.
- Search the changed set for stale `Draft`, `In progress`, and unchecked completion markers that contradict final state.
- Verify all roadmap issue links resolve and remain open except P06 after merge.
- Review the complete current-head diff.
- Do not claim application tests as rerun because P06 changes documentation and backlog only.
