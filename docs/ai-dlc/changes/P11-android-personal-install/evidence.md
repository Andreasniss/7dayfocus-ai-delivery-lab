# P11 Android Personal Install: Evidence

- **Owner:** Andreas
- **Status:** Physical-device outcome verified; final PR gates tracked in #19
- **Evidence date:** 2026-09-06

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
- `tauri icon src-tauri/app-icon.svg` generated the Android and bundle variants successfully; the 256 px render was visually checked for legibility. Intermediate bundle variants remain ignored; Android launcher resources were later committed with the generated project during the PC continuation.
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

## PC follow-up: 6 September 2026

- Refreshed candidate head `e1a8dc8923b6c52b635007e95fca3fc6bf841207` was clean. Its hosted [Verify check](https://github.com/Andreasniss/7dayfocus-ai-delivery-lab/actions/runs/33958053652/job/101284855541) completed successfully.
- Microsoft's installed-product inventory now reports Visual Studio Build Tools 2026 version 18.9.1 as complete, launchable, stable (not prerelease), and not requiring a reboot.
- The PC's system Node version did not match `.nvmrc`. An isolated official Node.js 24.19.0 distribution was checked against the vendor's SHA-256 checksum and its executable's valid OpenJS Authenticode signature, then paired with the repository-pinned npm 11.9.0. System-wide Node/npm settings were not changed. The existing pins were preserved as the repository's reproducibility exception to the latest-stable setup preference.
- With those exact Node/npm versions, `npm ci`, `npm run verify`, `npm audit --omit=dev`, and `git diff --check` passed on this documentation-only continuation: 17 test files, 249 tests (including the 24 deterministic cases), and the 49-module production build; zero known runtime npm vulnerabilities. npm 11.9.0 warned that it does not recognize the existing user `min-release-age` configuration; that user setting was not changed, and the locked install was used.
- The existing APK was rehashed and still matches `8C694F0079929FA5C828D90C3D7BEB62C57A6EEF54EA37ED66AD07042AFD0299`. Rehashing is artifact-integrity evidence, not a new build or device test.
- A fresh `adb devices -l` check successfully started the device bridge but returned no connected devices. Installation and every physical-device checklist result remain pending.
- Runbook review restored explicit reset, keyboard-focus, and error-state checks from the accepted specification, and added an existing-installation safeguard because the predecessor shares the package identifier. These are documentation-only changes, not newly verified mobile behavior.

## Physical-device feedback: 6 September 2026

- Device: Pixel 8 Pro, Android 17 / API 37. No installation of `com.nissenlabs.dayfocus` existed before this session's install.
- The recorded ARM64 APK installed successfully and launched `MainActivity` without an account prompt. App version is `0.1.0` (version code 1), targeting API 36. The installed application's sources match `d8655d890fbeb94db0bc84f186c115ea99d1c110`; the only changes since build head `e1a8dc8` were documentation.
- **[P2] Status bar overlaps the header.** On first portrait launch, the app header appeared underneath the Pixel's clock, status icons, and camera-cutout area. Andreas independently reported the same overlap. The generated activity enabled edge-to-edge display without handling system-bar or cutout insets. This fails the portrait-layout acceptance check and blocks merge until verified fixed.
- Correction: the native content container applies system-bar and display-cutout padding, then forwards zero values for those handled inset types to WebView while preserving keyboard updates. This follows [Android's WebView inset guidance](https://developer.android.com/develop/ui/views/layout/webapps/understand-window-insets). A device instrumentation test checks the actual WebView bounds against the platform-reported safe area.
- The corrected `npm run android:build:debug` completed and the APK updated the Pixel successfully with `adb install -r`. SHA-256: `6DF7CDF89B406FEC95BEE7BD54F3ACEA4659BF75D8FE05117F141A616D1B02F7`. The saved planner state was identical before and after the update; no task content is recorded here.
- `npm run verify` passed again with the pinned Node/npm versions: 17 files, 249 tests, lint, type checking, and the 49-module production build. `npm audit --omit=dev` reported zero known runtime npm vulnerabilities, and `git diff --check` passed.
- `:app:assembleUniversalDebugAndroidTest` compiled the native regression test successfully in 34 seconds, reusing the freshly built ARM64 Rust library. Execution and visual verification remain pending: the phone automatically locked, and Android reported `showing=true` and `inputRestricted=true`. A zero-sized hidden WebView and black screen capture from that locked state are not evidence of an application layout failure or a successful fix. No lock bypass was attempted.
- After Andreas unlocked the phone, the first native safe-area test passed. The WebView moved from `[0,0][1008,2244]` to `[0,113][1008,2190]`; the clock, battery icons, and header no longer overlapped. The saved state remained identical across that update.
- **[P2] Narrow week cards squeeze task text between controls.** The Pixel displayed a short fictional task one character per line in a 250 px week card. Small-screen cards now put text on its own line. The updated device geometry test passed, and the real task text measured about 206 CSS px wide. This is a layout correction, not a domain or storage change.
- **[P2] Native panning interrupts touch drag.** The phone's long-press gesture reached the intended handle and announced pickup, but horizontal scrolling took over before drop. Setting `touch-action: none` on only the drag handle allowed the same native gesture to drop the fictional task on the adjacent day. This diagnostic used a temporary style override; the committed correction still requires its rebuilt-APK test. The rest of the planner retains normal scrolling.
- **[P2] Export appears available but produces no file.** A registered native tap on Export produced no download event, file picker, or matching planner JSON in Downloads. Import did open Android's document picker, and cancelling preserved state. Android export is now disabled with a visible, accessible limitation message; browser export stays enabled. This avoids expanding native filesystem capabilities or implying a backup exists. Both focused integration regressions passed within the 16-test App suite.
- Task creation with native touch/keyboard input, empty-edit rejection, edit/priority/completion controls, fixture-only provider selection, non-mutating generation, stale-proposal rejection, and one explicit test approval were observed on the Pixel. The approved diff affected exactly one fictional task; the existing user task was not changed. Fixture generation emitted no network requests in WebView diagnostics.
- With airplane mode enabled and Wi-Fi disabled, the app relaunched with all three tasks and generated a non-mutating fixture proposal with no requests. Android WebView still reported `navigator.onLine=true`, so that property is not treated as proof of connectivity. Airplane mode, Wi-Fi, and Bluetooth settings were restored to their initial values afterward. Final-candidate verification remains below as a pending gate.

## Verified device candidate: 6 September 2026

The completed phone pass used the application sources committed as `4220b266154275cd1d7d552b1c1af2b0b5595801`. The APK was built before that commit; the later public-example/test additions did not alter its production bundle. Both builds produced the same `index-CC82P5C4.css` and `index-DHy-1RGQ.js` assets. Subsequent screenshot and evidence changes are documentation-only.

- `npm run verify`: lint, type checking, 18 test files / 253 tests (including 24 deterministic proposal cases), and production build passed with Node 24.19.0 / npm 11.9.0.
- `npm audit --omit=dev`: zero known runtime npm vulnerabilities.
- `npm run android:build:debug`: passed. ARM64 debug APK, 258,299,764 bytes; SHA-256 `FC0B184E803616B3FEA190251A4D3D6DF6C5B23632A81C6EC65869A5D7EAFAD9`. `apksigner verify --verbose` passed APK Signature Scheme v2. This is debug signing, not release signing or Play readiness.
- The native test APK compiled against the same freshly built ARM64 library. `MainActivityInsetsTest` passed on the Pixel in 1.101 seconds: `OK (1 test)`. It checks platform safe-area padding and actual WebView bounds, readable narrow-card text, shipped `touch-action: none` on the drag handle, and the disabled/disclosed Android export control. It does not modify saved tasks.
- The corrected APK updated the existing install successfully. Earlier before/after state fingerprints proved that the native-inset update preserved app data. Final-build relaunch retained all 15 demo tasks; a fresh import and another relaunch exercised persistence without clearing app storage.

### Final phone checklist

| Check | Observed result |
| --- | --- |
| Install / launch / update | Passed on Pixel 8 Pro, Android 17 / API 37; package targets API 36, minimum 24; no account prompt |
| Add / edit / prioritize / complete / delete | Passed with disposable tasks on the installed final build. Native keyboard entry added a test task; edit, priority, completion, and deletion controls worked. Deletion restored the pre-test state fingerprint |
| Error state / keyboard | Empty edit rejected with the visible task-text error; the prior saved value remained intact. Native input and Enter completed task creation |
| Native touch drag | Passed without a diagnostic style override. A native long-press drag moved a fictional task from Sunday to Monday and announced the correct destination |
| Layout / system bars | Status-bar and cutout overlap fixed; the WebView is inside platform safe bounds. Narrow-card text keeps a readable line. Phone screenshots were visually inspected |
| Fixture generation / diff | Only fixture provider offered, no key input. Generation left the saved state unchanged and showed a before/after diff |
| Stale rejection / approval | Editing a task made approval unavailable; attempted stale application changed nothing. A fresh proposal changed exactly one task after one explicit test approval |
| Import | Native Android document picker selected the portable demo. Replacement confirmation appeared. Confirming loaded all 15 tasks; reimport restored the original demo after the behavior tests |
| Export | Limitation: the native WebView download did not produce a file. Export is now disabled with visible accessible guidance; browser export remains enabled |
| Reset | Limitation: no dedicated in-app reset control exists. The verified reimport path resets the fictional demo after replacement confirmation. Android Clear storage / uninstall was not exercised |
| Offline relaunch / persistence | Passed with airplane mode enabled and Wi-Fi disabled. Android reported `Active default network: none`; all 15 tasks returned and a fixture proposal appeared without mutation or WebView network requests. Original airplane, Wi-Fi, and Bluetooth settings were restored |

### Finding dispositions and evidence limits

The four observed P2 findings above are resolved in this candidate: native insets, narrow-card layout, touch panning during drag, and misleading export availability. Export itself is not implemented on Android; the specification expressly allows recording a WebView limitation. No new filesystem or download plugin was introduced. The capability remains `core:default`.

The published [`examples/demo-week.json`](../../../../examples/demo-week.json) is fictional, fixed-date data. Two automated regressions verify import, fresh identifiers, and its documented non-mutating Sunday-to-Saturday fixture proposal. [`docs/screenshots/`](../../../screenshots/) contains inspected captures from the installed app, with no device identifiers or personal tasks. Vivaldi imported the same file successfully; its screen-capture connection timed out, so no desktop screenshot or desktop visual-quality pass is claimed.

Several diagnostic harness attempts failed because of a locked/backgrounded app, quoted selector syntax, an ephemeral connection port, or a closed assistant. Those are not counted as passed checks or app regressions. The successful device outcomes above were observed after correcting the harness state. Raw UI dumps, diagnostic transcripts, private recovery data, and local paths remain outside Git.

The review covered accepted scope, unchanged domain/storage boundaries, fixture/provider separation, user control, test coverage, and public claims. No additional blocking defect was identified in the observed Android follow-up. This is a scoped repository review, not independent human review, an exhaustive security audit, accessibility certification, or broad device-compatibility testing. Existing generated/upstream Gradle/Tauri deprecation warnings remain disclosed.

## Remaining release gates

- Exact final-head hosted CI and PR review/merge, with live status in [PR #19](https://github.com/Andreasniss/7dayfocus-ai-delivery-lab/pull/19).
- The dependent website case study must publish only evidence supported by the merged Android source.
- Release signing and Google Play remain optional, unstarted, and unclaimed. The three-hour Play timer has not started. P07-P10 remain parked.
