# GhostTrace export / import — Tasks
Rules: one agent, no subagents. Locally run only `npm test`, `npm run typecheck`, `npm run build`. Never run Playwright or download browsers locally.
- [x] 1. Write this spec (requirements, design, tasks) and commit.
- [x] 2. Install dev dependency `@playwright/test` only (R8).
- [x] 3. `src/lib/exportBundle.ts`: export file, serializer, repair spec (R1, R2).
- [x] 4. `src/lib/importBundle.ts`: size, depth, JSON, wrapper and bundle validation (R4, R5).
- [x] 5. `tests/lib/exportBundle.test.ts`: format, secret sentinels, spec content (R1, R2, F12, F22).
- [x] 6. `tests/lib/importBundle.test.ts`: every rejection path, all errors shown, never throws (R4, R5, F09, F10, F11, F21).
- [x] 7. `tests/lib/roundtrip.test.ts`: G111 round trip and eight-config property (R7, F13).
- [x] 8. `src/components/ExportPanel.tsx` and workbench wiring, CSS for narrow screens (R3, R6).
- [x] 9. `tests/ui/exportPanel.test.tsx`: preview, downloads, import ok, import error, no fetch (R3, R5, R6).
- [x] 10. `playwright.config.ts`, `e2e/story.spec.ts`, `e2e/keyboard.spec.ts`, `e2e/narrow.spec.ts`; exclude `e2e/` from Vitest (R8, F18).
- [x] 11. Add `e2e` job to `.github/workflows/ci.yml` (needs `verify`, artifact upload) (R8).
- [x] 12. Run `npm test`, `npm run typecheck`, `npm run build`; all exit 0; commit.
- [x] 13. Custom agent review attempt: not possible in this session, reason in `docs/reviews/slice-3.md` (review NOT RUN).
- [x] 14. Tick `.kiro/specs/ghosttrace/tasks.md`, update `docs/KIRO_LOG.md`, push `slice-3`, open PR if `gh` is logged in.
Not run locally by design: Playwright (CI only). T5 stays open until the E2E job is green in CI.
