# P11 Android Personal Install: Plan

- **Owner:** Andreas
- **Accepted:** 2026-09-01
- **Status:** In progress

## Implementation order

1. Record the accepted P11 intent, specification, architecture decision, and evidence ledger.
2. Add a pure runtime-capability helper and pass its result into `PlanAssistant`.
3. Restrict packaged mode to the deterministic fixture and add component tests for the boundary.
4. Add the minimal Tauri v2 configuration, Rust shell, Android configuration, icon source, and npm commands.
5. Add setup, build, install, device-test, signing, and three-hour Play spike documentation.
6. Update security, README, roadmap, provenance, and repository instructions without claiming unobserved build or device results.
7. Run locked install, lint, typecheck, tests, evals, web build, dependency audit, disclosure scan, Rust formatting/check where available, and diff checks.
8. Open a linked pull request, run current-head review and CI, resolve findings, merge only when the evidence contract is satisfied.
9. From Andreas's PC, generate the Android project/build, install the exact revision on the phone, execute the device checklist, and append observed evidence.
10. Only after device success, start the optional Play spike and stop within three focused hours.

## Verification contract

### Accepted physical-device feedback follow-up: 6 September 2026

Andreas accepted resolving the observed phone defects in this session and recording the reproduce/fix/verify sequence as public delivery evidence. The first Pixel installation exposed a status-bar overlap covered by the existing portrait-layout requirement. Apply native system-bar/display-cutout insets, add a real-device regression check, rebuild and update without clearing app data, then rerun the device checklist. Small additional corrections must address observed usability or correctness defects within the accepted P11 boundary; broader features remain backlog work. Public evidence must omit device identifiers, personal data, and raw conversations, and must not imply Anthropic certification or endorsement.

### Commands and gates

Andreas also accepted a populated fictional demo and genuine app screenshots for the public README and existing website case study on 6 September. Publish a portable example file through the existing import workflow, test that its documented fixture proposal is reproducible, and use the same data for captures. Do not automatically seed or overwrite users' saved state. Reconcile public claims with the final physical-device evidence and preserve the website's existing publishing workflow.

- `npm ci`
- `npm run verify`
- `npm audit --omit=dev`
- mobile capability tests
- `npm run tauri info`
- `cargo fmt --check` and `cargo check` when Rust is available
- `npm run android:init` and `npm run android:build:debug` when Android SDK and Rust Android targets are available
- physical-device checklist on Andreas's phone
- current-head hosted CI and review
