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

## Slice 3 run entry (2026-11-19)
- Kiro surface: Kiro IDE session, single agent, no subagents, no Task Runner. Session/run ID: sess_fc25d265-fc9c-4b37-8490-5c04e39b838c. Credits before/after: owner to fill.
- Branch: `slice-3` from `main` (HEAD a8f3d8f). Commits: cee05c8 (housekeeping), f042058 (export/import spec), b7b024e (export/import and E2E), tasks/log commit: see `git log` (a commit cannot record its own SHA).
- RAM free at start: 2.68 GiB (gate met). Before build: 2.34 GiB.
- Files created: `.kiro/hooks/engine-tests.json`, `.kiro/specs/ghosttrace-export/{requirements,design,tasks}.md`, `src/lib/{exportBundle,importBundle}.ts`, `src/components/ExportPanel.tsx`, `tests/lib/{exportBundle,importBundle,roundtrip}.test.ts`, `tests/ui/exportPanel.test.tsx`, `playwright.config.ts`, `e2e/{story,keyboard,narrow}.spec.ts`, `docs/reviews/slice-3.md`. Deleted: `.kiro/hooks/engine-tests-on-save.kiro.hook`. Edited: `ReplayWorkbench.tsx` (bundle held in state, panel added), `styles.css`, `vite.config.ts` (exclude `e2e/`), `tsconfig.json` (include `e2e`, `playwright.config.ts`), `.github/workflows/ci.yml` (job `e2e`), `package.json`, `package-lock.json`, spec task files, this log. `src/engine/**` and existing tests untouched.
- Dependency added (dev): `@playwright/test` only. Browsers not downloaded.
- Commands and exit codes (local):
  - `git checkout main`, `git pull --ff-only`: exit 0 (already up to date)
  - `npm test` before changes: exit 0, 7 files, 69 tests
  - `npm install -D @playwright/test` (with `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`): exit 0, 0 vulnerabilities
  - First `npm test` after new tests: exit 1 (two failures in my own new tests: a config key-order comparison, and a money test that mutated a field the first event does not have); both fixed in the tests, no existing test touched
  - `npm test`: exit 0, 11 files, 101 tests
  - `npm run typecheck`: first run exit 1 (`Buffer` not typed in an e2e file), fixed, then exit 0
  - `npm run build`: exit 0 (30 modules; JS 244.37 kB, gzip 76.22 kB; CSS 3.29 kB)
  - Playwright: NOT RUN locally by rule. No CI result exists yet.
- New tests: exportBundle 8, importBundle 12, roundtrip 3, exportPanel (UI) 7 = 30; total 101.
- Decisions where the prompt was silent:
  1. The preview and the download use one string, so what is shown is what is saved.
  2. The whole export file is passed through `redact`, not only the bundle.
  3. An import with unknown keys inside `preset.config` is rejected; unknown top-level keys are ignored.
  4. A bundle that contained secrets exports as `[REDACTED]` values and still imports. Its fingerprint then differs from the original; the round-trip claim is for bundles without secret keys (the fixture).
  5. The import status line uses `data-testid`, not `role="status"`, so the existing UI test that finds the single status element keeps working.
  6. The Playwright config starts `vite preview` itself (`webServer`), so the CI step is `npx playwright test`.
