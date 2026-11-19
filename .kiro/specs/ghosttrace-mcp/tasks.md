# GhostTrace CLI and MCP server - Tasks
Rules: one agent, no subagents. Run locally only `npm test`, `npm run typecheck`, `npm run build`. No Playwright.
- [ ] 1. Write this spec and commit.
- [ ] 2. Add dependencies `@modelcontextprotocol/sdk`, `zod`, dev `tsx` (R5).
- [ ] 3. `cli/core.ts` and `cli/node-io.ts` (R1, R2).
- [ ] 4. `cli/main.ts` and npm script `ghosttrace` (R3).
- [ ] 5. `mcp/server.ts` with three tools (R4).
- [ ] 6. `.kiro/settings/mcp.json` registering `ghosttrace` (R5).
- [ ] 7. Tests `tests/cli/*.test.ts` for core, CLI and handlers (R5).
- [ ] 8. `npm test`, `npm run typecheck`, `npm run build` all exit 0; commit.
- [ ] 9. Real MCP calls from Kiro, saved to `docs/evidence/mcp-calls.md`.
- [ ] 10. Hook check, log, README, push `slice-4`.
