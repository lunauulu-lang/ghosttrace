# GhostTrace release readiness - Design
## Pages
- `pages.yml`: jobs `build` (checkout, setup-node 22, `npm ci`, `npx vite build --base=/ghosttrace/`, `configure-pages`, `upload-pages-artifact` with `path: dist`) and `deploy` (`deploy-pages`, environment `github-pages`). Only `workflow_dispatch`.
- The base is a CLI flag, so `vite.config.ts` is unchanged. `index.html` uses `/src/main.tsx`, which Vite rewrites. `src/App.tsx` imports the fixture as a module, so no runtime fetch exists and no path helper is needed. A Vitest test builds nothing; it scans `index.html` and `src/**` for `fetch(` and root-absolute `src`/`href` values to guard this.
## Confinement
- `cli/node-io.ts` gains `resolveInsideCwd(path, cwd, realpath, sep)`-style logic. Pure decision function `isInside(root, target)` lives in `cli/paths.ts` (no I/O) so it can be unit tested with both separators; `node-io.ts` calls `realpathSync` on the cwd and on the target, then checks `isInside`.
- Errors: `Path is outside the repository: <path>`.
- `cli/node.d.ts` adds `realpathSync`, and `process.cwd()`.
## Audit
- `git grep` patterns over tracked files; results written to `docs/reviews/pre-publication-audit.md`.
## Docs
- `docs/KIRO_USAGE.md` links to specs, steering, hooks, MCP config, evidence and commits. README gets a top section only.
