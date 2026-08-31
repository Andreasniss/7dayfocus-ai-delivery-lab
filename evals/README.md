# Plan My Week evaluations

The deterministic suite in `src/test/planWeek.evals.test.ts` contains 24 named cases covering:

- safe moves, priority changes, swaps, and combined operations;
- move semantics that clear priority unless explicitly restored;
- unknown, duplicate, completed, malformed, and no-op tasks;
- week-boundary, task-capacity, and priority-capacity failures; and
- attempted task deletion, rewriting, and incomplete proposal shapes.

Run it without credentials or network access:

```bash
npm run test -- --run src/test/planWeek.evals.test.ts
```

These deterministic contract evals measure whether the application accepts or rejects a proposal correctly. They do not measure live-model planning quality. Provider-specific quality trials remain separate evidence and require a user-owned credential.
