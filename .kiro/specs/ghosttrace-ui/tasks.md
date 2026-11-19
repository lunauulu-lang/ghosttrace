# GhostTrace UI v1 — Tasks

- [x] 1. Write this spec (requirements, design, tasks) and commit.
- [x] 2. Add steering `.kiro/steering/tech.md` and the engine test hook; commit.
- [x] 3. Install dev dependencies `jsdom` and `@testing-library/react` (nothing else).
- [x] 4. Widen Vitest `include` to `.test.tsx`; keep `environment: "node"` as default.
- [x] 5. `src/styles.css`: dark theme, grid, focus ring, reduced motion (R10, R11, R14).
- [x] 6. `src/components/IncidentTimeline.tsx` (R4, R5, R9, R10).
- [x] 7. `src/components/StateInspector.tsx` (R6, R7, R9).
- [x] 8. `src/components/ReplayWorkbench.tsx`: state, presets, derived replays (R2, R3, R8, R13).
- [x] 9. `src/App.tsx` + `src/main.tsx`: fixture validation, error state, CSS import (R1).
- [x] 10. `tests/ui/workbench.test.tsx`: 8 tests (R1–R13).
- [x] 11. Run `npm test`, `npm run typecheck`, `npm run build`; all exit 0; commit.
- [x] 12. Update `.kiro/specs/ghosttrace/tasks.md` (T5 sub-item) and `docs/KIRO_LOG.md`; commit.
- [x] 13. Push branch `slice-2` only if all checks passed.

Not in this slice: export/import UI, browser E2E, deploy.
