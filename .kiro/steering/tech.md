---
inclusion: always
---

# GhostTrace tech steering

## Stack
Vite, React, TypeScript (strict), Vitest, fast-check. UI adds jsdom and @testing-library/react for tests only. One CSS file, no UI libraries.

## Engine purity (`src/engine/`, `src/lib/`)
- No I/O, no network, no clock, no randomness.
- Never mutate inputs; never throw on business data (return violations or errors instead).
- Do not change engine or lib behavior while building UI. If the UI needs something the engine does not expose, stop and report.

## UI
- The UI derives everything from the engine (`replay`, `compareReplays`). The only state is the RepairConfig and the selected delivery.
- The app makes zero network requests. No localStorage, cookies, analytics, external fonts or CDNs.
- Meaning is never carried by colour alone. Every control is keyboard-operable and has an accessible name. Respect `prefers-reduced-motion`.
- A PASS means only that this synthetic replay passed. Never claim a production repair.

## Tests
- Never weaken or delete a test to make it pass. Do not edit existing tests unless the owner asks.
- Golden values come from `docs/TEST_MATRIX.md` (G000–G111). G110 captures 9800, G111 captures 4900.
- Property tests use fast-check with seed 20261117.
- Report failing commands as they are.

## Memory protocol (8 GB Windows host)
- Check free RAM before heavy commands (install, build, full tests). Target >= 2 GiB; if lower, stop and report unless the owner approves.
- One foreground agent at a time. No subagents, no Task Runner parallel steps.
- Heavy CI belongs to GitHub Actions.
