# Pilot evidence

See [the pilot record](../../../evidence-sdlc-pilot.md) for exact tested revision, observed results and review limitations. The source bundle was independently implemented from official guidance and passed skill format validation. The Runbook Relay pilot uses the same bundle with repository-specific checks. Publication and final CI are tracked in the pull requests.

## Canonical source pin, 6 September 2026

The adopter bundle matches every file digest from canonical source commit `793ca27f23b336e21b50972919146c9bfcacaba2`. Only installation documentation changed inside the bundle; workflow and helper code are unchanged. The source manifest lives outside the copied bundle. On local candidate `ae1c6c41495dc7b9f2f28884365a0aba65375c16`, the configured helper tests and complete application verification passed with unchanged repository state at the sampled boundaries. Staged and outgoing-history privacy checks passed before upload. This evidence-only addition is followed by a fresh final gate; the PR records that candidate and hosted checks. Review covers scope, source identity, privacy, and truthful claims. Domain, persistence, provider, and release behavior are unchanged. Cross-runtime interactive compatibility remains unmeasured.
