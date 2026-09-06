# Pilot plan

1. Add `skills/evidence-sdlc/` with concise instructions, adoption/source references, verification helper, and deterministic tests.
2. Add a repository-specific check configuration and a CI step running skill tests. Link the skill from existing instructions and README.
3. Copy the reviewed skill bundle to Runbook Relay, with its own check configuration and adoption record. Preserve all existing application contracts.
4. Test helper failures, missing executables, stale revisions, repository mutation, and configuration validation. Run existing repository gates.
5. Record actual pilot results and fresh review findings, fix demonstrated defects, then open privacy-checked PRs.
6. Publish only after required checks pass; synchronize website evidence without claiming measured delivery gains.

The skill initially lives in this repository because the current connector can publish into existing repositories but cannot create a new standalone repository. It remains independently installable.

## Approved standalone extraction follow-through

On 6 September 2026, Andreas approved the standalone publication plan and requested migration of the existing skill identifier. The canonical `ai-sdlc-skill` repository is now published. Pin this adopter's bundle to its reviewed full commit, record file digests, and update the installation source link. This follows the approved extraction plan; it does not change the helper, application behavior, or authority boundaries. Preserve the dated pilot evidence and rerun the existing verification and publication gates.
