# Kiro implementation evidence register

> Status 2026-11-17: **NO KIRO MODEL IMPLEMENTATION RUN RECORDED.**
> This seed log was authored by ChatGPT as planning documentation, not by Kiro.

## Architecture changes made before any Kiro code generation
- Claude architecture review: GitHub Issue #8 comment `6947855152`.
- Corrected semantics: reject does not consume idempotency key; eight golden G000–G111 cases.
- Static Vite/React/TypeScript selected for contest MVP to reduce Windows load.
- First real agent run is a bounded Slice 0 to create tested replay engine code.
- Optional CLI/MCP is deferred until verified core + UI and must not compromise submission.
- Original design and revisions are visible in the Git history; do not claim they were Kiro-authored.

## Kiro run ledger (fill only from direct evidence)

| Time (UTC) | Kiro surface / version | Session/run ID | Task and paths changed | Git SHA | Commands/exit statuses | RAM before/after | Free credits before/after | Bonus credits before/after | Status / evidence |
|---|---|---|---|---|---|---|---|---|---|
| NOT RUN | NOT RUN | — | — | — | — | — | — | — | NOT RUN |

## Test and deployment evidence (do not infer from unrelated factory CI)

| Gate | State | Commit / evidence |
|---|---|---|
| Dedicated PRIVATE contest repo + root .kiro + LICENSE | NOT RUN | — |
| Real Kiro code change for replay core | NOT RUN | — |
| G000–G111 golden tests | NOT RUN | — |
| Retry after rejected delivery / canonical conflict | NOT RUN | — |
| Typecheck and production Vite build | NOT RUN | — |
| Playwright E2E | NOT RUN | — |
| Sanitized export and repeatable import | NOT RUN | — |
| Real Kiro agent hook execution | NOT RUN | — |
| Real MCP tool invocation (optional) | NOT RUN | — |
| Public judge URL and Devpost submission | NOT RUN | — |

Do not publish raw KAS/doctor output, credentials, tokens, cookies, credit redeem links or private user information. A stage is only PASS if evidence names a SHA and reproducible check; otherwise FAIL or NOT RUN.

## Slice 0 run entry (2026-11-17)

- Date/time: 2026-11-17, approx. 19:46-20:00 +06 (local, Windows host).
- Kiro surface: Kiro Crew dashboard, single foreground session, no subagents, no Task Runner. Session/run ID: not exposed to the agent (owner to fill).
- Branch: `slice-0`. Prior commit: f42acce ("kiro: update repository status after bootstrap"). Slice commit SHA: see `git log` (a commit cannot record its own SHA).
- RAM free at start: about 1.9 GiB (owner stated memory was freed; below the 2 GiB steering threshold, noted). Credits (owner-reported): Free credits before 0.11/50, after 0.11/50. kiroween2026 bonus before 0/4000, after 7.08/4000. Session turns 0.41 + 1.02 + 5.30, plus 0.27 for a failed first session opened in the wrong folder. PR #1 merged to main as `fdc8dc3`.
- The turn was interrupted once after `npm install` and resumed; no completed step was repeated.
- Files created: `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/engine/{types,schema,identity,repair,invariants,replay}.ts`, `tests/engine/{helpers,golden,identity,schema,properties}.ts` (helpers/test files). Edited: `README.md`, `.kiro/specs/ghosttrace/tasks.md`, this log.
- Commands and exit codes:
  - `git checkout -b slice-0` exit 0
  - `npm install react react-dom` exit 0
  - `npm install -D vite @vitejs/plugin-react typescript vitest fast-check @types/react @types/react-dom` exit 0 (0 vulnerabilities reported)
  - `npm test` exit 0: 4 files, 48 tests passed
  - `npm run typecheck` exit 0
  - `npm run build`: NOT RUN (heavy build is left to CI)
