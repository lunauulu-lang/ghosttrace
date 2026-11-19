# GhostTrace final polish - Requirements
Scope: Slice 6. Docs, one hook, one reviewer-agent run, a demo video plan and a Devpost draft. `src/engine/**`, `src/lib/**` and existing test expectations are not changed. All data is synthetic; PASS means only that this synthetic replay passed.
## R1 Truthful docs
- THE README SHALL describe the repository as public and SHALL link the live demo https://lunauulu-lang.github.io/ghosttrace/ without "not deployed" wording.
- THE docs SHALL NOT call the repository private, except where they describe history or a past state.
- THE `docs/KIRO_USAGE.md` SHALL state that Playwright tests run in the CI `e2e` job and SHALL mark that and the deployed link as reported by the orchestrator.
- THE `docs/KIRO_USAGE.md` SHALL describe the Kiro surfaces used (Crew for Slices 0-2, IDE for 3-6) and SHALL compare spec-driven work with vibe coding using only this project's evidence.
- IF a Kiro power was not used, THEN THE docs SHALL say so.
- THE `docs/KIRO_LOG.md` SHALL have a valid heading structure and one row per feature.
- THE audit file SHALL record the owner's publication decisions.
## R2 Working hook
- WHEN a TypeScript file under `src/` or `tests/` is saved, THE hook SHALL run `npm test` and report the result.
- THE hook SHALL be created through the Kiro UI by the owner.
- THE log SHALL record whether the hook fired as observed or NOT OBSERVED, with what the owner saw.
- THE hook test SHALL leave `tests/` unchanged.
## R3 Reviewer agent
- WHEN the owner runs `ghosttrace-reviewer` in a new chat, THE agent SHALL write only `docs/reviews/final-review.md`.
- THE SYSTEM SHALL fix every high-severity finding in a non-engine file and list the rest as "Not fixed" with reasons.
- IF the agent is unavailable, THEN `docs/reviews/final-review.md` SHALL say exactly why.
## R4 Video plan
- THE SYSTEM SHALL provide `docs/video/script.md` (2:40 plan, hard limit 2:50), `docs/video/narration.txt` (at most 330 words) and `docs/video/recording-checklist.md`.
- THE log SHALL record the versions of ffmpeg, faster-whisper and remotion, or that they are absent.
- THE video material SHALL use no music and no third-party marks except the Kiro name.
## R5 Devpost draft
- THE `docs/DEVPOST.md` SHALL have the standard Devpost sections, the Frankenstein category, the live and repo links and a YouTube placeholder.
- EVERY claim in it SHALL be backed by this repository.
