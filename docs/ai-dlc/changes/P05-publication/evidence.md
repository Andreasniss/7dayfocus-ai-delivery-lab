# P05 Publication: Evidence

- **Owner:** Andreas
- **Opened:** 2026-08-31
- **Completed:** 2026-09-01
- **Live scope:** [GitHub issue #8](https://github.com/Andreasniss/7dayfocus-ai-delivery-lab/issues/8)
- **Status:** Published and verified; explicit rendered-QA waiver retained

Only observed results belong below.

## Intended gates

| Gate | Result |
| --- | --- |
| Official-source review | Nine official Anthropic, AWS, and OpenAI pages were fetched and reviewed across three method workstreams on 2026-08-31; the public copy links the primary sources it uses |
| Locked local verification | `npm ci` installed 133 locked packages; lint and type checking passed; 244 tests in 16 files passed; the Vite production build passed |
| Isolated clean-copy verification | A temporary source copy excluding dependencies and build output repeated `npm ci`, the same 244-test verification gate, and the production build successfully |
| Dependency audit | `npm audit --audit-level=low` reported zero known vulnerabilities in both the working copy and isolated clean copy |
| Credential and disclosure scan | Targeted credential, private-key, secret-assignment, private-email, and machine-path patterns returned no candidate disclosure finding; unfinished-copy review returned only intentional UI/code terms and existing punctuation |
| Website synchronization | The final website head passed its content validator across 38 pages, 12 articles, 14 references, and 12 templates; Hugo 0.165.0 built 179 pages; the built-site validator passed 85 HTML pages, internal references, JSON-LD, sharing metadata, robots.txt, and machine discovery |
| Rendered desktop and mobile QA | Not completed: the permitted cloud browser returned `ERR_BLOCKED_BY_CLIENT` for the executor-local Vite URL. DOM interaction, accessibility, footer, and approval-flow tests passed, but no rendered application screenshot, rendered-quality claim, or accessibility-conformance claim is made. Andreas explicitly waived this unavailable gate on 2026-09-01 and authorized publication with the limitation retained |
| Pull-request review | The exact final head `875d331` received current-head Codex review with no findings. All earlier P1 and P2 findings were fixed and their threads resolved |
| Public visibility and default-branch verification | [PR #9](https://github.com/Andreasniss/7dayfocus-ai-delivery-lab/pull/9) was squash-merged as `1ec9919`; GitHub reports the repository public, and the public repository URL returned HTTP 200 on 2026-09-01 |
| Website deployment | [Website PR #36](https://github.com/Andreasniss/personal-website/pull/36) was squash-merged as `b551ce1`; the [case study](https://andreasnissen.dev/projects/7dayfocus-ai-delivery-lab/) and [comparison article](https://andreasnissen.dev/writing/ai-native-software-delivery-methods/) each returned HTTP 200 with the expected content on 2026-09-01 |

## Claim boundary

Publication shows a locally verified, public pre-1.0 reference project. It does not establish production readiness, security certification, accessibility conformance, live-provider quality, Anthropic compliance, endorsement, adoption, reliability, or scale.
