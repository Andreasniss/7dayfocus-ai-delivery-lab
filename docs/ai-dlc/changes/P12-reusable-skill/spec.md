# Implementation contract

Derived implementation details under the authorized pilot scope; these are not a claim of separate human review of each technical choice.

- Package a self-contained `evidence-sdlc` skill with official-source mapping and adoption instructions.
- Preserve the host repository's planning, privacy, review, and release requirements. A fast path never overrides them.
- Provide a standard-library verification helper that runs reviewed argument arrays, requires a clean committed revision, fails on any unsuccessful or unavailable check, and reports revision/configuration identity without retaining raw command output.
- Treat its report as reproducible evidence, not authenticated approval or a security boundary. Checks execute with the caller's privileges.
- Keep application verification and skill tests separate; run both for each pilot.
- Independently review realistic usage and record limitations. Do not manufacture efficiency or live-model-quality results.
