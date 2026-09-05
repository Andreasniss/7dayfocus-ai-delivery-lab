# P11 Android Personal Install: Evidence

- **Owner:** Andreas
- **Status:** Implementation in progress
- **Evidence date:** 2026-09-05

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
- Microsoft's current MSVC guidance documents the standalone Build Tools, the Desktop development with C++ workload, and the generic stable Winget package used for Visual Studio 2026 and later: <https://learn.microsoft.com/en-us/cpp/overview/acquire-msvc>
- Google Play requires new apps submitted from 31 August 2026 to target Android 16, API 36: <https://support.google.com/googleplay/android-developer/answer/11926878>
- Google documents additional testing gates for some personal developer accounts created after 13 November 2023: <https://support.google.com/googleplay/android-developer/answer/9859152>

## Environment inventory

- The original cloud environment provided Node.js 24.19.0, npm 11.9.0, and Java 17, but not Rust, Cargo, an Android SDK, or a physical device.
- The PC continuation used Node.js 24.11.1, Rust and Cargo 1.98.1, Temurin Java 17.0.20.1, Android SDK Platform 36, Build-Tools 36.0.0, Platform-Tools 37.0.1, NDK 29.0.14206865, current stable Microsoft Build Tools 2026 version 18.9.1 with MSVC 14.51.36231, Windows SDK 10.0.26100, and all four documented Rust Android targets.
- The Android SDK, NDK, Java, Cargo cache, and Gradle cache were placed on the data drive because the system drive did not have enough free space for the normal Android Studio installation.
- Initial Tauri diagnostics found WebView2 but no Visual Studio or Visual Studio Build Tools instance with the required MSVC and Windows SDK components. The required current stable Build Tools components were then installed on the data drive.
- `adb devices -l` started ADB successfully but reported no connected device.

## Observed results

- Targeted mobile-boundary and integration tests: 23 passed across `runtime.test.ts`, `PlanAssistant.test.tsx`, and `App.test.tsx`.
- TypeScript type checking passed.
- Oxlint passed with warnings denied.
- Locked install and the complete web verification gate passed: 17 test files and 249 tests, including 24 deterministic evaluation cases, followed by the production Vite build.
- The production bundle built successfully with 49 transformed modules and a 289.24 kB JavaScript artifact before gzip.
- `npm audit --omit=dev` reported zero known runtime dependency vulnerabilities.
- `git diff --check` and the credential/private-key signature scan passed.
- Hosted Verify [run #35](https://github.com/Andreasniss/7dayfocus-ai-delivery-lab/actions/runs/33483496032) passed on behavior head `44423b99756550f9558395c45bbb4c51fa0acc45` after the fail-closed request guard and 249th test were added.
- `tauri info --verbose` recognized Tauri CLI 2.11.4, the React/Vite project, CSP, development URL, and frontend distribution path.
- `tauri icon src-tauri/app-icon.svg` generated the Android and bundle variants successfully; the 256 px render was visually checked for legibility. Generated variants remain reproducible output and are not committed.
- `tauri android init --ci` stopped before modifying the generated Android project because `cargo` is unavailable. The observed error was `failed to run command cargo metadata ... No such file or directory`.
- Tauri environment diagnostics also confirmed that Rust, Cargo, and rustup are absent. Node.js 24.19.0, npm 11.9.0, and Java 17 are available.
- On the PC continuation, `npm ci` completed from the locked graph with zero reported vulnerabilities and `npm run verify` passed: 17 test files and 249 tests, followed by the same 49-module production build.
- Rust formatting initially found one extra trailing blank line in each of the three minimal shell files. Those formatting-only defects were removed, after which `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` and `git diff --check` passed.
- Cargo generated the previously missing application `Cargo.lock`, resolving 430 packages, so subsequent Rust checks can use `--locked`.
- `tauri android init --ci` succeeded on the PC and generated the Android Studio project. The committed configuration uses `compileSdk = 36`, `buildToolsVersion = "36.0.0"`, `targetSdk = 36`, `minSdk = 24`, and application ID `com.nissenlabs.dayfocus`. The source manifest declares only `android.permission.INTERNET`; the packaged manifest also contains AndroidX's app-scoped `DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`.
- The native MSVC `cargo check` stopped because `link.exe` is unavailable. An isolated GNU-host experiment compiled most dependencies but the Tauri build script exited with `STATUS_ACCESS_VIOLATION`; it is not accepted as a replacement for Tauri's documented Microsoft C++ Build Tools prerequisite.
- `npm run android:build:debug` completed the frontend build and began the ARM64 Rust build, then stopped at the same unsupported GNU-host Tauri build-script failure. No APK was produced.
- A WSL build fallback was evaluated but abandoned without build evidence because the Linux NDK requires case-sensitive storage and the available data-drive mounts could not provide a reliable extraction path without broader machine changes.
- A legacy year-specific Winget package ID initially selected Build Tools 2022 even though Build Tools 2026 was current. The installation was stopped, the incomplete 2022 instance was removed, and the generic current package ID was resolved against Microsoft's documentation and Winget before continuing with Build Tools 2026 version 18.9.1. The retrospective action is to prefer the latest stable vendor release and document any required older-version exception before installation.
- Tauri CLI 2.11.4 diagnostics still failed to recognize the installed Build Tools 2026 instance and suggested its hard-coded Visual Studio 2022 download. The direct MSVC checks and Android build below passed, so the diagnostic is recorded as a current-version detection limitation rather than a requirement to install the older toolchain.
- With Build Tools 2026 active, `cargo check --manifest-path src-tauri/Cargo.toml --locked` passed in 5 minutes 57 seconds using the MSVC host toolchain.
- Gradle initially selected Build-Tools 35.0.0 by default. The generated project was pinned to the already installed latest stable Build-Tools 36.0.0, Gradle build output was cleaned, and `npm run android:build:debug` then passed from a clean Android output state.
- The resulting universal debug APK is ARM64-only and 132,713,374 bytes. `aapt` confirmed package `com.nissenlabs.dayfocus`, version `0.1.0`, minimum SDK 24, and compile/target SDK 36. `apksigner` verified APK Signature Scheme v2. The observed SHA-256 was `8C694F0079929FA5C828D90C3D7BEB62C57A6EEF54EA37ED66AD07042AFD0299`.
- The successful build emitted upstream/generated deprecation warnings for Tauri Android APIs and Gradle features, plus one Android SDK XML-version compatibility warning during the first Gradle run. They did not fail the build; no application behavior claim is inferred from that result.

## Open gates

- physical-device installation and test
- signing and optional Play Console spike
- final documentation-head verification, pull-request review, and merge after the PC/device evidence is appended
