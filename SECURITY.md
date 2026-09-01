# Security Policy

## Current architecture and trust boundary

The project is a local-only, synthetic-data prototype, not a production service. Its P04 architecture is a React client plus an explicitly started Node gateway bound to `127.0.0.1`. Fixture mode makes no external request. Live mode sends the current planner snapshot and instruction to the user-selected Anthropic, OpenAI, or OpenRouter API.

Do not put secrets into task text or use the project with confidential information, personal data, or production records. Provider API keys belong only in the password field for one active request.

## Supported versions

This is a public pre-1.0 reference project. Security fixes target the latest revision on the default branch. Old commits, forks, screenshots, and unpublished builds are not supported versions. This policy does not provide a response-time or remediation SLA.

## Reporting a vulnerability

Please report suspected vulnerabilities privately:

1. Use the repository's **Private vulnerability reporting** / security-advisory form if it is enabled.
2. If that channel is unavailable, use a non-public contact method listed on the repository owner's profile and name this repository in the subject.

Include the affected revision, impact, reproduction steps, and any safe proof of concept. Do not include live credentials, personal data, or confidential records. Please avoid opening a public issue until the report has been triaged.

Ordinary bugs that do not have security or privacy impact may be filed in the repository issue tracker when it is available.

## Baseline controls

- Keep all fixtures synthetic and all planner content non-sensitive.
- Do not place tokens, passwords, private URLs, or credentials in source, browser bundles, screenshots, logs, or issues.
- Pin or lock dependencies where the selected toolchain supports it, review dependency changes, and retain license notices.
- Avoid remote fonts, analytics, trackers, and runtime CDN dependencies in the baseline.
- Treat generated content and imported files as untrusted input.
- Report only checks that were actually run; documentation is not evidence that a control works.

## Current data handling and limits

P02 stores planner state as unencrypted JSON in browser `localStorage` and allows local JSON import/export. The implementation validates a versioned current envelope, migrates the supported P01 key with regenerated IDs, limits imported files to 8 MiB, and exposes unreadable-data replacement and failed-save retry paths. These controls reduce silent failure; they do not provide confidentiality, access control, encrypted storage, a retention policy, secure deletion, backup, cross-device recovery, or production durability. Browser profiles, extensions, local users, exported files, and device backups may be able to access the data.

Use only non-sensitive fictional data in this portfolio reference project. Malformed or unsupported stored data is preserved until the user explicitly confirms replacement, but browser storage and exported files remain user-controlled local artifacts.

The local persistence adapter does not coordinate concurrent tabs. Two open tabs can each hold stale state, and a later write can replace a newer write from the other tab. Treat the current app as single-tab; cross-tab conflict detection is not implemented.

## Provider credentials and outbound requests

- The browser keeps a provider key in React state only until the live request finishes, then clears the field.
- The key is sent in the JSON body of a same-origin loopback request. It is never written to `localStorage`, `sessionStorage`, cookies, URLs, files, exports, analytics, or repository configuration.
- The gateway maps a closed provider enum to three fixed HTTPS endpoints. A user cannot configure an arbitrary base URL.
- The gateway does not log request bodies, keys, prompts, provider responses, or upstream response bodies. User-facing errors are bounded and credential-free.
- The gateway applies host/origin, method, content-type, request-size, schema, and timeout checks. It binds only to IPv4 loopback.
- Provider structured-output enforcement is not trusted as an application security boundary. Every proposal is parsed and validated again before display and approval.

Browser extensions, local malware, a compromised local process, provider infrastructure, DNS/TLS compromise, and operating-system inspection remain outside this prototype's protection boundary. Live requests are subject to the selected provider's billing, retention, abuse-monitoring, and data-processing policies.

## Model-output and approval controls

- Model output may reference only existing incomplete task IDs and may propose only a day move, a priority state, or both.
- The parser rejects extra fields, malformed IDs, duplicates, unknown/completed tasks, no-op changes, and out-of-week indexes.
- A deterministic final-state simulation rejects task-capacity or priority-capacity violations.
- The UI shows every before/after change. Generation never mutates planner state.
- Approval compares the full planner revision again and dispatches one atomic reducer action. Stale or invalid proposals produce no partial mutation.

Semantic planning quality remains probabilistic. Schema validity and deterministic invariant checks do not establish that a proposed plan is useful.

## AI-assisted repository controls

`AGENTS.md`, `CLAUDE.md`, and `REVIEW.md` provide instructions and review conventions; prompt text is not a security boundary. The repository does not commit Claude Code permissions, sandbox settings, hooks, specialized agents, or reusable skills. Any such controls require a later gated change and must not be claimed from documentation alone.

## Local gateway boundary

ADR 0004 supersedes ADR 0001's optional FastAPI direction with a smaller Node gateway. The built static client remains usable in fixture mode without live provider access. Adding non-loopback access, authentication, a hosted proxy, provider-key persistence, external tools, autonomous execution, or shared/remote application data requires a new threat review and explicit owner approval. A loopback binding reduces exposure; it does not make the gateway production-safe.

## Independence

This security policy belongs to an independent project and is not an assurance from Anthropic, OpenAI, or any other provider. The project is not affiliated with, sponsored by, or endorsed by those organizations.
