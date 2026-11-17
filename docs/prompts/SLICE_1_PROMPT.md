# Slice 1 — compare, redaction, CI build (GhostTrace)

Prepared by Claude AI (project orchestrator) on 2026-11-17. Executed by Kiro.

## Gate status

Slice 0 is merged into the working tree on branch `slice-0` (commits `f42acce`,
`7c90d51`), PR [#1](https://github.com/lunauulu-lang/ghosttrace/pull/1) is open
against `main` with green CI, **not merged yet**. `src/engine/{types,schema,
identity,repair,invariants,replay}.ts` exist and are tested (48/48 passing).
Branch this slice off `slice-0`, not off `main` — `main` does not have the
engine yet. Do not merge `slice-0` into `main` and do not touch PR #1; that is
the owner's review, separate from this run.

The RAM gate is **>= 2 GiB free** before starting. The Slice 0 log recorded
starting at ~1.9 GiB with the owner's explicit override — do not treat that as
precedent. If free RAM is below 2 GiB when you start, stop and report; do not
ask for an exception.

## Rules

- You are the only agent. Do not spawn subagents, do not delegate, do not use Task Runner.
- Work only inside this repository folder. No global installs.
- Network only for `npm install` from the public npm registry.
- No runtime LLM calls, no webhooks, no payment SDKs, no secrets.
- Never weaken or delete a test to make it pass. Never change expected values from `docs/TEST_MATRIX.md`. If the spec looks contradictory, stop and write the question in your final report instead of guessing.
- Do not touch `src/components/`, `src/App.tsx` beyond the existing placeholder, or anything export/UI-related beyond `src/lib/redact.ts` itself — Workbench, Timeline and the export panel are Slice 2/3.
- Time budget: 75 minutes. If Kiro Crew warns about low memory, stop and report.

## Read first

`.kiro/steering/product.md`, `.kiro/specs/ghosttrace/design.md` (sections
"Replay semantics", "Data safety"), `.kiro/specs/ghosttrace/tasks.md` (T3, T6),
`docs/TEST_MATRIX.md` (F12, F21, F22, F24), `src/engine/types.ts`,
`src/engine/replay.ts`, `src/engine/identity.ts` (note the depth-limited
`canonicalJson` pattern — reuse that shape for the redactor's depth guard).

## Scope — two independent pieces, both pure functions, no UI

### A. `src/engine/compare.ts` (closes T3's remaining "compare" item, F24)

`ReplayResult.firstDivergence` (in `types.ts`) is the lowest-index violation
*within one run* — that already exists. This is a different thing: comparing
**two** `ReplayResult`s (e.g. baseline vs. repaired config) produced from the
*same* input bundle.

Implement:

```ts
export type DivergencePoint = {
  eventId: string;
  deliveryIndex: number;
  baseline: DeliveryRecord | null; // null if this (eventId, deliveryIndex) never got a record in baseline (e.g. halted before it)
  repaired: DeliveryRecord | null;
};

export type CompareResult = {
  inputHashMatch: boolean;
  divergences: readonly DivergencePoint[]; // every pair whose decision, before/after state, or violation codes differ, in ORIGINAL delivery order
  firstDivergence: DivergencePoint | null; // divergences[0], or null if none
};

export function compareReplays(baseline: ReplayResult, repaired: ReplayResult): CompareResult
```

Design requirements (from design.md, "Compare baseline and repaired..."):
- Pair records by `(eventId, deliveryIndex)`, **not** by position in
  `deliveries` or `executionOrder` — those arrays can be in different orders
  between the two runs (that's the whole point of `causalCheckoutOrder`).
- Report divergences in **original delivery order** (ascending
  `deliveryIndex`), even when `executionOrder` differs between the two runs.
- A pair diverges if `decision` differs, `after` state differs, or the set of
  violation codes differs. `before` state differing without the rest
  differing still counts (it means something upstream already diverged).
- `baseline.inputHash !== repaired.inputHash` means these aren't two configs
  of the same incident — that's a caller error, not business data. Set
  `inputHashMatch: false` and return immediately with `divergences: []`,
  `firstDivergence: null` rather than guessing a pairing. Document this
  choice in the KIRO_LOG entry since the design doc doesn't spell out the
  mismatched-hash case.
- Do not mutate either input `ReplayResult`.

Test `tests/engine/compare.test.ts` (F24):
- Using `fixtures/haunted-checkout.json`, compare `replay(bundle, G000-config)`
  vs `replay(bundle, G111-config)` (all repairs off vs. all on). Assert the
  first divergence is on d1 (the payment delivered before its checkout) and
  that `divergences` stays in ascending `deliveryIndex` order even though
  `executionOrder` is reordered by `causalCheckoutOrder` in the repaired run.
- Identical configs (e.g. G000 vs G000) → `divergences` is empty,
  `firstDivergence` is `null`.
- Mismatched `inputHash` (construct a second tiny bundle inline, replay it,
  compare against the fixture's result) → `inputHashMatch: false`,
  `divergences: []`.
- A `halted` (hard-conflict) baseline compared against a non-halted repaired
  run — construct a minimal inline bundle with two deliveries sharing an
  `eventId` but different canonical content (same shape as the existing F08
  conflict test in `identity.test.ts`) so you don't need a second fixture
  file.

### B. `src/lib/redact.ts` (T6's redaction item, F12 + F21 + F22)

Pure, depth-limited, recursive, case-insensitive-substring key redaction for
client-side export previews. Never mutates input; returns a deep copy.

```ts
export function redact(value: unknown, maxDepth?: number): unknown // default maxDepth 32, matching schema.ts's import depth limit
```

- A key is sensitive if its name contains, case-insensitively, any of:
  `token`, `secret`, `cookie`, `authorization`, `api_key`, `card_number`,
  `signature` (the last one catches `signature`, `x-signature`,
  `Webhook-Signature`, etc. — substring match, not exact). Match on object
  keys at any depth, in objects nested in arrays too.
- A matched key's value is replaced with the literal string `"[REDACTED]"`
  regardless of its original type.
- At depth > `maxDepth`, stop recursing and replace the remaining subtree
  with the literal string `"[MAX_DEPTH_EXCEEDED]"` rather than throwing or
  continuing — mirror the sentinel-on-cutoff shape `canonicalJson` already
  uses in `identity.ts`, don't let the parser crash on deeply nested export
  input (F21 is about rejecting deep *imports*; this is the symmetric guard
  on the *export* path per design.md's "Use the same bounded-depth checks on
  every export path").
- Primitives, `null`, and non-plain objects pass through unchanged (aside
  from the sensitive-key and depth rules above).

Test `tests/lib/redact.test.ts`:
- F12: a nested object with `token`, `secret`, `cookie`, `authorization`,
  `api_key`, `card_number` keys at multiple depths and inside an array of
  objects — all scrubbed, non-matching sibling keys untouched.
- F22: keys `signature`, `x-signature`, `Webhook-Signature` (mixed case) —
  all scrubbed.
- Depth guard: an object nested deeper than `maxDepth` — replaced with the
  sentinel, no stack overflow, no thrown error.
- The input object is unchanged after calling `redact` (deep-freeze it first,
  like the existing property test does for `replay`).

## C. CI build step

`.github/workflows/ci.yml` currently stops at `npm test`. Add, as the last
step, after `Test`:

```yaml
      - name: Build
        if: hashFiles('package.json') != ''
        run: npm run build
```

Run `npm run build` locally first and confirm it exits 0 before adding the CI
step — the existing `package-lock.json` was generated on Windows; if a build
or install step on Linux CI fails with something like `Cannot find module
@rollup/rollup-linux-x64-gnu`, that's a known optional-dependency lockfile
issue, not an engine bug. Do not attempt to fix it by hand-editing the
lockfile — report it in your final report and in `docs/KIRO_LOG.md` as an
open item for the owner/PR review instead.

## Steps

1. `git checkout slice-0 && git checkout -b slice-1`.
2. Implement and test part A (`compare.ts` + `compare.test.ts`). Run `npm test` and `npm run typecheck`; both must exit 0.
3. Commit: `kiro: Slice 1 compare engine (T3, F24)`.
4. Implement and test part B (`redact.ts` + `redact.test.ts`). Run `npm test` and `npm run typecheck`; both must exit 0.
5. Add the CI build step (part C) and confirm `npm run build` exits 0 locally.
6. Commit: `kiro: Slice 1 redaction and CI build step (T6 partial, F12, F21, F22)`.
7. In `.kiro/specs/ghosttrace/tasks.md`: mark **T3** done with
   `evidence: compare.ts + compare.test.ts, commit <SHA from step 3>`. For
   **T6**, add a sub-note (don't check it off — export panel, Kiro repair
   spec export and UI integration are still open):
   `sub-item done: src/lib/redact.ts (depth<=32, signature-inclusive), commit <SHA from step 6>`.
8. Append a "Slice 1 run entry" to `docs/KIRO_LOG.md`, same shape as the
   existing "Slice 0 run entry": date/time, Kiro surface, RAM free at start
   (must be the real measured number — if it was under 2 GiB say so, don't
   round up), credits before/after (owner to fill), files created/edited,
   exact commands with exit codes, test counts, the `npm run build` result
   and any CI/lockfile risk noted above, what's NOT done (export/reimport UI,
   Kiro repair spec export, E2E, Playwright, deploy), and the open question
   about mismatched-`inputHash` behavior in `compareReplays`.
9. Do not push.

## Final report (in chat)

Branch name, both commit SHAs, files created/changed, exit codes and test
counts for `npm test`, `npm run typecheck` and `npm run build`, the
`tasks.md` edits made, anything NOT DONE, and the lockfile/CI risk if
`npm run build` behaves differently than expected.
