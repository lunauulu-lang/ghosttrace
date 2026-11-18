# GhostTrace UI v1 — Tasks

- [ ] 1. Write this spec (requirements, design, tasks) and commit.
- [ ] 2. Add steering `.kiro/steering/tech.md` and the engine test hook; commit.
- [ ] 3. Install dev dependencies `jsdom` and `@testing-library/react` (nothing else).
- [ ] 4. Widen Vitest `include` to `.test.tsx`; keep `environment: "node"` as default.
- [ ] 5. `src/styles.css`: dark theme, grid, focus ring, reduced motion (R10, R11, R14).
- [ ] 6. `src/components/IncidentTimeline.tsx` (R4, R5, R9, R10).
- [ ] 7. `src/components/StateInspector.tsx` (R6, R7, R9).
- [ ] 8. `src/components/ReplayWorkbench.tsx`: state, presets, derived replays (R2, R3, R8, R13).
- [ ] 9. `src/App.tsx` + `src/main.tsx`: fixture validation, error state, CSS import (R1).
- [ ] 10. `tests/ui/workbench.test.tsx`: 8 tests (R1–R13).
- [ ] 11. Run `npm test`, `npm run typecheck`, `npm run build`; all exit 0; commit.
- [ ] 12. Update `.kiro/specs/ghosttrace/tasks.md` (T5 sub-item) and `docs/KIRO_LOG.md`; commit.
- [ ] 13. Push branch `slice-2` only if all checks passed.

Not in this slice: export/import UI, browser E2E, deploy.
