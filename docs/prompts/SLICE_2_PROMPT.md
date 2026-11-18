# Slice 2 — Kiro-authored UI spec, steering, hook, guest UI v1 (GhostTrace)

Prepared by Claude AI (project orchestrator) on 2026-11-17. Executed by Kiro.

## Why this slice looks the way it does

Judges score "how thoroughly and skillfully the project uses Kiro": spec-driven
development, steering, hooks, custom agents, MCP, property-based testing. So far Kiro
wrote all code, but the planning specs were written outside Kiro. In this slice YOU
write the UI spec first (Kiro spec-driven workflow), then implement it. Everything you
write is committed so the git history shows Kiro authorship.

## Gate status

`main` contains Slice 0 (engine, PR #1) and Slice 1 (`src/engine/compare.ts`,
`src/lib/redact.ts`, PR #2, merge commit `c077db3`). There is no separate operator for
this slice: you do the git preparation (Step 0) and the push (Step 6) yourself.

RAM gate: **>= 2 GiB free** at start. If below, stop and report. Record the real number.

## Rules

- You are the only agent. No subagents, no delegation, no Task Runner.
- Work only inside this repository. No global installs.
- Network only for `npm install` from the public npm registry and for `git pull` /
  `git push` to this repository's `origin`. Allowed new dev
  dependencies: `jsdom`, `@testing-library/react`. Nothing else.
- No runtime LLM calls, no webhooks, no payment SDKs, no secrets, no analytics, no
  external fonts or CDNs. The app makes zero network requests.
- Do not change `src/engine/**` or `src/lib/**` behavior. Do not edit existing tests.
  If the UI needs something the engine does not expose, stop and report.
- Never weaken a test to make it pass.
- No export/import UI (Slice 3), no E2E/Playwright (Slice 3), no deploy.
- Push only the `slice-2` branch, only in Step 6. No PRs, no merge, never push `main`,
  never force-push. The orchestrator opens the PR and reviews it.
- Time budget: 90 minutes. If Kiro Crew warns about low memory, stop and report.

## Read first

`.kiro/steering/product.md`, `.kiro/specs/ghosttrace/{requirements,design,tasks}.md`
(especially design.md "UI design" and "Testable end-to-end flow"), `docs/TEST_MATRIX.md`
(G000–G111, F02, F16), `src/engine/{types,replay,compare,schema}.ts`, `src/App.tsx`,
`src/main.tsx`, `fixtures/haunted-checkout.json`, `docs/KIRO_LOG.md`.

## Step 0 — preparation and branch

1. `git status`: the working tree must be clean. If not, stop and report; do not stash,
   reset or discard anything.
2. `git checkout main`, then `git pull --ff-only`.
3. Check that `docs/prompts/SLICE_2_PROMPT.md`, `src/engine/compare.ts` and
   `src/lib/redact.ts` exist. Record `git log -1 --format=%h` of `main`.
4. `npm test` must exit 0 with 61 tests before you change anything. If not, stop and
   report.
5. `git checkout -b slice-2`.

## Step 1 — Kiro-authored UI spec (spec-driven development)

Create `.kiro/specs/ghosttrace-ui/` with three files, written by you in the Kiro spec
format:

- `requirements.md`: user stories with acceptance criteria in EARS style
  ("WHEN ... THE SYSTEM SHALL ..."). Cover at least: load the synthetic fixture; three
  repair toggles; story presets G000 / G110 / G111; timeline in original delivery
  order; decision and violation codes per delivery; first divergence vs baseline;
  final state and PASS/FAIL; the 9800 case labelled as a simulated invalid state, not a
  real charge; synthetic-data badge; keyboard-only use; reduced motion; no network;
  responsive layout.
- `design.md`: component tree, state model (the only state is the RepairConfig and the
  selected delivery; everything else is derived by calling `replay` and
  `compareReplays`), data flow, accessibility approach, styling approach.
- `tasks.md`: ordered checklist that you then follow in steps 3–4.

Base it on the existing `.kiro/specs/ghosttrace/design.md`; do not contradict it. Commit:
`kiro: UI spec (requirements, design, tasks)`.

## Step 2 — steering and hook

- `.kiro/steering/tech.md` (always included): stack (Vite, React, TypeScript strict,
  Vitest, fast-check), engine purity (no I/O, no mutation, never throw on business data),
  UI derives everything from the engine, no network, test rules (never weaken tests,
  golden values come from `docs/TEST_MATRIX.md`), memory protocol (>= 2 GiB before
  heavy commands, one agent).
- `.kiro/hooks/`: one hook that runs `npm test` when a file under `src/engine/` or
  `src/lib/` is saved. Use the hook file format from the current Kiro documentation that
  you know. If you are not sure the format is correct, say so in the log. Record whether
  the hook actually fired during this session; if Kiro Crew does not run hooks, write
  "hook defined, execution NOT OBSERVED in Kiro Crew" — never claim it ran.

Commit: `kiro: steering tech.md and engine test hook`.

## Step 3 — UI v1

Plain React + one CSS file (`src/styles.css`). No UI libraries.

`src/App.tsx`: load `fixtures/haunted-checkout.json` (static import), validate with the
existing schema function; on failure show an error state. Render `ReplayWorkbench`.

`src/components/ReplayWorkbench.tsx`:
- Left panel: incident title; badge "Synthetic data — no real payments"; three labelled
  checkboxes: "Schema mapping (v2 amount)" = normalizeV2Amount, "Causal ordering" =
  causalCheckoutOrder, "Deduplicate applied deliveries" = deduplicateDeliveries;
  three preset buttons: "G000 Broken", "G110 Over-capture", "G111 Repaired".
- Baseline is always all repairs off. Current run = current toggles. Call `replay` for
  both and `compareReplays(baseline, current)`. Use `useMemo`; no other state.

`src/components/IncidentTimeline.tsx`:
- One row per delivery, in original `deliveryIndex` order: `d<index>`, event type,
  eventId, decision as text (applied / rejected / duplicate_skipped / hard_conflict),
  violation codes, and "executed #N" when execution order differs from delivery order.
- Mark the first divergence vs baseline with a visible text label "First divergence",
  not only colour.
- Rows are selectable by mouse and keyboard (buttons or a listbox with arrow keys).

`src/components/StateInspector.tsx`:
- Big status "PASS" or "FAIL" in an `aria-live="polite"` region.
- Final state: captured / total in USD minor units shown as dollars, fulfilled yes/no.
  When captured > total show "Simulated invalid state — no real charge".
- Violation ledger (code, delivery, message). Input hash (label it "input fingerprint,
  non-cryptographic").
- For the selected delivery: before/after state.

Styling: dark Halloween theme (near-black background, pumpkin-orange and ghost-white
accents), WCAG AA contrast, visible focus ring on every control, meaning never by colour
alone, `@media (prefers-reduced-motion: reduce)` disables all transitions/animations,
three columns at >= 1024 px, stacked below. English text only. No localStorage, no
cookies.

## Step 4 — UI tests

`tests/ui/workbench.test.tsx` with `// @vitest-environment jsdom` at the top (so engine
tests keep their environment). Use `@testing-library/react`. Tests:
1. Initial render = G000: status FAIL; `schema_drift` and `order_violation` visible.
2. Preset G110: captured $98.00 shown with the "Simulated invalid state" label;
   `capture_over_total` visible; FAIL.
3. Preset G111: PASS; captured $49.00 of $49.00; fulfilled yes.
4. With G111, the row marked "First divergence" is d1.
5. Toggling the three checkboxes one by one from G000 reaches the same result as the
   G111 preset.
6. Every checkbox and button has an accessible name (query by role + name).
7. `globalThis.fetch` is never called (spy).
8. Changing toggles does not mutate the imported fixture (compare JSON before/after).

Run `npm test`, `npm run typecheck`, `npm run build`; all must exit 0. Commit:
`kiro: guest UI v1 (workbench, timeline, inspector) and UI tests`.

## Step 5 — tasks and log

- `.kiro/specs/ghosttrace/tasks.md`: under T5 add a line
  `sub-item done: UI v1 (workbench, timeline, inspector, jsdom tests), commit <SHA>`.
  Do NOT mark T5 done: responsive and keyboard behavior still need browser E2E (Slice 3).
- `docs/KIRO_LOG.md`: append "Slice 2 run entry" in the same shape as Slice 1 (real RAM
  number, commands with exit codes, test counts per file, build size, decisions, NOT
  done). Add a short section "Kiro features used so far" listing, with evidence (file +
  commit): Kiro Crew sessions, Kiro-authored spec (`.kiro/specs/ghosttrace-ui/`),
  steering files, hook (defined / fired or NOT OBSERVED), property-based tests
  (fast-check, seed 20261117), and "MCP: not yet (planned Slice 4)".

Commit: `kiro: Slice 2 tasks and log`.

## Step 6 — push

Only if `npm test`, `npm run typecheck` and `npm run build` all exited 0:
`git push -u origin slice-2`. Record the exit code. If the push fails (authentication,
network), do not retry in a loop and do not change git settings or credentials; report
the error text.

## Final report (in chat)

Branch `slice-2`, main SHA from Step 0, the four commit SHAs, push result, files
created/changed, exit codes and test counts, build size, whether the hook fired,
anything NOT DONE, open questions.
