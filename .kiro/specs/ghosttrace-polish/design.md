# GhostTrace final polish - Design
- Docs are edited in place; no code changes. The only code-adjacent file is a hook created by Kiro UI in `.kiro/hooks/`.
- Hook test: owner appends an empty line to `tests/cli/paths.test.ts`, saves, waits 30 s, removes it, saves. `git diff tests/` must be empty afterwards.
- Reviewer: owner pastes a fixed prompt in a new chat with `ghosttrace-reviewer` selected. Output only in `docs/reviews/final-review.md`.
- Video: script table with time ranges, screen, clicks, narration. Narration text is extracted from the script and counted with a word count command.
- Devpost: sections written from `README.md`, `docs/KIRO_USAGE.md`, `docs/KIRO_LOG.md`; no number or claim without a file behind it.
- Gates: `npm test`, `npm run typecheck`, `npm run build`. No Playwright locally. Push only `slice-6`.
