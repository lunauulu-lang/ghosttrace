# Slice 7 — Prove the hook with an agent edit, third real MCP call, final narration

Prepared by Claude AI (orchestrator) on 2026-11-19. Executed by Kiro (Kiro IDE) in a NEW session.

Why this slice: the Kiro docs (https://kiro.dev/docs/hooks/) say file triggers respond only to
changes made by the agent; saving a file manually in the editor does not trigger
`PostFileSave`. Our earlier hook tests were manual saves, and the UI-created hook was added
mid-session (it becomes active at the next session start). So "NOT OBSERVED" was a wrong test,
not proof that the hooks are broken. This new session is the right test.

## Rules

- One agent, no subagents. Work only in this repository. No global installs, no new dependencies.
- Network only for `git pull` / `git push` to `origin`.
- Do not change engine behavior (`src/engine/**`, `src/lib/**`) or existing tests.
- Do not run Playwright locally. Push only branch `slice-7`; never push `main`.
- Never invent evidence. Record exactly what you saw, with time.
- Stop and report if blocked. Time budget 45 minutes.

## Step 0 — prep

Clean tree (else stop) → `git checkout main` → `git pull --ff-only` → `npm test` exits 0
→ `git checkout -b slice-7`.

## Step 1 — hook proof by an agent edit

1. With your own file tools, create `tests/hooks/hook-probe.test.ts` containing one trivial
   Vitest test (`it("hook probe", () => expect(true).toBe(true))`).
2. Then, with your own file tools, EDIT that file (for example add a one-line comment) so a
   `PostFileSave` happens by the agent. Both hooks match it only if their matcher allows
   `tests/`; `.kiro/hooks/test-on-ts-save.json` does. Do not edit engine files.
3. Watch for the hook: an injected hook prompt or message in this session, a hook run shown in
   the UI, or `npm test` output. Tell the owner: "Watch the screen now and tell me if you see a
   hook run" and wait for the answer.
4. Record in `docs/KIRO_LOG.md` (Slice 7 entry) exactly what you and the owner observed:
   OBSERVED (with what) or NOT OBSERVED. Keep the probe test file and commit
   `kiro: hook probe by agent edit`.

## Step 2 — third real MCP call

Check that the `ghosttrace` MCP tools are available in this session. If not, stop and ask the
owner to check the MCP SERVERS panel (Connected, 3 tools) and to reload the window if needed.
Then call through MCP (not the shell): `export_regression` with
`{"path": "fixtures/haunted-checkout.json", "repairs": "M,O,D"}`.
Append the exact input and output to `docs/evidence/mcp-calls.md` as "Call 4", with the date.
Confirm in the file that no secret value appears in the output. If the call is impossible,
write exactly why — never write output by hand. Commit `kiro: export_regression MCP evidence`.

## Step 3 — correct the docs and the narration

- `docs/KIRO_USAGE.md`, `docs/KIRO_LOG.md` feature table, `docs/DEVPOST.md`: explain the earlier
  NOT OBSERVED results with the documented reason (manual saves do not trigger file hooks;
  link https://kiro.dev/docs/hooks/), then give the Slice 7 result. If Call 4 succeeded, say
  Kiro called all three MCP tools for real.
- `docs/video/script.md` and `docs/video/narration.txt`: remove any sentence saying the hooks
  never fired. If the hook was OBSERVED in Step 1, add one short line that a Kiro hook runs the
  tests when Kiro edits a test file. Keep the narration at most 330 words and the plan at most
  2:50. Show the MCP panel (Connected, 3 tools) and the reviewer review file in the plan.
- Commit `kiro: docs after hook and MCP proof`.

## Step 4 — log, push

- `docs/KIRO_LOG.md`: "Slice 7 run entry" with session ID, commands and exit codes, test counts.
- `npm test`, `npm run typecheck`, `npm run build` all exit 0.
- Commit `kiro: Slice 7 log`, then `git push -u origin slice-7`. No PR, no merge.

## Final report (in chat)

Branch, commit SHAs, push result, test counts and exit codes, hook outcome (with what was seen),
MCP Call 4 outcome, narration word count, NOT DONE, open questions.