- Test coverage: G000-G111 table plus G110/G111 explicit, G100/G101 retry, F07, F07b, F08 (all 8 configs), F09, F10, F11, F21, F14 and F15 (fast-check seed 20261117, 200 runs), deep-frozen input.
- Not done: UI, redaction (`src/lib/redact.ts`), export/reimport, compare by (eventId, deliveryIndex), E2E, CI, build verification.
- Open spec questions / choices made where the spec was silent:
  1. On a hard conflict the replay halts; only deliveries of the conflicting eventIds get `hard_conflict` records, other deliveries get none.
  2. Extra violation codes beyond the golden list: `unknown_amount`, `checkout_already_exists`, `duplicate_fulfillment`, `identity_conflict`.
  3. With schema drift on a payment that also arrives before the checkout, both `schema_drift` and `order_violation` are recorded (needed by G000).
  4. Money must be a positive safe integer (zero rejected). Payment v1 uses `amount_cents`; checkout.created and fulfillment accept version 1 only.
  5. Input hash is a non-cryptographic 53-bit fingerprint (cyrb53) of canonical JSON, not SHA-256.
  6. Memory was 1.9 GiB at start, under the 2 GiB gate; owner approved starting.

## Slice 1 run entry (2026-11-17)

- Date/time: 2026-11-17, approx. 21:14-21:22 +06 (local, Windows host).
- Kiro surface: Kiro Crew dashboard, single foreground session, no subagents, no Task Runner. Session/run ID: not exposed to the agent (owner to fill).
- Branch: `slice-1` from `main` (HEAD 18f21d2). Commits: 7d5dce7 (Part A), 89c6ef2 (Parts B and C), tasks/log commit: see `git log` (a commit cannot record its own SHA).
- RAM free at start: measured 1.92 GiB (below the 2 GiB gate). A first check read 0.70 GiB and the run stopped; the owner then explicitly approved starting at 1.92 GiB. Credits before/after: owner to fill.
- Files created: `src/engine/compare.ts`, `src/lib/redact.ts`, `tests/engine/compare.test.ts`, `tests/lib/redact.test.ts`. Edited: `.github/workflows/ci.yml` (Build step), `.kiro/specs/ghosttrace/tasks.md`, this log. No Slice 0 test edited, no UI touched.
- Commands and exit codes:
  - `git checkout -b slice-1` exit 0
  - After Part A: `npm test` exit 0 (5 files, 54 tests); `npm run typecheck` exit 0
  - After Parts B+C: `npm test` exit 0 (6 files, 61 tests); `npm run typecheck` exit 0; `npm run build` exit 0 (vite, 15 modules, 219.61 kB JS)
- Test counts per file: identity 5, golden 12, schema 27, properties 4, compare 6, redact 7.
- Build result: local Vite build passed. Risk: the lockfile was made on Windows; if Linux CI fails with `Cannot find module @rollup/rollup-linux-x64-gnu`, that is a lockfile issue, not an engine bug. `package-lock.json` was not edited.
- Decisions where the spec was silent:
  1. Mismatched input hash: `compareReplays` returns `{ inputHashMatch: false, divergences: [], firstDivergence: null }` and does not throw.
  2. Key normalization: lowercase, remove `-` and `_`, then substring match on token, secret, cookie, authorization, apikey, cardnumber, signature (so `tokens_count` would also be redacted; accepted over-redaction).
  3. Depth: root container is depth 1 (as in schema.ts); a container at depth > maxDepth becomes `[MAX_DEPTH_EXCEEDED]`. Recursion is bounded by maxDepth, so no stack overflow.
  4. Redaction output uses `defineProperty`, so a `__proto__` key stays plain data.
  5. Compare uses divergence on decision, before, after, and sorted violation codes; ties on deliveryIndex sort by eventId.
- Spec checks: G110 vs G111 first divergence is d3 (applied vs duplicate_skipped), as the prompt expected; F24 first divergence is d1 (rejected vs applied). No contradiction found.
- NOT done: export/reimport, repair-spec export, UI (Workbench, Timeline, export panel), E2E, deploy, push/PR. T6 is not complete.

## Slice 2 run entry (2026-11-18)

