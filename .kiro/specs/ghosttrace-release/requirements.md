# GhostTrace release readiness - Requirements
Scope: T9 and the preparation part of T10 of `.kiro/specs/ghosttrace/tasks.md`. `src/engine/**`, `src/lib/**` and existing test expectations are not changed. The owner makes the repository public and enables GitHub Pages; this slice only prepares them. All data is synthetic; PASS means only that this synthetic replay passed.

## R1 Judge link (GitHub Pages)
- THE SYSTEM SHALL provide `.github/workflows/pages.yml` that builds the web UI and deploys it with `actions/configure-pages`, `actions/upload-pages-artifact` and `actions/deploy-pages`.
- THE workflow SHALL run on `workflow_dispatch` only and SHALL request only `contents: read`, `pages: write`, `id-token: write`.
- WHEN the Pages build runs, THE SYSTEM SHALL pass `--base=/ghosttrace/` to `vite build`; `npm run dev`, `npm run build` and `vite preview` SHALL keep serving at `/`.
- THE built site SHALL contain no absolute-root asset or fetch path other than those Vite rewrites with the base, and the fixture SHALL be bundled into the JS (no runtime fetch).

## R2 Local file confinement (CLI and MCP)
- WHEN the CLI or an MCP tool receives a path, THE SYSTEM SHALL resolve its real path and accept it only if it is inside the current working directory.
- IF the real path is outside the working directory (absolute path, `..` traversal or a symlink out), THEN THE SYSTEM SHALL return a readable error and read nothing.
- THE SYSTEM SHALL keep the 1 MiB limit and SHALL stay read-only with no network.

## R3 Pre-publication audit
- THE SYSTEM SHALL record in `docs/reviews/pre-publication-audit.md` the result of checking every tracked file for secrets, personal data and local paths, the license, the `.kiro` and `.gitignore` state, and `npm audit --omit=dev`.
- IF a clear problem is found in a non-engine file, THEN THE SYSTEM SHALL fix it; anything else SHALL be listed under "Owner decisions".

## R4 Kiro usage narrative
- THE SYSTEM SHALL provide `docs/KIRO_USAGE.md` built only from evidence in this repository, with each claim linked to a file or commit and unverified claims marked NOT VERIFIED.
- THE document SHALL state that prompts were prepared by Claude AI as orchestrator and that the owner approved merges.
- THE document SHALL include a "How to judge in 3 minutes" section.

## R5 README and log
- THE README top SHALL hold a one-paragraph pitch, a Live demo placeholder marked "available after the repo is public", and a link to `docs/KIRO_USAGE.md`.
- THE log `docs/KIRO_LOG.md` SHALL get a Slice 5 run entry and an updated feature table, with hook behavior recorded as observed or NOT OBSERVED.
