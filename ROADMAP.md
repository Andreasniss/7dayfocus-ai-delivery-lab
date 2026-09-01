# 7DayFocus Learning Roadmap

This roadmap records possible learning and portfolio extensions. It is not a standalone-product strategy. GitHub issues are the authoritative live backlog; change packets and pull requests carry accepted contracts, observed evidence, findings, and disposition.

## Product-discovery conclusion

7DayFocus began as a real response to a missing personal workflow and as a vehicle for learning cross-platform mobile development and AI-assisted delivery. The prototype proved the bounded-assistant design and the repository now preserves the Anthropic-inspired artifact chain.

The product need later changed. Andreas now uses Claude and ChatGPT as context-rich orchestrators, with Todoist as the task system of record and visual interface through its connector and CLI. This architecture has more context and less duplicate product surface than a separate AI planner. Standalone development is therefore not an active goal.

## Current sequence

| Order | Change | Outcome | Disposition |
| --- | --- | --- | --- |
| 1 | [P06 · Lifecycle integrity and reflection](https://github.com/Andreasniss/7dayfocus-ai-delivery-lab/issues/12) | Reconcile evidence, capture the product-discovery conclusion, and establish the learning backlog | In progress |
| 2 | [P11 · Android personal install](https://github.com/Andreasniss/7dayfocus-ai-delivery-lab/issues/17) | Reuse the earlier Tauri/Android proof where useful, install a current build on Andreas's phone, and record a device test | Optional learning goal after P06; Google Play spike capped at three hours |
| Parked | [P07 · Hosted reviewer demo/PWA](https://github.com/Andreasniss/7dayfocus-ai-delivery-lab/issues/13) | Bookmarkable fixture path and rendered mobile/desktop proof | Proceed only for clear portfolio value |
| Parked | [P08 · Delivery and rollback](https://github.com/Andreasniss/7dayfocus-ai-delivery-lab/issues/14) | Green hosted CI, traceable deployment, and exercised rollback | Proceed only to deepen Deploy evidence |
| Parked | [P09 · Maintain loop](https://github.com/Andreasniss/7dayfocus-ai-delivery-lab/issues/15) | Operational control band, diagnosis, incident record, and regression eval | Proceed only to demonstrate Maintain learning |
| Parked | [P10 · Planning quality](https://github.com/Andreasniss/7dayfocus-ai-delivery-lab/issues/16) | Richer constraints and 30–50-case model evaluation | Proceed only if the product problem becomes relevant again |

## Parked feature candidates

P10 retains the product ideas so the learning is not lost:

- task duration or effort;
- fixed commitments and available planning windows;
- energy/focus preferences;
- proposal explanations and alternatives;
- read-only calendar/ICS import after privacy review; and
- 30–50 realistic and adversarial evaluation cases, with dated live-provider results only when observed.

These are not promised features. If resumed, every feature must retain deterministic validation, a complete proposal diff, stale-state rejection, explicit approval, and atomic application. Autonomous deletion, completion, background mutation, or sensitive-data handling remains out of scope unless a later accepted packet changes that boundary.

## Android and Google Play boundary

The earlier private proof of concept contains a React and Tauri v2 Android project, Android Studio/emulator setup, PWA support, tests, and Android build instructions. It was tested and prepared for distribution but not launched to production.

P11 succeeds when a current build is installed and tested on Andreas's personal Android phone. This is a learning and completion goal, not a revival of the standalone-product strategy.

After device success, Google Play work is an optional launch spike capped at **three hours**. Stop at the cap or earlier when account testing gates, identity, policy, privacy, security, or engineering work cannot be completed safely inside the remaining budget. Record the exact gate and reusable artifacts. A stopped Play attempt does not invalidate the personal-device outcome.

No store publication, testing-track availability, API compatibility, privacy disclosure, or mobile behavior is claimed until its evidence is recorded.

## Backlog quality contract

Each resumed change must define:

1. intent, reviewer, outcome, scope, constraints, and proof;
2. product and design requirements, alternatives, concerns, and human gates;
3. a plan naming files or modules, implementation order, and tests;
4. observed evidence, findings, residual limitations, and owner disposition; and
5. synchronized README, repository, live demo, and portfolio claims when behavior changes.

A sound outcome may be to stop. Product discovery that removes the need for a feature must be preserved as clearly as implementation evidence.