- Date/time: 2026-11-18, approx. 21:27-21:45 +06 (local, Windows host).
- Kiro surface: Kiro Crew dashboard, single foreground session, no subagents, no Task Runner. Session/run ID: not exposed to the agent (owner to fill). Credits before/after: owner to fill.
- Branch: `slice-2` from `main` (HEAD 37428d8). Commits: f80bbdd (UI spec), 369c84b (steering and hook), 18f4605 (UI v1 and tests), tasks/log commit: see `git log` (a commit cannot record its own SHA).
- RAM gate DEVIATION: the gate is >= 2 GiB free. Measured 0.97, 1.24, 1.19 and 1.85 GiB across four checks (best 1.85 GiB, below the gate). The owner explicitly approved starting at 1.85 GiB. Free RAM during the run read 1.31 GiB (before `npm install`) and 1.01 GiB (after build). No command failed from memory.
- Note: the owner's first request named `docs/promts/SLICE_2_PROMT.md`; the real path is `docs/prompts/SLICE_2_PROMPT.md` and that file was used.
- Files created: `.kiro/specs/ghosttrace-ui/{requirements,design,tasks}.md`, `.kiro/steering/tech.md`, `.kiro/hooks/engine-tests-on-save.kiro.hook`, `src/styles.css`, `src/css.d.ts`, `src/components/{ReplayWorkbench,IncidentTimeline,StateInspector}.tsx`, `tests/ui/workbench.test.tsx`. Edited: `src/App.tsx`, `src/main.tsx`, `vite.config.ts` (test include widened to `.test.{ts,tsx}`), `package.json`, `package-lock.json`, `.kiro/specs/ghosttrace/tasks.md`, this log. Engine, lib and existing tests untouched.
- Dependencies added (dev): `jsdom`, `@testing-library/react`. `@testing-library/dom` came in as a peer dependency of the latter.
- Commands and exit codes:
  - `git checkout main` exit 0; `git pull --ff-only` exit 0
  - `npm test` before changes: exit 0, 61 tests
  - `git checkout -b slice-2` exit 0
  - `npm install -D jsdom @testing-library/react` exit 0 (`npm audit` reports a high-severity `picomatch` ReDoS advisory; the suggested fix downgrades vitest, so it was not applied)
  - `npm test` after UI: exit 0, 7 files, 69 tests
  - `npm run typecheck`: first run exit 1 (`./styles.css` had no type declaration), fixed with `src/css.d.ts`, then exit 0
  - `npm run build` exit 0 (26 modules; JS 237.50 kB, gzip 74.21 kB; CSS 2.81 kB)
- Test counts per file: identity 5, golden 12, schema 27, properties 4, compare 6, redact 7, workbench (UI) 8.
- Decisions where the prompt was silent:
  1. `@testing-library/dom` is not listed in `package.json` directly; npm installed it as a peer.
  2. A `css.d.ts` module declaration was added instead of loading `vite/client` types, because `tsconfig` sets `types: []`.
  3. The timeline rows are `<button>` elements in a `<ul>` (Tab and Enter/Space), not a listbox.
  4. The hook file uses the `.kiro.hook` JSON format (`when: fileEdited`, `then: askAgent`) from memory of Kiro documentation. I am NOT sure this format is correct.
- Hook: defined, execution NOT OBSERVED in Kiro Crew. Files under `src/engine/` and `src/lib/` were not saved during this session, and Kiro Crew is not known to run hooks.
- NOT done: export/import UI, browser E2E, responsive and keyboard check in a real browser (T5 stays open), deploy, PR.

## Kiro features used so far

| Feature | Evidence | Status |
|---|---|---|
| Kiro Crew sessions | Slice 0, 1, 2 entries in this log | used; run IDs not exposed |
| Kiro-authored spec | `.kiro/specs/ghosttrace-ui/`, commit f80bbdd | done |
| Steering | `.kiro/steering/product.md`, `.kiro/steering/tech.md` (commit 369c84b) | done |
| Hook | `.kiro/hooks/engine-tests-on-save.kiro.hook`, commit 369c84b | defined, execution NOT OBSERVED in Kiro Crew; format unverified |
| Property-based tests | `tests/engine/properties.test.ts` (fast-check, seed 20261117) | done |
| Custom agents | `.kiro/agents/ghosttrace-{builder,reviewer}.md` | defined; not run by this slice |
| MCP | not yet (planned Slice 4) | not done |
