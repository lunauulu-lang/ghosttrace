# Slice 4 — GhostTrace as a CLI and an MCP server that Kiro itself calls

Prepared by Claude AI (orchestrator) on 2026-11-19. Planned and executed by Kiro (Kiro IDE).

Goal: the SAME pure engine gets two more "heads" next to the web UI — a read-only CLI and
a local stdio MCP server — and you, Kiro, configure the server in `.kiro/settings/mcp.json`
and really call it from this session. This is the Frankenstein story (one engine, three
bodies) and the strongest "how Kiro was used" evidence. Never fake a tool call.

## Rules

- One agent, no subagents. Work only in this repository. No global installs.
- Network only for `npm install` and `git pull` / `git push` to `origin`.
- Allowed new dependencies: `@modelcontextprotocol/sdk`, `zod`, `tsx` (dev). Nothing else.
- Do not change engine behavior (`src/engine/**`, `src/lib/**`) or existing tests.
- The CLI and MCP server are read-only: no network, no writes outside paths the user
  passes, input files <= 1 MiB and validated with the existing schema code.
- Do not run Playwright locally. Push only branch `slice-4`; never push `main`.
- Stop and report if blocked. Time budget 90 minutes.

## Step 0 — prep

Clean tree (else stop) → `git checkout main` → `git pull --ff-only` → `npm test` exits 0
→ `git checkout -b slice-4`.

## Step 1 — your spec

Write `.kiro/specs/ghosttrace-mcp/{requirements,design,tasks}.md` (EARS), covering T11
of `.kiro/specs/ghosttrace/tasks.md`. Commit `kiro: MCP/CLI spec`.

## Step 2 — implement (follow your tasks.md, tick items)

- CLI: `npm run ghosttrace -- replay <bundle.json> [--repairs M,O,D] [--json]` printing
  PASS/FAIL, captured/total, violations and first divergence vs all-off baseline.
- MCP server (stdio, `@modelcontextprotocol/sdk`): tools `replay_incident`
  (path + repairs → result summary), `diff_runs` (path + two repair sets → first
  divergence), `export_regression` (path + repairs → sanitized bundle + preset JSON,
  using `redact`). Start command e.g. `npx tsx mcp/server.ts`.
- `.kiro/settings/mcp.json` registering the server as `ghosttrace`.
- Vitest tests for the CLI and for each MCP tool handler (call handlers directly; G000
  FAIL, G110 shows 9800, G111 PASS; secrets never appear in `export_regression`).
- `npm test`, `npm run typecheck`, `npm run build` all exit 0. Commit
  `kiro: GhostTrace CLI and MCP server`.

## Step 3 — real MCP call by Kiro (evidence)

Make sure the `ghosttrace` MCP server is connected in this Kiro session. If it is not
available yet, stop and ask the owner to enable it in the Kiro MCP panel, then continue.
Then call, through MCP (not through the shell):
1. `replay_incident` on `fixtures/haunted-checkout.json` with no repairs,
2. `replay_incident` with all repairs,
3. `diff_runs` between them.
Save the exact tool names, inputs and outputs to `docs/evidence/mcp-calls.md` with the
date. If you could not call it through MCP, write exactly why there — never invent output.

## Step 4 — hook check

`.kiro/hooks/engine-tests.json` now exists from the start of this session. Note in the log
whether the hook fired at any point (observed / NOT OBSERVED). Do not edit engine code just
to trigger it.

## Step 5 — log, push

- `docs/KIRO_LOG.md`: "Slice 4 run entry" (surface: Kiro IDE; commands with exit codes;
  test counts; MCP call result; hook result) and update the "Kiro features used so far"
  table (MCP: done/not done with evidence path).
- README: a short "Three heads, one engine" section (web UI, CLI, MCP) with run commands.
- Commit `kiro: Slice 4 tasks and log`, then `git push -u origin slice-4`. No PR, no merge.

## Final report (in chat)

Branch, commit SHAs, push result, test counts and exit codes, MCP call evidence (yes/no and
file), hook outcome, NOT DONE, open questions.
