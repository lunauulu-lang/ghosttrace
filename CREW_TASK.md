# Kiro Crew — GhostTrace first real implementation slice (historical: Slice 0 was run on 2026-11-17)

## Authority and scope
Contest: Kiroween 2026 / Frankenstein. This document is the **historical planning instruction** for Slice 0. It is not evidence of a run; the run is recorded in `docs/KIRO_LOG.md`. The repository was private at the time and became public on 2026-11-19.
The owner approved spending existing Kiro Free credits and Kiroween bonus credits for contest development on 2026-11-17; no Pro plan, paid overage, deployment or public release is authorized.

## Gates BEFORE the first model call
1. (Historical gate, met on 2026-11-17.) A dedicated GhostTrace repository was to be created, private until publication, with the CONTENTS of this staging folder at its root, including `/.kiro` and `LICENSE`. Repository creation needs owner's separate approval. Do not publish or transfer AI Software Factory / EvidencePulse history.
2. Windows has a clean checked-out contest branch; `git status`, `git remote -v` and an innocuous non-model Git push/fetch have been verified for THIS repository. No tokens in logs.
3. Crew auth matches credited Kiro account, paid overage OFF, start balance recorded. Preflight KAS PASS already reported on Windows, but not a proof of first model execution.
4. Available physical memory **at least 2 GiB**, Crew reports no critically-low-memory warning. Close optional apps/tabs without stopping active Gateway.
5. Exactly **one foreground root Kiro agent**, no delegation or parallel subtasks. The Crew `max_subagents=0` setting means AUTO, not a hard single-worker cap. If Task Runner previews independent steps or parallel batches, **do not run it** for this slice; use a single foreground Kiro session. No second Gateway.
6. Show the agent the current `.kiro/specs/ghosttrace/{requirements,design,tasks}.md`, `.kiro/steering/product.md`, `docs/TEST_MATRIX.md`, and synthetic fixture. Document user/ChatGPT-authored seed material honestly.

## First authorized technical task: Slice 0 only
Create minimal Vite + React + TypeScript repository scaffolding and a **pure deterministic TypeScript replay core** in `src/engine/{schema,identity,replay}.ts` with relevant helper modules.

- Validate the checked-in incident fixture; reject malformed data, invalid minor units and duplicate deliveryIndex.
- Detect same-eventId/different-canonical-content hard conflicts before execution.
- Mark an idempotency key applied **only on successful application**. A rejected d1 must not prevent later valid retry d3.
- Support three independent repairs: v2 amount mapping, applied-only dedup, causal ordering.
- Write tests for all **G000–G111** golden outcomes in `docs/TEST_MATRIX.md`, including synthetic 9800 overcapture in G110 and clean 4900 in G111; preserve immutable input and trace violations.
- Ensure no external webhook sends, payment calls, runtime LLM calls or secrets are involved.
- Keep local tests quick and bounded. GitHub Actions, rather than this 8 GB Windows host, should run full build and browser tests once scaffolded.

## Evidence and limits
- Before starting: record timestamp, memory, run/session ID if provided, Kiro account usage. During run, do not start another agent.
- Stop after 60 minutes or on RAM warnings, auth failure, unsupported tools or ambiguous spend settings. Maximum one corrective attempt **after review**; no automatic indefinite retries.
- Commit only related source/tests/docs on an isolated branch; verify a real push to the contest repo and a SHA with relevant tests. Later verify CI green on the same SHA (or mark NOT RUN).
- Record actual credits before/after; account for delayed metering. Record `PASS`, `FAIL` or `NOT RUN` for each criterion in `docs/KIRO_LOG.md` and in GitHub Issue #8.
- Do not claim Task Runner checkpoint, pause/resume or Gateway restart recovery if using a foreground session. They may remain NOT RUN and are **not** gates to a correct core implementation.
- Do not publish, deploy, purchase, change security controls, submit Devpost or access unrelated repositories without explicit permission.

## Next stage
Only after Slice 0 code exists and its tests are witnessed: implement safe browser import, workbench UI, privacy-safe export with repair preset, CI/E2E, then optional CLI/MCP. Do not start the full T0–T10 backlog as a single agent call.
