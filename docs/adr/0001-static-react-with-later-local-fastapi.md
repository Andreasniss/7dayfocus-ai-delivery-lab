# ADR 0001: Static React First, Optional Local FastAPI Later

- **Status:** Accepted
- **Date:** 2026-08-30
- **Decision scope:** P01 architecture and the boundary for a later local companion

## Context

The project needs a small, inspectable first milestone that can be opened locally without an account, a provider credential, or a production backend. Its public examples must be safe to share and easy to distinguish from real operational data.

Starting with a network service would add packaging, security, data-lifecycle, and deployment obligations before P01 has a demonstrated need for them. At the same time, later experiments may need capabilities that a browser should not own, such as local file access, secret-bearing provider calls, or Python-only processing.

This ADR selects a sequence. The P01 React implementation is present in the acceptance candidate; the later companion is not built.

## Decision

### P01: static React client

The first application surface will be a React client that can be built into static HTML, CSS, and JavaScript assets.

- P01 starts with empty local browser state; automated tests use fictional examples.
- The baseline requires no runtime application server, provider account, API key, telemetry, or external AI request.
- No secret may be embedded in the client bundle.
- Runtime CDN assets and third-party trackers are excluded from the baseline.
- A feature is not described as delivered until its implementation and verification evidence are committed.

The development toolchain may require Node.js, but the built client must not require a Node.js or Python server to execute its baseline flow.

### Later milestone: optional local FastAPI companion

FastAPI may be added in a later ADR-backed milestone when a concrete browser-external capability justifies it. The companion will be a separate, explicitly started local process rather than a hidden prerequisite for the static client.

Its initial boundary must be narrow:

- bind to `127.0.0.1` by default;
- expose only documented endpoints needed by the client;
- restrict browser origins and validate all inputs;
- keep credentials in a server-side environment or suitable local secret store, never in the browser bundle;
- make outbound provider calls opt-in and visible; and
- preserve a useful static mode when the companion is absent.

Non-loopback access, persistent real data, authentication, multi-user operation, or cloud hosting are not implied by this decision. Each would require a separate design and threat review.

## Rationale

Static-first keeps the P01 trust boundary small. It makes the baseline reviewable as files, avoids an unnecessary server lifecycle, and lets the project demonstrate interface and delivery discipline with synthetic data.

Reserving a local companion avoids forcing sensitive or privileged work into browser code later. FastAPI is a reasonable candidate because it supports a typed, documented Python boundary without turning P01 into a hosted platform.

## Consequences

### Benefits

- The baseline can work locally without credentials or a long-running backend.
- Static assets are straightforward to inspect, test, and reproduce.
- Synthetic fixtures keep public demonstrations independent of private systems.
- A later companion can be added only when its cost and trust boundary are justified.

### Costs and constraints

- Browser-only P01 cannot safely hold provider secrets or perform unrestricted local file operations.
- Client-side state is not a substitute for durable or multi-user persistence.
- Adding the companion creates a second runtime, API compatibility work, packaging needs, and new security obligations.
- Loopback-only software can still be attacked through a browser or malicious local process, so validation and origin controls remain necessary.

## Alternatives considered

### Build React and FastAPI together in P01

Rejected for P01 because it expands the attack surface and delivery burden before a server-side requirement has been evidenced.

### Use a hosted backend or serverless functions

Rejected for the baseline because it introduces accounts, remote data handling, deployment ownership, and operating-cost questions that are outside the local-only scope.

### Package a desktop application immediately

Deferred because desktop packaging and update security add complexity that the first static workflow does not require.

## Follow-up triggers

Before implementing the FastAPI companion, record the motivating use case, endpoint contract, data flows, credential handling, logging and retention rules, dependency plan, test evidence, and revised threat assumptions. Update `BASELINE.md`, `PROVENANCE.md`, `SECURITY.md`, and the README in the same milestone.

## Independence and license

This architecture is for an independent Apache-2.0 project. It does not indicate affiliation with or endorsement by Anthropic, OpenAI, or any other provider, and it does not assert that Claude or another provider is integrated.
