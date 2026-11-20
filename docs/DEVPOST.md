# GhostTrace: Devpost draft

**Category:** Frankenstein
**Live demo:** https://lunauulu-lang.github.io/ghosttrace/
**Repository:** https://github.com/lunauulu-lang/ghosttrace (MIT license, `.kiro/` at the root)
**Demo video:** https://youtu.be/rEmJm2CfRv8
**How Kiro was used, with evidence:** [docs/KIRO_USAGE.md](KIRO_USAGE.md)

All data is synthetic. A PASS means only that this synthetic replay passed. GhostTrace makes no claim about any production system.

## Inspiration
Webhook incidents in a checkout are hard to reason about. A payment event can arrive before its checkout, a provider can retry a delivery, and a field can change name between API versions. A solo engineer sees one wrong total and has to guess which of the three faults caused it.

## What it does
GhostTrace replays a synthetic "haunted checkout" through a deterministic engine and lets you switch three repairs on one at a time:
- schema mapping for the v2 amount field,
- causal ordering of checkout, payment and fulfillment,
- deduplication of applied deliveries.

With all repairs off the replay fails and captures nothing (G000). With schema mapping and ordering on but deduplication off, it captures 9800 against a total of 4900 (a synthetic over-capture, G110). With all three on it captures 4900 and passes (G111). The timeline marks the first delivery where the broken and repaired runs diverge. You can preview and download a redacted export that stores the repairs you used, import it again, and download a Kiro repair spec. The same engine also runs as a command line tool and as a local MCP server with three tools (`replay_incident`, `diff_runs`, `export_regression`). Money is integer minor units. Same-ID events with different content are a hard conflict, and a rejected delivery never reserves its ID.

## How we built it (with Kiro)
Slices 0 to 2 ran in the Kiro Crew dashboard and Slices 3 to 6 in the Kiro IDE. Each slice from 2 onward started with a spec in `.kiro/specs/`, then tests and code. Steering files in `.kiro/steering/` set engine purity and claim limits. The golden outcomes G000 to G111 come from `docs/TEST_MATRIX.md` and are tested in `tests/engine/golden.test.ts`, with property tests (fast-check, seed 20261117). Kiro called all three MCP tools (`replay_incident`, `diff_runs`, `export_regression`) for real (`docs/evidence/mcp-calls.md`). A reviewer-agent run produced `docs/reviews/final-review.md`, which led to wider redaction and a symlink test. A Kiro hook runs `npm test` when Kiro edits a test file; we saw it fire twice in Slice 7. Our earlier manual-save tests showed nothing because the [Kiro docs]( Kiro Powers were not used. Details, limits and what is NOT VERIFIED are in [docs/KIRO_USAGE.md](KIRO_USAGE.md) and [docs/KIRO_LOG.md](KIRO_LOG.md).

Honest provenance: the first planning documents were written outside Kiro (ChatGPT), and the slice prompts were prepared by Claude AI as orchestrator. The owner approved every merge.

## Challenges
- Keeping the engine pure and immutable while the UI, CLI and MCP server all reuse it.
- Defining idempotency so that a rejected delivery does not block a later valid retry.
- Redaction versus fidelity: a redacted export can differ from the original. The final review found a case where redaction could turn a hard conflict into a pass after re-import. That case is not fixed and is listed under "Not fixed" in `docs/reviews/final-review.md`.
- Hooks: our first tests saved files by hand, which does not trigger Kiro file hooks ([docs](
- Developing on an 8 GB Windows machine, so browser tests run only in GitHub Actions.

## Accomplishments
- 138 unit, property and UI tests pass locally (`npm test`), plus `npm run typecheck` and `npm run build`.
- Browser end-to-end tests (Playwright) run in the CI `e2e` job. CI green on every PR since PR #4 is reported by the orchestrator, not independently checked here.
- CLI and MCP file access is confined to the working directory, including a test for a link that points outside it.
- The guest demo needs no login, no secrets and no network calls after load.

## What we learned
Writing the spec first kept each slice small and made failing new tests easy to tell apart from regressions. It also added text that mostly restated the prompt. We have no vibe-coded slice to compare with, so we report experience, not a measured difference.

## What's next
- Fix the redaction and conflict interaction (export/import semantics).
- Pin the CLI and MCP file root to the package directory and review auto-approval of tools.
- Add a static purity test over `src/engine` and `src/lib` and wider property generators.
- Optional, after the contest: persistence for private incidents.
