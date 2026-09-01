# P11 Android Personal Install: Intent

- **Owner:** Andreas
- **Accepted:** 2026-09-01 through the explicit request to build the next roadmap features
- **Status:** Accepted for implementation
- **Issue:** [#17](https://github.com/Andreasniss/7dayfocus-ai-delivery-lab/issues/17)

## Outcome

Produce a current, reviewable Android build path for 7DayFocus that Andreas can install and test on his personal phone. Preserve the learning value of the earlier private Tauri prototype without restarting the standalone product strategy.

## Reviewer

Andreas is the product, architecture, device-installation, signing, and release owner. A portfolio reviewer should be able to inspect the mobile boundary without Android Studio or a provider key.

## Scope

- Add a minimal Tauri v2 Android shell around the current public React application.
- Keep all planner state local to the Android WebView.
- Make deterministic fixture planning available on Android.
- Disable live-provider choices in the packaged application because the existing loopback Node gateway is not embedded in the Android package.
- Add automated coverage for the mobile capability boundary.
- Add reproducible Android setup, build, install, and device-test instructions.
- Update the threat model, README, roadmap, and portfolio case study only with evidence observed on the reviewed revision.

## Constraints

- Do not copy Supabase, authentication, deep-link, remote-sync, or credential-storage behavior from the predecessor.
- Do not store signing keys or credentials in the repository.
- Do not claim an APK, device installation, or Google Play availability until observed.
- Keep Google Play optional and capped at three focused hours after personal-device success.
- Stop when Android SDK, Rust targets, a connected phone, signing, Play Console, identity, policy, or account-specific testing gates require Andreas's local environment or approval.

## Proof

- Existing web verification remains green.
- Packaged-runtime tests prove that only fixture mode is offered.
- Tauri configuration and Rust source pass every check available in this environment.
- An Android APK build and physical-device test are recorded later from Andreas's PC with exact commit, commands, device class, Android version, results, and limitations.

