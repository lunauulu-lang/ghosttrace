# Slice 3 — export / reimport, browser E2E in CI, Kiro hook v1 (GhostTrace)

Prepared by Claude AI (orchestrator) on 2026-11-19. Executed and planned by Kiro.

This prompt gives goals, limits and acceptance criteria. YOU plan the work: write the
spec first, then implement it. Judges score how thoroughly the project uses Kiro
(specs, steering, hooks, custom agents, MCP, property tests), so keep everything you
decide in `.kiro/` and in git.

## Rules

- One agent. No subagents, no delegation, no Task Runner.
- Work only in this repository. No global installs.
- Network only for `npm install` (public npm registry) and `git pull` / `git push` to
  `origin`. The app itself makes zero network requests.
- New dev dependency allowed: `@playwright/test`. Nothing else.
- Do not change engine behavior (`src/engine/**`) or existing tests. If you must, stop
  and report.
- Never weaken a test. Never claim something ran if you did not see it run.
- Do NOT run Playwright or download browsers locally (8 GB laptop). E2E runs in CI only.
- Push only branch `slice-3`. Never push `main`, never force-push.
- RAM: target >= 2 GiB free. If 1.7–2.0 GiB, the owner pre-approves starting; record
  the number. Below 1.7 GiB stop and report.
- Time budget 90 minutes.

## Step 0 — prep

Clean tree (else stop, do not stash or reset) → `git checkout main` →
`git pull --ff-only` → `npm test` exits 0 with 69 tests → `git checkout -b slice-3`.

## Step 1 — housekeeping (commit `kiro: Slice 3 housekeeping`)

1. `.kiro/specs/ghosttrace-ui/tasks.md`: tick the items that Slice 2 really completed.
2. Hook: migrate to the current Kiro hook format (Kiro IDE 1.0 / CLI 3.0):
   `.kiro/hooks/engine-tests.json` with `"version": "v1"` and a `hooks` array; one hook
   with `trigger: "PostFileSave"`, a regex `matcher` for `src/engine/` and `src/lib/`
   TypeScript files, `action: { "type": "command", "command": "npm test" }`.
   Delete the legacy `.kiro/hooks/engine-tests-on-save.kiro.hook`.
3. `.kiro/specs/ghosttrace/design.md`: add a section "Implementation decisions (Kiro)"
   listing the decisions already recorded in `docs/KIRO_LOG.md` (hard conflict halts
   replay, zero amount rejected, extra violation codes, cyrb53 fingerprint, compare on
   mismatched hash, redaction key normalization). Do not change existing text.

## Step 2 — your spec (commit `kiro: export/import spec`)

Write `.kiro/specs/ghosttrace-export/{requirements,design,tasks}.md` (EARS
requirements). It must cover T2, T6, T7, T8 of `.kiro/specs/ghosttrace/tasks.md` and
TEST_MATRIX F09–F13, F18, F21, F22. Required behavior:

- **Export** (client-side, Blob download, preview first): a sanitized bundle passed
  through `redact`, plus the current RepairConfig as a validated preset, in one JSON
  file; plus a short Markdown "Kiro repair spec" describing the failing invariants and
  the repairs that fixed them. Zero secrets in any output.
- **Import**: local file input only; reject > 1 MiB, invalid JSON, depth > 32, schema
  errors (show each error); a valid file restores bundle AND preset, then replays.
- **Round trip**: export at G111 → import → PASS with identical input fingerprint.
- **E2E** (Playwright, chromium, CI only): G000 FAIL → G110 shows $98.00 and the
  simulated-state label → G111 PASS → export → reimport → PASS. Plus one keyboard-only
  pass and one 375 px narrow-viewport check.

## Step 3 — implement your tasks

Follow your `tasks.md`, ticking items as you finish. Unit tests (Vitest) for export
format, import validation (including a bundle with nested `token`, `api_key`,
`X-Signature` fields → none survive export), and the round trip. Add Playwright config
and `e2e/` tests; make sure Vitest does not pick up `e2e/`. Add an `e2e` job to
`.github/workflows/ci.yml` that runs after `verify`: `npm ci`,
`npx playwright install --with-deps chromium`, build, serve with `vite preview`, run
Playwright, upload the report as an artifact. Locally run only `npm test`,
`npm run typecheck`, `npm run build` (all exit 0). Commit:
`kiro: export/import and E2E`.

## Step 4 — custom agent review (experiment)

If Kiro Crew lets you run the custom agent in `.kiro/agents/` that reviews code, run it
on `git diff main...slice-3` and save its output to `docs/reviews/slice-3.md`. If that
is not possible in Kiro Crew, write in that file exactly why. Do not fake a review.

## Step 5 — log, push, PR

- Tick `.kiro/specs/ghosttrace/tasks.md` sub-items you finished (T5 stays open until
  E2E is green in CI).
- `docs/KIRO_LOG.md`: "Slice 3 run entry" like Slice 2, and update the table "Kiro
  features used so far" (hook format migrated; hook execution observed or NOT OBSERVED;
  custom agent run or not).
- Commit `kiro: Slice 3 tasks and log`, then `git push -u origin slice-3`.
- If `gh auth status` shows you are logged in, open a PR to `main` titled
  "Slice 3: export/import, E2E, hook v1 (Kiro)" with a short body. Otherwise skip and
  say so. Do not merge.

## Final report (in chat)

Branch, commit SHAs, push and PR result, test counts and exit codes, build size, what
the E2E job is expected to do in CI, hook and custom-agent outcome, NOT DONE, open
questions.
