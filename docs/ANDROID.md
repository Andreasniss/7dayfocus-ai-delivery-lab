# Android Build and Personal-Device Test

This runbook completes P11 from a PC with Android Studio and a physical Android phone. The current Android package is deliberately fixture-only. It does not embed the local Node provider gateway, accept an API key, or call Anthropic, OpenAI, or OpenRouter.

## Expected result

The required P11 outcome is a debug build installed and tested on Andreas's phone. Google Play is optional and starts only after that result.

## One-time PC setup

Install:

- Node.js 24 and npm 11;
- [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with the **Desktop development with C++** workload and a Windows SDK;
- Rust through [rustup](https://rustup.rs/);
- [Android Studio](https://developer.android.com/studio) with Android SDK Platform 36, Android SDK Build-Tools 36, Android SDK Platform-Tools, Android SDK Command-line Tools, and the side-by-side NDK; and
- the Android USB driver for the phone when Windows does not recognize it through ADB.

Keep several gigabytes free for Rust, Gradle, the Android SDK, and the NDK. On a space-constrained PC, install the SDK on a data drive and point `ANDROID_HOME`, `NDK_HOME`, `CARGO_HOME`, and `GRADLE_USER_HOME` there. Tauri still requires the Microsoft linker from the C++ Build Tools; a GNU Rust host toolchain is not a supported substitute on Windows.

Add the Rust Android targets:

```powershell
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
```

Set the environment paths for the current PowerShell session. Replace the SDK and NDK values with the paths shown by Android Studio under **Settings > Languages & Frameworks > Android SDK**:

```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:NDK_HOME = "$env:ANDROID_HOME\ndk\<installed-version>"
$env:Path += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\cmdline-tools\latest\bin;$env:USERPROFILE\.cargo\bin"
```

Verify the toolchain:

```powershell
node --version
npm --version
rustc --version
cargo --version
java -version
adb version
```

## Resume the exact repository change

```powershell
git clone https://github.com/Andreasniss/7dayfocus-ai-delivery-lab.git
cd 7dayfocus-ai-delivery-lab
git fetch origin
git switch p11/android-personal-install
npm ci
npm run verify
npm run tauri info
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo check --manifest-path src-tauri/Cargo.toml --locked
```

If P11 has already been merged, use `git switch main` and `git pull --ff-only` instead.

Generate the Android Studio project once:

```powershell
npm run android:icons
npm run android:init
```

The icon command reproducibly generates platform assets from the committed `src-tauri/app-icon.svg`; generated icon variants are intentionally not versioned. Do not overwrite an existing `src-tauri/gen/android` without reviewing its diff. Confirm that the generated `app/build.gradle.kts` uses `compileSdk = 36` and `targetSdk = 36` before considering Google Play.

## Install on Andreas's phone

On the phone:

1. Enable Developer options.
2. Enable USB debugging.
3. Connect the USB cable and accept the computer's debugging fingerprint.

On the PC:

```powershell
adb devices
npm run android:dev
```

`adb devices` must show one authorized device. `android:dev` builds, installs, and opens the development package. Keep it in the foreground so Gradle, Rust, ADB, and WebView errors remain visible.

Then produce a reusable ARM64 debug APK:

```powershell
npm run android:build:debug
Get-ChildItem -Recurse src-tauri\gen\android\app\build\outputs\apk\*.apk
```

Install the reported APK when needed:

```powershell
adb install -r <path-to-debug-apk>
```

## Device checklist

Record the Android version, general device model, app version, commit SHA, and result for every row. Do not record the device serial number.

| Test | Expected result |
| --- | --- |
| Install and launch | App opens without crash or account prompt |
| Add/edit/complete/priority/delete | Each action updates the intended task only |
| Move by touch | A long press and drag moves one task to the selected day |
| Restart persistence | Tasks remain after fully closing and reopening the app |
| Assistant providers | Only `Fixture demo (no key)` appears |
| Proposal generation | Generation changes no task before approval |
| Proposal approval | The complete valid diff applies atomically after approval |
| Stale proposal | Changing the week before approval blocks the old proposal |
| Import/export | Works through Android WebView file surfaces, or the exact limitation is recorded |
| Portrait layout | Controls remain readable and tappable at the phone's normal display scaling |
| Offline relaunch | Planner and fixture work with airplane mode enabled |
| Update/reinstall | `adb install -r` preserves expected state; uninstall behavior is documented separately |

Append observed results to [`P11 evidence`](ai-dlc/changes/P11-android-personal-install/evidence.md). Device success requires the checklist, not merely a successful Gradle build.

## Optional Google Play spike

Start a timer only after the device checklist passes. Stop the cumulative Play work at three focused hours or earlier when an account, identity, tester, continuous-testing, policy, privacy, security, or engineering gate cannot be completed safely inside the remaining time.

Within the time box:

1. Create a keystore outside the repository and back it up safely.
2. Configure ignored `keystore.properties`; never commit the keystore or passwords.
3. Run `npm run android:build:bundle` and locate the `.aab` under `src-tauri/gen/android/app/build/outputs/bundle/`.
4. Complete accurate app content, privacy, Data safety, content rating, target audience, and store-listing fields.
5. Upload first to internal testing or the furthest valid track available to the account.

Google states that some personal developer accounts created after 13 November 2023 need a closed test before production access. From 31 August 2026, new mobile apps must target API 36. Record the actual account-specific gate instead of assuming it applies.

References: [Tauri Android prerequisites](https://v2.tauri.app/start/prerequisites/#android), [Tauri Google Play guide](https://v2.tauri.app/distribute/google-play/), [Android target API requirements](https://support.google.com/googleplay/android-developer/answer/11926878), and [Play app setup](https://support.google.com/googleplay/android-developer/answer/9859152).
