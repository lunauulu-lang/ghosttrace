# GhostTrace — Kiroween 2026 (Frankenstein)

GhostTrace is a deterministic webhook incident workbench for solo SaaS engineers. It replays a synthetic "haunted checkout" (schema drift, duplicate deliveries, out-of-order events) through a pure, immutable engine, lets you switch repairs on one at a time, shows the first divergence, and exports a sanitized regression fixture plus a Kiro repair spec. A PASS means only that this synthetic replay passed. Nothing here touches real payments or production systems.

- **Live demo:** https://lunauulu-lang.github.io/ghosttrace/ (deployed by the `Pages` workflow, run #1, 2026-11-19; reported by the orchestrator)
- **How Kiro was used, with evidence:** [docs/KIRO_USAGE.md](docs/KIRO_USAGE.md)
- **Judge in 3 minutes:** last section of that document.
- **Local gates:** `npm test`, `npm run typecheck`, `npm run build`.

**STATUS (2026-11-19):** This repository is public and the live demo above is deployed with GitHub Pages. Slices 0 to 5 are merged to `main` (engine, UI, export/import, CLI and MCP, release preparation); Slice 6 is final polish. CI (`verify` and Playwright `e2e` jobs) has been green on every PR since PR #4 (reported by the orchestrator; see `.github/workflows/ci.yml`). Planning specs were authored outside Kiro; Kiro runs are tracked in `docs/KIRO_LOG.md`. The contest repository began as a bootstrap commit (561322c).

- Track: Frankenstein
- Deadline: 2026-12-04 14:00 Pacific = 2026-12-05 04:00 Bishkek
- Official rules: https://kiroween.devpost.com/rules
- Implementation contract: `.kiro/specs/ghosttrace/{requirements,design,tasks}.md`.
- First model-run instruction: `CREW_TASK.md`.
- Execution and acceptance evidence: `docs/KIRO_LOG.md`, `docs/TEST_MATRIX.md`.
- Project name is provisional. No trademark clearance or commercial demand validation.

## Product demo

A guest opens "The Haunted Checkout" synthetic incident, sees a broken replay, inspects schema drift, duplicate delivery and causal ordering, enables explicit repairs, reruns the same immutable fixture, sees a passing final state and downloads a sanitized regression fixture plus a Kiro repair spec. Neither money nor production webhooks move.

## MVP stack and boundaries

- Vite + React + TypeScript static SPA and pure, deterministic TypeScript engine; GitHub Actions handles build and E2E checks.
- Guest demo with checked-in synthetic JSON, no login and no runtime LLM.
- Read-only local JSON upload with strict size/event/depth limits, validation and privacy-safe export with a reproducible repairs preset.
- Optional Supabase auth + RLS persistence is post-contest work; do not add it to the contest-critical path.
- Static hosting deployment only when a working build exists and publication is approved.
- No arbitrary URL fetching, external webhook sending, payment SDK calls, paid services or secrets. The optional CLI/MCP bridge comes only after the browser demo is verified.
- English UI, keyboard controls, accessible dark theme and reduced-motion support.

## Three heads, one engine
The same pure replay engine (`src/engine/`) has three front ends. The CLI and the MCP server are read-only: no network, no file writes, input files <= 1 MiB.
- Web UI: `npm run dev`, then open the printed local URL.
- CLI: `npm run ghosttrace -- replay fixtures/haunted-checkout.json --repairs M,O,D [--json]` (M = v2 amount mapping, O = causal order, D = dedup). Exits 0 after a completed replay (PASS or FAIL), 2 on usage or input errors.
- MCP server (stdio): `npx tsx mcp/server.ts`, registered as `ghosttrace` in `.kiro/settings/mcp.json`. Tools: `replay_incident`, `diff_runs`, `export_regression`. Real Kiro call evidence: `docs/evidence/mcp-calls.md`.

## Files

- `.kiro/specs/ghosttrace/requirements.md`: implementation requirements.
- `.kiro/specs/ghosttrace/design.md`: architecture/data contract/algorithms.
- `.kiro/specs/ghosttrace/tasks.md`: sequential acceptance-driven tasks.
- `.kiro/steering/product.md`: persistent constraints for actual Kiro work.
- `.kiro/agents/`: proposed role configurations; existence is not proof of agent execution.
- `CREW_TASK.md`: bounded first implementation slice; historical Slice 0 instruction (already executed); kept as evidence of the original gates.
- `docs/TEST_MATRIX.md`: failure/repair regression matrix.
- `docs/SUBMISSION_AND_EVIDENCE.md`: proof and Devpost gates.
- `docs/KIRO_LOG.md`: actual Kiro run/session/credit/test ledger, initially NOT RUN.
- `fixtures/haunted-checkout.json`: synthetic input.

## Evidence policy

Actual Kiro use requires independently recorded Kiro task/session IDs, code commits attributed in a truthful activity log, tests and observable credit balance. These planning files alone do not count as evidence of Kiro use. Never fabricate a Kiro-generated commit.
