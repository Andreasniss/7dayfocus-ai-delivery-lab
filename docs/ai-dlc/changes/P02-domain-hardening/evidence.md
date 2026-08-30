# P02 Domain Hardening: Evidence

- **Owner:** Andreas
- **Record opened:** 2026-08-30
- **Status:** Completed and owner-accepted; pull request #3 merged as `16c04f6`
- **Authoritative live status:** [GitHub pull request #3](https://github.com/Andreasniss/7dayfocus-ai-delivery-lab/pull/3) for the candidate diff, findings, and approval; [GitHub issue #2](https://github.com/Andreasniss/7dayfocus-ai-delivery-lab/issues/2) for backlog scope and status

This record contains observed checks only. P02 implementation began before the AI-assisted lifecycle packet was added; neither this file nor its date is evidence that intent/spec/plan approval preceded the first code change.

## Candidate identity

| Field | Value |
| --- | --- |
| Repository visibility during P02 | Private, rechecked through the authenticated repository connection on 2026-08-30 |
| Local branch | `p02/domain-hardening` |
| Remote base | Exact merged private `main` revision `50721115a392fb96db0bb90c774d351945b86827` |
| Pull request | [#3: P02: harden planner domain and local persistence](https://github.com/Andreasniss/7dayfocus-ai-delivery-lab/pull/3) |
| Candidate commit | The pull request records the current head after each publication; this file cannot self-reference its containing follow-up commit |
| GitHub issue | [#2: P02: Harden planner domain and local persistence](https://github.com/Andreasniss/7dayfocus-ai-delivery-lab/issues/2) |
| Owner acceptance | Recorded before merge |

The local branch is a development worktree and is not claimed to reproduce the exact remote commit ancestry. The authenticated connection confirmed that the repository remained private, the intended base commit existed, and pull request #3 was created from that base. The pull request records the remote commit identity and later review findings.

## Checks actually observed

| Date | Command | Result | Scope and limits |
| --- | --- | --- | --- |
| 2026-08-30 | `npm run typecheck` | Passed | TypeScript project check completed on the then-current local worktree. This is not the final P02 candidate and does not imply tests, lint, build, review, visual QA, or security checks passed. |
| 2026-08-30 | Intermediate-worktree `npm run verify` | Passed | Lint, typecheck, 140 automated tests in 8 files, and the Vite production build passed before the later accessibility review/fixes. This historical row is not the final candidate result and does not establish manual visual quality, complete accessibility, security, or production readiness. |
| 2026-08-30 | Intermediate clean-copy `npm ci` then `npm run verify` | Passed | A temporary copy excluding local Git metadata, installed dependencies, and build output installed 133 packages from the lockfile; lint, typecheck, the then-current 140-test suite, and build passed. This historical row is not the final candidate result or an authenticated fresh clone of the remote. |
| 2026-08-30 | `git diff --check` then `npm run verify` on the frozen worktree | Passed | No whitespace errors; lint, typecheck, 170 automated tests in 10 files, and the Vite production build passed after the final accessibility fixes. |
| 2026-08-30 | Clean-copy `npm ci` then `npm run verify` on the frozen worktree | Passed | A temporary copy excluding Git metadata, installed dependencies, and build output installed 133 packages from the lockfile; lint, typecheck, all 170 tests, and the production build passed. This is not an authenticated remote clone. |
| 2026-08-30 | `npm audit --audit-level=low` and `npm audit --offline --audit-level=low` | Passed | Both npm runs reported 0 vulnerabilities. The offline result is cache-backed; neither result is a penetration test or supply-chain assurance. |
| 2026-08-30 | Targeted secret/disclosure and repository-shape searches | Passed within stated limits | Canonical credential patterns, email addresses, machine-local paths, source network paths, environment files, symlinks, files above 1 MiB, and dependency-file changes each returned zero findings. Dedicated secret scanners were unavailable for this final worktree pass. |
| 2026-08-30 | Local Vite preview plus HTTP requests | Passed | The generated HTML, CSS, and JavaScript each returned HTTP 200 with expected content types. This is an HTTP smoke check, not rendered visual QA. |
| 2026-08-30 | Post-PR-review `npm run verify` | Passed | After making portable v2 require an explicit boolean `completed`, lint, typecheck, 171 automated tests in 10 files, and the production build passed. |
| 2026-08-30 | Post-PR-review clean-copy `npm ci` then `npm run verify` | Passed | A temporary copy installed 133 locked packages; lint, typecheck, all 171 tests, and the production build passed. This is not an authenticated remote clone. |

## Verification status

| Check | Command or method | Status |
| --- | --- | --- |
| Lint | `npm run lint` | Passed on the frozen worktree and clean copy |
| Automated tests | `npm run test` | 171/171 passed in 10 files on the post-review worktree and clean copy |
| Production build | `npm run build` | Passed on the frozen worktree and clean copy |
| Complete local gate | `npm run verify` | Passed on the frozen worktree and clean copy |
| Clean dependency install and clean-copy gate | `npm ci` followed by `npm run verify` in an isolated copy | Passed after installing 133 locked packages; not an authenticated remote clone |
| Dependency audit | Online and cache-backed offline npm audit | Both reported 0 vulnerabilities |
| Secret/disclosure scan | Targeted final-worktree searches | Passed within the stated pattern/tool limits; dedicated final-pass scanners and exact remote history scan remain unavailable |
| HTTP preview smoke | Local preview plus HTML/CSS/JS requests | Passed; three expected assets returned HTTP 200 |
| Manual browser/visual QA | Available cloud browser against the local preview | Not completed: the cloud browser could not access the executor-local URL; no rendered visual claim is made |
| Focused accessibility review | Independent code review plus keyboard, focus, alert, labeling, capacity, dialog, and drag-announcement tests | Final UI re-review reported no remaining P0–P2 findings on the first PR head; the later parser-only change does not alter UI behavior. This is not rendered-browser accessibility conformance. |
| Hosted CI | Successful workflow linked from the pull request | Unavailable/not claimed unless account restriction changes |

## Review findings

Independent code, security/privacy, lifecycle-claims, and accessibility review were run before the first PR head. GitHub's automated review then identified the portable-v2 finding below. It was fixed in a follow-up commit with focused, full, and clean-copy verification; follow-up review found no major issues and the thread was resolved. Findings stay visible here after correction.

| Severity | Finding | Disposition | Evidence |
| --- | --- | --- | --- |
| `P1` | Replacement after a corrupt current key could remove a separate readable P01 key that had never been migrated | Fixed locally | Legacy cleanup is now conditional on a successful migration from that key; application regression test preserves the separate value |
| `P2` | Browser policy could throw while acquiring `window.localStorage` before adapter error handling | Fixed locally | Safe storage acquisition plus a throwing-property-getter test |
| `P2` | Preserved over-capacity data could not make a non-worsening settings or view change | Fixed locally | Per-day excess comparison plus tests for unchanged, reduced, and worsened violations |
| `P2` | P01-reachable long text/higher task counts and portable version `1` needed a bounded compatible migration path | Fixed locally | Explicit recovery bounds, legacy-settings normalization, portable version `2`, version-1 migration, and regression tests |
| `P2` | Rollover UI could allow a request that the atomic reducer rejected, producing a silent no-op | Fixed locally | Shared carry-over preflight, visible capacity alert, exact-fit coverage, and no-partial-update tests |
| `P2` | Review dialog lacked complete modal focus, Escape, and focus-restoration behavior | Fixed locally | Dialog semantics, initial focus, focus trap, Escape handling, opener restoration, and focused tests |
| `P2` | Overdue bulk moves could partially apply and full destinations still exposed invalid drop/action paths | Fixed locally | Deterministic capacity preflight, disabled full destinations, exact-fit/source-priority tests, and visible accessible reasons |
| `P2` | Keyboard drag announcements exposed UUIDs/internal day IDs and the overlay duplicated interactive controls | Fixed locally | Human-readable task/date announcements, noninteractive `aria-hidden` overlay, and regression tests for every announcement phase |
| `P2` | Repeated task and add controls lacked task/day context for screen-reader navigation | Fixed locally | Contextual accessible names, linked capacity explanations, edit-focus restoration, and focused regression tests |
| `P2` | Strict portable v2 accepted a task without `completed` and silently defaulted it to `false` | Fixed in post-review follow-up | Portable v2 now requires an explicit boolean completion state; legacy v1/metadata-free migration retains compatibility defaults; focused regression test plus 171-test full and clean-copy gates pass |
| `P3` | Concurrent browser tabs can overwrite each other with last-write-wins storage | Open, documented limitation | `SECURITY.md`; current app is explicitly single-tab/private-prototype scope |
| `P3` | Browser-local state and exported JSON are plaintext | Open, documented limitation | `SECURITY.md`; only non-sensitive fictional data is permitted |
| `P3` | Overdue bulk moves dispatch sequential reducer actions after a deterministic UI preflight rather than one reducer-level batch action | Open, bounded design debt | Current synchronous path and capacity tests prevent partial capacity failure; a future asynchronous or bypass caller must introduce a batch domain action |

## Acceptance gates

- [x] The post-review worktree matches the accepted intent and specification.
- [x] Publish the portable-v2 fix to pull request #3.
- [x] Confirm pull-request re-review reports no remaining P0–P2 findings.
- [x] `npm run verify` passes with 171 tests on the post-review worktree and isolated clean copy.
- [x] Storage recovery and no-silent-overwrite behavior are demonstrated by tests.
- [x] Manual rendered-browser QA is precisely disclosed as pending because the available browser could not access the local preview.
- [x] Remote base, initial candidate commit, pull request, and repository privacy are recorded; the follow-up head will be recorded by the pull request after publication.
- [x] Andreas records final P02 acceptance.

## Claim boundary

The evidence supports that P02 was owner-accepted after lint, typecheck, 171 automated tests in 10 files, a production build, and a clean-copy locked install and verification run passed after the portable-v2 review fix. Earlier online and cache-backed offline npm audits, targeted worktree scans, and the HTTP preview smoke check applied to the first PR candidate, whose dependency graph and runtime boundary were unchanged by the parser/test/documentation follow-up. It does not support claims of rendered visual quality, production readiness, security certification, accessibility conformance, Anthropic approval/compliance, adoption, reliability, or scale.

Do not add raw transcripts, prompt histories, or private/hidden reasoning here. Record reproducible commands, concise inputs, results, findings, limitations, links, and human approvals.
