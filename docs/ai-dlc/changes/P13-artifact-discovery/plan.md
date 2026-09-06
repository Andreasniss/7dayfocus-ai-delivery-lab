# Plan: document the existing artifact layout

This plan implements the owner's direct documentation request and the bounded [specification](spec.md), with no new feature or release boundary.

1. Check Anthropic's live playbook and the actual repository paths.
2. Add root README navigation and a lifecycle file map, preserving existing records and source distinctions.
3. Inspect the complete diff and resolve local Markdown destinations.
4. Run the repository's required `npm run verify` gate and the staged/outgoing publication privacy checks.
5. Open a focused PR; inspect exact-candidate review and CI results, resolve findings, and merge within existing authorization. The PR remains the live status owner.
6. Synchronize the skill and website explanations in their own repositories.

Stop publication on broken links, incorrect attribution, unresolved material findings, or a failed required check. Record actual results in [evidence.md](evidence.md).
