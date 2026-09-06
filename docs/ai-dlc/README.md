# AI-Assisted Delivery Lifecycle

This directory makes the project's AI-assisted delivery process inspectable through version-controlled intent, specifications, plans, diffs, tests, review findings, and evidence. Candidate artifacts become committed evidence only when they are included in a Git revision.

## Find the artifacts

Start with [all change folders](changes/) or open [P04: Plan My Week](changes/P04-plan-my-week/). The exact example path from the repository root is `docs/ai-dlc/changes/P04-plan-my-week/`.

| File | Direct example | Purpose |
| --- | --- | --- |
| `intent.md` | [P04 intent](changes/P04-plan-my-week/intent.md) | Outcome, constraints, and exclusions |
| `spec.md` | [P04 specification](changes/P04-plan-my-week/spec.md) | Required behavior, design, and failure cases |
| `plan.md` | [P04 build plan](changes/P04-plan-my-week/plan.md) | Implementation sequence and planned checks |
| `evidence.md` | [P04 evidence](changes/P04-plan-my-week/evidence.md) | Observed checks, findings, fixes, revisions, and limits |

**One folder represents one scoped change across its delivery cycle.** Reuse it through design revisions, implementation sessions, test failures, and review corrections. Create the documents as useful content becomes available; never prefill passing evidence. A later separately scoped feature or incident correction gets a new folder linked to its predecessor. Code, tests, ADRs, and PR discussions remain in their own homes and are linked from the packet.

Use a unique full folder name, such as `<change-id>-<short-name>`, and include it in the issue or PR. Historical P06 and P12 prefixes occur more than once; their complete folder names distinguish those records. Preserve their existing URLs rather than renumbering history. This lab's repository rules require packets; the general skill permits an issue or PR alone for small reversible changes.

The reusable skill's instructions live separately at [`skills/ai-sdlc-skill/SKILL.md`](../../skills/ai-sdlc-skill/SKILL.md). Project evidence stays here, outside that installed bundle. The [canonical skill's layout guide](https://github.com/Andreasniss/ai-sdlc-skill/blob/main/skills/ai-sdlc-skill/references/artifact-layout.md) explains adoption; the installed copy retains its explicitly pinned revision until a reviewed update.

## Standing repository documents

These documents apply across many change packets. Their root location makes them easy to discover; deeper architecture and operational records live under `docs/`.

| Home | Purpose in this repository |
| --- | --- |
| [`README.md`](../../README.md) | Product entry point, setup, evidence, and navigation |
| [`LICENSE`](../../LICENSE), [`NOTICE`](../../NOTICE), [`CONTRIBUTING.md`](../../CONTRIBUTING.md) | Reuse terms, attribution, and contribution expectations |
| [`SECURITY.md`](../../SECURITY.md) | Supported security scope and private vulnerability reporting |
| [`PRIVACY.md`](../../PRIVACY.md) | Contributor publication hygiene and disclosure checks; this is not the application's end-user privacy notice |
| [`PROVENANCE.md`](../../PROVENANCE.md) | Baseline origins, inherited material, asset sources, and human/AI roles |
| [`AGENTS.md`](../../AGENTS.md), [`CLAUDE.md`](../../CLAUDE.md), [`REVIEW.md`](../../REVIEW.md) | Agent routing, repository rules, and review criteria |
| [`docs/THREAT-MODEL.md`](../THREAT-MODEL.md) | System trust boundaries, data handling, threats, and limitations |
| [`docs/adr/`](../adr/), [`docs/ANDROID.md`](../ANDROID.md) | Architecture decision rationale and the Android runbook |
| [`docs/ai-dlc/changes/`](changes/) | A separate four-file record for each scoped delivery change |

Reference these files from the relevant spec and plan. Update a standing document in the same change when its facts or rules change; do not copy all standing policies into every packet. For example, adding a provider can affect the threat model, while a new imported asset can affect provenance.

GitHub explicitly supports files such as `SECURITY.md` and `CONTRIBUTING.md` as [community health files](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file), including root, `.github/`, and `docs/` locations. `PRIVACY.md`, `PROVENANCE.md`, and `REVIEW.md` are project-chosen names with the purposes above, not universal AI-DLC requirements. [ADRs](https://adr.github.io/) come from architecture decision-recording practice. A human-readable provenance narrative is distinct from [SLSA build provenance](https://slsa.dev/spec/v1.2/provenance).

## Honest adoption record

This lifecycle layer was introduced **during P02, after P02 implementation work had already begun**. The P02 packet is therefore a contemporaneous mid-change capture, not proof that the full artifact chain preceded the first P02 code edit. Dates, status, and evidence must not be backdated or rewritten to imply otherwise.

P01 also predates this layer. Its existing disclosure record remains the evidence for that milestone.

## What comes directly from Anthropic guidance

Anthropic's public AI-native SDLC playbook proposes a committed flow from intent to specification to plan, then code and tests, pull-request review findings, and incident learning. It treats accepted artifacts as gates for the next stage, Git and pull requests as an audit trail, and humans as owners of high-judgment and production-boundary approvals.

Location clarification, checked 6 September 2026: the playbook suggests an `intent/` folder in a single product's repository and explicitly puts `spec.md` alongside `intent.md`. It names a committed `plan.md` and says to update it when implementation departs from the plan. It does not prescribe `evidence.md` or exactly four files per cycle. Our existing `docs/ai-dlc/changes/<change>/` home preserves that artifact continuity without introducing a second `intent/` tree.

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
