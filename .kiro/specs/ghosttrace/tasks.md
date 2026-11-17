# Implementation tasks — Kiro must execute and verify after credits

**Do not start now.** Planning written outside Kiro on 2026-11-16. One worker at a time. An unchecked task is NOT completed just because a file exists.

- [ ] T0 — **Owner approval required for repository creation:** create a dedicated PRIVATE contest repository, copy staging folder CONTENTS to its root, keep root `/.kiro` and `LICENSE`, commit. Do not publish without approval. Record original commit and date; never transfer EvidencePulse/Factory histories. Verify Windows git fetch/commit/push to this private repo with an innocuous non-model marker before allowing Kiro model work.
- [ ] T1 — **Slice 0 / first actual Kiro model run:** bootstrap minimum Vite + React + TypeScript static SPA manifest/lockfile and implement `src/engine/{schema,identity,replay}.ts` plus automated tests for G000–G111, conflicting same-ID contents and rejected-then-successful retry. Keep root-agent session sequential, no subagents. Use local short unit tests only; run heavier Vite build/E2E in contest repo CI. Record run ID, SHA, before/after credit balances and exact test outputs. Stop after <=60 minutes; one corrective attempt maximum.
- [ ] T2 — Complete browser import and nested depth<=32 validation. Prove malformed/oversized/unknown event/invalid currency/money/repeated deliveryIndex are rejected and imported data never triggers network calls.
- [ ] T3 — Complete pure immutable trace, compare and first divergence using (eventId,deliveryIndex). Fixture must reproducibly meet G000–G111 including rejected delivery not consuming idempotency key; no unhandled exception. Expand seeded property tests.
- [ ] T4 — Finish schema mapping, successfully-applied-only dedup, checkout-specific ordering and invariant traces. Verify same-ID conflict always fails; identical input hash; repaired target captures 4900 once and ends fulfilled; G110 deliberately shows invalid 9800 simulation.
- [ ] T5 — Build polished English guest UI with load fixture, detailed timeline, invariant panel, before/after compare and full keyboard flow. Check responsive and prefers-reduced-motion behavior.
- [ ] T6 — Add depth-limited recursive sensitive-key redaction (`signature` included), previewed client-side exports: JSON fixture + repair preset and Kiro repair spec. Prove zero secret sentinels in any output and successful export/reimport. Executable Vitest regression export is an optional polish item.
- [ ] T7 — Add thorough seeded unit and invariant/property tests for G000–G111, plus browser E2E showing G000 -> G110 -> G111 -> sanitized export -> reimport. Run against actual app through dedicated contest GitHub Actions, not the factory's `verify.yml`.
- [ ] T8 — Run contest CI (`npm ci`, typecheck, unit/property tests, `vite build`, Playwright E2E), all tied to same SHA, and smoke test static artifact. Record missing checks as NOT RUN, never inherited green checks from factory.
- [ ] T9 — After owner authorization, make dedicated repo public, verify license recognition and root `/.kiro`, deploy to approved free hosting, test public judge link and keep it accessible through 2027-01-29. No auto-spend.
- [ ] T10 — After actual Kiro runs, write truthful Kiro usage narrative using task IDs, model/session evidence, specs, steering and real commits. Record English public YouTube demo < 3 minutes and assemble Devpost entry; submit only with owner approval.
- [ ] T11 (optional, never before working MVP) — Package the same replay engine as read-only CLI and optionally a stdio MCP server; validate one real Kiro MCP call with logs. Drop if core/UI/CI still behind on 2026-11-28.
- [ ] T12 (post-contest, not critical path) — Consider Supabase auth/private incident persistence with tenant RLS and negative tests only after guest project is shipped.

## Mandatory stop gates
- No Kiro model calls while granted credits are absent or spend settings are unknown.
- No parallel Crew on 8 GB host without proven headroom/isolation. `max_subagents=0` means auto, not single worker; enforce no delegation in Slice 0 and abort if Task Runner previews concurrent steps.
- No production integration or real payment/webhook calls.
- Never treat a claimed green test, submitted Devpost form or successful deployment as fact without logs/URL.
- Replanning can cut optional features; it cannot cut R1-R8 or actual Kiro participation.
