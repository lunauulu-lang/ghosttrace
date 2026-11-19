# How Kiro was used in GhostTrace
Draft for judges, written 2026-11-19 by Kiro (Kiro IDE) from files in this repository. Every claim links to a file or commit. Anything without evidence in the repository is marked NOT VERIFIED.

## Who did what
- **Claude AI acted as orchestrator.** It wrote the slice prompts in [`docs/prompts/`](prompts/) (for example commit [36c0d52](../../../commit/36c0d52) for Slice 0, [30092af](../../../commit/30092af) for Slice 5). The prompts set scope, rules and acceptance checks.
- **ChatGPT wrote the first planning documents** (`.kiro/specs/ghosttrace/*`, early steering, the first `docs/KIRO_LOG.md`) before any Kiro run. They were imported in the bootstrap commit [561322c](../../../commit/561322c). The log says they were not Kiro-authored ([`docs/KIRO_LOG.md`](KIRO_LOG.md), top).
- **Kiro did the implementation work** in Slices 0 to 5: wrote code and tests, ran the commands, made the git commits and pushed the slice branches. Commits with the `kiro:` prefix are Kiro's, for example [7c90d51](../../../commit/7c90d51) (engine and golden tests).
- **The owner approved and merged.** Pull requests #1 to #5 are merge commits in the history: [fdc8dc3](../../../commit/fdc8dc3), [c077db3](../../../commit/c077db3), [77720eb](../../../commit/77720eb), [a808470](../../../commit/a808470), [8681caf](../../../commit/8681caf). Review comments on those PRs were not read for this document: NOT VERIFIED.
- Slice 0 to 2 ran in the Kiro Crew dashboard and Slices 3 to 5 in Kiro IDE ([`docs/KIRO_LOG.md`](KIRO_LOG.md), run entries). Slice 0 to 2 session IDs were not exposed to the agent. Slice 3 and 4 IDs are in the log. Credit balances are the owner's to fill: NOT VERIFIED.

## Kiro features and evidence
| Feature | What it did | Evidence | State |
|---|---|---|---|
| Specs (requirements, design, tasks) | Kiro wrote one spec per slice before coding, in EARS style. | [`ui`](../.kiro/specs/ghosttrace-ui/) ([f80bbdd](../../../commit/f80bbdd)), [`export`](../.kiro/specs/ghosttrace-export/) ([f042058](../../../commit/f042058)), [`mcp`](../.kiro/specs/ghosttrace-mcp/) ([1dc8460](../../../commit/1dc8460)), [`release`](../.kiro/specs/ghosttrace-release/) ([65b77f9](../../../commit/65b77f9)). The base spec [`ghosttrace/`](../.kiro/specs/ghosttrace/) was written outside Kiro. | Verified in git |
| Steering | `product.md` and `tech.md` constrain engine purity, memory use, tests and claims. | [`.kiro/steering/`](../.kiro/steering/), `tech.md` added in [369c84b](../../../commit/369c84b) | Files exist. That Kiro applied them in each session: NOT VERIFIED beyond the behavior visible in the commits. |
| Hook | `PostFileSave` on `src/engine` or `src/lib` TypeScript files runs `npm test`. | [`.kiro/hooks/engine-tests.json`](../.kiro/hooks/engine-tests.json) | Defined. **Execution NOT OBSERVED**: on 2026-11-19 the owner saved `src/engine/schema.ts` unchanged and saw nothing in 20 seconds ([`docs/KIRO_LOG.md`](KIRO_LOG.md), Slice 5 entry). |
| MCP | Local stdio server `ghosttrace` with `replay_incident`, `diff_runs`, `export_regression`. Kiro called all three. | [`.kiro/settings/mcp.json`](../.kiro/settings/mcp.json), [`mcp/server.ts`](../mcp/server.ts), exact inputs and outputs in [`docs/evidence/mcp-calls.md`](evidence/mcp-calls.md) | Three real calls recorded (Slice 4, [a66ed38](../../../commit/a66ed38)). |
| Property-based tests | fast-check, seed 20261117, over the replay engine. | [`tests/engine/properties.test.ts`](../tests/engine/properties.test.ts) | Run locally with `npm test`. |
| Custom agents | Builder and reviewer definitions. | [`.kiro/agents/`](../.kiro/agents/) | Defined only. The reviewer was NOT RUN ([`docs/reviews/slice-3.md`](reviews/slice-3.md)). |
| Kiro-planned slices | Kiro planned each slice in its own spec, then executed it. | Run entries in [`docs/KIRO_LOG.md`](KIRO_LOG.md) | Verified in the log. |

## What exists and how it was checked
- Pure replay engine and golden tests G000 to G111: [`src/engine/`](../src/engine/), [`tests/engine/golden.test.ts`](../tests/engine/golden.test.ts), commit [7c90d51](../../../commit/7c90d51).
- Redaction, export and import with round trip: [`src/lib/`](../src/lib/), commits [89c6ef2](../../../commit/89c6ef2) and [b7b024e](../../../commit/b7b024e).
- Guest UI: [`src/components/`](../src/components/), commit [18f4605](../../../commit/18f4605).
- CLI and MCP: [`cli/`](../cli/), [`mcp/`](../mcp/), commit [2b5d014](../../../commit/2b5d014). Slice 5 restricts both to files inside the repository ([`cli/node-io.ts`](../cli/node-io.ts), [`tests/cli/paths.test.ts`](../tests/cli/paths.test.ts)).
- Local gates run by Kiro: `npm test`, `npm run typecheck`, `npm run build`. Exact counts and exit codes per slice are in [`docs/KIRO_LOG.md`](KIRO_LOG.md).
- **Playwright browser tests are written ([`e2e/`](../e2e/)) but have NOT been run.** No CI result for them exists in this repository: NOT VERIFIED.
- **The public judge link has NOT been deployed.** The Pages workflow ([`.github/workflows/pages.yml`](../.github/workflows/pages.yml)) exists and is manual-only. The owner enables Pages after making the repository public: NOT VERIFIED.
- A PASS in GhostTrace means only that a synthetic replay passed. It makes no claim about a production system.

## How to judge in 3 minutes
1. **Open the live link** (after the repository is public): `https://lunauulu-lang.github.io/ghosttrace/`. Until then run `npm ci` and `npm run dev` and open the printed local URL.
2. **Click through the haunted checkout.** The fixture loads in a failing state (nothing captured). Select deliveries in the timeline and read the invariant violations.
3. **Apply repairs.** Turn on the v2 amount mapping, causal order and deduplication one at a time. With only the first two on, the replay captures 9800 (the synthetic overcapture, G110). With all three on it captures 4900 and passes (G111). Compare the before and after.
4. **Export.** Use the export panel to preview and download the sanitized fixture, repair preset and Kiro repair spec. Import the file again to restore the same repairs.
5. **CLI:** `npm run ghosttrace -- replay fixtures/haunted-checkout.json --repairs M,O,D` prints `PASS` with 4900 of 4900. Without `--repairs` it prints `FAIL`.
6. **MCP:** the server is registered in `.kiro/settings/mcp.json`. In Kiro, enable the `ghosttrace` server and call `replay_incident` with `{"path": "fixtures/haunted-checkout.json", "repairs": "M,O,D"}`. Compare with [`docs/evidence/mcp-calls.md`](evidence/mcp-calls.md).
7. **Tests:** `npm test` (unit, property and UI tests), `npm run typecheck`, `npm run build`.
