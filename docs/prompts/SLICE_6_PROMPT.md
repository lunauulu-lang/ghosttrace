# Slice 6 — Final polish: truthful docs, working hook, reviewer agent, video script, Devpost draft

Prepared by Claude AI (orchestrator) on 2026-11-19. Planned and executed by Kiro (Kiro IDE).

Context: the repository is now public and the judge link works:
https://lunauulu-lang.github.io/ghosttrace/ (deployed by the `Pages` workflow run #1 on
2026-11-19; the orchestrator opened it and saw FAIL at load and PASS after "G111 Repaired").
CI (`verify` + `e2e` Playwright jobs) has been green on every PR since PR #4 (CI runs #14–#20).

## Rules

- One agent, no subagents (except Step 4, where the owner runs the reviewer agent in a
  separate chat). Work only in this repository. No global installs.
- Network only for `npm install` and `git pull` / `git push` to `origin`.
- No new dependencies. No paid services, no API keys, no secrets.
- Do not change engine behavior (`src/engine/**`, `src/lib/**`) or existing test expectations.
- Do not run Playwright locally. Push only branch `slice-6`; never push `main`.
- Never invent evidence. Anything you did not see yourself is marked "reported by the owner"
  or "reported by the orchestrator".
- Stop and report if blocked. Time budget 90 minutes.

## Step 0 — prep

Clean tree (else stop) → `git checkout main` → `git pull --ff-only` → `npm test` exits 0
→ `git checkout -b slice-6`.

## Step 1 — your spec

Write `.kiro/specs/ghosttrace-polish/{requirements,design,tasks}.md` (EARS). Commit
`kiro: polish spec`.

## Step 2 — fix the docs (truth first)

- `README.md`: replace the stale "private repository" STATUS paragraph with a current one;
  the Live demo line becomes a working link (no "not deployed yet").
- `CREW_TASK.md`: fix stale "private" wording.
- `docs/KIRO_USAGE.md`: fix the false claim that Playwright tests never ran — they run in
  the CI `e2e` job (green since PR #4, reported by the orchestrator; cite
  `.github/workflows/ci.yml`). Mark the live link as deployed (reported by the orchestrator).
  Add a "Kiro surfaces" paragraph (Kiro Crew for Slices 0–2, Kiro IDE for 3–6, how they
  differed in practice) and a short "Spec-driven vs vibe coding" paragraph based on this
  project. If Kiro powers were not used, say so plainly.
- `docs/KIRO_LOG.md`: fix the broken heading (`Devpost.## Kiro features used so far` must be
  two lines) and remove the duplicated Hook row in the features table.
- `docs/reviews/pre-publication-audit.md`: record the owner's decisions: keep
  `lunauulu-lang` in LICENSE; README link to the private repo removed (2f056fe); "private"
  wording fixed in this slice; all `docs/prompts/*` kept; repo made public on 2026-11-19.
- Commit `kiro: truthful docs after publication`.

## Step 3 — make a hook really fire (owner helps)

The JSON hook `.kiro/hooks/engine-tests.json` never fired. Stop and ask the owner to create a
hook through the Kiro UI instead:
"In the Kiro panel, under AGENT HOOKS, press + and describe: *When a TypeScript file under
src/ or tests/ is saved, run npm test and report the result.* Save the hook, then tell me."
Then ask the owner to open `tests/cli/paths.test.ts`, add one empty line at the end, press
Ctrl+S, wait 30 seconds, delete the empty line, press Ctrl+S again, and tell you what
happened. Check whether the hook ran (agent message, terminal, notification). Record the
outcome honestly in `docs/KIRO_LOG.md` (observed / NOT OBSERVED, with what the owner saw),
make sure `git diff tests/` is empty, and commit the new hook file Kiro created (if any) with
`kiro: hook created in Kiro UI`. If the old JSON hook is clearly broken, say why in the log;
do not delete it without a reason.

## Step 4 — reviewer agent run (owner helps)

`.kiro/agents/ghosttrace-reviewer.md` was never run. Stop and give the owner this exact
message to paste into a NEW Kiro chat after choosing the `ghosttrace-reviewer` agent in the
agent selector next to the chat input:

"Review the whole GhostTrace repository on branch slice-6 as a strict judge of the Kiroween
hackathon. Check: engine purity, test quality, security of the CLI/MCP file access, honesty
of docs/KIRO_USAGE.md and README against the code and git history. Do not edit any file
except docs/reviews/final-review.md, where you write your findings with severity
(high/medium/low) and file references. Do not commit."

When the owner says the review is done, read `docs/reviews/final-review.md`, fix every
high-severity finding that is in a non-engine file, list the rest under "Not fixed" in the
same file with reasons, and commit `kiro: reviewer agent findings`. If the agent selector or
the agent is not available, write exactly why in `docs/reviews/final-review.md`.

## Step 5 — demo video script (English)

Check what is installed and record versions in the log (do not install anything):
`ffmpeg -version`, `python -c "import faster_whisper; print(faster_whisper.__version__)"`
(or `py -c ...` on Windows), `npx --no-install remotion --version`.
Then write:
- `docs/video/script.md`: a 2 min 40 s demo plan (hard limit 2:50), as a table of time
  ranges with: what is on screen, what the owner clicks, and the narration line. Cover:
  the problem (haunted checkout, 1 sentence), FAIL at load, repairs one by one (G110 shows
  9800 over-capture, G111 PASS 4900), first divergence, export, the CLI, the MCP server
  connected in Kiro with a real tool call, and how Kiro built it (specs panel, steering,
  hook, MCP, reviewer agent, KIRO_LOG). End with the repo and live link.
- `docs/video/narration.txt`: only the narration text, plain English, short sentences, at
  most 330 words, ready to paste into ElevenLabs.
- `docs/video/recording-checklist.md`: a step-by-step list for the owner to record the screen
  (Windows Win+Alt+R or any recorder), without sound, following the script order.
No music, no third-party logos or trademarks except the Kiro name.

## Step 6 — Devpost draft

Write `docs/DEVPOST.md` in English with the usual Devpost sections: Inspiration, What it
does, How we built it (with Kiro — link `docs/KIRO_USAGE.md`), Challenges, Accomplishments,
What we learned, What's next; plus "Category: Frankenstein", the live link, the repo link,
and a placeholder for the YouTube link. Only claims backed by this repository.

## Step 7 — log, push

- `docs/KIRO_LOG.md`: "Slice 6 run entry" and update the "Kiro features used so far" table
  (hook, custom agent, video script).
- `npm test`, `npm run typecheck`, `npm run build` all exit 0.
- Commit `kiro: Slice 6 log`, then `git push -u origin slice-6`. No PR, no merge.

## Final report (in chat)

Branch, commit SHAs, push result, test counts and exit codes, hook outcome, reviewer agent
outcome, installed video tools with versions, NOT DONE, open questions.
