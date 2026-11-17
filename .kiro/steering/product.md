# GhostTrace product and execution steering

Product: deterministic webhook incident workbench for solo SaaS engineers.
Contest: Kiroween 2026, Frankenstein, newly built after 2026-10-30.
Primary goal: a polished, verifiable, under-three-minute guest demo.

## Engineering
- Static Vite + React + TypeScript SPA; deterministic pure engine in src/engine/; UI in src/App.tsx and src/components/. Build and browser E2E run in dedicated contest repository GitHub Actions, not on memory-limited Windows unless separately validated.
- No LLM at runtime, no webhook emissions, no fetching arbitrary URLs, no financial transactions.
- Never mutate imported event arrays or event payloads. No eval, dynamic JS execution or user-generated shell commands.
- Define one validated JSON bundle schema, bound to <= 1 MiB and <= 500 events.
- Event IDs are applied-only idempotency keys: identical same-ID retry is skipped only after a successful earlier apply; rejected delivery never reserves the key. Same-ID/different canonical content is always a hard conflict. Expose G000–G111 golden outcomes, especially synthetic overcapture G110 (9800) vs clean G111 (4900).
- Reject non-integer monetary minor units, missing currencies, invalid dates, invalid event types, and unknown schema versions explicitly.
- Ordering is explicit/deterministic within the synthetic checkout scenario; do not claim universal causality inference.
- Guest demo requires no secrets or external service.
- Outputs require bounded-depth (<=32) recursive redaction preview; never export signature keys, tokens, card data, cookies or private event bodies. Export/reimport must preserve or restore the repairs used.
- Unit, property/invariant, typecheck, build and browser E2E gates before release.
- English language, accessible focus, keyboard control, reduced motion.

## Workflow
Use the existing ChatGPT-authored specs as transparent seed inputs; actual Kiro revisions must be logged, not falsely attributed. Do not spend tokens merely to re-author identical documentation. Record run/session evidence in docs/KIRO_LOG.md after real sessions.
Run one foreground root agent at a time on the 8 GB Windows host. Crew max_subagents=0 (auto) is NOT a 1-agent cap; explicitly forbid delegation and Task Runner parallel steps for Slice 0. Check available RAM >= 2 GiB before starting. Move heavy CI to GitHub Actions.
Preserve GitHub SHA, test output, run ID, credit balance before/after, and any failure.
No app deployment, repo publication, subscription, pay-per-use enablement or Devpost submission without explicit owner approval.
Before promotional credits are visible, do not initiate Kiro model work; planning files are not proof of Kiro use.

Reference: https://kiroween.devpost.com/rules
