# Slice 1 — compare, redaction, CI build (GhostTrace)

Prepared by Claude AI (project orchestrator) on 2026-11-17, revised the same day. Executed by Kiro.

## Gate status

Slice 0 is merged: PR #1 (`slice-0`, commits `f42acce`, `7c90d51`) was merged into
`main` as `fdc8dc3`. `main` contains `src/engine/{types,schema,identity,repair,
invariants,replay}.ts` and 48 passing tests. This prompt is on `main` too.

The operator (not Kiro) has already run `git checkout main` and `git pull --ff-only`
before starting this session. You do not need network for git.

The RAM gate is **>= 2 GiB free** before starting. Slice 0 started at ~1.9 GiB with
the owner's explicit override — that is not a precedent. If free RAM is below 2 GiB
when you start, stop and report.

## Rules

- You are the only agent. Do not spawn subagents, do not delegate, do not use Task Runner.
- Work only inside this repository folder. No global installs.
- Network only for `npm install` from the public npm registry (normally not needed: no new dependencies in this slice).
- No runtime LLM calls, no webhooks, no payment SDKs, no secrets.
- Never weaken or delete a test to make it pass. Never change expected values from `docs/TEST_MATRIX.md`. Do not edit existing Slice 0 tests. If the spec looks contradictory, stop and write the question in your final report instead of guessing.
- Do not touch UI: no `src/components/`, no changes to `src/App.tsx`. Workbench, Timeline and the export panel are Slice 2/3.
- Do not push, do not create PRs, do not merge. The operator does that.
- Time budget: 75 minutes. If Kiro Crew warns about low memory, stop and report.

## Read first

