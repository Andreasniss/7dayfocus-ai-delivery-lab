# Review Contract

This file defines the repository's review convention. It is informed by Anthropic's public AI-native SDLC and Claude Code review guidance, but the severity model and review passes below are project choices rather than an Anthropic standard.

## Reviewer objective

Review the candidate change against its applicable intent and specification, including their recorded acceptance status. Prefer concrete, reproducible findings over stylistic preference. A reviewer should be able to identify the affected behavior, the evidence, and the smallest safe correction.

P02 remains the disclosed transition exception: implementation began before the intent and specification were captured or accepted. Changes from P03 onward require recorded acceptance of intent, specification, and plan before implementation.

## Severity

| Severity | Meaning | Merge effect |
| --- | --- | --- |
| `P0` | Immediate credential exposure, destructive data loss, or a critical trust-boundary failure | Block merge; stop work and notify Andreas |
| `P1` | Likely user-data loss, security/privacy breach, or core behavior contradicts the specification | Block merge |
| `P2` | Material correctness, migration, accessibility, test, or maintainability defect | Fix before merge unless Andreas explicitly accepts and records it |
| `P3` | Localized improvement with low user risk | Non-blocking unless it compounds another finding |

## Required review passes

1. **Intent and scope**
   - Does the diff solve the accepted change intent without adding telemetry, authentication, remote persistence, hosted credentials, or unrelated feature work?
   - Are user-visible and data-lifecycle changes represented in the specification?

2. **Domain correctness**
   - Are reducer transitions pure, deterministic, bounded by the configured week, and atomic on invalid input?
   - Are capacity, priority, move, rollover, and settings invariants enforced consistently?

3. **Storage and migration**
   - Is every stored or imported value treated as untrusted?
   - Are schema versions explicit, migrations deterministic, IDs regenerated where required, and corrupt/unsupported data preserved rather than silently overwritten?
   - Can a user observe and recover from read or write failure?

4. **Security and privacy**
   - Does the change keep credentials ephemeral, restrict outbound calls to accepted provider origins, avoid raw transcripts and hidden reasoning, and prevent accidental disclosure?
   - Are dependency, browser-storage, and trust-boundary changes disclosed?

7. **Provider output and human control**
   - Are request bodies bounded, provider-specific, and free of persistence or logging?
   - Is every response independently parsed and validated rather than trusted because the provider accepted a schema?
   - Can the model only propose accepted operations on existing incomplete tasks?
   - Is the full proposal rejected atomically when stale, malformed, duplicated, unknown, or over capacity?
   - Does exactly one explicit approval precede one atomic reducer action?

5. **Tests and evidence**
   - Do tests exercise success, boundary, malformed-input, failure, and no-partial-update paths?
   - Were results recorded only after execution on the candidate revision?
   - Are limitations such as unavailable hosted CI, manual visual QA, or incomplete accessibility review explicit?

6. **Claims and release boundary**
   - Do docs describe only delivered, verified behavior?
   - Does the change avoid production-readiness, security-certification, adoption, scale, Anthropic-affiliation, or "Anthropic-compliant" claims?

## Finding format

Use one finding per item:

```text
[P1] Short actionable title
Location: path:line or affected behavior
Evidence: exact reproduction, input, or contradiction
Impact: user, data, security, or maintenance consequence
Required change: smallest acceptable correction
```

If no blocking finding is identified, say which passes were performed and list any residual limitations. "No findings" is not a claim that the software is secure or production-ready.

## Human approval gates

Andreas retains judgment and approval for:

- accepting or changing intent and user-facing requirements;
- accepting a migration or any behavior that can discard or replace saved data;
- waiving a blocking finding;
- adding providers, credentials, a backend, remote access, sensitive data, or production infrastructure; and
- publishing the repository, releasing a version, or making portfolio claims.

Before a pull request exists, the GitHub issue is the live status record. Once opened, the pull request is authoritative for the candidate diff, findings, responses, and approval; the linked issue remains the backlog scope record. Do not store raw chat transcripts or private/hidden reasoning as review evidence.
