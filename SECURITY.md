# Security Policy

## P01 security posture

P01 is a local-only, synthetic-data prototype baseline, not a production service. Its selected first architecture is a static React client. P01 does not include accounts, a hosted API, remote model calls, production persistence, telemetry, or a claim of production-grade security.

Do not use P01 with secrets, confidential information, personal data, or production records.

## Supported versions

There is no supported public release yet. After the first release, security fixes will target the latest revision on the default branch while the project remains pre-1.0. Old commits, forks, screenshots, and unpublished builds will not be supported versions. This policy does not provide a response-time or remediation SLA.

## Reporting a vulnerability

Please report suspected vulnerabilities privately:

1. Use the repository's **Private vulnerability reporting** / security-advisory form if it is enabled.
2. If that channel is unavailable, use a non-public contact method listed on the repository owner's profile and name this repository in the subject.

Include the affected revision, impact, reproduction steps, and any safe proof of concept. Do not include live credentials, personal data, or confidential records. Please avoid opening a public issue until the report has been triaged.

Ordinary bugs that do not have security or privacy impact may be filed in the public issue tracker.

## Baseline controls

- Keep all P01 fixtures synthetic and all P01 workflows local.
- Do not place tokens, passwords, private URLs, or credentials in source, browser bundles, screenshots, logs, or issues.
- Pin or lock dependencies where the selected toolchain supports it, review dependency changes, and retain license notices.
- Avoid remote fonts, analytics, trackers, and runtime CDN dependencies in the baseline.
- Treat generated content and imported files as untrusted input.
- Report only checks that were actually run; documentation is not evidence that a control works.

## Current data-handling limits

P01 stores planner state as unencrypted JSON in browser `localStorage` and allows local JSON import/export. It does not provide access control, encrypted storage, schema-version migration, a retention policy, secure deletion, or recovery from every malformed or unavailable-storage condition. Browser profiles, extensions, local users, exported files, and device backups may be able to access the data.

Use only non-sensitive fictional data in this pre-release baseline. P02 is expected to add stricter runtime validation and user-visible failure handling; that future work is not a current control.

## Requirements for a later FastAPI companion

The FastAPI companion described in ADR 0001 is a future option, not a P01 feature. If introduced, it must at minimum:

- be installed and started explicitly, with the static client remaining useful without it;
- bind to `127.0.0.1` by default and clearly warn before any non-loopback exposure;
- use a narrow allowlist for browser origins and reject unexpected methods and content types;
- validate inputs, constrain file paths and payload sizes, and avoid executing user-supplied code;
- redact secrets and sensitive content from logs and errors; and
- keep any provider credential outside the browser bundle and repository, with outbound calls disabled until the user deliberately configures them.

Adding remote access, authentication, external AI calls, or persistent real data requires a new threat review and updated documentation. A loopback binding reduces exposure; it does not make the companion production-safe.

## Independence

This security policy belongs to an independent project and is not an assurance from Anthropic, OpenAI, or any other provider. The project is not affiliated with, sponsored by, or endorsed by those organizations.