`.kiro/steering/product.md`, `.kiro/specs/ghosttrace/design.md` (sections "Replay
semantics" and "Data safety"), `.kiro/specs/ghosttrace/tasks.md` (T3, T6),
`docs/TEST_MATRIX.md` (F12, F21, F22, F24), `src/engine/types.ts`,
`src/engine/replay.ts`, `src/engine/identity.ts`, `src/engine/schema.ts` (how it
counts JSON depth), `docs/KIRO_LOG.md`.

## Part A — `src/engine/compare.ts` (T3, F24)

`ReplayResult.firstDivergence` already exists: it is the lowest-index violation
inside ONE run. Part A is different: compare TWO `ReplayResult`s of the same bundle
(baseline config vs repaired config).

```ts
export type DivergencePoint = {
  eventId: string;
  deliveryIndex: number;
  baseline: DeliveryRecord | null; // null if this pair has no record in that run
  repaired: DeliveryRecord | null;
};

export type CompareResult = {
  inputHashMatch: boolean;
  divergences: readonly DivergencePoint[]; // ascending deliveryIndex (original delivery order)
  firstDivergence: DivergencePoint | null; // divergences[0] ?? null
};

export function compareReplays(baseline: ReplayResult, repaired: ReplayResult): CompareResult;
```

Rules (design.md: "Compare baseline and repaired..."):
- Pair records by `(eventId, deliveryIndex)`, never by array position. `deliveries`
  and `executionOrder` may be in different orders in the two runs.
- Output in original delivery order (ascending `deliveryIndex`), even when execution
  order differs.
- A pair diverges if any of these differ: `decision`, `before` state, `after` state,
  or the sorted list of violation codes. A pair present in only one run diverges.
- If `baseline.inputHash !== repaired.inputHash`, return
  `{ inputHashMatch: false, divergences: [], firstDivergence: null }`. Do not throw.
  Record this choice in KIRO_LOG as a decision (design.md does not cover it).
- Pure: no mutation of inputs, no I/O, deterministic.

Tests `tests/engine/compare.test.ts`:
1. F24: fixture `fixtures/haunted-checkout.json`, G000 config (all off) vs G111
   config (all on). Assert: `inputHashMatch` true; `executionOrder` differs between
   the two runs; `divergences` is sorted by ascending `deliveryIndex`;
   `firstDivergence` is the first payment delivery (d1: rejected with violations in
   G000, applied in G111).
2. G110 vs G111 (only dedup differs): the first divergence is the retry delivery d3
   (applied in G110, `duplicate_skipped` in G111). Check this against the actual
   fixture; if the engine says otherwise, stop and report, do not change the test to
   match.
3. Same result compared with itself, for all 8 configs: zero divergences.
4. Mismatched hash: a second tiny valid bundle defined inline → `inputHashMatch`
   false, `divergences` empty.
5. Halted case: an inline bundle with two deliveries of the same `eventId` and
   different canonical content (like the F08 test). Replay it under G000 and under
   G111: both runs are `halted` (a hard conflict halts regardless of repairs), the
   hashes match, and compare returns zero divergences.
6. Inputs are deep-frozen before compare and unchanged after.

## Part B — `src/lib/redact.ts` (T6 sub-item, F12, F21, F22)

```ts
export const REDACTED = "[REDACTED]";
export const TOO_DEEP = "[MAX_DEPTH_EXCEEDED]";
export function redact(value: unknown, maxDepth = 32): unknown;
```

- Returns a new value; never mutates input.
- A key is sensitive if its name, lowercased and with `-` and `_` removed, contains
  any of: `token`, `secret`, `cookie`, `authorization`, `apikey`, `cardnumber`,
  `signature`. So `api_key`, `apiKey`, `API-KEY`, `x-signature`,
  `Webhook-Signature`, `card_number` all match.
- A sensitive key keeps its name; its value (any type, including objects) becomes
  `REDACTED`.
- Recurse into objects and arrays. Count depth the same way `schema.ts` does. Beyond
  `maxDepth`, replace the subtree with `TOO_DEEP` instead of recursing. Never throw,
  never overflow the stack.
- Strings, numbers, booleans and null are copied as is.

Tests `tests/lib/redact.test.ts`:
1. F12: nested `token`, `secret`, `cookie`, `authorization`, `api_key`, `apiKey`,
   `card_number` at several depths, including objects inside arrays → all
   `REDACTED`; non-sensitive siblings unchanged.
2. F22: `signature`, `x-signature`, `Webhook-Signature`, `X-SIGNATURE` → all
   `REDACTED`.
3. Depth: nesting deeper than 32 → `TOO_DEEP` at the cut, no throw; a 10 000-level
   chain also does not throw.
4. The fixture `fixtures/haunted-checkout.json` passes through `redact` unchanged
   (deep equal) — no false positives on the demo data.
5. A deep-frozen input is unchanged after `redact`.

## Part C — CI build step

Append to `.github/workflows/ci.yml`, after the `Test` step, same indentation:

```yaml
      - name: Build
        if: hashFiles('package.json') != ''
        run: npm run build
```

Run `npm run build` locally; it must exit 0. The lockfile was created on Windows. If
Linux CI later fails with `Cannot find module @rollup/rollup-linux-x64-gnu`, that is
a lockfile issue, not an engine bug: do not hand-edit `package-lock.json`, just note
the risk in the log.

## Steps

1. Check: current branch is `main`, working tree clean, `src/engine/replay.ts`
   exists. Otherwise stop and report. Then `git checkout -b slice-1`.
2. Part A. Run `npm test` and `npm run typecheck` (both exit 0). Commit:
   `kiro: Slice 1 baseline/repaired compare (T3, F24)`.
3. Part B and Part C. Run `npm test`, `npm run typecheck`, `npm run build` (all exit
   0). Commit: `kiro: Slice 1 redaction and CI build step (T6 partial, F12, F21, F22)`.
4. `.kiro/specs/ghosttrace/tasks.md`: mark T3 done with
   `evidence: src/engine/compare.ts + tests/engine/compare.test.ts, commit <SHA of step 2>, 2026-11-xx`.
   Under T6 add one line, do NOT mark T6 done:
   `sub-item done: src/lib/redact.ts (depth <= 32, signature), commit <SHA of step 3>`.
5. `docs/KIRO_LOG.md`:
   - In the Slice 0 entry replace "owner to fill" with these owner-reported values
     (mark them "owner-reported"): Free credits before 0.11/50, after 0.11/50;
     kiroween2026 bonus before 0/4000, after 7.08/4000; session turns
     0.41 + 1.02 + 5.30, plus 0.27 for a failed first session opened in the wrong
     folder. PR #1 merged to main as `fdc8dc3`.
   - Append a "Slice 1 run entry" in the same shape as Slice 0: date/time, Kiro
     surface, measured RAM at start (real number), credits "owner to fill", files
     created/edited, every command with exit code, test counts per file, build
     result, decisions (mismatched hash behavior, key normalization), NOT done
     (export/reimport, repair-spec export, UI, E2E, deploy).
6. Commit: `kiro: Slice 1 tasks and log`. Do not push.

## Final report (in chat)

Branch, the three commit SHAs, files created/changed, exit codes and test counts for
`npm test`, `npm run typecheck`, `npm run build`, anything NOT DONE, open questions.
