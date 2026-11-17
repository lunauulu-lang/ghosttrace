# Slice 0 - first Kiro implementation run (GhostTrace)

Prepared by Claude AI (project orchestrator) on 2026-11-17. Executed by Kiro.

## Gate status
The pre-run gates in CREW_TASK.md were satisfied by the owner on 2026-11-17:
this dedicated private contest repository exists (bootstrap commit 561322c),
git push is verified, Kiro credit use is approved, one agent only.
Banners such as "Do not start now", "PLAN ONLY" or "NOT RUN" describe the state
before bootstrap. Update them in step 1.

## Rules
- You are the only agent. Do not spawn subagents, do not delegate, do not use Task Runner.
- Work only inside this repository folder. No global installs.
- Network only for `npm install` from the public npm registry.
- No runtime LLM calls, no webhooks, no payment SDKs, no secrets.
- Never weaken or delete a test to make it pass. Never change expected values
  from docs/TEST_MATRIX.md. If the spec looks contradictory, stop and write the
  question in your final report instead of guessing.
- Time budget: 60 minutes. If Kiro Crew warns about low memory, stop and report.

## Read first
.kiro/steering/product.md, .kiro/specs/ghosttrace/requirements.md, design.md,
tasks.md, docs/TEST_MATRIX.md, fixtures/haunted-checkout.json

## Steps
0. Create branch: git checkout -b slice-0
1. Repository status docs. README.md: this is now the dedicated contest
   repository. Replace the "STATUS: PLAN ONLY" line and the section
   "IMPORTANT: separate contest repository required" with a short accurate
   status. Remove the reference to ../REHEARSAL.md. In tasks.md mark T0 done
   with "evidence: bootstrap commit 561322c, 2026-11-17".
   Commit: "kiro: update repository status after bootstrap".
2. Minimal scaffold, no UI work: package.json (private, "type": "module")
   with scripts dev="vite", build="vite build", typecheck="tsc --noEmit",
   test="vitest run". Dependencies: react, react-dom. Dev dependencies: vite,
   @vitejs/plugin-react, typescript, vitest, fast-check, @types/react,
   @types/react-dom. Run npm install and commit package-lock.json.
   tsconfig.json strict with noUncheckedIndexedAccess. vite.config.ts,
   index.html, src/main.tsx, src/App.tsx with a one-line placeholder.
3. Engine in src/engine/ following design.md exactly:
   types.ts (contract), schema.ts (R2 and "Data safety": size, count,
   depth <= 32, types, versions, ISO timestamps, integer minor units, unique
   deliveryIndex), identity.ts (canonical sorted-key JSON excluding
   deliveryIndex, hard conflicts detected before execution, applied-only
   idempotency), repair.ts (RepairConfig, v2 amount mapping, checkout-specific
   ordering), invariants.ts, replay.ts (pure function; per-delivery decision
   applied | rejected | duplicate_skipped | hard_conflict, before/after
   snapshots, violation codes, final state, pass, input hash).
   Never mutate input. Never throw for invalid business data; return explicit
   decisions.
4. Tests in tests/engine/:
   - golden.test.ts: table-driven G000-G111 exactly as in docs/TEST_MATRIX.md
     against fixtures/haunted-checkout.json (captured, fulfilled, required
     violation codes present, pass).
   - identity.test.ts: F07, F07b, F08.
   - schema.test.ts: F09 (501 events, oversized input), F10, F11 (including
     reused deliveryIndex), F21.
   - properties.test.ts: fast-check with fixed seed 20261117 and numRuns 200:
     F14 (all repairs on, any permutation of deliveries -> same final state,
     zero violations), F15 (determinism), deep-frozen input stays unchanged.
5. Run `npm test` and `npm run typecheck`. Fix code, not tests, until both
   exit 0, or stop at the time limit.
6. Append an entry to docs/KIRO_LOG.md: date/time, Kiro surface (Kiro Crew,
   single foreground session), files created, exact commands with exit codes,
   test counts, open questions. Credit fields: "owner to fill".
7. Commit: "kiro: Slice 0 replay engine and golden tests". Do not push.

## Final report (in chat)
Branch name, commit SHAs, files created, exit codes and test counts for
npm test and npm run typecheck, anything NOT DONE, open spec questions.
