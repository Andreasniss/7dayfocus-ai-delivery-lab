# P11 Android Personal Install: Evidence

- **Owner:** Andreas
- **Status:** Implementation in progress
- **Evidence date:** 2026-09-01

## Confirmed predecessor evidence

The private `Andreasniss/Todo-app` repository contains a React and Tauri v2 Android project with identifier `com.nissenlabs.dayfocus`, Android Studio/emulator instructions, PWA support, tests, generated Android configuration targeting API 36, and distribution preparation. Its README correctly records that no production or app-store launch occurred.

Reusable decisions:

- Tauri v2 is a proven packaging path for this project.
- Android API 36 and Java 17 are already reflected in the earlier generated project.
- Personal-device installation remains meaningful learning evidence.

Rejected carry-over:

- Supabase, authentication, deep links, remote synchronization, and credential-related plugins are outside the current public project's scope.
- The earlier implementation and test counts do not become evidence for this public revision merely by reference.

## Primary-source validation

- Tauri's current CLI documents `tauri android init`, `dev`, `build`, and `run`, with APK and AAB output support: <https://v2.tauri.app/reference/cli/>
- Tauri's Google Play guide documents AAB generation, API 24 minimum support, signing, and manual first upload: <https://v2.tauri.app/distribute/google-play/>
- Google Play requires new apps submitted from 31 August 2026 to target Android 16, API 36: <https://support.google.com/googleplay/android-developer/answer/11926878>
- Google documents additional testing gates for some personal developer accounts created after 13 November 2023: <https://support.google.com/googleplay/android-developer/answer/9859152>

## Environment inventory

- Node.js 24.19.0 and npm 11.9.0 are available.
- Java 17 is available.
- Rust, Cargo, Android SDK environment variables, and a physical Android device are not available in the current cloud environment.

## Observed results

- Targeted mobile-boundary and integration tests: 22 passed across `runtime.test.ts`, `PlanAssistant.test.tsx`, and `App.test.tsx`.
- TypeScript type checking passed.
- Oxlint passed with warnings denied.
- Locked install and the complete web verification gate passed: 17 test files and 248 tests, including 24 deterministic evaluation cases, followed by the production Vite build.
- The production bundle built successfully with 49 transformed modules and a 289.15 kB JavaScript artifact before gzip.
- `npm audit --omit=dev` reported zero known runtime dependency vulnerabilities.
- `git diff --check` and the credential/private-key signature scan passed.
- `tauri info --verbose` recognized Tauri CLI 2.11.4, the React/Vite project, CSP, development URL, and frontend distribution path.
- `tauri icon src-tauri/app-icon.svg` generated the Android and bundle variants successfully; the 256 px render was visually checked for legibility. Generated variants remain reproducible output and are not committed.
- `tauri android init --ci` stopped before modifying the generated Android project because `cargo` is unavailable. The observed error was `failed to run command cargo metadata ... No such file or directory`.
- Tauri environment diagnostics also confirmed that Rust, Cargo, and rustup are absent. Node.js 24.19.0, npm 11.9.0, and Java 17 are available.

## Open gates

- Android project generation and APK build require Andreas's PC with Rust and Android SDK
- physical-device installation and test
- signing and optional Play Console spike
- current-head pull-request review and merge
