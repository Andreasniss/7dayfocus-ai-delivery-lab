# Evidence: artifact discoverability

## Source inspection

On 6 September 2026, inspected the default branch at `abca39d5731f2aa5fd4ab3d0fb6a315c001bfbec` and Anthropic's live [AI-native SDLC playbook](https://claude.com/blog/the-ai-native-sdlc-playbook).

The source recommends an `intent/` folder for a single product, an adjacent `spec.md`, and a committed `plan.md`. It does not name `evidence.md` or prescribe exactly four files per cycle. The existing `docs/ai-dlc/changes/` layout remains a project convention. Historical full folder names and artifact URLs are preserved.

Root `PRIVACY.md` covers repository publication hygiene. Root `PROVENANCE.md` records source origins and human/AI roles. Neither filename establishes a universal AI-DLC requirement or a machine-verified assurance.

## Candidate verification

The documentation candidate on base `abca39d5731f2aa5fd4ab3d0fb6a315c001bfbec` passed `npm run verify` on 6 September 2026: lint, TypeScript checks, 253 tests across 18 files, and the production build. Dependencies were copied from an existing installation with a byte-identical lockfile; this was not a fresh network installation. Application code is unchanged.

The changed Markdown's local file and directory destinations resolved successfully. The complete documentation diff was inspected for attribution, source boundaries, and historical URL preservation.

These observations were made before committing the documentation candidate. They are not a claim of a committed-candidate helper run or fresh Android/device testing. The PR carries exact-candidate publication checks, review findings, CI, and merge status. Historical application and device evidence is unchanged.
