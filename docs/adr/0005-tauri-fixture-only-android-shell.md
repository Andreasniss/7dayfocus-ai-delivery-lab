# ADR 0005: Tauri fixture-only Android shell

- **Status:** Accepted
- **Date:** 2026-09-01
- **Owner:** Andreas

## Context

The current public project is a React/Vite application. Its deterministic fixture runs entirely in the browser, while live Anthropic, OpenAI, and OpenRouter requests use a loopback-only Node gateway. The earlier private proof of concept established Tauri v2 and Android Studio as a workable mobile packaging path, but also contains product features that are intentionally absent from the public lab.

## Decision

Package the current React application with Tauri v2 for Android and expose only deterministic fixture planning inside the packaged runtime. Detect the Tauri runtime at the UI boundary and remove live-provider choices before a request can be formed. Keep planner state in WebView local storage and grant only Tauri's default core capability.

The Android shell uses `com.nissenlabs.dayfocus`, API 24 minimum support, and API 36 compile/target configuration when the generated Android project is created.

## Consequences

- The mobile app remains useful without a provider account, key, or network request.
- The existing proposal validation, stale-state rejection, human approval, and atomic reducer remain unchanged.
- No Node gateway or credential-handling service must be embedded in the app.
- Live-provider mode is unavailable on Android until a later accepted design defines safe request routing, provider policy compatibility, credential handling, and threat controls.
- A Rust and Android toolchain plus a physical device are still required to produce and verify the installable package.

## Alternatives

An installable PWA would be smaller but would require a hosted deployment and would not reuse the earlier Tauri learning. Capacitor would add a new wrapper stack. Native Android would duplicate validated domain logic. Direct provider calls from the WebView were rejected because they would expand credential and network boundaries solely to preserve feature parity.

