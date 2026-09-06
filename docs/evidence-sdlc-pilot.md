# Evidence SDLC pilot

Status: local repository pilot passed, 2026-09-06. Hosted CI and publication are tracked by the delivery PR.

This repository is the initial source home of the independently installable `skills/ai-sdlc-skill` bundle. Runbook Relay pilots the same bundle with different repository-owned commands. The P12 change packet records the scope and implementation plan.

The existing intent/specification/plan requirements remain authoritative. The skill does not replace them or the application's runtime proposal approval boundary. The pilot adds a reusable instruction link, standalone failure tests, a CI test step, and `delivery-checks.json`; application behavior is unchanged.

Observed local result at `251a0381bb964d5e1071ea09c39b9be08c8fe62a`: 12 skill tests and the full npm run verify gate passed, with a clean revision before and after each configured command. The final documentation commit is verified separately in hosted CI. No measured speedup, defect reduction, live-model evaluation, or interactive Claude Code/Codex compatibility is claimed.

## Review and limitations

Independent agent review ran the 12 helper tests and additional isolated probes. It found one wording overclaim about continuous cleanliness; the guide now explicitly limits observation to command endpoints. The reviewer confirmed the correction. Workflow-depth and approval scenarios were textual walkthroughs, not measured autonomous agent runs. No outstanding findings from that review remained.

The two pilots establish repository integration and deterministic behavior only. They do not establish fewer interruptions, faster delivery, lower defect rates, or live Claude Code/Codex invocation compatibility. A future bounded feature change can measure those outcomes before broader rollout.

## Identifier migration

Andreas approved the `ai-sdlc-skill` identifier and standalone packaging on 2026-09-06. Version 0.2.0 renames the bundle and invocation from `evidence-sdlc`; the earlier pilot results above concern version 0.1.0. Current instructions, CI, and check configuration use the new path. The standalone repository has not been created yet. Its source revision will become the update authority only after publication and verification.
