# Demo video script (target 2:40, hard limit 2:50)

Live app: https://lunauulu-lang.github.io/ghosttrace/ . Repo: https://github.com/lunauulu-lang/ghosttrace . All data is synthetic. A PASS means only that this synthetic replay passed. The narration is in `narration.txt` (about 300 words, plain English). The screen recording has no sound; narration is added afterwards. No music, no third-party logos, only the Kiro name.

| Time | On screen | Owner clicks / does | Narration (short form) |
|---|---|---|---|
| 0:00-0:15 | Title card "GhostTrace", then the app header | Nothing. Open the live link in a clean browser window. | A checkout webhook goes wrong: payment before checkout, a retry, a renamed field. Nobody knows which fault broke what. |
| 0:15-0:25 | App at load: replay is FAIL, nothing captured | Nothing. Hold on the FAIL state and the "synthetic" wording. | GhostTrace replays a synthetic incident through a pure engine. No network, no real money. |
| 0:25-0:40 | Timeline `d1` to `d4` and the State panel with violations | Press the preset "G000 Broken". Click `d1`, then `d4`. | The replay fails. Nothing is captured, yet the order is fulfilled. |
| 0:40-1:00 | Repairs fieldset | Turn on "Schema mapping (v2 amount)", then "Causal ordering". | I switch repairs on one at a time. Schema mapping first, then causal ordering. |
| 1:00-1:15 | State panel shows captured 9800 and violations | Press the preset "G110 Over-capture". Click `d3`. | Captured is 9800 of 4900. A synthetic over-capture, G110: the retry was applied twice. |
| 1:15-1:30 | State panel shows PASS, captured 4900 | Turn on "Deduplicate applied deliveries" (or press "G111 Repaired"). | Deduplication gives 4900. The replay passes, G111. A pass means only this synthetic replay passed. |
| 1:30-1:40 | Timeline row with the "First divergence" tag | Point at the tagged row (`d1`). | The timeline marks the first divergence: rejected before, applied now. |
| 1:40-2:00 | Export panel with the JSON preview and the repair spec preview | Press "Preview export". Scroll the preview. Press "Download export JSON". Use the import file field to import it again. | The preview shows exactly what is saved. Secrets are redacted. The chosen repairs are stored, and import restores them. |
| 2:00-2:12 | Terminal in the repo folder | Run `npm run ghosttrace -- replay fixtures/haunted-checkout.json --repairs M,O,D`. | The same engine runs as a command line tool: PASS, 4900 of 4900. |
| 2:12-2:24 | Kiro IDE, MCP panel showing `ghosttrace` Connected with 3 tools, then a chat | Ask Kiro: call `replay_incident` for `fixtures/haunted-checkout.json` with repairs `M,O,D`. Show the tool result (PASS, 4900). | The same engine is an MCP server. Here Kiro calls replay_incident and gets the same pass. |
| 2:24-2:36 | Kiro specs panel, `.kiro/steering`, hooks panel, `docs/reviews/final-review.md`, `docs/KIRO_LOG.md` | Click through each for about 2 seconds. | Each slice started with a spec. Steering kept the engine pure. A Kiro hook runs the tests when Kiro edits a test file. I used an MCP server and a reviewer agent. |
| 2:36-2:40 | End card: repo URL and live URL | Nothing. | GhostTrace. Replay it, repair it, prove it. Links below. |

## Notes for the recording
- Do not show the Kiro credit balance, account name, tokens or any browser profile data.
- The MCP call must be live. If the `ghosttrace` server is not Connected, enable it in the Kiro MCP panel first (see `docs/evidence/mcp-calls.md`). All three MCP tools have recorded real calls (`docs/evidence/mcp-calls.md`).
- If the recording runs over 2:50, cut the hooks panel and the specs panel first.
