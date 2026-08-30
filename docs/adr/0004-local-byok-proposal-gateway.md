# ADR 0004: Local BYOK Proposal Gateway

- **Status:** Accepted for P04
- **Decision owner:** Andreas
- **Date:** 2026-08-31

## Context

The planner needs real model-provider integration without turning a static browser app into a credential-hosting service. Calling providers directly from the browser would expose keys to browser code, CORS constraints, extensions, and network tooling, while persisting keys would create a new sensitive-data lifecycle.

## Decision

1. A small Node gateway binds to `127.0.0.1`, serves the built app, and owns the allowlisted outbound provider calls.
2. The browser sends a selected provider, model, active-request key, planner snapshot, and instruction over same-origin loopback HTTP.
3. Neither browser nor gateway persists credentials. The gateway logs only method, path, status, duration, and a generated request identifier.
4. Each provider uses its native current structured-output contract. The application still parses and validates every returned value independently.
5. The model produces a proposal, never commands. Only an explicit UI approval dispatches one atomic domain action.
6. Fixture mode is the default public test path and performs no outbound request.

## Consequences

The demo remains locally runnable and provider-flexible without a hosted secret store. Users must trust their own local browser and process, and provider data handling still applies to live requests. A static GitHub Pages deployment can demonstrate fixture mode but cannot safely proxy live BYOK calls; live providers require the local gateway.

## Rejected alternatives

- **Direct browser-to-provider calls:** rejected because keys would be exposed to more browser surfaces and provider CORS behavior.
- **Persisted local keys:** rejected because convenience does not justify a secret lifecycle in this reference app.
- **Hosted proxy:** rejected because it would require authentication, abuse prevention, operational monitoring, and production credential controls outside the project scope.
- **Provider SDKs:** deferred because native `fetch` keeps the adapter surface small and inspectable.

## Independence

This is an independent project decision. Provider names indicate supported APIs only and do not imply endorsement or affiliation.
