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

P02 is the disclosed transition exception: coding began before steps 1–3 were formalized or accepted. Its packet was added when the gap was identified, reconciled with the implementation and review, and accepted by Andreas before merge. P03 and P04 follow the intended pre-implementation acceptance sequence.

P05 was initiated by Andreas's explicit publication goal on 2026-08-31. Its accepted packet records the documentation, evidence, website synchronization, visibility, and publication closeout.

P06 was initiated on 2026-09-01 after a lifecycle audit found status drift in completed packets and no active roadmap. It reconciles those records without backdating them and establishes [`ROADMAP.md`](../../ROADMAP.md) plus issues [#12](https://github.com/Andreasniss/7dayfocus-ai-delivery-lab/issues/12)–[#17](https://github.com/Andreasniss/7dayfocus-ai-delivery-lab/issues/17) as the forward backlog.

## How this relates to AWS AI-DLC

This repository uses the smallest useful Anthropic-inspired artifact handshake. It does not implement the full AWS AI-Driven Development Life Cycle.

AWS AI-DLC is the more comprehensive method when delivery needs structured discovery, decomposition, risk-calibrated workflow depth, and lifecycle governance across a larger system. Its public method groups work into Inception, Construction, and Operations; decomposes the solution into independently implementable Units; sequences Construction through Bolts, starting with a walking skeleton; and keeps explicit workflow state, audit history, and evidence.

The methods can be combined without duplicating ceremonies: use AWS AI-DLC to select lifecycle depth, Units, Bolts, and governance, then use a compact `intent.md` to `spec.md` to `plan.md` handshake inside a Unit when that continuity helps. This lab stays deliberately smaller so a reviewer can inspect the complete chain in one repository.

## Current and deferred controls

P02 added the minimum documentation layer and the domain/persistence hardening it describes. P03 adds:

- a pull-request template that keeps verification, review, visual, and human gates distinct;
- a GitHub Actions workflow that runs the locked `npm run verify` gate on pull requests and `main` pushes; and
- reviewer-first release documentation, visible attribution, and an explicit publication boundary.

The workflow's presence is not proof that hosted CI passed. P03 evidence records each observed run result separately.

P04 adds the first applied-model workflow under a separate accepted contract:

- a loopback-only BYOK gateway for Anthropic, OpenAI, and OpenRouter;
- deterministic fixture mode with no credential or external request;
- provider-native structured outputs plus independent proposal validation;
- a complete visible diff and explicit approval before one atomic planner transition; and
- named deterministic eval cases that measure the application contract separately from live-model quality.

P04 does not claim live-provider verification without observed credentialed runs. The gateway and key handling are documented controls, not a production security assurance.

Current roadmap issues own the deferred work rather than leaving it as an unprioritized list:

- [P07](https://github.com/Andreasniss/7dayfocus-ai-delivery-lab/issues/13): hosted fixture demo and installable PWA;
- [P08](https://github.com/Andreasniss/7dayfocus-ai-delivery-lab/issues/14): reliable hosted CI, deployment, release, and rollback evidence;
- [P09](https://github.com/Andreasniss/7dayfocus-ai-delivery-lab/issues/15): deterministic operational control bands and incident-to-eval learning;
- [P10](https://github.com/Andreasniss/7dayfocus-ai-delivery-lab/issues/16): deeper planning constraints and 30–50-case model evaluation; and
- [P11](https://github.com/Andreasniss/7dayfocus-ai-delivery-lab/issues/17): personal Android installation, followed by an optional Google Play launch spike capped at three hours.

Scoped rules, permissions, hooks, dedicated verifier/adversarial agents, and reusable skills remain candidates only when a roadmap change demonstrates their value. No control is claimed as effective merely because its configuration or documentation exists.

## Privacy, evidence, and ownership

- Human owner and final approver: **Andreas**.
- Repository visibility and publication remain human-controlled decisions and require Andreas's explicit approval.
- Do not commit raw chat transcripts, prompt histories, hidden reasoning, private chain-of-thought, credentials, personal data, customer data, or employer-confidential material.
- Preserve concise decisions, input/output contracts, diffs, test cases, reproducible commands, tool results, findings, limitations, and approvals.
- Before a pull request exists, the GitHub issue is the authoritative live scope/status record. Once opened, the pull request is authoritative for the candidate diff, findings, responses, and approval; the linked issue remains the backlog scope record. Markdown files are committed change records and may lag live discussion until updated in the candidate diff.

## Official sources

Reviewed on 2026-08-31. These pages may evolve; the repository records the project conventions adopted from the guidance rather than treating the linked text as a fixed certification standard.

- [The AI-native software development lifecycle playbook](https://claude.com/blog/the-ai-native-sdlc-playbook)
- [How Anthropic secures its AI-native software development lifecycle](https://claude.com/blog/how-anthropic-secures-its-ai-native-software-development-lifecycle)
- [Claude Code: Manage memory](https://code.claude.com/docs/en/memory)
- [Claude Code: Code review](https://code.claude.com/docs/en/code-review)
- [Claude Code: Settings](https://code.claude.com/docs/en/settings)
- [Claude Code: Hooks](https://code.claude.com/docs/en/hooks)
- [AWS: AI-Driven Development Life Cycle](https://aws.amazon.com/blogs/devops/ai-driven-development-life-cycle/)
- [AWS Labs AI-DLC Workflows: Introduction](https://awslabs.github.io/aidlc-workflows/guide/00-introduction/)
- [AWS Labs AI-DLC Workflows: Phases and stages](https://awslabs.github.io/aidlc-workflows/guide/04-phases-and-stages/)
- [AWS Labs AI-DLC Workflows: Scopes and depth](https://awslabs.github.io/aidlc-workflows/guide/05-scopes-and-depth/)

## Independence

This is an independent project. Its process is derived from selected public material and adapted with our own conventions. It is not affiliated with, sponsored by, endorsed by, approved by, or certified by Anthropic, and it makes no claim of Anthropic compliance.
