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