- Hook: format migrated to `.kiro/hooks/engine-tests.json` (`version: "v1"`, `PostFileSave`, regex matcher, command `npm test`). The matcher regex was checked against sample paths in PowerShell. Execution NOT OBSERVED: no file under `src/engine/` or `src/lib/` was saved through the IDE in a way I could confirm triggered it; I created files under `src/lib/` and saw no hook output.
- Custom agent review: NOT RUN. Reason in `docs/reviews/slice-3.md`.
- NOT done: Playwright run (CI only), CI result, deploy, merge. T5 and T7 and T8 stay open.
## Slice 4 run entry (2026-11-19)
- Kiro surface: Kiro IDE session, single agent, no subagents. Session ID: sess_07de11ed-1d1a-4df5-9048-492fd931d4d3. Credits before/after: owner to fill.
- Branch: `slice-4` from `main` (HEAD 21bab9f). Commits: 1dc8460 (MCP/CLI spec), 2b5d014 (CLI and MCP server), tasks/log commit: see `git log` (a commit cannot record its own SHA).
- Files created: `.kiro/specs/ghosttrace-mcp/{requirements,design,tasks}.md`, `cli/{core,node-io,run,main}.ts`, `cli/node.d.ts`, `mcp/server.ts`, `.kiro/settings/mcp.json`, `tests/cli/cli.test.ts`, `docs/evidence/mcp-calls.md`. Edited: `package.json` (scripts `ghosttrace`, `mcp`), `package-lock.json`, `tsconfig.json` (include `cli`, `mcp`), `README.md`, `.kiro/specs/ghosttrace/tasks.md`, this log. `src/engine/**`, `src/lib/**` and existing tests untouched.
- Dependencies added: `@modelcontextprotocol/sdk`, `zod`, dev `tsx`. `@types/node` is not allowed, so `cli/node.d.ts` declares the few Node APIs used.
- Commands and exit codes:
  - `git checkout main` 0; `git pull --ff-only` 0 (a8f3d8f to 21bab9f)
  - `npm test` before changes: 0 (11 files, 101 tests); `git checkout -b slice-4` 0
  - `npm i @modelcontextprotocol/sdk zod` 0; `npm i -D tsx` 0 (0 vulnerabilities)
  - `npm run typecheck`: first run 1 (leftover `ALL_REPAIRS` re-export in `cli/core.ts`), fixed, then 0
  - `npm test` after: 0 (12 files, 120 tests; 19 new in `tests/cli/cli.test.ts`)
  - `npm run build` 0
  - CLI by hand: `npm run ghosttrace -- replay fixtures/haunted-checkout.json --repairs M,O,D` printed PASS 4900/4900; `--repairs M,O` printed FAIL 9800/4900
- MCP: the first attempt stopped because the `ghosttrace` server was not connected in this session. The owner enabled it in the Kiro MCP panel (Connected, 3 tools). Then three real calls through MCP: `replay_incident` (no repairs) returned FAIL with 0 captured; `replay_incident` (M,O,D) returned PASS with 4900 captured; `diff_runs` (none vs M,O,D) returned first divergence d1 `evt-payment-001` (rejected vs applied), 3 divergences. Exact inputs and outputs: `docs/evidence/mcp-calls.md`.
- Hook `.kiro/hooks/engine-tests.json`: NOT OBSERVED. No file under `src/engine/` or `src/lib/` was saved in this session, and engine code was not edited to trigger it.
- Playwright: NOT RUN (by rule). Custom agent review: NOT RUN.
- NOT done: CI result for this branch, deploy, PR, merge.
## Slice 5 run entry (2026-11-19)
- Kiro surface: Kiro IDE session, single agent, no subagents. Session ID: sess_b71fdb1c-d481-4f70-bcca-16b83c0b9424. Credits before/after: owner to fill.
- Branch: `slice-5` from `main` (HEAD 30092af). Commits: 65b77f9 (release spec), aa60dff (Pages workflow and path confinement), 606895c (pre-publication audit), final docs commit: see `git log` (a commit cannot record its own SHA).
- RAM free at start: 2.54 GiB; before final build: 2.62 GiB (gate met).
- Files created: `.kiro/specs/ghosttrace-release/{requirements,design,tasks}.md`, `.github/workflows/pages.yml`, `cli/paths.ts`, `tests/release/paths.test.ts`, `tests/cli/paths.test.ts`, `docs/reviews/pre-publication-audit.md`, `docs/KIRO_USAGE.md`. Edited: `cli/node-io.ts` (confinement), `cli/node.d.ts` (more typings), `package.json` (`"license": "MIT"`), `README.md` (top block), this log, `.kiro/specs/ghosttrace-release/tasks.md`. `src/engine/**`, `src/lib/**`, `vite.config.ts` and existing tests untouched. No new dependencies.
- Commands and exit codes:
  - `git checkout main` 0; `git pull --ff-only` 0 (21bab9f to 30092af)
  - `npm test` before changes: 0 (12 files, 120 tests); `git checkout -b slice-5` 0
  - `npm run typecheck` after first new files: 1 (`isDirectory` missing from the `statSync` typing in `cli/node.d.ts`), fixed, then 0
  - `npm test` after changes: 0 (14 files, 133 tests; 13 new: 5 in `tests/release/paths.test.ts`, 8 in `tests/cli/paths.test.ts`)
  - `npm audit --omit=dev` 0 (0 vulnerabilities)
  - Final: `npm test` 0 (133 tests), `npm run typecheck` 0, `npm run build` 0 (30 modules; JS 244.37 kB, gzip 76.22 kB)
  - Extra check: `npx vite build --base=/ghosttrace/` to a temp folder, exit 0; the output `index.html` references `/ghosttrace/assets/...`. The temp folder was deleted.
  - Playwright: NOT RUN (by rule). Pages workflow: NOT RUN (manual trigger, repo private). No CI result for this branch.
