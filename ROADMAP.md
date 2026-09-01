# 7DayFocus Roadmap

This roadmap turns the repository's forward work into explicit outcomes and GitHub issues. Open issues are the authoritative live backlog; change packets and pull requests carry accepted contracts, implementation evidence, findings, and disposition.

Roadmap entries are planned work, not delivered-product claims.

## Product direction

Build a trustworthy local-first weekly planner that demonstrates bounded AI assistance, explicit human approval, evidence-led delivery, and useful mobile operation. The shortest reviewer path remains deterministic and credential-free. The Android goal is first to install and use the app on Andreas's own phone; Google Play is optional and time-boxed.

## Ordered backlog

| Order | Change | Outcome | Status and dependency |
| --- | --- | --- | --- |
| 1 | [P06 · Lifecycle integrity](https://github.com/Andreasniss/7dayfocus-ai-delivery-lab/issues/12) | Reconcile completed packets, establish this roadmap, and seed executable work | In progress |
| 2 | [P07 · Hosted reviewer demo/PWA](https://github.com/Andreasniss/7dayfocus-ai-delivery-lab/issues/13) | Bookmarkable fixture path, installability, reset, and rendered mobile/desktop proof | Open after P06 |
| 3 | [P08 · Delivery and rollback](https://github.com/Andreasniss/7dayfocus-ai-delivery-lab/issues/14) | Green hosted CI, traceable deployment, release evidence, and exercised rollback | Open; coordinate with P07 |
| 4 | [P09 · Maintain loop](https://github.com/Andreasniss/7dayfocus-ai-delivery-lab/issues/15) | Versioned operational control band, diagnosis, new intent, incident record, and regression eval | Open after P07–P08 |
| 5 | [P10 · Planning quality](https://github.com/Andreasniss/7dayfocus-ai-delivery-lab/issues/16) | Effort, availability, fixed commitments, explanations, alternatives, and 30–50-case evaluation | Open after P06; hosted evidence benefits from P07–P08 |
| 6 | [P11 · Android personal install](https://github.com/Andreasniss/7dayfocus-ai-delivery-lab/issues/17) | Install and test a current Android build on Andreas's phone | Open after P06; P07 may provide the fastest base |

P07 and P10 may proceed in either order after P06 when capacity favors product depth over hosting. P08 should be designed with P07. P09 needs an observable hosted or delivery surface. P11 discovery can start after P06 without waiting for every web milestone.

## Feature backlog

P10 owns the current product candidates:

- task duration or effort;
- fixed commitments and available planning windows;
- energy/focus preferences;
- proposal explanations and alternatives;
- read-only calendar/ICS import after privacy review; and
- 30–50 realistic and adversarial evaluation cases, with dated live-provider results only when actually observed.

Every feature must retain deterministic validation, a complete proposal diff, stale-state rejection, explicit approval, and atomic application. Autonomous deletion, completion, background mutation, or sensitive-data handling remains out of scope unless a later accepted packet changes that boundary.

## Android and Google Play boundary

P11 succeeds when a current build is installed and tested on Andreas's personal Android phone. The implementation starts with an architecture decision and inventory of the older Android Studio experiment.

After device success, Google Play work is an optional launch spike capped at **three hours**. Stop at the cap or earlier when account testing gates, identity, policy, privacy, security, or engineering work cannot be completed safely inside the remaining budget. Record the exact gate and reusable artifacts. A stopped Play attempt does not invalidate the personal-device outcome.

No store publication, testing-track availability, API compatibility, privacy disclosure, or mobile behavior is claimed until its evidence is recorded.

## Backlog quality contract

Each change must define:

1. intent, reviewer, outcome, scope, constraints, and proof;
2. product and design requirements, alternatives, concerns, and human gates;
3. a plan naming files or modules, implementation order, and tests;
4. observed evidence, findings, residual limitations, and owner disposition; and
5. synchronized README, repository, live demo, and portfolio claims when behavior changes.

Material incidents and escaped defects become a new issue, intent artifact, and regression evaluation rather than disappearing from history.
