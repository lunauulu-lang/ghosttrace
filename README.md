# GhostTrace — Kiroween 2026 project staging package

**STATUS (2026-11-17):** This is the dedicated private contest repository (bootstrap commit 561322c). Slice 0 (pure replay engine and golden tests) is the first Kiro run, tracked in `docs/KIRO_LOG.md`. Planning specs were authored outside Kiro. Nothing is deployed or published.

- Track: Frankenstein
- Deadline: 2026-12-04 14:00 Pacific = 2026-12-05 04:00 Bishkek
- Official rules: https://kiroween.devpost.com/rules
- Implementation contract: `.kiro/specs/ghosttrace/{requirements,design,tasks}.md`.
- First model-run instruction: `CREW_TASK.md`.
- Execution and acceptance evidence: `docs/KIRO_LOG.md`, `docs/TEST_MATRIX.md`.
- Preparation background (not part of contest repo): https://github.com/lunauulu-lang/ai-software-factory/issues/8
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

## Files

- `.kiro/specs/ghosttrace/requirements.md`: implementation requirements.
- `.kiro/specs/ghosttrace/design.md`: architecture/data contract/algorithms.
- `.kiro/specs/ghosttrace/tasks.md`: sequential acceptance-driven tasks.
- `.kiro/steering/product.md`: persistent constraints for actual Kiro work.
- `.kiro/agents/`: proposed role configurations; existence is not proof of agent execution.
- `CREW_TASK.md`: bounded first implementation slice; DO NOT RUN until private contest repo, verified Git push, credit and RAM gates pass.
- `docs/TEST_MATRIX.md`: failure/repair regression matrix.
- `docs/SUBMISSION_AND_EVIDENCE.md`: proof and Devpost gates.
- `docs/KIRO_LOG.md`: actual Kiro run/session/credit/test ledger, initially NOT RUN.
- `fixtures/haunted-checkout.json`: synthetic input.

## Evidence policy

Actual Kiro use requires independently recorded Kiro task/session IDs, code commits attributed in a truthful activity log, tests and observable credit balance. These planning files alone do not count as evidence of Kiro use. Never fabricate a Kiro-generated commit.