- Path confinement: CLI and MCP tools now read only files whose real path is inside the working directory. Tests cover an absolute outside path, a relative `..` path to a file outside, a normal fixture path, a missing file, Windows separators and case, and the CLI exit code (2).
- Audit summary (`docs/reviews/pre-publication-audit.md`): no secrets, emails, phones or local paths found; `LICENSE` is MIT and `package.json` now says MIT; `.kiro` is tracked and not ignored; `npm audit --omit=dev` found 0 vulnerabilities. Owner decisions: copyright holder name, README line linking to the private `ai-software-factory` repo, stale "private" wording in README and `CREW_TASK.md`.
- Hook `.kiro/hooks/engine-tests.json`: **NOT OBSERVED.** At my request the owner opened `src/engine/schema.ts`, pressed Ctrl+S with no change and waited 20 seconds. The owner saw no notification, no new chat message and no terminal. I did not edit engine code to trigger it. Possible reasons (not tested): an unchanged file may not count as a save, the hook may not be loaded, or its output may not be shown.
- Decisions where the prompt was silent:
  1. The base path is passed only as a CLI flag in `pages.yml`; no code change or path helper was needed because the fixture is imported into the bundle and `index.html` is rewritten by Vite. A guard test checks this.
  2. `tests/cli/paths.test.ts` creates a temporary file under the OS temp folder to test the outside-path cases, and deletes it afterwards.
  3. `docs/KIRO_USAGE.md` links commits with relative `../../../commit/<sha>` URLs, which resolve on GitHub only.
  4. The review comments on PRs #1 to #5 were not read; only the merge commits are cited.
- NOT done: public repository, Pages enablement and deploy, public judge URL check, CI result, Playwright run, PR for `slice-5`, demo video, Devpost.

## Kiro features used so far

| Feature | Evidence | Status |
|---|---|---|
| Kiro sessions | Slice 0, 1, 2 (Crew), Slice 3 (Kiro IDE) entries in this log | used; run IDs not exposed |
| Kiro-authored spec | `.kiro/specs/ghosttrace-ui/` (f80bbdd), `.kiro/specs/ghosttrace-export/` (f042058) | done |
| Steering | `.kiro/steering/product.md`, `.kiro/steering/tech.md` (commit 369c84b) | done |
| Hook | `.kiro/hooks/engine-tests.json` (format v1, `PostFileSave`), Slice 3 | format migrated from legacy `.kiro.hook`; execution NOT OBSERVED (Slice 5: owner saved `src/engine/schema.ts` unchanged, saw nothing in 20 s) |
| Property-based tests | `tests/engine/properties.test.ts` (fast-check, seed 20261117) | done |
| Custom agents | `.kiro/agents/ghosttrace-{builder,reviewer}.md` | defined; reviewer NOT RUN in Slice 3 (`docs/reviews/slice-3.md` gives the reason) |
| MCP | `.kiro/settings/mcp.json`, `mcp/server.ts`, `docs/evidence/mcp-calls.md` (three real calls through MCP, Slice 4) | done |
| Kiro usage narrative | [`docs/KIRO_USAGE.md`](KIRO_USAGE.md) (Slice 5) | done; claims without evidence marked NOT VERIFIED |
| Kiro-authored release spec | `.kiro/specs/ghosttrace-release/` (65b77f9) | done |
