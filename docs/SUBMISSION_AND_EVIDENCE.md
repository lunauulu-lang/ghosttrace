# Kiroween 2026 — submission evidence gates

Reference: https://kiroween.devpost.com/ and https://kiroween.devpost.com/rules
Latest organizer deadline visible: **2026-12-04 14:00 PST = 2026-12-05 04:00 Bishkek**.
Verify source on the signed-in 2026 Devpost contest before final submission; old/cached 2025 rules may appear in public search tools.

> **Superseded in part on 2026-11-19.** The status list below is the seed written on 2026-11-17, before any Kiro run. It is kept as history. The current state is in the proof register below and in `docs/KIRO_LOG.md`.

## Source-backed status as of 2026-11-17 (seed, historical)
- Devpost registration: owner-reported completed (individual).
- Kiroween 4,000 bonus credits: browser-Claude observed `kiroween2026: 0 / 4000 used`, same Google identity as local Kiro Crew; Free plan `0.11 / 50`. Browser-Claude report, **not an independent API audit**.
- Owner explicitly authorized using included Free and bonus credits; Pro purchase and paid overage not authorized.
- Windows: Crew 0.12.2, host KAS preflight reportedly PASS but **no Kiro model coding run**.
- Free memory during last check: ~1.1 GiB, critically below Crew's 2 GiB warning threshold. Run Slice 0 only after safety gate.
- GitHub PR #7 holds **staging plan only**. This is NOT a contest app; unrelated factory CI green runs do not verify GhostTrace.
- CLAUDE ARCHITECTURE REVIEW in Issue #8 confirmed five improvement areas; revised architecture: static Vite/React/TS, applied-only idempotency, eight golden outcomes, independent contest CI.
- (Historical) A dedicated contest repository was NOT YET CREATED when this line was written. Copy contents of `ghosttrace/` to its root, including `.kiro` and `LICENSE`, only after owner authorizes creation. Do not copy private AI Software Factory or EvidencePulse history.

## Proof register (update only after real evidence)

| Gate | Status | Evidence needed |
|---|---|---|
| Credits & Kiro identity | REPORTED CONFIRMED | Recheck account balance before model call |
| KAS preflight | REPORTED PASS | Sanitized host preflight record |
| RAM >= 2GiB before model | NOT VERIFIED | Fresh Windows available-memory reading |
| Dedicated contest repo (root .kiro and LICENSE) | DONE: created 2026-11-17 (bootstrap 561322c); public since 2026-11-19 (reported by the owner) | https://github.com/lunauulu-lang/ghosttrace |
| Windows Git commit/push/fetch to contest repo | DONE: slice branches pushed and merged (PR #1 to #6 in git history) | `git log` |
| First real Kiro engine Slice 0 | DONE, run recorded; session ID not exposed, credits owner-reported | `docs/KIRO_LOG.md` Slice 0 entry, 7c90d51 |
| Golden matrix G000–G111 | PASS locally (`npm test`, `tests/engine/golden.test.ts`) | `docs/KIRO_LOG.md` |
| Browser UI / safe import / export / reimport | Unit and UI tests PASS locally. Playwright runs in CI only; green reported by the orchestrator, not seen by Kiro | `.github/workflows/ci.yml` |
| Full contest CI (typecheck/tests/build/Playwright) | Reported green by the orchestrator (runs #14 to #20); NOT VERIFIED by Kiro | GitHub Actions job on the submitted SHA |
| Kiro-native usage evidence | Partly: specs, steering and two MCP tools recorded; both hooks NOT OBSERVED | `docs/KIRO_USAGE.md` |
| Optional CLI / MCP | CLI run by hand; MCP `replay_incident` and `diff_runs` called for real; `export_regression` has no recorded MCP call | `docs/evidence/mcp-calls.md` |
| Public website & judge URL | Deployed (reported by the orchestrator, `Pages` run #1); NOT VERIFIED by Kiro | https://lunauulu-lang.github.io/ghosttrace/ |
| Public OSS GitHub with root /.kiro | Public since 2026-11-19 (reported by the owner), MIT license | repo URL |
| English public demo video (<3m) | NOT MADE | Public video link showing the working app |
| Devpost GhostTrace submission | NOT SUBMITTED | Submitted entry URL and state |
| Prize payment availability | UNKNOWN | Organizer/prize provider written process |

## Final-entry checklist
1. Confirm **2026** eligibility/category Frankenstein and actual submission window on the current contest entry page.
2. Public GitHub contest repo, root `/.kiro`, detectable OSI LICENSE, installation/test instructions.
3. Guest demo link works without auth or paid keys; never make real payment/webhook calls.
4. Demonstrate actual G000 failure -> G110 synthetic overcapture -> G111 success -> redacted export/reimport.
5. All five official judging dimensions addressed: potential impact, technological implementation with Kiro, design, innovation, presentation. No claim of tested features without matching evidence.
6. English write-up and public video under three minutes with app actually running. Record truthful Kiro usage, review alternatives/experiments.
7. Owner approves repo publication, deployment and final Devpost submission separately. Aim to submit by Dec 3 for buffer; final hard deadline Dec 5 04:00 Bishkek.
8. Keep judge access open for the required judging period; verify specific 2026 end date against the current signed-in rules.

## Evidence integrity
All pre-Kiro specs, log templates and fixture were prepared by ChatGPT/Claude or the owner. Actual Kiro contribution starts only at a witnessed model execution and code changes. Mark PASS / FAIL / NOT RUN; record exact GitHub SHA; never confuse unrelated root factory checks with contest app checks.
