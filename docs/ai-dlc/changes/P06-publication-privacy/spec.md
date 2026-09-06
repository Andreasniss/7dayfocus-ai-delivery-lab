# Specification

Accepted on 2026-09-06 with the implementation request. Add a shared dependency-free Git-content privacy check, staged-file and outgoing-commit hooks, CI coverage, and contributor instructions. Keep application prompts and reviewed delivery artifacts public. Pin workflow Actions to verified commit IDs. Do not change application behavior, repository visibility, access, or deployment configuration.

Checks must read Git objects, inspect every outgoing commit, redact findings, and fail on missing history or malformed notebooks. Local hooks remain opt-in and bypassable; CI cannot undo a public push. Human review remains necessary for confidential facts and image contents.
