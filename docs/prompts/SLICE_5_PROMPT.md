# Slice 5 — Release readiness: judge link, hardening, pre-publication audit, Kiro usage draft

Prepared by Claude AI (orchestrator) on 2026-11-19. Planned and executed by Kiro (Kiro IDE).

Goal: make the repository ready to become public and to give judges a working link,
without spending money and without changing engine behavior. The owner will make the
repository public and enable GitHub Pages himself after this slice is merged.

## Rules

- One agent, no subagents. Work only in this repository. No global installs.
- Network only for `npm install` and `git pull` / `git push` to `origin`.
- No new runtime dependencies. No paid services, no new accounts, no secrets.
- Do not change engine behavior (`src/engine/**`, `src/lib/**`) or existing test expectations.
- Do not run Playwright locally. Push only branch `slice-5`; never push `main`.
- Do not make the repository public and do not change GitHub settings — the owner does that.
- Stop and report if blocked. Time budget 90 minutes.

## Step 0 — prep

Clean tree (else stop) → `git checkout main` → `git pull --ff-only` → `npm test` exits 0
→ `git checkout -b slice-5`.

## Step 1 — your spec

Write `.kiro/specs/ghosttrace-release/{requirements,design,tasks}.md` (EARS), covering T9
and the preparation part of T10 of `.kiro/specs/ghosttrace/tasks.md`. Commit
`kiro: release spec`.

## Step 2 — judge link (GitHub Pages, free)

- Add `.github/workflows/pages.yml` that builds the web UI and deploys it with the official
  `actions/configure-pages`, `actions/upload-pages-artifact`, `actions/deploy-pages`.
  Trigger: `workflow_dispatch` only (the repo is still private; the owner enables Pages
  after making it public). Permissions: `contents: read`, `pages: write`, `id-token: write`.
- The site will be served from `/ghosttrace/`. Pass the base path only in the Pages build
  (for example `npx vite build --base=/ghosttrace/`), so `npm run dev`, `npm run build`,
  `vite preview` and the existing E2E job keep working at `/`.
- Make sure the bundled fixture loads under the sub-path (no absolute `/` asset or fetch
  paths). Add a Vitest test if a path helper is needed.

## Step 3 — MCP/CLI hardening

The CLI and MCP tools currently read any local path. Restrict them to files inside the
current working directory (the repository): resolve the real path and reject anything
outside with a readable error. Keep the 1 MiB limit. Add Vitest tests for a path outside
the repo, `..` traversal and a normal fixture path. If you need more `node:` typings,
extend `cli/node.d.ts` (still no `@types/node`).

## Step 4 — pre-publication audit

Before the owner makes the repo public, check every tracked file and write the result to
`docs/reviews/pre-publication-audit.md`:
- secrets or token-like strings (`git grep` for keys, tokens, passwords, `sk-`, `ghp_`,
  `AKIA`, private keys);
- personal data: real names, emails, phone numbers, local paths like `C:\Users\...`;
- `LICENSE` is an OSI open-source license and `package.json` `license` matches it;
- `/.kiro` is at the root and not ignored by `.gitignore`;
- `npm audit --omit=dev` result (report it; do not force-upgrade).
Fix only clear problems in non-engine files (for example remove a local path from a doc).
List anything that needs the owner's decision under "Owner decisions". Do not rewrite git
history.

## Step 5 — hook demonstration (owner helps)

Stop and ask the owner: "Open `src/engine/schema.ts`, press Ctrl+S without changing
anything, and tell me what you see." Then check whether the `engine-tests` hook ran
(Kiro hook output / agent message). Record the outcome honestly in `docs/KIRO_LOG.md`
as observed / NOT OBSERVED, with what the owner saw. Do not edit engine code to trigger it.

## Step 6 — Kiro usage draft for judges

Write `docs/KIRO_USAGE.md` (English, plain, truthful), built only from real evidence in
this repo: specs in `.kiro/specs/*`, steering, hooks, `.kiro/settings/mcp.json`,
`docs/evidence/mcp-calls.md`, `docs/KIRO_LOG.md`, commit history and PRs #1–#5.
- Say clearly which work Kiro did (planning specs, writing code and tests, git operations,
  MCP calls) and that prompts were prepared by Claude AI acting as orchestrator, with the
  owner approving merges.
- Each claim links to a file or commit. Mark anything not verified as NOT VERIFIED.
- Add a short "How to judge in 3 minutes" section: open link, click through the haunted
  checkout, apply repairs, export; CLI and MCP commands.

## Step 7 — README for judges, log, push

- README top: one-paragraph pitch, "Live demo" placeholder `https://lunauulu-lang.github.io/ghosttrace/`
  (marked "available after the repo is public"), link to `docs/KIRO_USAGE.md`.
- `docs/KIRO_LOG.md`: "Slice 5 run entry" (surface Kiro IDE; commands with exit codes;
  test counts; audit summary; hook result) and update the "Kiro features used so far" table.
- `npm test`, `npm run typecheck`, `npm run build` all exit 0.
- Commit `kiro: Slice 5 release readiness`, then `git push -u origin slice-5`. No PR, no merge.

## Final report (in chat)

Branch, commit SHAs, push result, test counts and exit codes, audit findings and owner
decisions, hook outcome, NOT DONE, open questions.
