# GhostTrace release readiness - Tasks
Rules: one agent, no subagents. Locally run only `npm test`, `npm run typecheck`, `npm run build`. No Playwright. Push only `slice-5`.
- [x] 1. Write this spec and commit.
- [ ] 2. `.github/workflows/pages.yml` and a guard test for absolute paths (R1).
- [ ] 3. Path confinement in CLI and MCP with tests (R2).
- [ ] 4. Pre-publication audit document and fixes (R3).
- [ ] 5. Hook demonstration with the owner; record result (R5).
- [ ] 6. `docs/KIRO_USAGE.md` (R4).
- [ ] 7. README top, log entry, feature table (R5).
- [ ] 8. `npm test`, `npm run typecheck`, `npm run build` exit 0; commit; push `slice-5`.
