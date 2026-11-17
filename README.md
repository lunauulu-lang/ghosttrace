# GhostTrace — Kiroween 2026 project staging package

**STATUS: PLAN ONLY (2026-11-16).** Authored as a preparation package by ChatGPT, not by Kiro. No Kiro model tasks, application implementation, live tests, public deployment or credit use are claimed.

- Track: Frankenstein
- Deadline: 2026-12-04 14:00 Pacific = 2026-12-05 04:00 Bishkek
- Official rules: https://kiroween.devpost.com/rules
- Implementation contract: `.kiro/specs/ghosttrace/{requirements,design,tasks}.md`.
- First model-run instruction: `CREW_TASK.md`.
- Execution and acceptance evidence: `docs/KIRO_LOG.md`, `docs/TEST_MATRIX.md`.
- Preparation background (not part of contest repo): https://github.com/lunauulu-lang/ai-software-factory/issues/8
- Project name is provisional. No trademark clearance or commercial demand validation.

## IMPORTANT: separate contest repository required

This folder is **only a staging package** in the private AI Software Factory repository. For the final Kiroween submission, initialize a **dedicated GhostTrace GitHub repository** using the CONTENTS OF THIS FOLDER AS ITS ROOT. That repo's root must contain `.kiro/`, `LICENSE`, source code, test instructions and the working application. Never make the existing AI Software Factory repo public: it also contains unrelated projects and history. Do not claim that nesting `.kiro/` inside this staging folder satisfies the final root requirement.

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

## First post-credit action

Browser-Claude reported 4,000 bonus credits active on the SAME Kiro account as Crew, KAS preflight PASS, but no model run. Follow the revised ../REHEARSAL.md: after owner approval, create a separate PRIVATE contest repo with this folder's contents at root, verify git write/push, ensure >=2 GiB RAM free, then launch a **single root Kiro agent** on reusable engine Slice 0. This is NOT RUN; do not invoke model, Refine, Task Runner or hooks before those gates. Never start a parallel crew on this Windows host by default.
