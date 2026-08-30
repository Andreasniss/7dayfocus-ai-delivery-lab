# AI-Assisted Delivery Lifecycle

This directory makes the project's AI-assisted delivery process inspectable through version-controlled intent, specifications, plans, diffs, tests, review findings, and evidence. Candidate artifacts become committed evidence only when they are included in a Git revision.

## Honest adoption record

This lifecycle layer was introduced **during P02, after P02 implementation work had already begun**. The P02 packet is therefore a contemporaneous mid-change capture, not proof that the full artifact chain preceded the first P02 code edit. Dates, status, and evidence must not be backdated or rewritten to imply otherwise.

P01 also predates this layer. Its existing disclosure record remains the evidence for that milestone.

## What comes directly from Anthropic guidance

Anthropic's public AI-native SDLC playbook proposes a committed flow from intent to specification to plan, then code and tests, pull-request review findings, and incident learning. It treats accepted artifacts as gates for the next stage, Git and pull requests as an audit trail, and humans as owners of high-judgment and production-boundary approvals.

Anthropic's public guidance also documents:

- `CLAUDE.md` as persistent project context, including `@path` imports;
- repository settings and hooks as enforceable controls;
- specialized review and verification agents; and
- security controls that operate across prompts, generated code, dependencies, credentials, and deployment boundaries.

Those are guidance and product capabilities, not a formal certification or universal compliance standard.

## What this repository infers or chooses

The following are our provider-neutral implementation conventions, not requirements asserted by Anthropic:

| Convention | Project rationale |
| --- | --- |
| `AGENTS.md` as the shared primary instruction file | Gives different coding agents one concise repository contract |
| `CLAUDE.md` importing `AGENTS.md` | Reuses that contract through Claude Code's documented import mechanism |
| `REVIEW.md` and the `P0`–`P3` model | Makes review criteria and merge impact explicit |
| `docs/ai-dlc/changes/<change>/` | Keeps intent, specification, plan, and evidence together per change |
| `evidence.md` as a concise result ledger | Separates observed checks from generated explanations or raw transcripts |
| GitHub issue, then pull request, as live status records | Uses the issue for backlog scope/status and the opened pull request for the candidate diff, findings, responses, and approval |

## Artifact flow

For a new change, the target sequence is:

1. Draft `intent.md` and obtain Andreas's recorded acceptance.
2. Draft and review `spec.md`, then obtain Andreas's recorded acceptance.
3. Draft and review `plan.md`, then obtain Andreas's recorded acceptance.
4. Change code and tests in a focused branch.
5. Record actual commands and results in `evidence.md`.
6. Use the GitHub pull request to record the diff, reviewer findings, responses, and final human approval.
7. Turn material incidents or escaped defects into a new evidence/learning record rather than erasing them from history.

P02 is the disclosed transition exception: coding began before steps 1–3 were formalized or accepted. Its packet was added when the gap was identified, reconciled with the implementation and review, and accepted by Andreas before merge. P03 follows the intended pre-implementation acceptance sequence.

## Current and deferred controls

P02 added the minimum documentation layer and the domain/persistence hardening it describes. Later changes may consider, on their own merits:

- scoped `.claude/rules/` files;
- `.claude/settings.json` permissions;
- deterministic hooks;
- dedicated verifier and adversarial-review agents;
- reusable skills;
- evaluation cases, pull-request templates, and hosted CI when the platform permits it.

No P03 control is claimed as implemented by the existence of this document.

## Privacy, evidence, and ownership

- Human owner and final approver: **Andreas**.
- Repository visibility and publication remain human-controlled decisions and require Andreas's explicit approval.
- Do not commit raw chat transcripts, prompt histories, hidden reasoning, private chain-of-thought, credentials, personal data, customer data, or employer-confidential material.
- Preserve concise decisions, input/output contracts, diffs, test cases, reproducible commands, tool results, findings, limitations, and approvals.
- Before a pull request exists, the GitHub issue is the authoritative live scope/status record. Once opened, the pull request is authoritative for the candidate diff, findings, responses, and approval; the linked issue remains the backlog scope record. Markdown files are committed change records and may lag live discussion until updated in the candidate diff.

## Official sources

Reviewed on 2026-08-30. These pages may evolve; the repository records the project conventions adopted from the guidance rather than treating the linked text as a fixed certification standard.

- [The AI-native software development lifecycle playbook](https://claude.com/blog/the-ai-native-sdlc-playbook)
- [How Anthropic secures its AI-native software development lifecycle](https://claude.com/blog/how-anthropic-secures-its-ai-native-software-development-lifecycle)
- [Claude Code: Manage memory](https://code.claude.com/docs/en/memory)
- [Claude Code: Code review](https://code.claude.com/docs/en/code-review)
- [Claude Code: Settings](https://code.claude.com/docs/en/settings)
- [Claude Code: Hooks](https://code.claude.com/docs/en/hooks)

## Independence

This is an independent project. Its process is derived from selected public material and adapted with our own conventions. It is not affiliated with, sponsored by, endorsed by, approved by, or certified by Anthropic, and it makes no claim of Anthropic compliance.
